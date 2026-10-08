import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ePub from 'epubjs';
import type { Book, Contents, Location, NavItem, Rendition } from 'epubjs';

import { List } from 'lucide-react';

import {
  ReaderShell,
  ScaledStage,
  type ReaderShellHandle,
} from './reader/ReaderShell';

import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  READER_BUTTON_ACTIVE_CLASS,
  READER_BUTTON_CLASS,
  triggerDownload,
} from './reader/reader-kit';

/* ─────────────────────────────────────────────────────────────────────────────
   EpubReader

   Usa o MESMO shell do PDFReader (cabeçalho, zoom, páginas, setas, rodapé,
   teclado, gestos, tela cheia, baixar, girar). O EPUB é paginado dentro de
   uma "folha" do tamanho de uma página A4 e a folha é ampliada / girada
   exatamente como uma página de PDF.
───────────────────────────────────────────────────────────────────────────── */

interface EpubReaderProps {
  url: string;
  title: string;
  author: string;
  coverUrl?: string;
  onClose: () => void;
}

/*
 * Espaço total entre colunas. O epub.js usa metade dele como margem de cada
 * lado da página — 96 → margem de 48px, parecida com a de um PDF.
 */
const PAGE_GAP = 96;

/* Caracteres por página quando não dá para medir (a folha tem tamanho fixo). */
const DEFAULT_CHARS_PER_PAGE = 1500;

const LOAD_TIMEOUT_MS = 45_000;

/*
 * Tema único (folha branca, igual às páginas do PDF).
 * Importante: NÃO mexer em padding/margin/largura do body — o epub.js controla
 * esses valores para montar as colunas; sobrescrevê-los quebrava a paginação.
 */
const EPUB_THEME = {
  body: {
    'font-family': 'Georgia, "Times New Roman", serif !important',
    'font-size': '17px',
    'line-height': '1.65 !important',
    color: '#202124 !important',
    background: '#ffffff !important',
    'text-rendering': 'optimizeLegibility',
    '-webkit-font-smoothing': 'antialiased',
  },
  p: {
    'line-height': '1.65 !important',
    'margin-top': '0 !important',
    'margin-bottom': '0.9em !important',
    orphans: '2',
    widows: '2',
  },
  'h1, h2, h3, h4, h5, h6': {
    color: '#111111 !important',
    'line-height': '1.25 !important',
    'break-after': 'avoid',
  },
  a: {
    color: '#8a6d1d !important',
  },
  img: {
    'max-width': '100% !important',
    'max-height': '720px !important',
    height: 'auto !important',
    'object-fit': 'contain',
  },
  svg: {
    'max-width': '100% !important',
    'max-height': '720px !important',
  },
};

const PROTECTION_CSS = `
  html {
    overscroll-behavior: none;
  }

  html, body, body * {
    -webkit-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  img, svg {
    -webkit-user-drag: none !important;
  }

  ::selection {
    background: transparent !important;
  }
`;

function describeLoadError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('failed to fetch') || lower.includes('cors')) {
    return 'Este EPUB não pode ser carregado diretamente devido às regras de CORS ou a conexão falhou.';
  }

  if (message.startsWith('HTTP ')) {
    return `O arquivo EPUB não está disponível no endereço informado (${message}).`;
  }

  if (lower.includes('tempo')) {
    return 'O EPUB demorou demais para abrir. Tente novamente.';
  }

  return 'Não foi possível abrir este EPUB. O arquivo pode estar corrompido, protegido ou o endereço pode estar indisponível.';
}

interface FlatTocItem {
  id: string;
  href: string;
  label: string;
  depth: number;
}

function flattenToc(items: NavItem[], depth = 0): FlatTocItem[] {
  return items.flatMap((item, index) => [
    {
      id: `${depth}-${index}-${item.id || item.href}`,
      href: item.href,
      label: (item.label || '').trim() || 'Sem título',
      depth,
    },
    ...(item.subitems?.length ? flattenToc(item.subitems, depth + 1) : []),
  ]);
}

export function EpubReader({
  url,
  title,
  author,
  coverUrl,
  onClose,
}: EpubReaderProps) {
  const shellRef = useRef<ReaderShellHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [pageNumber, setPageNumber] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const [toc, setToc] = useState<NavItem[]>([]);
  const [showToc, setShowToc] = useState(false);

  const flatToc = useMemo(() => flattenToc(toc), [toc]);

  /* ─────────────────────────────────────────────────────────────────────────
     Carregamento do livro
  ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    const host = stageRef.current;

    if (!host) return;

    let cancelled = false;
    let book: Book | null = null;
    let rendition: Rendition | null = null;
    let locationsReady = false;
    let currentCfi: string | null = null;

    const updateFromLocations = () => {
      if (!book || !locationsReady || !currentCfi) return;

      const index = book.locations.locationFromCfi(currentCfi) as unknown;

      if (typeof index === 'number' && index >= 0) {
        setPageNumber(index + 1);
        setNumPages(Math.max(book.locations.length(), index + 1));
      }
    };

    const handleRelocated = (location: Location) => {
      currentCfi = location.start?.cfi ?? null;

      setAtStart(Boolean(location.atStart));
      setAtEnd(Boolean(location.atEnd));

      if (locationsReady) {
        updateFromLocations();
        return;
      }

      // Enquanto o livro inteiro não foi contado, mostra a página do capítulo.
      const displayed = location.start?.displayed;

      if (displayed) {
        setPageNumber(displayed.page);
        setNumPages(displayed.total);
      }
    };

    /* Proteção + eventos de dentro do iframe de cada capítulo. */
    const handleContent = (contents: Contents) => {
      const doc = contents.document;

      if (!doc) return;

      if (!doc.getElementById('mv-reader-content-protection')) {
        const style = doc.createElement('style');
        style.id = 'mv-reader-content-protection';
        style.textContent = PROTECTION_CSS;
        doc.head?.appendChild(style);
      }

      const prevent = (event: Event) => event.preventDefault();

      doc.addEventListener('selectstart', prevent);
      doc.addEventListener('copy', prevent);
      doc.addEventListener('cut', prevent);
      doc.addEventListener('contextmenu', prevent);
      doc.addEventListener('dragstart', prevent);

      // Teclas dentro do iframe não chegam ao documento principal:
      // repassamos para o shell, assim setas, +, -, 0, R, F e Esc funcionam
      // mesmo depois de clicar no livro.
      doc.addEventListener('keydown', (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (
          (event.ctrlKey || event.metaKey) &&
          ['a', 'c', 'x', 's', 'p'].includes(key)
        ) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (
          [' ', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(
            event.key
          )
        ) {
          event.preventDefault();
        }

        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: event.key,
            code: event.code,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            altKey: event.altKey,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      // Ctrl + roda / pinça do trackpad = zoom (como no PDF).
      doc.addEventListener(
        'wheel',
        (event: WheelEvent) => {
          if (!event.ctrlKey) return;

          event.preventDefault();
          shellRef.current?.wheelZoom(event.deltaY);
        },
        { passive: false }
      );

      doc.addEventListener('mousemove', () => shellRef.current?.wake(), {
        passive: true,
      });

      // Deslizar / toque duplo dentro do livro, igual ao PDF.
      doc.addEventListener(
        'touchstart',
        (event: TouchEvent) => {
          if (event.touches.length === 1) {
            shellRef.current?.localTouchStart(
              event.touches[0].clientX,
              event.touches[0].clientY
            );
          } else {
            shellRef.current?.localTouchCancel();
          }
        },
        { passive: true }
      );

      // Deslize horizontal vira troca de página, não "voltar" do navegador.
      let moveStart: { x: number; y: number } | null = null;

      doc.addEventListener(
        'touchstart',
        (event: TouchEvent) => {
          moveStart =
            event.touches.length === 1
              ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
              : null;
        },
        { passive: true }
      );

      doc.addEventListener(
        'touchmove',
        (event: TouchEvent) => {
          if (!moveStart || event.touches.length !== 1) return;
          if (shellRef.current?.isPanMode()) return;

          const dx = Math.abs(event.touches[0].clientX - moveStart.x);
          const dy = Math.abs(event.touches[0].clientY - moveStart.y);

          if (dx > dy && event.cancelable) event.preventDefault();
        },
        { passive: false }
      );

      doc.addEventListener(
        'touchend',
        (event: TouchEvent) => {
          const touch = event.changedTouches[0];

          if (touch) {
            shellRef.current?.localTouchEnd(touch.clientX, touch.clientY);
          }
        },
        { passive: true }
      );
    };

    const load = async () => {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(
          () => controller.abort(),
          LOAD_TIMEOUT_MS
        );

        let data: ArrayBuffer;

        try {
          const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit',
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          data = await response.arrayBuffer();
        } finally {
          window.clearTimeout(timeout);
        }

        if (cancelled) return;

        book = ePub(data);

        const options = {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          spread: 'none',
          flow: 'paginated',
          gap: PAGE_GAP,
          resizeOnOrientationChange: false,
        };

        rendition = book.renderTo(host, options);
        renditionRef.current = rendition;

        rendition.themes.default(EPUB_THEME);
        rendition.hooks.content.register(handleContent);
        rendition.on('relocated', handleRelocated);

        const navigation = await book.loaded.navigation;

        if (cancelled) return;

        setToc(navigation?.toc ?? []);

        await Promise.race([
          rendition.display(),
          new Promise<never>((_, reject) =>
            window.setTimeout(
              () => reject(new Error('tempo esgotado')),
              LOAD_TIMEOUT_MS
            )
          ),
        ]);

        if (cancelled) return;

        setLoading(false);

        // A contagem de páginas do livro todo é opcional: roda depois que a
        // primeira página já está na tela (EPUBs grandes podem demorar).
        // Mede quantos caracteres cabem de verdade em uma folha, para que o
        // contador avance de 1 em 1 a cada virada de página.
        let charsPerPage = DEFAULT_CHARS_PER_PAGE;

        try {
          const contents = rendition.getContents() as unknown as Contents[];
          const current = Array.isArray(contents) ? contents[0] : null;
          const textLength = current?.document?.body?.textContent?.length ?? 0;
          const here = (await rendition.currentLocation()) as unknown as Location;
          const total = here?.start?.displayed?.total ?? 0;

          if (total >= 3 && textLength > 0) {
            charsPerPage = Math.max(400, Math.round(textLength / total));
          }
        } catch {
          // Usa o valor padrão.
        }

        if (cancelled) return;

        book.locations
          .generate(charsPerPage)
          .then(() => {
            if (cancelled) return;

            locationsReady = true;
            updateFromLocations();
          })
          .catch((locationError: unknown) => {
            if (!cancelled) {
              console.warn(
                'Não foi possível contar as páginas do EPUB.',
                locationError
              );
            }
          });
      } catch (err) {
        if (cancelled) return;

        console.error('Erro ao abrir EPUB:', err);

        setError(
          err instanceof DOMException && err.name === 'AbortError'
            ? describeLoadError(new Error('tempo esgotado'))
            : describeLoadError(err)
        );
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;

      try {
        rendition?.destroy();
      } catch {
        // Ignora erros de limpeza.
      }

      try {
        book?.destroy();
      } catch {
        // Ignora erros de limpeza.
      }

      renditionRef.current = null;
      host.innerHTML = '';
    };
  }, [url, reloadKey]);

  /* ─────────────────────────────────────────────────────────────────────────
     Navegação / ações
  ───────────────────────────────────────────────────────────────────────── */

  const nextPage = useCallback(() => {
    renditionRef.current?.next().catch(() => {});
  }, []);

  const previousPage = useCallback(() => {
    renditionRef.current?.prev().catch(() => {});
  }, []);

  const downloadEpub = useCallback(() => {
    void triggerDownload(url, `${title}.epub`);
  }, [url, title]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setPageNumber(null);
    setNumPages(null);
    setReloadKey((key) => key + 1);
  }, []);

  const closeToc = useCallback(() => setShowToc(false), []);
  const toggleToc = useCallback(() => setShowToc((value) => !value), []);

  const goToChapter = useCallback((href: string) => {
    renditionRef.current
      ?.display(href)
      .then(() => setShowToc(false))
      .catch((err: unknown) => {
        console.warn('Não foi possível abrir o capítulo.', err);
      });
  }, []);

  return (
    <ReaderShell
      ref={shellRef}
      title={title}
      author={author || 'Autor desconhecido'}
      formatLabel="EPUB"
      coverUrl={coverUrl}
      onClose={onClose}
      loading={loading}
      loadingTitle="Carregando EPUB"
      loadingSubtitle="Preparando o livro…"
      error={error}
      errorTitle="Não foi possível abrir o EPUB"
      errorPrimary={{ label: 'Tentar novamente', onClick: retry }}
      pageNumber={pageNumber}
      numPages={numPages}
      canPrev={!atStart}
      canNext={!atEnd}
      onPrev={previousPage}
      onNext={nextPage}
      pageWidth={PAGE_WIDTH}
      pageHeight={PAGE_HEIGHT}
      onDownload={downloadEpub}
      headerExtras={
        flatToc.length > 0 ? (
          <button
            type="button"
            onClick={toggleToc}
            className={`${READER_BUTTON_CLASS} w-10 h-10 ${
              showToc ? READER_BUTTON_ACTIVE_CLASS : ''
            }`}
            title="Sumário (T)"
            aria-label="Sumário"
            aria-pressed={showToc}
          >
            <List className="w-4 h-4" />
          </button>
        ) : null
      }
      panelOpen={showToc && flatToc.length > 0}
      panelTitle="Sumário"
      onClosePanel={closeToc}
      onTogglePanel={flatToc.length > 0 ? toggleToc : undefined}
      panel={flatToc.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => goToChapter(item.href)}
          className="
            w-full
            text-left
            py-2.5
            pr-3
            rounded-lg
            text-sm
            text-[var(--text-sub)]
            hover:text-[var(--gold)]
            hover:bg-[var(--gold-glow)]
            transition-colors
          "
          style={{ paddingLeft: 12 + Math.min(item.depth, 4) * 14 }}
        >
          {item.label}
        </button>
      ))}
    >
      {({ scale, rotation }) => (
        <ScaledStage
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          scale={scale}
          rotation={rotation}
        >
          <div
            ref={stageRef}
            aria-label="Conteúdo do livro"
            className="
              overflow-hidden
              rounded-sm
              bg-white
              shadow-[0_12px_50px_rgba(0,0,0,.45)]
            "
            style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
          />
        </ScaledStage>
      )}
    </ReaderShell>
  );
}
