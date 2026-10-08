import {
  useCallback,
  useEffect,
  useImperativeHandle,
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
  MonitorDown,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import {
  READER_BUTTON_ACTIVE_CLASS,
  READER_BUTTON_CLASS,
  ZOOM_LEVELS,
  useAutoHideControls,
  useBodyScrollLock,
  useEntranceTransition,
  useFullscreen,
  usePageZoom,
  useViewport,
} from './reader-kit';

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
const activeButtonClass = READER_BUTTON_ACTIVE_CLASS;

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
  const { isMobile, isTablet, isDesktop } = viewport;

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
    zoomPercentage,
    zoomIn,
    zoomOut,
    setManualZoom,
    fitToScreen,
  } = zoom;

  const { isFullscreen, toggleFullscreen } = useFullscreen(rootRef);

  useBodyScrollLock();

  const { visible: showControls, wake: wakeControls } = useAutoHideControls({
    suspended: loading || Boolean(error) || showZoomMenu || panelOpen,
  });

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
    }),
    [runGesture, wakeControls, wheelZoom]
  );

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────── */

  const pageLabel = `${pageNumber ?? '—'} / ${numPages ?? '—'}`;

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
      {/* HEADER */}

      <header
        aria-hidden={!showControls}
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
          border-b
          border-[var(--border)]
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

          {!isMobile && (
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              {author} · {formatLabel}
            </p>
          )}
        </div>

        {/* ZOOM */}

        <div ref={zoomMenuRef} className="relative hidden sm:flex items-center">
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
              shadow-sm
            "
          >
            <button
              type="button"
              onClick={fitToScreen}
              className={`
                ${buttonClass}
                w-9 h-9
                ${zoomMode === 'fit' ? activeButtonClass : ''}
              `}
              title="Ajustar à tela (0)"
              aria-label="Ajustar à tela"
            >
              <MonitorDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={zoomOut}
              className={`${buttonClass} w-9 h-9`}
              title="Diminuir zoom (-)"
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowZoomMenu((value) => !value)}
              className="
                min-w-[64px]
                h-9
                px-2
                rounded-lg
                text-xs
                font-semibold
                text-[var(--text)]
                hover:bg-[var(--gold-glow)]
                transition-colors
              "
              title="Selecionar zoom"
              aria-label={`Zoom atual ${zoomPercentage}`}
              aria-expanded={showZoomMenu}
            >
              {zoomPercentage}
            </button>

            <button
              type="button"
              onClick={zoomIn}
              className={`${buttonClass} w-9 h-9`}
              title="Aumentar zoom (+)"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {showZoomMenu && (
            <div
              className="
                absolute
                top-[calc(100%+8px)]
                right-0
                z-50
                w-44
                max-h-[60vh]
                overflow-y-auto
                p-2
                rounded-2xl
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              "
            >
              <p
                className="
                  px-3 py-2
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-[var(--text-muted)]
                "
              >
                Nível de zoom
              </p>

              <div className="grid grid-cols-2 gap-1">
                {ZOOM_LEVELS.map((level) => {
                  const active = Math.abs(scale - level) < 0.01;

                  return (
                    <button
                      type="button"
                      key={level}
                      ref={active ? activeLevelRef : undefined}
                      onClick={() => {
                        setManualZoom(level);
                        setShowZoomMenu(false);
                      }}
                      className={`
                        px-2
                        py-2
                        rounded-lg
                        text-xs
                        transition-colors
                        ${
                          active
                            ? 'bg-[var(--gold-glow)] text-[var(--gold)]'
                            : 'text-[var(--text-sub)] hover:bg-[var(--bg-3)]'
                        }
                      `}
                    >
                      {Math.round(level * 100)}%
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO */}

        <div
          className="
            hidden md:flex
            items-center
            gap-1
            px-1
            py-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
          "
        >
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className={`${buttonClass} w-9 h-9`}
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span
            className="
              min-w-[80px]
              text-center
              text-xs
              font-medium
              text-[var(--text)]
            "
          >
            {pageLabel}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className={`${buttonClass} w-9 h-9`}
            title="Próxima página"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Extras do formato (ex.: sumário) */}

        {headerExtras}

        {/* Rotação */}

        <button
          type="button"
          onClick={rotate}
          className={`${buttonClass} w-10 h-10`}
          title="Rotacionar página (R)"
          aria-label="Rotacionar página"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Download */}

        {!isMobile && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className={`${buttonClass} w-10 h-10`}
            title={`Baixar ${formatLabel}`}
            aria-label={`Baixar ${formatLabel}`}
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Fullscreen */}

        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className={`${buttonClass} w-10 h-10`}
          title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </header>

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
            m-auto (e não justify-center): quando a página ampliada fica maior
            que a tela, o lado esquerdo continua acessível pela rolagem.
          */}
          <div className="m-auto select-none">
            {children({ scale, rotation })}
          </div>
        </div>

        {/* Navegação lateral */}

        {ready && (
          <>
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className="
                hidden sm:flex
                fixed
                left-4
                top-1/2
                -translate-y-1/2
                z-20
                w-11 h-20
                items-center
                justify-center
                rounded-2xl
                bg-transparent
                text-white/35
                hover:bg-black/20
                hover:text-white/80
                disabled:opacity-0
                transition-all
              "
              title="Página anterior"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="
                hidden sm:flex
                fixed
                right-4
                top-1/2
                -translate-y-1/2
                z-20
                w-11 h-20
                items-center
                justify-center
                rounded-2xl
                bg-transparent
                text-white/35
                hover:bg-black/20
                hover:text-white/80
                disabled:opacity-0
                transition-all
              "
              title="Próxima página"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-6 h-6" />
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
            style={{ top: 56 }}
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

      {/* FOOTER MOBILE / TABLET */}

      {(isMobile || isTablet) && ready && (
        <footer
          aria-hidden={!showControls}
          className={`
            relative
            z-30
            flex
            items-center
            justify-between
            gap-2
            px-3
            py-2
            min-h-[58px]
            bg-[var(--bg-2)]
            border-t
            border-[var(--border)]
            transition-[opacity,transform]
            duration-300 ease-out
            ${
              showControls
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-3 pointer-events-none'
            }
          `}
        >
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="
              w-11 h-11
              flex
              items-center
              justify-center
              rounded-xl
              text-[var(--text-sub)]
              hover:text-[var(--gold)]
              hover:bg-[var(--gold-glow)]
              disabled:opacity-30
            "
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="
              flex
              items-center
              gap-1
              px-1
              py-1
              rounded-xl
              bg-[var(--bg-3)]
            "
          >
            <button
              type="button"
              onClick={zoomOut}
              className="
                w-9 h-9
                flex
                items-center
                justify-center
                rounded-lg
                hover:bg-[var(--gold-glow)]
                hover:text-[var(--gold)]
              "
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={fitToScreen}
              className="min-w-[55px] text-xs font-semibold"
              title="Ajustar à tela"
              aria-label={`Zoom atual ${zoomPercentage}. Toque para ajustar à tela`}
            >
              {zoomPercentage}
            </button>

            <button
              type="button"
              onClick={zoomIn}
              className="
                w-9 h-9
                flex
                items-center
                justify-center
                rounded-lg
                hover:bg-[var(--gold-glow)]
                hover:text-[var(--gold)]
              "
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <span
            className="
              absolute
              left-1/2
              -translate-x-1/2
              bottom-[-1px]
              px-2
              py-0.5
              rounded-t-lg
              bg-[var(--bg-3)]
              text-[9px]
              text-[var(--text-muted)]
            "
          >
            {pageLabel}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="
              w-11 h-11
              flex
              items-center
              justify-center
              rounded-xl
              text-[var(--text-sub)]
              hover:text-[var(--gold)]
              hover:bg-[var(--gold-glow)]
              disabled:opacity-30
            "
            aria-label="Próxima página"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </footer>
      )}

      {/* DICA DE ATALHOS — DESKTOP */}

      {isDesktop && ready && (
        <div
          className="
            pointer-events-none
            fixed
            bottom-4
            left-1/2
            -translate-x-1/2
            z-20
            px-4
            py-2
            rounded-full
            bg-black/50
            backdrop-blur-md
            border
            border-white/10
            text-[10px]
            text-white/60
            opacity-0
            hover:opacity-100
            transition-opacity
          "
        >
          ← → páginas · + − zoom · 0 ajustar · R girar · F tela cheia
          {onTogglePanel ? ' · T sumário' : ''} · Ctrl + roda zoom
        </div>
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
