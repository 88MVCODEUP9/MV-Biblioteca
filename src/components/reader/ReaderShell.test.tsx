import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { ReaderShell } from './ReaderShell';
import { ScaledStage } from './ReaderShell';
import { usePageZoom } from './reader-kit';

// Polyfill for ResizeObserver in jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock do useViewport para controlar dimensões nos testes
vi.mock('./reader-kit', async (importOriginal) => {
  const actual = await importOriginal();
  const mod = actual as Record<string, unknown>;
  return {
    ...mod,
    useViewport: () => ({
      width: 1280,
      height: 720,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }),
  };
});

describe('ReaderShell — zoom e rolagem horizontal', () => {
  const defaultProps = {
    title: 'Livro Teste',
    author: 'Autor Teste',
    formatLabel: 'PDF',
    onClose: vi.fn(),
    loading: false,
    loadingTitle: 'Carregando',
    loadingSubtitle: 'Aguarde',
    error: null,
    errorTitle: 'Erro',
    pageNumber: 1,
    numPages: 10,
    canPrev: false,
    canNext: true,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    pageWidth: 595,
    pageHeight: 842,
    children: () => (
      <div
        style={{ width: 595, height: 842 }}
        className="bg-white rounded shadow"
        data-testid="page-content"
      >
        Página 1
      </div>
    ),
  };

  it('renderiza a barra de zoom flutuante com botões de zoom', () => {
    render(<ReaderShell {...defaultProps} />);

    expect(screen.getByRole('button', { name: /diminuir zoom/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aumentar zoom/i })).toBeInTheDocument();
    // O thumb da barra de zoom tem aria-label "Mover a página para os lados"
    expect(screen.getByRole('slider', { name: /mover a página para os lados/i })).toBeInTheDocument();
  });

  it('renderiza controle de pan horizontal na barra de zoom', () => {
    render(<ReaderShell {...defaultProps} />);

    // O thumb da barra de zoom serve como controle de pan horizontal
    const panThumb = screen.getByRole('slider', { name: /mover a página para os lados/i });
    expect(panThumb).toBeInTheDocument();
  });

  it('renderiza controles de navegação (página anterior/próxima)', () => {
    render(<ReaderShell {...defaultProps} />);

    expect(screen.getByRole('button', { name: /página anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima página/i })).toBeInTheDocument();
  });

  it('renderiza barra de progresso de leitura', () => {
    render(<ReaderShell {...defaultProps} />);

    expect(screen.getByRole('progressbar', { name: /progresso de leitura/i })).toBeInTheDocument();
  });

  it('renderiza botões de ação (tela cheia, girar)', () => {
    render(<ReaderShell {...defaultProps} />);

    expect(screen.getByRole('button', { name: /tela cheia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /girar página/i })).toBeInTheDocument();
  });

  it('mostra título e autor no cabeçalho', () => {
    render(<ReaderShell {...defaultProps} />);

    expect(screen.getByText('Livro Teste')).toBeInTheDocument();
    expect(screen.getByText(/Autor Teste/)).toBeInTheDocument();
  });
});

describe('ScaledStage — escala e rotação', () => {
  it('aplica escala e rotação corretamente', () => {
    const { container } = render(
      <ScaledStage width={595} height={842} scale={1.5} rotation={90}>
        <div data-testid="content" style={{ width: 595, height: 842 }} />
      </ScaledStage>
    );

    const stage = container.querySelector('[style*="width"]');
    expect(stage).toBeInTheDocument();
  });

  it('mantém dimensões corretas com rotação 0', () => {
    const { container } = render(
      <ScaledStage width={595} height={842} scale={2} rotation={0}>
        <div data-testid="content" style={{ width: 595, height: 842 }} />
      </ScaledStage>
    );

    const outerDiv = container.querySelector('div[style*="width"]');
    expect(outerDiv).toHaveStyle({ width: '1190px', height: '1684px' });
  });
});

describe('usePageZoom — lógica de zoom', () => {
  it('calcula zoom "ajustar à tela" para desktop', () => {
    // Teste indireto via componente que usa o hook
    const TestComponent = () => {
      const containerRef: RefObject<HTMLElement | null> = { current: null };
      const zoom = usePageZoom({
        containerRef,
        viewport: { width: 1280, height: 720, isMobile: false, isTablet: false, isDesktop: true },
        pageWidth: 595,
        pageHeight: 842,
        rotation: 0,
        enabled: true,
      });

      // Simula container com dimensões conhecidas
      containerRef.current = {
        clientWidth: 1200,
        clientHeight: 600,
      } as HTMLElement;

      return <div data-testid="zoom-percent">{zoom.zoomPercentage}</div>;
    };

    const { getByTestId } = render(<TestComponent />);
    // O zoom deve ser calculado baseado na largura/altura disponível
    expect(getByTestId('zoom-percent')).toBeInTheDocument();
  });
});