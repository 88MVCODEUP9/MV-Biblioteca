import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  FileText,
  FolderOpen,
  Grid3X3,
  Library,
  List,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { loadInitialBooks, loadRecentIds, saveRecentIds, MAX_RECENT } from '@/lib/storage';
import { DEFAULT_COLLECTIONS } from '@/data/catalog';
import { Input } from '@/components/ui/input';
import {
  bookInCollection,
  buildCollectionDefinitions,
  canonicalKey,
  sameCollectionId,
  sortBooks,
  type Book,
  type FileType,
  type FormatFilter,
  type SortMode,
} from '@/lib/library';

// Os leitores (pdf.js, epub.js) são pesados: só são baixados quando alguém abre um livro.
const loadPdfReader = () => import('@/components/PDFReader');
const loadEpubReader = () => import('@/components/EpubReader');
const PDFReader = lazy(() => loadPdfReader().then(m => ({ default: m.PDFReader })));
const EpubReader = lazy(() => loadEpubReader().then(m => ({ default: m.EpubReader })));

/** Começa a baixar o leitor assim que o dedo / mouse chega no livro: ao tocar, ele já está pronto. */
function prefetchReader(fileType: FileType) {
  if (fileType === 'epub') {
    loadEpubReader().catch(() => {});
  } else if (typeof DOMMatrix !== 'undefined') {
    // pdf.js precisa de DOMMatrix: sem ele nem adianta baixar o leitor.
    loadPdfReader().catch(() => {});
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileTypeIcon(ft: FileType) {
  if (ft === 'epub') return <BookOpen className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function fileTypeBadgeColor(ft: FileType) {
  if (ft === 'epub') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  return 'text-[var(--gold-dim)] bg-[var(--gold-glow-2)] border-[rgba(201,171,110,0.15)]';
}


const NAV_ITEMS = [
  { id: 'books', label: 'Livros', Icon: BookOpen },
  { id: 'collections', label: 'Coleções', Icon: FolderOpen },
] as const;


// ─── Small components ─────────────────────────────────────────────────────────

/** Capa com plano B: se a imagem falhar, mostra o título em vez de um buraco preto. */
function BookCover({ book, priority }: { book: Book; priority: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!book.coverPath || failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center text-[var(--text-muted)] bg-gradient-to-b from-[var(--bg-4)] to-[var(--bg-3)]">
        {fileTypeIcon(book.fileType)}
        <span className="font-serif text-[11px] leading-tight line-clamp-4 text-[var(--text-sub)]">{book.title}</span>
      </div>
    );
  }

  return (
    <img
      src={book.coverPath}
      alt={book.title}
      className="w-full h-full object-cover"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/** Evita que um erro dentro do leitor derrube o app inteiro. */
class ReaderBoundary extends Component<
  { onClose: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[var(--bg)] p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-[var(--gold)]" />
        <h2 className="font-serif text-xl text-[var(--text)]">Não foi possível abrir este livro</h2>
        <p className="max-w-sm text-sm text-[var(--text-sub)]">Ocorreu um erro no leitor. Volte à estante e tente abrir o livro de novo.</p>
        <button type="button" onClick={this.props.onClose} className="px-5 py-2 rounded-full bg-[var(--gold)] text-[var(--bg)] text-sm font-semibold">
          Voltar à estante
        </button>
      </div>
    );
  }
}

const FORMAT_FILTERS: { id: FormatFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pdf', label: 'PDF' },
  { id: 'epub', label: 'EPUB' },
];

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'default', label: 'Ordem da estante' },
  { id: 'title', label: 'Título (A–Z)' },
  { id: 'recent', label: 'Mais recentes' },
];

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const [books] = useState<Book[]>(loadInitialBooks);
  const collectionDefinitions = useMemo(() => buildCollectionDefinitions(books, DEFAULT_COLLECTIONS), [books]);

  const [activeTab,          setActiveTab]          = useState<'books' | 'collections'>('books');
  const [searchQuery,        setSearchQuery]        = useState('');
  // A digitação responde na hora; a lista filtra logo em seguida, sem travar.
  const deferredQuery = useDeferredValue(searchQuery);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{
    activeTab: 'books' | 'collections';
    selectedCollection: string | null;
  }>>([]);
  const [readingBook,        setReadingBook]        = useState<Book | null>(null);
  const [sortMode,          setSortMode]           = useState<SortMode>('default');
  const [formatFilter,      setFormatFilter]       = useState<FormatFilter>('all');
  const [recentIds,         setRecentIds]          = useState<string[]>(loadRecentIds);
  const isReading = readingBook !== null;

  // Abrir o leitor cria uma entrada de histórico; voltar fecha apenas o leitor.
  // O fechamento explícito remove essa entrada sem criar listeners temporários.
  useEffect(() => {
    if (!isReading) return;

    if (!window.history.state?.mvReader) {
      window.history.pushState({ ...window.history.state, mvReader: true }, '');
    }
    const handlePopState = () => setReadingBook(null);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isReading]);

  const closeReader = useCallback(() => {
    if (window.history.state?.mvReader) window.history.back();
    setReadingBook(null);
  }, []);

  const [viewMode,           setViewMode]           = useState<'grid' | 'list'>('grid');

  // ── Collections ────────────────────────────────────────────────────────────
  const collections = useMemo(() => {
    return collectionDefinitions.map(collection => {
      const childIds = collectionDefinitions.filter(item => sameCollectionId(item.parentId, collection.id)).map(item => item.id);
      const collectionBooks = books.filter(book => bookInCollection(book, collection.id, childIds));
      return {
        ...collection,
        count: collectionBooks.length,
        covers: collectionBooks.filter(book => book.coverPath).slice(0, 3).map(book => book.coverPath!),
        authors: [...new Set(collectionBooks.map(book => book.author))].slice(0, 2),
      };
    });
  }, [books, collectionDefinitions]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const q = canonicalKey(deferredQuery);
    const childIds = selectedCollection
      ? collectionDefinitions.filter(item => sameCollectionId(item.parentId, selectedCollection)).map(item => item.id)
      : [];

    const matches = books.filter(book => {
      const matchSearch = !q ||
        canonicalKey(book.title).includes(q) ||
        canonicalKey(book.author).includes(q);
      const matchCol = !selectedCollection || bookInCollection(book, selectedCollection, childIds);
      const matchFormat = formatFilter === 'all' || book.fileType === formatFilter;
      return matchSearch && matchCol && matchFormat;
    });

    return sortBooks(matches, sortMode);
  }, [books, collectionDefinitions, deferredQuery, selectedCollection, formatFilter, sortMode]);

  const recentBooks = useMemo(
    () => recentIds.map(id => books.find(book => book.id === id)).filter((book): book is Book => Boolean(book)),
    [recentIds, books],
  );

  const openBook = useCallback((book: Book) => {
    setReadingBook(book);
    setRecentIds(prev => [book.id, ...prev.filter(id => id !== book.id)].slice(0, MAX_RECENT));
  }, []);

  // Persistência isolada das atualizações de estado (compatível com StrictMode).
  useEffect(() => {
    saveRecentIds(recentIds);
  }, [recentIds]);

  useEffect(() => {
    document.title = readingBook
      ? `${readingBook.title} — Minha Estante`
      : selectedCollection
        ? `${selectedCollection} — Minha Estante`
        : 'Minha Estante — Biblioteca Digital';
  }, [readingBook, selectedCollection]);

  const changeTab = (tab: 'books' | 'collections') => {
    setNavigationHistory([]);
    setActiveTab(tab);
    setSelectedCollection(null);
    setSearchQuery('');
    setFormatFilter('all');
  };

  const selectCollection = useCallback((id: string) => {
    setNavigationHistory(prev => [...prev, { activeTab, selectedCollection }]);
    setSelectedCollection(id);
    setActiveTab(collectionDefinitions.some(collection => sameCollectionId(collection.parentId, id)) ? 'collections' : 'books');
  }, [activeTab, collectionDefinitions, selectedCollection]);

  // Retorna exatamente para a tela anterior, preservando aba e coleção.
  const goBack = useCallback(() => {
    const previous = navigationHistory[navigationHistory.length - 1];

    if (!previous) {
      setSelectedCollection(null);
      setActiveTab('collections');
      return;
    }

    setSelectedCollection(previous.selectedCollection);
    setActiveTab(previous.activeTab);
    setNavigationHistory(navigationHistory.slice(0, -1));
  }, [navigationHistory]);

  // ── Reader renderer ────────────────────────────────────────────────────────
  const renderReader = () => {
    if (!readingBook) return null;
    const close = closeReader;
    const Reader = readingBook.fileType === 'epub' ? EpubReader : PDFReader;
    return (
      <ReaderBoundary key={readingBook.id} onClose={close}>
        <Suspense
          fallback={
            <div role="status" aria-label="Carregando leitor" className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
            </div>
          }
        >
          <Reader
            url={readingBook.filePath}
            title={readingBook.title}
            author={readingBook.author}
            coverUrl={readingBook.coverPath}
            onClose={close}
          />
        </Suspense>
      </ReaderBoundary>
    );
  };

  // ── Book card (grid) ───────────────────────────────────────────────────────
  const renderBookCard = (book: Book, index: number) => (
    <button
      key={book.id}
      className="book-card animate-cardIn text-left"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
      onClick={() => openBook(book)}
      onPointerEnter={() => prefetchReader(book.fileType)}
      onFocus={() => prefetchReader(book.fileType)}
      aria-label={`Ler ${book.title}`}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[var(--bg-4)]">
        <BookCover book={book} priority={index < 6} />
        <div className="cover-overlay">
          <span className="px-3 py-1.5 bg-[var(--gold)] text-[var(--bg)] text-[10px] font-semibold uppercase tracking-wider rounded-full">
            Ler agora
          </span>
        </div>
        {/* Format badge */}
        <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${fileTypeBadgeColor(book.fileType)}`}>
          {book.fileType}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-serif font-semibold text-sm sm:text-base text-[var(--text)] line-clamp-2 leading-tight">{book.title}</h3>
        <p className="text-xs text-[var(--text-sub)] mt-1 truncate">{book.author}</p>
        {(book.collectionId || book.subCollectionId) && (
          <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[var(--gold-dim)] bg-[var(--gold-glow-2)] border border-[rgba(201,171,110,0.15)] rounded">
            {book.subCollectionId || book.collectionId}
          </span>
        )}
      </div>
    </button>
  );

  // ── Book row (list view) ───────────────────────────────────────────────────
  const renderBookRow = (book: Book, index: number) => (
    <button
      key={book.id}
      className="w-full flex items-center gap-4 p-3 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl hover:border-[var(--border-2)] transition-all animate-cardIn text-left group"
      style={{ animationDelay: `${Math.min(index * 0.02, 0.4)}s` }}
      onClick={() => openBook(book)}
      onPointerEnter={() => prefetchReader(book.fileType)}
      onFocus={() => prefetchReader(book.fileType)}
      aria-label={`Ler ${book.title}`}
    >
      <div className="relative flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-[var(--bg-4)]">
        <BookCover book={book} priority={index < 6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-[var(--text)] text-sm truncate group-hover:text-[var(--gold)] transition-colors">{book.title}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{book.author}</p>
        {(book.collectionId || book.subCollectionId) && (
          <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--gold-dim)] bg-[var(--gold-glow-2)] border border-[rgba(201,171,110,0.15)] rounded">
            {book.subCollectionId || book.collectionId}
          </span>
        )}
      </div>
      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase rounded border ${fileTypeBadgeColor(book.fileType)}`}>
        {fileTypeIcon(book.fileType)}{book.fileType}
      </span>
      <span className="text-[11px] text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity pr-1 flex-shrink-0">
        Ler →
      </span>
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-0">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 bg-[var(--bg-2)] border-r border-[var(--border)] flex-col z-50">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
              <Library className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-[var(--gold)]">Minha Estante</h1>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Biblioteca Digital</p>
            </div>
          </div>
        </div>

        <nav aria-label="Principal" className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => changeTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                activeTab === id
                  ? 'bg-[var(--gold-glow)] text-[var(--gold)] border-l-2 border-[var(--gold)] pl-[10px]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-sub)] hover:bg-white/[0.025]'
              }`}
            >
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span><b className="text-[var(--gold-dim)]">{books.length}</b> livros</span>
            <span><b className="text-[var(--gold-dim)]">{collections.length}</b> coleções</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['pdf','epub'] as FileType[]).map(ft => {
              const count = books.filter(b => b.fileType === ft).length;
              if (count === 0) return null;
              return (
                <span key={ft} className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${fileTypeBadgeColor(ft)}`}>
                  {ft} {count}
                </span>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-2)] border-b border-[var(--border)] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center">
            <Library className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <h1 className="font-serif text-base font-semibold text-[var(--gold)]">Minha Estante</h1>
        </div>
        {activeTab === 'books' && (
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="icon-btn w-9 h-9"
            aria-label="Mudar visualização"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">

        {/* ── Books ── */}
        {activeTab === 'books' && (
          <section className="animate-fadeIn max-w-[1600px] mx-auto">
            <div className="px-4 lg:px-10 pt-6 lg:pt-10 pb-4">
              {selectedCollection ? (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={goBack} className="icon-btn w-9 h-9" aria-label="Voltar">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--text)]">
                      <em className="text-[var(--gold)] not-italic">{selectedCollection}</em>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">
                      {filteredBooks.length} {filteredBooks.length === 1 ? 'livro' : 'livros'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--text)]">
                      Todos os <em className="text-[var(--gold)] not-italic">Livros</em>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">
                      {filteredBooks.length} títulos disponíveis
                    </p>
                  </div>
                  {/* Desktop view toggle */}
                  <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-3)] rounded-lg p-1 border border-[var(--border)]">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-[var(--gold-glow)] text-[var(--gold)]' : 'text-[var(--text-muted)] hover:text-[var(--text-sub)]'}`} aria-label="Grade" aria-pressed={viewMode === 'grid'}><Grid3X3 className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-[var(--gold-glow)] text-[var(--gold)]' : 'text-[var(--text-muted)] hover:text-[var(--text-sub)]'}`} aria-label="Lista" aria-pressed={viewMode === 'list'}><List className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
              <div className="gold-line mt-3" />
            </div>

            {/* Search + filters */}
            <div className="px-4 lg:px-10 pb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar título ou autor…"
                  className="pl-10 pr-10 bg-[var(--bg-3)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] h-12 rounded-xl focus:border-[var(--gold-dim)] transition-colors [&::-webkit-search-cancel-button]:hidden"
                  aria-label="Buscar livros"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5"
                    aria-label="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Filtrar por formato" className="flex items-center gap-1 bg-[var(--bg-3)] rounded-lg p-1 border border-[var(--border)]">
                  {FORMAT_FILTERS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormatFilter(id)}
                      aria-pressed={formatFilter === id}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        formatFilter === id
                          ? 'bg-[var(--gold-glow)] text-[var(--gold)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-sub)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortMode)}
                  aria-label="Ordenar livros"
                  className="h-9 px-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-xs text-[var(--text-sub)] focus:outline-none focus:border-[var(--gold-dim)]"
                >
                  {SORT_OPTIONS.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
                <span role="status" aria-live="polite" className="sr-only">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
                </span>
              </div>
            </div>

            {/* Abertos recentemente */}
            {!selectedCollection && !searchQuery && formatFilter === 'all' && recentBooks.length > 0 && (
              <div className="px-4 lg:px-10 pb-5">
                <h3 className="font-serif text-base text-[var(--text-sub)] mb-2">Abertos recentemente</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" data-testid="recent-shelf">
                  {recentBooks.map(book => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => openBook(book)}
      onPointerEnter={() => prefetchReader(book.fileType)}
      onFocus={() => prefetchReader(book.fileType)}
                      aria-label={`Continuar ${book.title}`}
                      className="relative flex-shrink-0 w-20 aspect-[2/3] rounded-md overflow-hidden border border-[var(--border)] hover:border-[var(--border-3)] transition-colors"
                    >
                      <BookCover book={book} priority={false} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Books grid or list */}
            <div className="px-4 lg:px-10 pb-10">
              {filteredBooks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-3)] flex items-center justify-center">
                    <Search className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="font-serif text-xl text-[var(--text)] mb-2">Nenhum livro encontrado</h3>
                  <p className="text-sm text-[var(--text-muted)]">Tente outra busca ou ajuste os filtros.</p>
                  {(searchQuery || formatFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setFormatFilter('all'); }}
                      className="mt-4 px-4 py-2 rounded-full border border-[var(--border-2)] text-xs text-[var(--gold)] hover:bg-[var(--gold-glow)]"
                    >
                      Limpar busca e filtros
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-5">
                  {filteredBooks.map(renderBookCard)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBooks.map(renderBookRow)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Collections ── */}
        {activeTab === 'collections' && (
          <section className="animate-fadeIn max-w-[1600px] mx-auto">
            <div className="px-4 lg:px-10 pt-6 lg:pt-10 pb-4">
              <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--text)]">
                Suas <em className="text-[var(--gold)] not-italic">Coleções</em>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Séries e universos literários</p>
              <div className="gold-line mt-3" />
            </div>
            <div className="px-4 lg:px-10 pb-8">
              {collections.length === 0 ? (
                <div className="text-center py-20">
                  <FolderOpen className="w-10 h-10 mx-auto mb-4 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Adicione livros com coleções para vê-las aqui.</p>
                </div>
              ) : selectedCollection && collectionDefinitions.some(collection => sameCollectionId(collection.parentId, selectedCollection)) ? (
                <div>
                  <button type="button" onClick={goBack} className="icon-btn w-9 h-9 mb-4" aria-label="Voltar às coleções">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-serif text-xl text-[var(--text)] mb-4">
                    <em className="text-[var(--gold)] not-italic">{selectedCollection}</em>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.filter(collection => sameCollectionId(collection.parentId, selectedCollection)).map((child, i) => (
                      <button key={child.id} onClick={() => selectCollection(child.id)} className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-5 text-left card-hover animate-cardIn" style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="w-12 h-16 mb-4 bg-[var(--bg-4)] rounded flex items-center justify-center overflow-hidden">
                          {child.covers[0] ? <img src={child.covers[0]} alt="" className="w-full h-full object-cover" /> : <FolderOpen className="w-6 h-6 text-[var(--text-muted)]" />}
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-[var(--text)] mb-2">{child.name}</h4>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-4)] border border-[var(--border)] rounded-full text-xs text-[var(--gold)] font-medium">
                          <BookOpen className="w-3 h-3" />{child.count} {child.count === 1 ? 'livro' : 'livros'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.filter(col => !col.parentId).map((col, i) => (
                    <button
                      type="button"
                      key={col.id}
                      className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-5 cursor-pointer card-hover animate-cardIn text-left"
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onClick={() => selectCollection(col.id)}
                    >
                      <div className="flex gap-2 mb-4">
                        {col.covers.length > 0 ? col.covers.map((cover, idx) => (
                          <img key={idx} src={cover} alt="" loading="lazy"
                            fetchPriority="low" decoding="async"
                            className="w-12 h-16 object-cover rounded border border-[var(--border)] shadow-lg"
                            style={{ transform: idx === 1 ? 'rotate(2deg) translateX(-4px)' : idx === 2 ? 'rotate(-2deg) translateX(-8px)' : 'none' }}
                          />
                        )) : (
                          <div className="w-12 h-16 bg-[var(--bg-4)] rounded flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-[var(--text)] mb-1">{col.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] mb-3">{col.authors.join(', ')}</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-4)] border border-[var(--border)] rounded-full text-xs text-[var(--gold)] font-medium">
                        <BookOpen className="w-3 h-3" />
                        {col.count} {col.count === 1 ? 'livro' : 'livros'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Principal (celular)" className="lg:hidden bottom-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => changeTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`bottom-nav-item ${activeTab === id ? 'active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Reader */}
      {renderReader()}

    </div>
  );
}

export default App;
