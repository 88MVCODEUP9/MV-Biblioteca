import { describe, expect, it, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { ZoomBar } from './ZoomBar';

beforeAll(() => {
  // jsdom não implementa captura de ponteiro
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
});

function makeScroller(scrollWidth: number, clientWidth: number) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true });
  // jsdom não rola de verdade: scrollLeft vira uma propriedade comum
  Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true, configurable: true });
  const ref = createRef<HTMLElement>() as { current: HTMLElement | null };
  ref.current = el;
  return { el, ref };
}

describe('ZoomBar', () => {
  const baseProps = { onZoomIn: vi.fn(), onZoomOut: vi.fn(), onReset: vi.fn() };

  it('mostra o zoom atual e desabilita os botões nos limites', () => {
    const { ref } = makeScroller(500, 500);
    const { rerender } = render(<ZoomBar {...baseProps} zoom={25} scrollRef={ref} />);

    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /diminuir zoom/i })).toBeDisabled();

    rerender(<ZoomBar {...baseProps} zoom={300} scrollRef={ref} />);
    expect(screen.getByRole('button', { name: /aumentar zoom/i })).toBeDisabled();
  });

  it('a caixa fica desativada quando a página cabe na tela', () => {
    const { ref } = makeScroller(500, 500);
    render(<ZoomBar {...baseProps} zoom={100} scrollRef={ref} />);

    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
  });

  it('arrastar a caixa rola a página para os lados', async () => {
    const { el, ref } = makeScroller(2000, 400);
    render(<ZoomBar {...baseProps} zoom={200} scrollRef={ref} />);

    const thumb = await screen.findByRole('slider');
    await waitFor(() => expect(thumb).toHaveAttribute('aria-disabled', 'false'));
    // trilho com 300px de curso (largura - caixa - folgas)
    const track = thumb.parentElement as HTMLElement;
    Object.defineProperty(track, 'clientWidth', { value: 300 + 72 + 4, configurable: true });

    fireEvent.pointerDown(thumb, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(thumb, { pointerId: 1, clientX: 400 }); // andou o curso inteiro

    expect(el.scrollLeft).toBe(2000 - 400);
  });

  it('toque duplo na caixa pede "ajustar à tela"', () => {
    const { ref } = makeScroller(500, 500);
    render(<ZoomBar {...baseProps} zoom={100} scrollRef={ref} />);

    fireEvent.doubleClick(screen.getByRole('slider'));
    expect(baseProps.onReset).toHaveBeenCalled();
  });
});
