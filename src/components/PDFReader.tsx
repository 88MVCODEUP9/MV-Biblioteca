import { useCallback, useState } from 'react';

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
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState({
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  });

  const previousPage = useCallback(() => {
    setPageNumber((page) => Math.max(page - 1, 1));
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((page) => Math.min(page + 1, numPages));
  }, [numPages]);

  const downloadPdf = useCallback(() => {
    void triggerDownload(url, `${title}.pdf`);
  }, [url, title]);

  return (
    <ReaderShell
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
            onLoadSuccess={({ numPages: total }) => {
              setNumPages(total);
              setPageNumber(1);
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
            {!isLoading && !error && numPages > 0 && (
              <div className="relative select-none">
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
          </Document>
        );
      }}
    </ReaderShell>
  );
}
