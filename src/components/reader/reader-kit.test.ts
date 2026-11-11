import { describe, expect, it, vi } from 'vitest';
import { triggerDownload } from './reader-kit';

describe('segurança do download', () => {
  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'file:///etc/passwd', 'https://user:secret@example.com/book.pdf'])(
    'não busca nem abre endereço inválido: %s', async (url) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
      try {
        await triggerDownload(url, 'livro.pdf');
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(clickSpy).not.toHaveBeenCalled();
      } finally {
        fetchSpy.mockRestore();
        clickSpy.mockRestore();
      }
    },
  );
});
