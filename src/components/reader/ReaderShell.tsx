import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize,
  Minimize,
  RotateCw,
  X,
} from 'lucide-react';

import {
  READER_BUTTON_CLASS,
  clamp,
  useAutoHideControls,
  useBodyScrollLock,
  useEntranceTransition,
  useFullscreen,
  usePageZoom,
  useViewport,
  ZoomBar,
} from './reader-kit';
import { MAX_ZOOM, MIN_ZOOM } from './ZoomBar';

/* ─────────────────────────────────────────────────────────────────────────────
   ReaderShell
   ─────────────────────────────────────────────────────────────────────────────
   Interface e lógica ÚNICAS de leitura, usadas por PDF e EPUB:

   - cabeçalho (fechar, capa, título, zoom, páginas, girar, baixar, tela cheia)
   - área de leitura com loading / erro / página centralizada
   - setas laterais, rodapé mobile/tablet, dica de atalhos no desktop
   - teclado, Ctrl + roda, toque (deslizar / toque duplo), auto-ocultar controles

   Cada formato só entrega o conteúdo da página (children) e a navegação.
───────────────────────────────────────────────────────────────────────────── */

export interface ReaderShellHandle {
  /** Mostra os controles de novo (ex.: atividade dentro do iframe do EPUB). */
  wake: () => void;
  /** Toque que começou dentro de conteúdo transformado (coordenadas locais). */
  localTouchStart: (x: number, y: number) => void;
  localTouchEnd: (x: number, y: number) => void;
  localTouchCancel: () => void;
  /** true quando a página está ampliada o bastante para arrastar em vez de virar. */
  isPanMode: () => boolean;
  /** Ctrl + roda / pinça vindos de dentro de um iframe. */
  wheelZoom: (deltaY: number) => void;
  /** Chamar ANTES de trocar página/capítulo: trava o scroll até o conteúdo novo assentar. */
  holdScroll: () => void;
}

export interface ReaderShellProps {
  ref?: Ref<ReaderShellHandle>;

  title: string;
  author: string;
  /** "PDF" ou "EPUB" — aparece embaixo do título. */
  formatLabel: string;
  coverUrl?: string;
  onClose: () => void;

  loading: boolean;
  loadingTitle: string;
  loadingSubtitle: string;

  error: string | null;
  errorTitle: string;
  errorPrimary?: { label: string; onClick: () => void };

  pageNumber: number | null;
  numPages: number | null;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;

  /** Tamanho real da página — usado no "ajustar à tela". */
  pageWidth: number;
  pageHeight: number;

  onDownload?: () => void;

  /** Botões extras do cabeçalho (ex.: sumário do EPUB). */
  headerExtras?: ReactNode;
  /** Painel lateral opcional (ex.: sumário). */
  panel?: ReactNode;
  panelTitle?: string;
  panelOpen?: boolean;
  onClosePanel?: () => void;
  onTogglePanel?: () => void;

  children: (view: { scale: number; rotation: number }) => ReactNode;
}

const buttonClass = READER_BUTTON_CLASS;

/* Botões laterais: 15% de opacidade em repouso, 80% ao passar o mouse na lateral. */
const sideButtonClass = `
  fixed
  top-1/2
  -translate-y-1/2
  z-20
  flex
  items-center
  w-14 sm:w-24
  h-40 sm:h-[55vh]
  text-white
  opacity-15
  hover:opacity-80
  focus-visible:opacity-80
  active:opacity-80
  disabled:opacity-0
  disabled:pointer-events-none
  transition-opacity
  duration-200
`;

export function ReaderShell({
  ref,
  title,
  author,
  formatLabel,
  coverUrl,
  onClose,
  loading,
  loadingTitle,
  loadingSubtitle,
  error,
  errorTitle,
  errorPrimary,
  pageNumber,
  numPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  pageWidth,
  pageHeight,
  onDownload,
  headerExtras,
  panel,
  panelTitle,
  panelOpen = false,
  onClosePanel,
  onTogglePanel,
  children,
}: ReaderShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const activeLevelRef = useRef<HTMLButtonElement | null>(null);

  const viewport = useViewport();
  const { isMobile } = viewport;

  const [rotation, setRotation] = useState(0);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const ready = !loading && !error;

  const zoom = usePageZoom({
    containerRef: contentRef,
    viewport,
    pageWidth,
    pageHeight,
    rotation,
    enabled: ready,
  });

  const {
    scale,
    zoomMode,
    zoomIn,
    zoomOut,
    setManualZoom,
    fitToScreen,
  } = zoom;

  const { isFullscreen, toggleFullscreen } = useFullscreen(rootRef);

  /* ─────────────────────────────────────────────────────────────────────────
     Zoom sem "pular": guarda o ponto central visível e o devolve ao centro
     depois de cada mudança de escala (senão a página ampliada vai para o canto).
  ───────────────────────────────────────────────────────────────────────── */

  const centerRatio = useRef({ x: 0.5, y: 0.5 });

  // Última posição de rolagem escolhida pelo usuário (em pixels).
  const scrollMemory = useRef({ left: 0, top: 0 });

  // Enquanto uma troca de página está em andamento (conteúdo novo carregando,
  // altura do conteúdo oscilando), o navegador "prende" o scrollTop e dispara
  // eventos de scroll com valores falsos. Congelamos a memória nesse período.
  const scrollFrozen = useRef(false);
  const unlockTimer = useRef<number | null>(null);
  const lockObserver = useRef<ResizeObserver | null>(null);
  const lockCleanup = useRef<(() => void) | null>(null);

  const readScrollPosition = useCallback(() => {
    const element = contentRef.current;

    if (!element) return;

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = element;

    scrollMemory.current = { left: scrollLeft, top: scrollTop };

    centerRatio.current = {
      x: scrollWidth ? (scrollLeft + clientWidth / 2) / scrollWidth : 0.5,
      y: scrollHeight ? (scrollTop + clientHeight / 2) / scrollHeight : 0.5,
    };
  }, []);

  const releaseScrollLock = useCallback(() => {
    if (unlockTimer.current !== null) {
      window.clearTimeout(unlockTimer.current);
      unlockTimer.current = null;
    }

    lockCleanup.current?.();
    lockCleanup.current = null;

    lockObserver.current?.disconnect();
    lockObserver.current = null;

    scrollFrozen.current = false;
  }, []);

  /*
   * Trava a posição de rolagem durante a troca de página / capítulo:
   *  1. congela a memória (eventos de scroll gerados pelo próprio navegador
   *     ao encolher/crescer o conteúdo não sobrescrevem a posição do usuário);
   *  2. devolve a posição guardada agora e a cada mudança de tamanho do
   *     conteúdo, até a página nova terminar de carregar;
   *  3. se o usuário rolar de propósito (roda, toque, teclado), solta a trava.
   * Pode ser chamada várias vezes: a posição salva na 1ª chamada é mantida.
   */
  const lockScroll = useCallback(() => {
    const element = contentRef.current;

    if (!element) return;

    if (!scrollFrozen.current) {
      readScrollPosition();
    }

    scrollFrozen.current = true;

    const restore = () => {
      const { left, top } = scrollMemory.current;

      if (element.scrollLeft !== left) element.scrollLeft = left;
      if (element.scrollTop !== top) element.scrollTop = top;
    };

    restore();

    if (unlockTimer.current === null) {
      window.requestAnimationFrame(restore);

      const userScroll = () => {
        releaseScrollLock();
        readScrollPosition();
      };

      const events = ['wheel', 'touchmove', 'pointerdown', 'keydown'] as const;

      events.forEach((name) =>
        element.addEventListener(name, userScroll, { passive: true })
      );

      lockCleanup.current = () =>
        events.forEach((name) => element.removeEventListener(name, userScroll));

      if (typeof ResizeObserver !== 'undefined') {
        lockObserver.current = new ResizeObserver(restore);
        lockObserver.current.observe(element);
        Array.from(element.children).forEach((child) =>
          lockObserver.current?.observe(child)
        );
      }
    } else {
      window.clearTimeout(unlockTimer.current);
    }

    unlockTimer.current = window.setTimeout(() => {
      unlockTimer.current = null;
      restore();
      releaseScrollLock();
      readScrollPosition();
    }, 450);
  }, [readScrollPosition, releaseScrollLock]);

  useEffect(() => {
    const element = contentRef.current;

    if (!element) return;

    const remember = () => {
      if (scrollFrozen.current) return;

      readScrollPosition();
    };

    element.addEventListener('scroll', remember, { passive: true });

    return () => {
      element.removeEventListener('scroll', remember);
      releaseScrollLock();
    };
  }, [readScrollPosition, releaseScrollLock]);

  // ZOOM / ROTAÇÃO: mantém o ponto central visível (comportamento original).
  useLayoutEffect(() => {
    const element = contentRef.current;

    if (!element) return;

    element.scrollLeft = centerRatio.current.x * element.scrollWidth - element.clientWidth / 2;
    element.scrollTop = centerRatio.current.y * element.scrollHeight - element.clientHeight / 2;

    // Atualiza a memória (em px) para a nova escala; senão a trava de troca de
    // página devolveria pixels da escala antiga.
    readScrollPosition();
  }, [scale, readScrollPosition]);

  // TROCA DE PÁGINA: NÃO recentraliza nem volta ao topo — preserva o scroll.
  // (A 1ª página, quando pageNumber sai de null, continua centralizada pelo
  // efeito de zoom acima.)
  const previousPageNumber = useRef<number | null>(pageNumber);

  useLayoutEffect(() => {
    const previous = previousPageNumber.current;

    previousPageNumber.current = pageNumber;

    if (previous === null || pageNumber === null || previous === pageNumber) {
      return;
    }

    lockScroll();
  }, [pageNumber, lockScroll]);

  useBodyScrollLock();

  const { visible: showControls, wake: wakeHeader } = useAutoHideControls({
    suspended: loading || Boolean(error) || showZoomMenu || panelOpen,
  });

  // A barra de zoom some mais cedo (2,5 s) para não atrapalhar a leitura
  // e volta a qualquer toque / movimento do mouse.
  const { visible: showZoomBar, wake: wakeZoomBar } = useAutoHideControls({
    idleMs: 2500,
    suspended: loading || Boolean(error),
  });

  const wakeControls = useCallback(() => {
    wakeHeader();
    wakeZoomBar();
  }, [wakeHeader, wakeZoomBar]);

  const entranceClass = useEntranceTransition();

  const rotate = useCallback(() => {
    setRotation((current) => (current + 90) % 360);
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
     Teclado
  ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      // Não sequestra atalhos do navegador (Ctrl+R, Ctrl++, Ctrl+0...).
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      wakeControls();

      switch (event.key) {
        case 'Escape':
          if (showZoomMenu) {
            setShowZoomMenu(false);
          } else if (panelOpen) {
            onClosePanel?.();
          } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            onClose();
          }
          break;

        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          event.preventDefault();
          onNext();
          break;

        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          onPrev();
          break;

        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;

        case '-':
        case '_':
          event.preventDefault();
          zoomOut();
          break;

        case '0':
          event.preventDefault();
          fitToScreen();
          break;

        case 'r':
        case 'R':
          event.preventDefault();
          rotate();
          break;

        case 'f':
        case 'F':
          event.preventDefault();
          void toggleFullscreen();
          break;

        case 't':
        case 'T':
          if (onTogglePanel) {
            event.preventDefault();
            onTogglePanel();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [
    fitToScreen,
    onClose,
    onClosePanel,
    onNext,
    onPrev,
    onTogglePanel,
    panelOpen,
    rotate,
    showZoomMenu,
    toggleFullscreen,
    wakeControls,
    zoomIn,
    zoomOut,
  ]);

  /* ─────────────────────────────────────────────────────────────────────────
     Ctrl + roda = zoom
  ───────────────────────────────────────────────────────────────────────── */

  const wheelZoom = useCallback(
    (deltaY: number) => {
      if (deltaY < 0) zoomIn();
      else zoomOut();
    },
    [zoomIn, zoomOut]
  );

  useEffect(() => {
    const element = contentRef.current;

    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;

      event.preventDefault();
      wheelZoom(event.deltaY);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => element.removeEventListener('wheel', handleWheel);
  }, [wheelZoom]);

  /* ─────────────────────────────────────────────────────────────────────────
     Fecha o menu de zoom ao clicar fora
  ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!showZoomMenu) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!zoomMenuRef.current?.contains(event.target as Node)) {
        setShowZoomMenu(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [showZoomMenu]);

  // Ao abrir o menu, mostra o nível atual (a lista tem 78 opções).
  useEffect(() => {
    if (showZoomMenu) {
      activeLevelRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [showZoomMenu]);

  /* ─────────────────────────────────────────────────────────────────────────
     Gestos: deslizar para trocar de página / toque duplo para ampliar
  ───────────────────────────────────────────────────────────────────────── */

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef(0);
  const scaleRef = useRef(scale);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    scaleRef.current = scale;
    rotationRef.current = rotation;
  }, [scale, rotation]);

  const runGesture = useCallback(
    (dx: number, dy: number) => {
      wakeControls();

      // Toque (quase sem movimento) → toque duplo amplia / ajusta.
      if (Math.hypot(dx, dy) < 10) {
        const now = Date.now();

        if (now - lastTapTime.current < 300) {
          lastTapTime.current = 0;

          if (zoomMode === 'manual') fitToScreen();
          else setManualZoom(scale * 1.5);
        } else {
          lastTapTime.current = now;
        }

        return;
      }

      lastTapTime.current = 0;

      // Deslizar na horizontal (só quando a página não está bem ampliada,
      // para não brigar com o arrastar da página).
      if (Math.abs(dx) > 60 && Math.abs(dy) < 100 && scale <= 1.3) {
        if (dx < 0) onNext();
        else onPrev();
      }
    },
    [fitToScreen, onNext, onPrev, scale, setManualZoom, wakeControls, zoomMode]
  );

  const handleTouchStart = (event: React.TouchEvent) => {
    wakeControls();

    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }

    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;

    touchStart.current = null;

    if (!start) return;

    const touch = event.changedTouches[0];

    runGesture(touch.clientX - start.x, touch.clientY - start.y);
  };

  useImperativeHandle(
    ref,
    () => ({
      wake: wakeControls,

      localTouchStart: (x, y) => {
        touchStart.current = { x, y };
      },

      localTouchEnd: (x, y) => {
        const start = touchStart.current;

        touchStart.current = null;

        if (!start) return;

        // Converte o deslocamento (feito dentro da página girada/ampliada)
        // para pixels reais da tela.
        const radians = (rotationRef.current * Math.PI) / 180;
        const localDx = x - start.x;
        const localDy = y - start.y;
        const factor = scaleRef.current;

        runGesture(
          (localDx * Math.cos(radians) - localDy * Math.sin(radians)) * factor,
          (localDx * Math.sin(radians) + localDy * Math.cos(radians)) * factor
        );
      },

      localTouchCancel: () => {
        touchStart.current = null;
      },

      isPanMode: () => scaleRef.current > 1.3,

      wheelZoom,

      holdScroll: lockScroll,
    }),
    [lockScroll, runGesture, wakeControls, wheelZoom]
  );

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────── */

  const pageLabel = `${pageNumber ?? '—'} / ${numPages ?? '—'}`;

  // Progresso de 0% (primeira página) a 100% (última página).
  const progress =
    pageNumber && numPages && numPages > 1
      ? clamp(((pageNumber - 1) / (numPages - 1)) * 100, 0, 100)
      : 0;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Leitor de ${title}`}
      className={`
        pdf-reader-root
        fixed inset-0 z-[1000]
        flex flex-col
        bg-[#09090b]
        text-[var(--text)]
        overflow-hidden
        transition-[opacity,transform]
        duration-300 ease-out
        ${entranceClass}
      `}
      onMouseMove={wakeControls}
      onClick={(event) => {
        if (event.target === event.currentTarget) wakeControls();
      }}
    >
      {/* BARRA DE AÇÕES SUPERIOR */}

      <header
        aria-hidden={!showZoomBar}
        className={`
          relative
          z-30
          flex
          items-center
          gap-2
          px-3 sm:px-4
          py-2
          min-h-[56px]
          shrink-0
          bg-[var(--bg-2)]
          shadow-lg
          transition-[opacity,transform]
          duration-300 ease-out
          ${
            showControls
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-3 pointer-events-none'
          }
        `}
      >
        {/* Fechar */}

        <button
          type="button"
          onClick={onClose}
          className={`${buttonClass} w-10 h-10 hover:text-red-400 hover:bg-red-400/10`}
          aria-label="Fechar leitor"
          title="Fechar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Capa */}

        {!isMobile && coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="w-8 h-11 object-cover rounded-md shadow-lg shrink-0"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {/* Informações */}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{title}</p>

          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {isMobile ? pageLabel : `${author} · ${formatLabel} · ${pageLabel}`}
          </p>
        </div>

        {/* Extras do formato (ex.: sumário) */}

        {headerExtras}

        {/* Ações: tela cheia · girar · baixar */}

        <div
          className="
            flex
            items-center
            gap-0.5
            p-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
            shrink-0
          "
          role="toolbar"
          aria-label="Ações do leitor"
        >
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className={`${buttonClass} w-9 h-9`}
            title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={rotate}
            className={`${buttonClass} w-9 h-9`}
            title="Girar página / orientação (R)"
            aria-label="Girar página"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className={`${buttonClass} w-9 h-9`}
              title={`Baixar ${formatLabel}`}
              aria-label={`Baixar ${formatLabel}`}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* LINHA DE PROGRESSO (sempre visível, colada abaixo da barra) */}

      <div
        role="progressbar"
        aria-label="Progresso de leitura"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="relative z-30 h-[3px] shrink-0 bg-white/10"
      >
        <div
          className="h-full bg-[var(--gold)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ÁREA DE LEITURA */}

      <main
        ref={contentRef}
        className="
          relative
          flex-1
          min-h-0
          overflow-auto
          bg-[#18181c]
          scrollbar-thin
        "
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background */}

        <div
          className="
            pointer-events-none
            fixed
            inset-0
            opacity-30
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]
          "
        />

        {/* Loading */}

        {loading && !error && (
          <div
            className="
              absolute
              inset-0
              z-20
              flex
              flex-col
              items-center
              justify-center
              gap-4
              bg-[#18181c]
            "
          >
            <div
              className="
                w-14 h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-[var(--gold-glow)]
              "
            >
              <Loader2 className="w-7 h-7 animate-spin text-[var(--gold)]" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium">{loadingTitle}</p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {loadingSubtitle}
              </p>
            </div>
          </div>
        )}

        {/* Erro */}

        {error && (
          <div
            className="
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              p-6
            "
          >
            <div
              className="
                max-w-md
                w-full
                p-8
                rounded-3xl
                text-center
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              "
            >
              <div
                className="
                  mx-auto
                  mb-5
                  w-16 h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  bg-red-500/10
                "
              >
                <BookOpen className="w-8 h-8 text-red-400" />
              </div>

              <h2 className="text-base font-semibold">{errorTitle}</h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {error}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {errorPrimary && (
                  <button
                    type="button"
                    onClick={errorPrimary.onClick}
                    className="
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--gold)]
                      text-[var(--bg)]
                      hover:brightness-110
                      transition
                    "
                  >
                    {errorPrimary.label}
                  </button>
                )}

                {onDownload && (
                  <button
                    type="button"
                    onClick={onDownload}
                    className="
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--bg-3)]
                      border
                      border-[var(--border)]
                      hover:bg-[var(--bg-4)]
                      transition
                    "
                  >
                    Baixar
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="
                    px-4 py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/20
                    transition
                  "
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Página */}

        <div
          className="
            relative
            z-10
            flex
            min-h-full
            min-w-full
            w-max
            items-center
            justify-center
            px-0
            sm:px-4
            py-3
            sm:py-6
          "
          style={{
            touchAction: scale > 1.25 ? 'pan-x pan-y' : 'pan-y',
          }}
        >
          {/*
            Centraliza a página. `w-max min-w-full` deixa este contêiner
            crescer junto com a página ampliada, então os dois lados ficam
            alcançáveis pela rolagem (sem cortar a esquerda). A escala é
            aplicada pelo próprio conteúdo (Page do PDF / ScaledStage do EPUB).
          */}
          <div className="select-none">
            {children({ scale, rotation })}
          </div>
        </div>

        {/* Botões laterais de passar página: discretos (15%) e 80% no hover */}

        {ready && (
          <>
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className={`${sideButtonClass} left-0 justify-start pl-1 sm:pl-3`}
              title="Página anterior (←)"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className={`${sideButtonClass} right-0 justify-end pr-1 sm:pr-3`}
              title="Próxima página (→)"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" />
            </button>
          </>
        )}

        {/* Painel lateral (sumário) */}

        {panelOpen && panel && (
          <aside
            className="
              fixed
              left-0
              bottom-0
              z-40
              w-[300px]
              max-w-[85vw]
              bg-[var(--bg-2)]
              border-r
              border-[var(--border)]
              shadow-2xl
              overflow-y-auto
            "
            style={{ top: 59 }}
          >
            <div
              className="
                sticky
                top-0
                z-10
                flex items-center
                justify-between
                px-4 py-3
                bg-[var(--bg-2)]
                border-b
                border-[var(--border)]
              "
            >
              <h2 className="text-sm font-semibold text-[var(--text)]">
                {panelTitle}
              </h2>

              <button
                type="button"
                onClick={onClosePanel}
                className={`${buttonClass} w-8 h-8`}
                aria-label={`Fechar ${panelTitle ?? 'painel'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="p-2">{panel}</nav>
          </aside>
        )}
      </main>

      {/* BARRA DE ZOOM FLUTUANTE — só existe dentro do leitor */}

      {ready && (
        <ZoomBar
          zoom={Math.round(scale * 100)}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={fitToScreen}
          scrollRef={contentRef}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          hidden={!showControls}
          onActivity={wakeControls}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ScaledStage
   ─────────────────────────────────────────────────────────────────────────────
   Para conteúdo que NÃO escala sozinho (EPUB): mantém o espaço de layout igual
   ao tamanho ampliado/girado, para a rolagem da página funcionar como no PDF.
───────────────────────────────────────────────────────────────────────────── */

interface ScaledStageProps {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  children: ReactNode;
}

export function ScaledStage({
  width,
  height,
  scale,
  rotation,
  children,
}: ScaledStageProps) {
  const swapped = rotation % 180 !== 0;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: (swapped ? height : width) * scale,
        height: (swapped ? width : height) * scale,
      }}
    >
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          width,
          height,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
