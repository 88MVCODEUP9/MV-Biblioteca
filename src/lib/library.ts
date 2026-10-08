// Lógica pura da biblioteca (sem React) — fácil de testar.

export type FileType = 'pdf' | 'epub';

export interface Collection {
  id: string;
  name: string;
  parentId?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  fileType: FileType;
  filePath: string;
  coverPath?: string;
  collectionId?: string;
  subCollectionId?: string;
  addedDate: string;
}

export type SortMode = 'default' | 'title' | 'recent';
export type FormatFilter = 'all' | FileType;

export function canonicalKey(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sameCollectionId(first?: string, second?: string): boolean {
  if (!first || !second) return false;
  return canonicalKey(first) === canonicalKey(second);
}

export function isValidBook(value: unknown): value is Book {
  if (!value || typeof value !== 'object') return false;
  const book = value as Partial<Book>;
  return (
    typeof book.id === 'string' &&
    typeof book.title === 'string' && book.title.trim().length > 0 &&
    typeof book.author === 'string' && book.author.trim().length > 0 &&
    (book.fileType === 'pdf' || book.fileType === 'epub') &&
    typeof book.filePath === 'string' && isHttpUrl(book.filePath) &&
    typeof book.addedDate === 'string'
  );
}

/**
 * Normaliza URLs de arquivos/capas:
 *  - links "github.com/<user>/<repo>/blob/<ref>/<path>?raw=true" viram
 *    "raw.githubusercontent.com/..." (evita o redirecionamento extra);
 *  - espaços e caracteres fora de ASCII são codificados corretamente, sem
 *    codificar duas vezes uma URL que já está codificada.
 */
export function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);

    if (url.hostname === 'github.com') {
      const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
      if (match) {
        const [, user, repo, rest] = match;
        return `https://raw.githubusercontent.com/${user}/${repo}/${rest}`;
      }
    }

    return url.toString();
  } catch {
    return value;
  }
}

/** Livro pertence à coleção (ou a uma de suas subcoleções)? */
export function bookInCollection(
  book: Book,
  collectionId: string,
  childIds: string[],
): boolean {
  return (
    sameCollectionId(book.collectionId, collectionId) ||
    sameCollectionId(book.subCollectionId, collectionId) ||
    childIds.some(
      childId =>
        sameCollectionId(childId, book.subCollectionId) ||
        sameCollectionId(childId, book.collectionId),
    )
  );
}

export function sortBooks(books: Book[], mode: SortMode): Book[] {
  if (mode === 'default') return books;
  const copy = [...books];
  if (mode === 'title') {
    copy.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { numeric: true, sensitivity: 'base' }));
  } else {
    copy.sort((a, b) => b.addedDate.localeCompare(a.addedDate));
  }
  return copy;
}

export function buildCollectionDefinitions(
  books: Book[],
  defaults: Collection[],
): Collection[] {
  const fromBooks = books.flatMap(book => {
    const definitions: Collection[] = [];
    if (book.collectionId) definitions.push({ id: book.collectionId, name: book.collectionId });
    if (book.subCollectionId) {
      definitions.push({ id: book.subCollectionId, name: book.subCollectionId, parentId: book.collectionId });
    }
    return definitions;
  });

  return [...defaults, ...fromBooks].filter(
    (collection, index, all) =>
      all.findIndex(item => sameCollectionId(item.id, collection.id)) === index,
  );
}
