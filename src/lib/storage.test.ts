import { describe, expect, it, vi } from 'vitest';
import { PRELOADED_BOOKS } from '@/data/catalog';
import { loadInitialBooks, loadRecentIds, saveRecentIds, MAX_RECENT } from './storage';

const customBook = { ...PRELOADED_BOOKS[0], id: 'custom-book' };

describe('armazenamento da biblioteca', () => {
  it('mantém o catálogo quando os dados salvos estão corrompidos', () => {
    localStorage.setItem('estante_books_v2', '{quebrado');
    expect(loadInitialBooks()).toEqual(PRELOADED_BOOKS);
  });

  it('ignora dados inválidos e livros duplicados', () => {
    localStorage.setItem('estante_books_v2', JSON.stringify([
      null, { id: 'invalid' }, PRELOADED_BOOKS[0], customBook, customBook,
    ]));
    expect(loadInitialBooks()).toHaveLength(PRELOADED_BOOKS.length + 1);
  });

  it('respeita os livros ocultos sem aceitar IDs de tipos incorretos', () => {
    localStorage.setItem('estante_hidden_preloaded_v1', JSON.stringify([PRELOADED_BOOKS[0].id, null, {}]));
    expect(loadInitialBooks()).toHaveLength(PRELOADED_BOOKS.length - 1);
    expect(loadInitialBooks().some(book => book.id === PRELOADED_BOOKS[0].id)).toBe(false);
  });

  it('remove entradas inválidas e repetidas do histórico e limita seu tamanho', () => {
    localStorage.setItem('estante_recent_v1', JSON.stringify([null, 'a', 'a', ...Array.from({ length: 20 }, (_, i) => String(i))]));
    expect(loadRecentIds()).toHaveLength(MAX_RECENT);
    expect(loadRecentIds().slice(0, 2)).toEqual(['a', '0']);
  });

  it('funciona quando o armazenamento está bloqueado ou cheio', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('cheio'); });
    try {
      expect(loadInitialBooks()).toEqual(PRELOADED_BOOKS);
      expect(loadRecentIds()).toEqual([]);
      expect(() => saveRecentIds(['a'])).not.toThrow();
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });
});
