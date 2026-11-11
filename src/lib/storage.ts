import { PRELOADED_BOOKS } from '@/data/catalog';
import { isValidBook, type Book } from './library';

const STORAGE_KEY = 'estante_books_v2';
const HIDDEN_PRELOADED_STORAGE_KEY = 'estante_hidden_preloaded_v1';
const RECENT_STORAGE_KEY = 'estante_recent_v1';
export const MAX_RECENT = 8;


function readStoredJson(key: string): unknown {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadInitialBooks(): Book[] {
  const parsedBooks = readStoredJson(STORAGE_KEY);
  const userBooks = Array.isArray(parsedBooks) ? parsedBooks.filter(isValidBook) : [];
  const preloadedIds = new Set(PRELOADED_BOOKS.map(book => book.id));
  // Evita chaves duplicadas na lista, inclusive em cadastros antigos do navegador.
  const extraIds = new Set<string>();
  const extras = userBooks.filter(book => {
    if (preloadedIds.has(book.id) || extraIds.has(book.id)) return false;
    extraIds.add(book.id);
    return true;
  });

  const hiddenRaw = readStoredJson(HIDDEN_PRELOADED_STORAGE_KEY);
  const hidden = new Set(
    Array.isArray(hiddenRaw) ? hiddenRaw.filter((id): id is string => typeof id === 'string') : []
  );

  return [...PRELOADED_BOOKS.filter(book => !hidden.has(book.id)), ...extras];
}

export function loadRecentIds(): string[] {
  const raw = readStoredJson(RECENT_STORAGE_KEY);
  return Array.isArray(raw) ? [...new Set(raw.filter((id): id is string => typeof id === 'string'))].slice(0, MAX_RECENT) : [];
}

export function saveRecentIds(ids: string[]) {
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* armazenamento cheio ou bloqueado — o histórico é opcional */
  }
}


