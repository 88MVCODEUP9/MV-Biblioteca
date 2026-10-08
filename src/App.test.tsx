import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Os leitores reais dependem de pdf.js/epub.js (canvas, workers): troca por stubs leves.
vi.mock('@/components/PDFReader', () => ({
  PDFReader: ({ title, onClose }: { title: string; onClose: () => void }) => (
    <div data-testid="pdf-reader">{title}<button onClick={onClose}>fechar</button></div>
  ),
}));
vi.mock('@/components/EpubReader', () => ({
  EpubReader: ({ title }: { title: string }) => <div data-testid="epub-reader">{title}</div>,
}));

const bookButtons = () => screen.queryAllByRole('button', { name: /^Ler / });

describe('App — estante', () => {
  it('mostra o título e todos os livros pré-carregados', () => {
    render(<App />);
    expect(screen.getAllByText('Minha Estante').length).toBeGreaterThan(0);
    expect(bookButtons().length).toBeGreaterThan(300);
  });

  it('busca por título ignorando acentos e limpa com o botão X', async () => {
    const user = userEvent.setup();
    render(<App />);
    const total = bookButtons().length;

    await user.type(screen.getByLabelText('Buscar livros'), 'crepusculo');
    const found = bookButtons();
    expect(found.length).toBeGreaterThan(0);
    expect(found.length).toBeLessThan(total);

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(bookButtons().length).toBe(total);
  });

  it('mostra estado vazio com atalho para limpar filtros', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Buscar livros'), 'zzzxxxqqq');
    expect(screen.getByText('Nenhum livro encontrado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar busca e filtros' }));
    expect(bookButtons().length).toBeGreaterThan(300);
  });

  it('filtra por formato e volta para todos', async () => {
    const user = userEvent.setup();
    render(<App />);
    const total = bookButtons().length;

    await user.click(screen.getByRole('button', { name: 'EPUB' }));
    const epubs = bookButtons().length;
    expect(epubs).toBeGreaterThan(0);
    expect(epubs).toBeLessThan(total);

    await user.click(screen.getByRole('button', { name: 'PDF' }));
    expect(bookButtons().length + epubs).toBe(total);

    await user.click(screen.getByRole('button', { name: 'Todos' }));
    expect(bookButtons().length).toBe(total);
  });

  it('ordena de A a Z', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Ordenar livros'), 'title');
    const names = bookButtons().map(b => b.getAttribute('aria-label')!.replace('Ler ', ''));
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });

  it('troca entre grade e lista', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.querySelector('.grid-cols-3')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Mudar visualização' }));
    expect(document.querySelector('.grid-cols-3')).toBeNull();
  });
});

describe('App — coleções', () => {
  it('navega Coleções → Marvel → subcoleção → voltar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('button', { name: /Coleções/ }));
    await user.click(screen.getByText('Marvel'));
    expect(screen.getByText('Guerras Secretas (1984)')).toBeInTheDocument();

    await user.click(screen.getByText('Guerras Secretas (1984)'));
    expect(bookButtons().length).toBe(12);

    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByText('Guerras Secretas II (1985)')).toBeInTheDocument();
  });
});

describe('App — leitor', () => {
  it('abre o leitor, registra em "Continue de onde parou" e fecha', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByTestId('recent-shelf')).toBeNull();

    await user.click(bookButtons()[0]);
    expect(await screen.findByTestId('pdf-reader')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('estante_recent_v1')!)).toHaveLength(1);
    expect(document.title).toMatch(/Minha Estante/);

    await user.click(screen.getByRole('button', { name: 'fechar' }));
    expect(screen.queryByTestId('pdf-reader')).toBeNull();
    expect(screen.getByTestId('recent-shelf')).toBeInTheDocument();
  });

  it('capa quebrada mostra o título no lugar da imagem', () => {
    render(<App />);
    const img = document.querySelector('img')!;
    const title = img.getAttribute('alt')!;
    img.dispatchEvent(new Event('error'));
    return vi.waitFor(() => {
      expect(document.querySelector(`img[alt="${CSS.escape(title)}"]`)).toBeNull();
    });
  });

  it('no StrictMode o leitor continua aberto (efeito do histórico não fecha sozinho)', async () => {
    const user = userEvent.setup();
    render(<StrictMode><App /></StrictMode>);
    await user.click(bookButtons()[0]);
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(screen.getByTestId('pdf-reader')).toBeInTheDocument();
  });

  it('o botão voltar do navegador fecha só o leitor', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(bookButtons()[0]);
    expect(await screen.findByTestId('pdf-reader')).toBeInTheDocument();
    window.history.back();
    await vi.waitFor(() => expect(screen.queryByTestId('pdf-reader')).toBeNull());
    expect(bookButtons().length).toBeGreaterThan(300);
  });
});
