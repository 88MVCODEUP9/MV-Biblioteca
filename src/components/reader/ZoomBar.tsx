import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   ZoomBar — barra fina flutuante só da tela de leitura

   [ − ]  [ trilho com a caixa do % deslizando para os lados ]  [ + ]

   - "−" e "+" dão zoom (segurar repete a cada 100 ms).
   - A caixa do % é o "botão de rolagem" horizontal: ao arrastar pelo trilho,
     ela rola a página (scrollLeft) para os lados, igual a uma barra de
     rolagem. Caixa à direita = parte direita da página.
   - Se a página cabe na tela (nada para rolar), a caixa fica no centro,
     apagada. Toque duplo na caixa = "ajustar à tela".
   - A barra é controlada: o zoom vive no usePageZoom; a posição vem do
     scroll real do <main> do leitor, então nada fica fora de sincronia.
────────────────────────────────────────────────────────────────────────── */

export interface ZoomBarProps {
  /** Zoom atual, em % (ex.: 100). */
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  /** Toque duplo na caixa: volta para "ajustar à tela". */
  onReset: () => void;
  /** Elemento que rola (a área de leitura). */
  scrollRef: RefObject<HTMLElement | null>;
  minZoom?: number;
  maxZoom?: number;
  /** Esconde a barra com fade (some após alguns segundos parada). */
  hidden?: boolean;
  /** Avisa o leitor que o usuário está mexendo (mantém os controles). */
  onActivity?: () => void;
}

const REPEAT_INTERVAL_MS = 100;
const THUMB_WIDTH = 72;   // px — largura da caixa do %
const THUMB_GAP = 2;      // px — folga entre a caixa e as pontas do trilho
const KEY_STEP = 60;      // px — passo das setas do teclado

const buttonClass = `
  flex-none flex items-center justify-center
  w-[34px] h-[34px] rounded-full
  text-[var(--text-sub)] text-xl leading-none select-none
  hover:text-[var(--gold)] hover:bg-[var(--gold-glow)]
  active:scale-95 transition
  disabled:opacity-30 disabled:pointer-events-none
`;

export function ZoomBar({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  scrollRef,
  minZoom = 25,
  maxZoom = 300,
  hidden = false,
  onActivity,
}: ZoomBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // pos: 0 (tudo à esquerda) a 1 (tudo à direita). scrollable: há o que rolar?
  const [pos, setPos] = useState(0.5);
  const [scrollable, setScrollable] = useState(false);
  const [dragging, setDragging] = useState(false);

  const dragRef = useRef({ startX: 0, startPos: 0 });
  const repeatRef = useRef<number | null>(null);

  /* Lê o scroll real da área de leitura e posiciona a caixa */
  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    if (max > 1) {
      setScrollable(true);
      setPos(Math.min(1, Math.max(0, el.scrollLeft / max)));
    } else {
      setScrollable(false);
      setPos(0.5);
    }
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    // O tamanho do conteúdo muda com o zoom / rotação / troca de página.
    let observer: ResizeObserver | undefined;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(sync);
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer?.observe(child));
    }

    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      observer?.disconnect();
    };
  }, [scrollRef, sync]);

  // Depois de cada mudança de zoom, relê (o layout muda no frame seguinte).
  useEffect(() => {
    const raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, [zoom, sync]);

  /* ─── Botões + e − com repetição ─── */

  const stopRepeat = useCallback(() => {
    if (repeatRef.current !== null) {
      window.clearInterval(repeatRef.current);
      repeatRef.current = null;
    }
  }, []);

  useEffect(() => stopRepeat, [stopRepeat]);

  const startRepeat = (action: () => void) => (event: ReactPointerEvent) => {
    event.preventDefault();
    onActivity?.();
    stopRepeat();
    action();
    repeatRef.current = window.setInterval(() => {
      onActivity?.(); // segurar o botão mantém a barra visível
      action();
    }, REPEAT_INTERVAL_MS);
  };

  /* ─── Caixa deslizante: arrastar = rolar a página para os lados ─── */

  const travel = () => {
    const track = trackRef.current;
    return track ? track.clientWidth - THUMB_WIDTH - THUMB_GAP * 2 : 0;
  };

  const scrollToPos = (next: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.min(1, Math.max(0, next)) * (el.scrollWidth - el.clientWidth);
  };

  const handleThumbDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onActivity?.();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startPos: pos };
    setDragging(true);
  };

  const handleThumbMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !scrollable) return;
    const range = travel();
    if (range <= 0) return;
    onActivity?.();
    scrollToPos(dragRef.current.startPos + (event.clientX - dragRef.current.startX) / range);
  };

  const handleThumbUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const handleThumbKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    if (event.key === 'ArrowLeft') el.scrollLeft -= KEY_STEP;
    else if (event.key === 'ArrowRight') el.scrollLeft += KEY_STEP;
    else return;

    // As setas aqui rolam a página; não podem virar a página do livro.
    event.preventDefault();
    event.stopPropagation();
    onActivity?.();
  };

  // Enquanto arrasta a caixa, a barra não pode sumir.
  const isHidden = hidden && !dragging;

  return (
    <div
      role="group"
      aria-label="Controles de zoom e rolagem horizontal"
      aria-hidden={isHidden}
      onPointerDown={onActivity}
      className={`
        fixed left-1/2 z-30 -translate-x-1/2
        bottom-[calc(14px+env(safe-area-inset-bottom,0px))]
        flex items-center gap-1.5 p-1
        w-[min(94vw,400px)]
        rounded-full border border-[var(--border-2)]
        bg-[var(--bg-2)]/60 backdrop-blur-sm
        select-none transition-[opacity,transform] duration-500 ease-out
        ${isHidden
          ? 'opacity-0 translate-y-3 pointer-events-none'
          : 'opacity-40 hover:opacity-100 active:opacity-100 focus-within:opacity-100'}
      `}
    >
      <button
        type="button"
        className={buttonClass}
        aria-label="Diminuir zoom"
        title="Diminuir zoom (−)"
        disabled={zoom <= minZoom}
        onPointerDown={startRepeat(onZoomOut)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
      >
        −
      </button>

      {/* Trilho */}
      <div
        ref={trackRef}
        className="
          relative flex-1 h-[34px] rounded-full overflow-hidden
          bg-[var(--bg)] border border-[var(--border)]
          shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]
        "
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 14px)',
        }}
      >
        <span aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none">‹</span>
        <span aria-hidden className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] leading-none text-white/25 pointer-events-none">›</span>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Mover a página para os lados"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos * 100)}
          aria-disabled={!scrollable}
          title={
            scrollable
              ? 'Arraste para os lados · toque duplo ajusta à tela'
              : 'Aumente o zoom para rolar para os lados'
          }
          onPointerDown={handleThumbDown}
          onPointerMove={handleThumbMove}
          onPointerUp={handleThumbUp}
          onPointerCancel={handleThumbUp}
          onDoubleClick={onReset}
          onKeyDown={handleThumbKey}
          className={`
            absolute top-[2px] h-7 flex items-center justify-center
            rounded-full border-2 bg-[var(--bg)]
            text-[13px] font-bold text-white touch-none
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold-bright)]
            ${scrollable ? 'border-[var(--gold)]' : 'border-[var(--gold-dark)] opacity-60'}
            ${dragging
              ? 'cursor-grabbing border-[var(--gold-bright)] shadow-[0_0_14px_rgba(240,224,184,.45)]'
              : 'cursor-grab transition-[left] duration-150'}
          `}
          style={{
            width: THUMB_WIDTH,
            left: `calc(${THUMB_GAP}px + (100% - ${THUMB_WIDTH + THUMB_GAP * 2}px) * ${pos})`,
          }}
        >
          {Math.round(zoom)}%
        </div>
      </div>

      <button
        type="button"
        className={buttonClass}
        aria-label="Aumentar zoom"
        title="Aumentar zoom (+)"
        disabled={zoom >= maxZoom}
        onPointerDown={startRepeat(onZoomIn)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
      >
        +
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   usePageZoom — zoom e "ajustar à tela" (o pan é o scroll nativo da área
   de leitura, controlado pela caixa do ZoomBar)
────────────────────────────────────────────────────────────────────────── */

export interface PageZoomState {
  scale: number;
  zoomMode: 'fit' | 'manual';
  zoomPercentage: string;
  zoomIn: () => void;
  zoomOut: () => void;
  setManualZoom: (value: number) => void;
  fitToScreen: () => void;
}

export interface PageZoomOptions {
  containerRef: RefObject<HTMLElement | null>;
  viewport: { width: number; height: number; isMobile: boolean; isTablet: boolean; isDesktop: boolean };
  pageWidth: number;
  pageHeight: number;
  rotation: number;
  enabled: boolean;
}

export const MIN_ZOOM = 25;
export const MAX_ZOOM = 300;
const DEFAULT_ZOOM = 100;
const ZOOM_STEP = 5;

export function usePageZoom({
  containerRef,
  viewport,
  pageWidth,
  pageHeight,
  rotation,
  enabled,
}: PageZoomOptions): PageZoomState {
  const { isMobile, isTablet } = viewport;

  const [scale, setScale] = useState(DEFAULT_ZOOM / 100);
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');

  // Calcula o zoom "ajustar à tela"
  const calculateFitZoom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return DEFAULT_ZOOM / 100;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return DEFAULT_ZOOM / 100;

    const swapped = rotation % 180 !== 0;
    const contentWidth = swapped ? pageHeight : pageWidth;
    const contentHeight = swapped ? pageWidth : pageHeight;

    const horizontalPadding = isMobile ? 0 : 32;
    const verticalPadding = isMobile ? 24 : 48;

    const widthScale = Math.max(width - horizontalPadding, 200) / contentWidth;
    const heightScale = Math.max(height - verticalPadding, 200) / contentHeight;

    const value = isMobile || isTablet
      ? widthScale
      : Math.min(widthScale, heightScale);

    return Math.min(Math.max(value, MIN_ZOOM / 100), MAX_ZOOM / 100);
  }, [containerRef, isMobile, isTablet, pageHeight, pageWidth, rotation]);

  // Mantém o zoom "ajustar à tela" atualizado enquanto estiver nesse modo
  useEffect(() => {
    if (!enabled || zoomMode !== 'fit') return;

    const raf = requestAnimationFrame(() => setScale(calculateFitZoom()));

    return () => cancelAnimationFrame(raf);
  }, [calculateFitZoom, enabled, zoomMode, viewport.width, viewport.height, pageWidth, pageHeight, rotation]);

  const setManualZoom = useCallback((value: number) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    setZoomMode('manual');
    setScale(clamped / 100);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomMode('manual');
    // Sempre cai em múltiplos de 5% (ex.: 87% → 90% → 95%).
    setScale((prev) => Math.min(MAX_ZOOM, (Math.floor(Math.round(prev * 100) / ZOOM_STEP) + 1) * ZOOM_STEP) / 100);
  }, []);

  const zoomOut = useCallback(() => {
    setZoomMode('manual');
    setScale((prev) => Math.max(MIN_ZOOM, (Math.ceil(Math.round(prev * 100) / ZOOM_STEP) - 1) * ZOOM_STEP) / 100);
  }, []);

  const fitToScreen = useCallback(() => {
    setZoomMode('fit');
    setScale(calculateFitZoom());

    window.requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }, [calculateFitZoom, containerRef]);

  return {
    scale,
    zoomMode,
    zoomPercentage: `${Math.round(scale * 100)}%`,
    zoomIn,
    zoomOut,
    setManualZoom,
    fitToScreen,
  };
}
