import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
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
});
