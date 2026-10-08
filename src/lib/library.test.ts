import { describe, expect, it } from 'vitest';
import {
  bookInCollection, buildCollectionDefinitions, canonicalKey, isValidBook,
  normalizeUrl, sameCollectionId, sortBooks, type Book,
} from './library';

const book = (over: Partial<Book> = {}): Book => ({
  id: '1', title: 'Livro', author: 'Autor', fileType: 'pdf',
  filePath: 'https://example.com/a.pdf', addedDate: '2026-01-01T00:00:00.000Z', ...over,
});

describe('canonicalKey / sameCollectionId', () => {
  it('ignora acentos, caixa e espaços nas pontas', () => {
    expect(canonicalKey('  Crepúsculo ')).toBe('crepusculo');
    expect(sameCollectionId('Bíblia em Quadrinho', 'biblia em quadrinho')).toBe(true);
  });
  it('retorna false quando falta um dos lados', () => {
    expect(sameCollectionId(undefined, 'x')).toBe(false);
    expect(sameCollectionId('x', '')).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('converte link blob do GitHub em raw e descarta ?raw=true', () => {
    expect(normalizeUrl('https://github.com/u/r/blob/main/A%20B/capa.webp?raw=true'))
      .toBe('https://raw.githubusercontent.com/u/r/main/A%20B/capa.webp');
  });
  it('codifica espaços e acentos', () => {
    expect(normalizeUrl('https://x.io/PDF/100 MINUTOS PLATÃO.pdf'))
      .toBe('https://x.io/PDF/100%20MINUTOS%20PLAT%C3%83O.pdf');
  });
  it('não codifica duas vezes uma URL já codificada', () => {
    const url = 'https://x.io/PDF/A%20B%2C%20C.pdf';
    expect(normalizeUrl(url)).toBe(url);
  });
  it('devolve o valor original se não for URL', () => {
    expect(normalizeUrl('não é url')).toBe('não é url');
  });
});

describe('isValidBook', () => {
  it('aceita um livro completo', () => expect(isValidBook(book())).toBe(true));
  it.each([
    ['sem título', { title: ' ' }],
    ['formato inválido', { fileType: 'mobi' }],
    ['url não http', { filePath: 'javascript:alert(1)' }],
  ])('rejeita livro %s', (_n, over) => {
    expect(isValidBook(book(over as Partial<Book>))).toBe(false);
  });
  it('rejeita null e primitivos', () => {
    expect(isValidBook(null)).toBe(false);
    expect(isValidBook('x')).toBe(false);
  });
});

describe('bookInCollection', () => {
  it('encontra por coleção, subcoleção e filhas', () => {
    const b = book({ collectionId: 'Marvel', subCollectionId: 'Guerras Secretas (1984)' });
    expect(bookInCollection(b, 'marvel', [])).toBe(true);
    expect(bookInCollection(b, 'Guerras Secretas (1984)', [])).toBe(true);
    expect(bookInCollection(b, 'Outra', ['Guerras Secretas (1984)'])).toBe(true);
    expect(bookInCollection(b, 'Outra', [])).toBe(false);
  });
});

describe('sortBooks', () => {
  const list = [
    book({ id: 'a', title: 'Livro 10', addedDate: '2026-01-01' }),
    book({ id: 'b', title: 'Livro 2', addedDate: '2026-03-01' }),
    book({ id: 'c', title: 'álbum', addedDate: '2026-02-01' }),
  ];
  it('por título usa ordem natural e ignora acento', () => {
    expect(sortBooks(list, 'title').map(x => x.id)).toEqual(['c', 'b', 'a']);
  });
  it('por data mostra os mais novos primeiro', () => {
    expect(sortBooks(list, 'recent').map(x => x.id)).toEqual(['b', 'c', 'a']);
  });
  it('default mantém a ordem e não altera a lista original', () => {
    expect(sortBooks(list, 'default')).toBe(list);
    sortBooks(list, 'title');
    expect(list.map(x => x.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('buildCollectionDefinitions', () => {
  it('une padrões e livros sem duplicar (ignorando acento/caixa)', () => {
    const defs = buildCollectionDefinitions(
      [book({ collectionId: 'marvel', subCollectionId: 'Sub' })],
      [{ id: 'Marvel', name: 'Marvel' }],
    );
    expect(defs.map(d => d.id)).toEqual(['Marvel', 'Sub']);
    expect(defs[1].parentId).toBe('marvel');
  });
});
