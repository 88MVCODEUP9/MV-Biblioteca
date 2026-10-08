import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   reader-kit
   ─────────────────────────────────────────────────────────────────────────
   Comportamentos compartilhados entre EpubReader e PDFReader.

   Extraído para eliminar duplicação (fullscreen, bloqueio de scroll, swipe,
   download) e para padronizar um recurso que nenhum dos três leitores tinha
   de forma consistente: os controles somem sozinhos após alguns segundos de
   inatividade, como em qualquer leitor profissional (Kindle, Apple Books,
   Google Play Livros), e voltam ao mover o mouse, tocar a tela ou apertar
   uma tecla.
────────────────────────────────────────────────────────────────────────── */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Controla o fullscreen real do navegador para um elemento específico.
 * Substitui a antiga lógica de `parentElement?.parentElement?.requestFullscreen()`
 * usada no EpubReader, que quebrava silenciosamente se a árvore DOM mudasse.
 */
export function useFullscreen(
  targetRef: React.RefObject<HTMLElement | null>
) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement) &&
          document.fullscreenElement === targetRef.current
      );
    };

    document.addEventListener('fullscreenchange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, [targetRef]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await targetRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Não foi possível alternar o fullscreen.', err);
    }
  }, [targetRef]);

  return { isFullscreen, toggleFullscreen };
}

/**
 * Trava o scroll do `body` enquanto o componente estiver montado
 * (usado pelos leitores em tela cheia sobre a página).
 */
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = root.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    // Impede que deslizar para os lados vire "voltar página" do navegador.
    root.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      root.style.overscrollBehavior = previousOverscroll;
    };
  }, [active]);
}

interface SwipeOptions {
  onNext: () => void;
  onPrev: () => void;
  /** Distância horizontal mínima, em px, para considerar um swipe. */
  threshold?: number;
  /** Tolerância vertical, em px, para não confundir com scroll. */
  maxVertical?: number;
  disabled?: boolean;
}

/**
 * Gestos de arrastar para os lados (próxima / página anterior),
 * ignorando arrastos majoritariamente verticais (scroll).
 */
export function useSwipeNavigation({
  onNext,
  onPrev,
  threshold = 60,
  maxVertical = 100,
  disabled = false,
}: SwipeOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || event.touches.length !== 1) return;
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    },
    [disabled]
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (
        disabled ||
        touchStartX.current === null ||
        touchStartY.current === null
      ) {
        return;
      }

      const deltaX = touchStartX.current - event.changedTouches[0].clientX;
      const deltaY = Math.abs(
        touchStartY.current - event.changedTouches[0].clientY
      );

      if (Math.abs(deltaX) > threshold && deltaY < maxVertical) {
        if (deltaX > 0) {
          onNext();
        } else {
          onPrev();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [disabled, threshold, maxVertical, onNext, onPrev]
  );

  return { onTouchStart, onTouchEnd };
}

interface AutoHideOptions {
  /** Tempo de inatividade antes de esconder os controles. */
  idleMs?: number;
  /** Enquanto true (painel aberto, carregando, com erro...), nunca esconde. */
  suspended?: boolean;
}

/**
 * Mostra os controles (header/footer/toolbars) e os esconde sozinho após um
 * período de inatividade, reaparecendo ao mover o mouse, tocar a tela,
 * pressionar uma tecla ou navegar de página. `suspended` mantém os controles
 * sempre visíveis (usado enquanto carrega, com erro, ou com um painel aberto).
 */
export function useAutoHideControls({
  idleMs = 3200,
  suspended = false,
}: AutoHideOptions = {}) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    if (suspended) return;

    timerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, idleMs);
  }, [clearTimer, idleMs, suspended]);

  const wake = useCallback(() => {
    setVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const toggle = useCallback(() => {
    setVisible((current) => {
      const next = !current;
      if (next) scheduleHide();
      else clearTimer();
      return next;
    });
  }, [scheduleHide, clearTimer]);

  useEffect(() => {
    if (suspended) {
      // A visibilidade precisa permanecer explícita enquanto o leitor está suspenso.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      clearTimer();
      return;
    }

    scheduleHide();
    return clearTimer;
  }, [suspended, scheduleHide, clearTimer]);

  return { visible, wake, toggle };
}

/**
 * Baixa um arquivo remoto.
 *
 * O atributo `download` é ignorado pelos navegadores quando o arquivo está em
 * outro domínio (o livro só abria em outra aba). Por isso tentamos primeiro
 * baixar os bytes via fetch e salvar como blob; se o servidor não permitir
 * (CORS), caímos no link direto.
 */
export async function triggerDownload(url: string, filename: string) {
  const safeName = filename.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'livro';

  const clickLink = (href: string, external: boolean) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = safeName;

    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blobUrl = URL.createObjectURL(await response.blob());
    clickLink(blobUrl, false);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    clickLink(url, true);
  }
}

/**
 * Pequena transição de entrada (fade + scale) para os overlays de leitura,
 * evitando que o leitor "pipoque" abruptamente sobre o conteúdo.
 * Retorna a className a aplicar no elemento raiz do overlay.
 */
export function useEntranceTransition(): string {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return entered
    ? 'opacity-100 scale-100'
    : 'opacity-0 scale-[0.98]';
}


/* ─────────────────────────────────────────────────────────────────────────
   Zoom, viewport e página — compartilhados por PDFReader e EpubReader
   para que os dois leiam, ampliem e se ajustem à tela exatamente igual.
────────────────────────────────────────────────────────────────────────── */

/** Tamanho base de uma página A4, em pontos (PDF) / pixels CSS (EPUB). */
export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useViewport(): ViewportInfo {
  const read = () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const [size, setSize] = useState(read);

  useEffect(() => {
    const handleResize = () => setSize(read());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    ...size,
    isMobile: size.width < 640,
    isTablet: size.width >= 640 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
}

// Re-export ZoomBar and new usePageZoom from ZoomBar module
export { ZoomBar, usePageZoom, type PageZoomState, type PageZoomOptions } from './ZoomBar';


/** Classes dos botões da barra do leitor (iguais em PDF e EPUB). */
export const READER_BUTTON_CLASS = `
  flex items-center justify-center
  rounded-xl
  transition-all duration-200
  text-[var(--text-sub)]
  hover:text-[var(--gold)]
  hover:bg-[var(--gold-glow)]
  active:scale-95
  disabled:opacity-30
  disabled:pointer-events-none
`;

export const READER_BUTTON_ACTIVE_CLASS = `
  text-[var(--gold)]
  bg-[var(--gold-glow)]
`;
