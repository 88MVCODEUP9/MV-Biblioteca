# Leia Livro De Graça: 
https://88mvcodeup9.github.io/MV-Biblioteca/

# MV_Biblioteca

Aplicativo de biblioteca digital em React + Vite para abrir livros em PDF/EPUB e organizar coleções.

## Requisitos

- Node.js 20+
- npm

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build de produção

```bash
npm run build
```

## Testes

```bash
npm run test     # vitest + Testing Library (lógica da biblioteca e fluxos do app)
npm run lint
npm run ci       # validate:app + lint + test + build
```

## Verificação de segurança da estrutura

```bash
npm run validate:app
```

Este projeto já conta com validação para impedir que o array de coleções seja contaminado por objetos de livro e para barrar IDs ou links de livros repetidos, evitando que a build quebre ao publicar no GitHub.

## Deploy no GitHub Pages

1. Faça push do projeto para o repositório GitHub.
2. Confirme que o arquivo [vite.config.ts](vite.config.ts) está com `base: '/MV-Biblioteca/'`.
3. Rode:

```bash
npm run build
```

4. Publique o conteúdo da pasta `dist` conforme a estratégia escolhida no GitHub Pages.

> O repositório foi deixado em estado pronto para ser enviado manualmente ao GitHub, sem quebrar na publicação.

## Organização do código

- `src/data/catalog.ts`: livros e coleções pré-carregados.
- `src/lib/library.ts`: validação, busca, ordenação e coleções.
- `src/lib/storage.ts`: leitura e gravação dos dados locais.
- `src/App.tsx`: navegação e interface da biblioteca.
- `src/components/reader/`: controles compartilhados pelos leitores PDF e EPUB.

Para adicionar livros, edite o catálogo e execute `npm run ci` antes de publicar.
