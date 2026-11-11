import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import type { ReaderShellHandle } from './reader/ReaderShell';

import { Document, Page, pdfjs } from 'react-pdf';

import { Loader2 } from 'lucide-react';

import { ReaderShell } from './reader/ReaderShell';

import { PAGE_HEIGHT, PAGE_WIDTH, triggerDownload } from './reader/reader-kit';

/* ─────────────────────────────────────────────────────────────────────────────
   PDF.js Worker

   Empacotado junto com o app (em vez de baixado de um CDN): funciona offline,
   não quebra com bloqueadores de anúncio e sempre tem a mesma versão do pdf.js.
───────────────────────────────────────────────────────────────────────────── */

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/* Limite de pixels do canvas — acima disso o navegador pode falhar (página em branco). */

const MAX_CANVAS_PIXELS = 16_000_000;

interface PDFReaderProps {
  url: string;
  title: string;
  author: string;
  coverUrl?: string;
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LazyPageSlot — HQs / PDFs em rolagem contínua

   Desenhar todas as páginas de uma vez trava o celular (um canvas por página).
   Aqui só as páginas perto da tela são desenhadas; as demais ficam como um
   espaço vazio do mesmo tamanho, então a barra de rolagem e a posição não
   mudam. Páginas que saem de longe liberam a memória do canvas.
───────────────────────────────────────────────────────────────────────────── */

const RENDER_MARGIN = '150% 0px';

function LazyPageSlot({
  page,
  width,
  height,
  children,
}: {
  page: number;
  width: number;
  height: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Sem IntersectionObserver (navegador muito antigo / testes): desenha tudo.
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: RENDER_MARGIN }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reader-page={page}
      className="flex w-full justify-center"
      // O espaço da página fica SEMPRE reservado: uma página que acabou de
      // entrar e ainda não carregou tem altura 0, o que faria a HQ "pular".
      style={{ minHeight: height, minWidth: width }}
    >
      {near ? children : null}
    </div>
  );
}

function describeLoadError(event: unknown): string {
  const message = event instanceof Error ? event.message : String(event);
  const lower = message.toLowerCase();

  if (lower.includes('cors') || lower.includes('failed to fetch')) {
    return 'Este PDF não pode ser carregado diretamente devido às regras de CORS.';
  }

  if (message.includes('Invalid PDF') || message.includes('startxref')) {
    return 'O arquivo informado não parece ser um PDF válido.';
  }

  if (lower.includes('missing pdf') || lower.includes('404')) {
    return 'O arquivo PDF não foi encontrado no endereço informado.';
  }

  return `Erro ao carregar o PDF: ${message}`;
}

export function PDFReader({
  url,
  title,
  author,
  coverUrl,
  onClose,
}: PDFReaderProps) {
  // HQs hospedadas no repositório HQ são lidas em fluxo contínuo, como um PDF.
  // Mantém mangás e demais PDFs no modo de uma página por vez.
  const continuousScroll = (() => {
    try {
      return decodeURIComponent(new URL(url).pathname)
        .split('/')
        .some((segment) => segment.toLowerCase() === 'hq');
    } catch {
      return false;
    }
  })();
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState({
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  });

  const shellRef = useRef<ReaderShellHandle>(null);

  // Tamanho real das páginas que diferem do tamanho da 1ª (HQs podem misturar tamanhos).
  const [measuredSizes, setMeasuredSizes] = useState<Record<number, { width: number; height: number }>>({});

  // Trava o scroll ANTES de trocar a página: o <Page> do react-pdf troca o
  // canvas por um placeholder durante o carregamento, o que faz o navegador
  // encolher o conteúdo e "cortar" o scrollTop.
  const previousPage = useCallback(() => {
    shellRef.current?.holdScroll();
    setPageNumber((page) => Math.max(page - 1, 1));
  }, []);

  const nextPage = useCallback(() => {
    shellRef.current?.holdScroll();
    setPageNumber((page) => Math.min(page + 1, numPages));
  }, [numPages]);

  const downloadPdf = useCallback(() => {
    void triggerDownload(url, `${title}.pdf`);
  }, [url, title]);

  return (
    <ReaderShell
      ref={shellRef}
      title={title}
      author={author}
      formatLabel="PDF"
      coverUrl={coverUrl}
      onClose={onClose}
      loading={isLoading}
      loadingTitle="Carregando PDF"
      loadingSubtitle="Preparando o documento…"
      error={error}
      errorTitle="Não foi possível abrir o PDF"
      errorPrimary={{
        label: 'Abrir PDF',
        onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
      }}
      pageNumber={numPages > 0 ? pageNumber : null}
      numPages={numPages > 0 ? numPages : null}
      canPrev={pageNumber > 1}
      canNext={pageNumber < numPages}
      onPrev={previousPage}
      onNext={nextPage}
      pageWidth={pageSize.width}
      pageHeight={pageSize.height}
      onDownload={downloadPdf}
      continuousScroll={continuousScroll}
    >
      {({ scale, rotation }) => {
        const devicePixelRatio = Math.max(
          1,
          Math.min(
            window.devicePixelRatio || 1,
            Math.sqrt(
              MAX_CANVAS_PIXELS /
                (pageSize.width * scale * pageSize.height * scale)
            )
          )
        );

        return (
          <Document
            file={url}
            onLoadSuccess={(pdf) => {
              const total = pdf.numPages;

              setNumPages(total);

              // HQ em rolagem contínua: só as páginas perto da tela são desenhadas,
              // então o tamanho real vem direto do PDF (senão o "ajustar à tela"
              // usaria um tamanho padrão e a página 1 abriria no lugar errado).
              if (continuousScroll) {
                void pdf
                  .getPage(1)
                  .then((first) => {
                    const view = first.getViewport({ scale: 1 });

                    setPageSize((current) =>
                      current.width === view.width && current.height === view.height
                        ? current
                        : { width: view.width, height: view.height }
                    );
                  })
                  .catch(() => {});
              }

              // Não volta para a página 1 se o Document recarregar: mantém a atual.
              setPageNumber((current) => Math.min(Math.max(current, 1), total));
              setIsLoading(false);
              setError(null);
            }}
            onLoadError={(event) => {
              setError(describeLoadError(event));
              setIsLoading(false);
            }}
            onSourceError={(event) => {
              setError(describeLoadError(event));
              setIsLoading(false);
            }}
            loading={null}
            error={null}
          >
            {!isLoading && !error && numPages > 0 && !continuousScroll && (
              <div
                className="relative select-none"
                style={{
                  // Reserva o tamanho da página enquanto a nova carrega, para o
                  // container não encolher (e o scrollTop não ser reduzido).
                  minWidth:
                    (rotation % 180 === 0 ? pageSize.width : pageSize.height) *
                    scale,
                  minHeight:
                    (rotation % 180 === 0 ? pageSize.height : pageSize.width) *
                    scale,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  devicePixelRatio={devicePixelRatio}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  canvasBackground="white"
                  className="overflow-hidden rounded-sm shadow-[0_12px_50px_rgba(0,0,0,.45)]"
                  loading={
                    <div
                      className="flex items-center justify-center bg-white rounded-sm"
                      style={{
                        width: pageSize.width * scale,
                        height: pageSize.height * scale,
                      }}
                    >
                      <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
                    </div>
                  }
                  onLoadSuccess={(page) => {
                    // Tamanho real da página: "ajustar à tela" fica correto
                    // para HQs, mangás e PDFs que não são A4.
                    setPageSize((current) =>
                      current.width === page.originalWidth &&
                      current.height === page.originalHeight
                        ? current
                        : {
                            width: page.originalWidth,
                            height: page.originalHeight,
                          }
                    );
                  }}
                />
              </div>
            )}
            {!isLoading && !error && numPages > 0 && continuousScroll && (
              <div className="flex w-max min-w-full flex-col items-center gap-2 py-2">
                {Array.from({ length: numPages }, (_, index) => {
                  const number = index + 1;
                  const known = measuredSizes[number] ?? pageSize;
                  const swapped = rotation % 180 !== 0;

                  return (
                    <LazyPageSlot
                      key={number}
                      page={number}
                      width={(swapped ? known.height : known.width) * scale}
                      height={(swapped ? known.width : known.height) * scale}
                    >
                      <Page
                        pageNumber={number}
                        scale={scale}
                        rotate={rotation}
                        devicePixelRatio={devicePixelRatio}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        canvasBackground="white"
                        className="overflow-hidden rounded-sm shadow-[0_12px_50px_rgba(0,0,0,.45)]"
                        loading={null}
                        onLoadSuccess={(loaded) => {
                          if (
                            known.width !== loaded.originalWidth ||
                            known.height !== loaded.originalHeight
                          ) {
                            setMeasuredSizes((current) => ({
                              ...current,
                              [number]: {
                                width: loaded.originalWidth,
                                height: loaded.originalHeight,
                              },
                            }));
                          }

                          if (index !== 0) return;
                          setPageSize((current) =>
                            current.width === loaded.originalWidth &&
                            current.height === loaded.originalHeight
                              ? current
                              : {
                                  width: loaded.originalWidth,
                                  height: loaded.originalHeight,
                                }
                          );
                        }}
                      />
                    </LazyPageSlot>
                  );
                })}
              </div>
            )}
          </Document>
        );
      }}
    </ReaderShell>
  );
}
