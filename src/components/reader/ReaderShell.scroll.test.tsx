import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReaderShell } from './ReaderShell';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

vi.mock('./reader-kit', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useViewport: () => ({
      width: 1280,
      height: 720,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }),
  };
});

const baseProps = {
  title: 'Livro',
  author: 'Autor',
  formatLabel: 'PDF',
  onClose: vi.fn(),
  loading: false,
  loadingTitle: 'Carregando',
  loadingSubtitle: 'Aguarde',
  error: null,
  errorTitle: 'Erro',
  numPages: 10,
  canPrev: true,
  canNext: true,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  pageWidth: 595,
  pageHeight: 842,
  children: () => <div style={{ width: 595, height: 842 }} />,
};

describe('ReaderShell — scroll preservado na troca de página', () => {
  it('não recentraliza nem volta ao topo quando a página muda', async () => {
    const { container, rerender } = render(
      <ReaderShell {...baseProps} pageNumber={1} />
    );

    const main = container.querySelector('main') as HTMLElement;

    // Simula página ampliada: faixa rolável de 800 x 1200 px.
    Object.defineProperty(main, 'scrollWidth', { value: 1800, configurable: true });
    Object.defineProperty(main, 'clientWidth', { value: 1000, configurable: true });
    Object.defineProperty(main, 'scrollHeight', { value: 2400, configurable: true });
    Object.defineProperty(main, 'clientHeight', { value: 1200, configurable: true });

    // O usuário rola de propósito (roda): essa passa a ser a posição dele.
    main.dispatchEvent(new Event('wheel'));
    main.scrollLeft = 700;
    main.scrollTop = 900;
    main.dispatchEvent(new Event('scroll'));

    rerender(<ReaderShell {...baseProps} pageNumber={2} />);

    expect(main.scrollLeft).toBe(700);
    expect(main.scrollTop).toBe(900);

    // O navegador "puxa" o scroll durante o carregamento da página nova…
    main.scrollLeft = 0;
    main.scrollTop = 0;
    main.dispatchEvent(new Event('scroll'));

    // …e a trava devolve a posição do usuário no próximo frame.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });

    expect(main.scrollLeft).toBe(700);
    expect(main.scrollTop).toBe(900);
  });
  const sizeScrollArea = (main: HTMLElement) => {
    Object.defineProperty(main, 'scrollWidth', { value: 1800, configurable: true });
    Object.defineProperty(main, 'clientWidth', { value: 1000, configurable: true });
    Object.defineProperty(main, 'scrollHeight', { value: 2400, configurable: true });
    Object.defineProperty(main, 'clientHeight', { value: 1200, configurable: true });
  };

  const wait = (ms: number) =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, ms));
    });

  it('posição escolhida na caixa do scroll fica TRAVADA ao virar página', async () => {
    const { container, rerender } = render(
      <ReaderShell {...baseProps} pageNumber={1} />
    );
    const main = container.querySelector('main') as HTMLElement;

    sizeScrollArea(main);
    main.scrollLeft = 0;

    // O usuário escolhe a posição na caixa (setas) e a página rola.
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    main.dispatchEvent(new Event('scroll'));

    expect(main.scrollLeft).toBe(120);

    // Várias trocas de página seguidas, com o navegador puxando o scroll.
    for (const page of [2, 3, 4]) {
      rerender(<ReaderShell {...baseProps} pageNumber={page} />);
      main.scrollLeft = 0;
      main.dispatchEvent(new Event('scroll'));
      await wait(60);
      expect(main.scrollLeft).toBe(120);
    }

    // Passado o tempo da troca, qualquer movimento que não seja do usuário
    // (foco, layout, navegador) também é desfeito.
    await wait(650);
    main.scrollLeft = 5;
    main.dispatchEvent(new Event('scroll'));

    expect(main.scrollLeft).toBe(120);
  });

  it('só muda quando o usuário mexe de novo na caixa', async () => {
    const { container } = render(<ReaderShell {...baseProps} pageNumber={1} />);
    const main = container.querySelector('main') as HTMLElement;

    sizeScrollArea(main);
    main.scrollLeft = 0;

    const thumb = screen.getByRole('slider');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    main.dispatchEvent(new Event('scroll'));
    expect(main.scrollLeft).toBe(60);

    await wait(650);

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    main.dispatchEvent(new Event('scroll'));
    expect(main.scrollLeft).toBe(120);

    await wait(650);
    main.scrollLeft = 0;
    main.dispatchEvent(new Event('scroll'));

    expect(main.scrollLeft).toBe(120);
  });
  it('trava a posição contra roda e toque e permite ajustar após destravar', () => {
    const { container } = render(<ReaderShell {...baseProps} pageNumber={1} />);
    const main = container.querySelector('main') as HTMLElement;
    sizeScrollArea(main);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    // A escolha é registrada mesmo antes do evento assíncrono de scroll.
    fireEvent.click(screen.getByRole('button', { name: 'Travar posição' }));
    fireEvent.wheel(main, { deltaX: 100, deltaY: 100 });
    fireEvent.touchMove(main);
    main.scrollLeft = 400;
    fireEvent.scroll(main);
    expect(main.scrollLeft).toBe(60);
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(main.scrollLeft).toBe(60);
    fireEvent.click(screen.getByRole('button', { name: 'Destravar posição' }));
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(main.scrollLeft).toBe(120);
  });

  it('preserva a proporção travada quando a largura muda', () => {
    const { container } = render(<ReaderShell {...baseProps} pageNumber={1} />);
    const main = container.querySelector('main') as HTMLElement;
    sizeScrollArea(main);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    fireEvent.click(screen.getByRole('button', { name: 'Travar posição' }));
    Object.defineProperty(main, 'scrollWidth', { value: 2600, configurable: true });
    fireEvent.scroll(main);
    expect(main.scrollLeft).toBe(120);
  });

});
