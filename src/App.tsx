import {
  Component, Suspense, lazy,
  useState, useEffect, useCallback, useMemo,
  type ReactNode,
} from 'react';
import {
  BookOpen, Library, Search,
  FolderOpen, ChevronLeft, FileText,
  Grid3X3, List, X, Loader2, AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  bookInCollection, buildCollectionDefinitions, canonicalKey, isValidBook,
  normalizeUrl, sameCollectionId, sortBooks,
  type Book, type Collection, type FileType, type FormatFilter, type SortMode,
} from '@/lib/library';

// Os leitores (pdf.js, epub.js) são pesados: só são baixados quando alguém abre um livro.
const PDFReader = lazy(() => import('@/components/PDFReader').then(m => ({ default: m.PDFReader })));
const EpubReader = lazy(() => import('@/components/EpubReader').then(m => ({ default: m.EpubReader })));

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'Marvel', name: 'Marvel' },
  { id: 'Trono de Vidro', name: 'Trono de Vidro' },
  { id: 'Bíblia em Quadrinho', name: 'Bíblia em Quadrinho' },
  { id: 'Harry Potter', name: 'Harry Potter' },
  { id: 'Crepúsculo', name: 'Crepúsculo' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileTypeIcon(ft: FileType) {
  if (ft === 'epub') return <BookOpen className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function fileTypeBadgeColor(ft: FileType) {
  if (ft === 'epub') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  return 'text-[var(--gold-dim)] bg-[var(--gold-glow-2)] border-[rgba(201,171,110,0.15)]';
}

// ─── Preloaded books ──────────────────────────────────────────────────────────
// To add new books: copy one of the objects below and fill in the fields.
// fileType: "pdf" | "epub"

const RAW_PRELOADED_BOOKS: Book[] = [

  // ── Crepúsculo ────────────────────────────────────────────────────────
  { id:"01", title:"A Breve Segunda Vida", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/A%20breve%20segunda%20vida.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/A%20Breve%20Segunda%20Vida.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"02", title:"Amanhecer", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/Amanhecer.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/Amanhecer.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"03", title:"Crepúsculo", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/Crep%C3%BAsculo.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/Crep%C3%BAsculo.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"04", title:"Eclipse", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/Eclipse.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/Eclipse.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"05", title:"Lua Nova", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/Lua%20nova.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/Lua%20Nova.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"06", title:"Sol da Meia-Noite", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/Sol%20da%20meia%20noite.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/Sol%20da%20Meia-Noite.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"07", title:"Vida e Morte Especial", author:"Stephenie Meyer", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/PDF/Vida%20e%20morte%20especial.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Stephenie%20Meyer/CAPA/Vida%20e%20Morte%20Especial.png", collectionId:"Crepúsculo", addedDate:"2026-03-25T00:00:00.000Z" },

  // ── Harry Potter ──────────────────────────────────────────────────────
  { id:"08", title:"A Pedra Filosofal", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20A%20PEDRA%20FILOSOFA%20.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/E%20A%20PEDRA%20FILOSOFAL.webp?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"09", title:"A Câmara Secreta", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20A%20CAMARA%20SECRETA%20.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/E%20A%20CAMARA%20SECRETA.WEBP?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"10", title:"O Prisioneiro de Azkaban", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20O%20PRISIONEIRO%20DE%20AZKABAN.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/O%20PRISIONEIRO%20DE%20AZKABAN.webp?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"11", title:"O Cálice de Fogo", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20O%20CALICE%20DE%20FOGO%20.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/O%20CALICE%20DE%20FOGO.webp?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"12", title:"A Ordem da Fênix", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20A%20ORDEM%20DA%20FENIX.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/E%20A%20ORDEM%20DA%20FENIX.WEBP?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"13", title:"O Enigma do Príncipe", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20O%20ENIGMA%20DO%20PRINCIPE.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/O%20ENIGMA%20DO%20PRINCIPE.WEBP?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"14", title:"As Relíquias da Morte", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/E%20AS%20RELIQUIAS%20DA%20MORTE.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/AS%20RELIQUIAS%20DA%20MORTE.WEBP?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"15", title:"A Criança Amaldiçoada", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/A%20CRIANCA%20AMALDICOADA.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/refs/heads/main/J.%20K.%20Rowling/CAPA/A%20CRIANCA%20AMALDICOADA.WEBP", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"16", title:"Animais Fantásticos: Os Crimes de Grindelwald", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/ANIMAIS%20FANTASTICOS%20E%20OS%20CRIMES%20DE%20GRINDELWALD.PDF", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/ANIMAIS%20FANTASTICOS%20E%20OS%20CRIMES%20DE%20GRINDELWALD.WEBP?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"17", title:"Os Contos de Beedle, O Bardo", author:"J. K. Rowling", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/J.%20K.%20Rowling/PDF/O%20BARDO%20OS%20CONTOS.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/J.%20K.%20Rowling/CAPA/O%20BARDO%20OS%20CONTOS.webp?raw=true", collectionId:"Harry Potter", addedDate:"2026-03-25T00:00:00.000Z" },

  // ── Bíblia em Quadrinho ───────────────────────────────────────────────
  { id:"18", title:"O bem e o mal - O PRINCÍPIO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/O%20PRINC%C3%8DPIO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/O%20PRINC%C3%8DPIO.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"19", title:"O bem e o mal - ABRAÃO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/ABRA%C3%83O.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/ABRA%C3%83O.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"20", title:"O bem e o mal - MOISÉS", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/MOIS%C3%89S.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/MOIS%C3%89S.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"21", title:"O bem e o mal - ÊXODO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/%C3%8AXODO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/%C3%8AXODO.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"22", title:"O bem e o mal - PROFETAS", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/PROFETAS.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/PROFETAS.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"23", title:"O bem e o mal - ELIAS", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/ELIAS.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/ELIAS.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"24", title:"O bem e o mal - AS PROFECIAS DE CRISTO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/AS%20PROFECIAS%20DE%20CRISTO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/AS%20PROFECIAS%20DE%20CRISTO.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"25", title:"O bem e o mal - NASCIMENTO DE CRISTO E TENTAÇÃO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/NOVO%20TESTAMENTO%2C%20NASCIMENTO%20DE%20CRISTO%20E%20TENTA%C3%87%C3%83O.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/NOVO%20TESTAMENTO%2C%20NASCIMENTO%20DE%20CRISTO%20E%20TENTA%C3%87%C3%83O.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"26", title:"O bem e o mal - INÍCIO DO MINISTÉRIO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/EIN%C3%8DCIO%20DO%20MINIST%C3%89RIO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/EIN%C3%8DCIO%20DO%20MINIST%C3%89RIO.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"27", title:"O bem e o mal - MILAGRES E PARÁBOLAS", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/MILAGRES%20E%20PAR%C3%81BOLAS.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/MILAGRES%20E%20PAR%C3%81BOLAS.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"28", title:"O bem e o mal - PÁSCOA E SOFRIMENTO DE CRISTO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/P%C3%81SCOA%20E%20SOFRIMEINTO%20DE%20CRISTO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/P%C3%81SCOA%20E%20SOFRIMEINTO%20DE%20CRISTO.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"29", title:"O bem e o mal - RESSURREIÇÃO, PENTECOSTE E A IGREJA PRIMITIVA", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/RESSURREI%C3%87%C3%83O%2C%20PENTECOSTE%20E%20A%20IGREJA%20PRIMITIVA.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/RESSURREI%C3%87%C3%83O%2C%20PENTECOSTE%20E%20A%20IGREJA%20PRIMITIVA.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"30", title:"O bem e o mal - PARA TODO O MUNDO", author:"Michael & Debi Pearl", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/PDF/PARA%20TODO%20O%20MUNDO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/bem-e-o-mal/CAPA/PARA%20TODO%20O%20MUNDO.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"31", title:"A Bíblia em Manga - Velho Testamento", author:"Siku/Akinsiku", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/testamento/PDF/velho-testamento.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/testamento/CAPA/velho-testamento.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"32", title:"A Bíblia em Manga - Novo Testamento", author:"Siku/Akinsiku", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/testamento/PDF/novo-testamento.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/BIBLICO/testamento/CAPA/novo-testamento.png", collectionId:"Bíblia em Quadrinho", addedDate:"2026-03-25T00:00:00.000Z" },

  // ── 100 Minutos ───────────────────────────────────────────────────────
  { id:"33", title:"100 MINUTOS para entender ARISTÓTELES", author:"Astral Cultural", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/PDF/100%20MINUTOS%20PARA%20ENTENDER%20ARIST%C3%93TELES.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/CAPA/100%20MINUTOS%20PARA%20ENTENDER%20ARIST%C3%93TELES.webp", collectionId:"100 Minutos", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"34", title:"100 MINUTOS para entender FREUD", author:"Astral Cultural", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/PDF/100%20MINUTOS%20PARA%20ENTENDER%20FREUD.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/CAPA/100%20MINUTOS%20PARA%20ENTENDER%20FREUD.webp", collectionId:"100 Minutos", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"35", title:"100 MINUTOS para entender NIETZSCHE", author:"Astral Cultural", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/PDF/100%20MINUTOS%20PARA%20ENTENDER%20NIETZSCHE.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/CAPA/100%20MINUTOS%20PARA%20ENTENDER%20NIETZSCHE.webp", collectionId:"100 Minutos", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"36", title:"100 MINUTOS para entender JUNG", author:"Astral Cultural", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/PDF/100%20MINUTOS%20PARA%20ENTENDER%20JUNG.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/CAPA/100%20MINUTOS%20PARA%20ENTENDER%20JUNG.png", collectionId:"100 Minutos", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"37", title:"100 MINUTOS para entender PLATÃO", author:"Astral Cultural", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/PDF/100%20MINUTOS%20PARA%20ENTENDER%20PLAT%C3%83O.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/CAPA/100%20MINUTOS%20PARA%20ENTENDER%20PLAT%C3%83O.png", collectionId:"100 Minutos", addedDate:"2026-03-25T00:00:00.000Z" },
  { id:"38", title:"100 MINUTOS para entender LACAN", author:"Astral Cultural", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/PDF/100%20MINUTOS%20PARA%20ENTENDER%20LACAN.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Astral%20Cultural/CAPA/100%20MINUTOS%20PARA%20ENTENDER%20LACAN.png", collectionId:"100 Minutos", addedDate:"2026-03-25T00:00:00.000Z" },

  // ── As Crônicas de Gelo e Fogo ────────────────────────────────────────
  { id:"39", title:"A DANÇA DOS DRAGÕES", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/A%20DAN%C3%87A%20DOS%20DRAG%C3%95ES.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/A%20DAN%C3%87A%20DOS%20DRAG%C3%95ES.JPG", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"40", title:"A GUERRA DOS TRONOS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/A%20GUERRA%20DOS%20TRONOS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/A%20GUERRA%20DOS%20TRONOS.JPG", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"41", title:"A TORMENTA DE ESPADAS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/A%20TORMENTA%20DE%20ESPADAS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/A%20TORMENTA%20DE%20ESPADAS.JPG", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"42", title:"CAVALEIRO DOS SETE REINOS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/CAVALEIRO%20DOS%20SETES%20REINOS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/CAVALEIRO%20DOS%20SETES%20REINOS.JPG", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"43", title:"FOGO E SANGUE", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/FOGO%20E%20SANGUE.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/FOGO%20E%20SANGUE.JPG", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"44", title:"FÚRIA DOS REIS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/F%C3%9ARIA%20DOS%20REIS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/F%C3%9ARIA%20DOS%20REIS.jpg", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"45", title:"MULHERES PERIGOSAS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/MULHERES%20PERIGOSAS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/MULHERES%20PERIGOSAS.JPG", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"46", title:"O FESTIM DOS CORVOS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/O%20FESTIM%20DOS%20CORVOS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/O%20FESTIM%20DOS%20CORVOS.jpg", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"47", title:"O MUNDO DE GELO E FOGO", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/O%20MUNDO%20DE%20GELO%20E%20FOGO.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/O%20MUNDO%20DE%20GELO%20E%20FOGO.jpg", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"48", title:"O PRÍNCIPE DE WESTEROS E OUTRAS HISTÓRIAS", author:"George R. R. Martin", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/PDF/O%20PR%C3%8DNCIPE%20DE%20WESTEROS%20E%20OUTRAS%20HIST%C3%93RIAS.PDF", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/George%20R.R.%20Martin/CAPAS/O%20PR%C3%8DNCIPE%20DE%20WESTEROS%20E%20OUTRAS%20HIST%C3%93RIAS.jpg", collectionId:"As Crônicas de Gelo e Fogo", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── The Beginning After the End ───────────────────────────────────────
  { id:"49", title:"Primeiros Anos", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Primeiros%20Anos.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Primeiros%20Anos.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"50", title:"Novas Alturas", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Novas%20Alturas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Novas%20Alturas.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"51", title:"O Chamado dos Destinos", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/O%20Chamado%20dos%20Destinos.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/O%20Chamado%20dos%20Destinos.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"52", title:"À Beira do Horizonte", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/%C3%80%20Beira%20do%20Horizonte.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/%C3%80%20Beira%20do%20Horizonte.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"53", title:"Convergência", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Converg%C3%AAncia.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Converg%C3%AAncia.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"54", title:"Divergência", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Diverg%C3%AAncia.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Diverg%C3%AAncia.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"55", title:"Transcendência", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Transcendence.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Transcend%C3%AAncia.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"56", title:"Ascensão", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Ascension.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Ascens%C3%A3o.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"57", title:"Entre os Caídos", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Entre%20os%20Ca%C3%ADdos.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Entre%20os%20Ca%C3%ADdos.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"58", title:"Acerto de Contas", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Acerto%20de%20Contas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Acerto%20de%20Contas.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"59", title:"Retribuição", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Retribui%C3%A7%C3%A3o.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Retribui%C3%A7%C3%A3o.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"60", title:"Providência", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Provid%C3%AAncia.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Provid%C3%AAncia.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"61", title:"Apoteose", author:"TurtleMe", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/PDF/Apoteose.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/The%20Beginning%20After%20the%20End/CAPAS/Apoteose.jpg", collectionId:"The Beginning After the End", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── Diários do Vampiro ────────────────────────────────────────────────
  { id:"62", title:"A Fúria", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/A%20FURIA%20DIARIOS%20DO%20VAMPIRO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/A%20FURIA%20DIARIOS%20DO%20VAMPIRO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"63", title:"Almas Sombrias - O Retorno", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/ALMAS%20SOMBRIAS%20-%20O%20RETORNO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/ALMAS%20SOMBRIAS%20-%20O%20RETORNO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"64", title:"Anoitecer - O Retorno", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/ANOITECER%20-%20O%20RETORNO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/ANOITECER%20-%20O%20RETORNO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"65", title:"Canção da Lua - O Caçador", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/CANCAO%20DA%20LUA%20-%20O%20CACADOR.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/CANCAO%20DA%20LUA%20-%20O%20CACADOR.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"66", title:"Depois do Expediente - Contos", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/DEPOIS%20DO%20EXPEDIENTE%20-%20CONTOS.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/DEPOIS%20DO%20EXPEDIENTE%20-%20CONTOS.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"67", title:"Desejo - Diário do Stefan", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/DESEJO%20DIARIO%20DO%20STEFAN.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/DESEJO%20DIARIO%20DO%20STEFAN.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"68", title:"Destino Nascente - O Caçador", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/DESTINO%20NASCENTE%20-%20O%20CACADOR.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/DESTINO%20NASCENTE%20-%20O%20CACADOR.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"69", title:"Espectro - O Caçador", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/ESPECTRO%20-%20O%20CACADOR.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/ESPECTRO-%20O%20CACADOR.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"70", title:"Estripador - Diário do Stefan", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/ESTRIPADOR%20%20DIARIO%20DO%20STEFAN.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/ESTRIPADOR%20DIARIO%20DO%20STEFAN.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"71", title:"Matt e Elena - Contos", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/MATT%20E%20ELENA%20-%20CONTOS.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/MATT%20E%20ELENA%20-%20CONTOS.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"72", title:"Meia-Noite - O Retorno", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/MEIA%20NOITE%20-%20O%20RETORNO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/MEIA%20NOITE%20-%20O%20RETORNO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"73", title:"O Asilo - Diário do Stefan", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/O%20ASILO%20DIARIO%20DO%20STEFAN.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/O%20ASILO%20DIARIO%20DO%20STEFAN.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"74", title:"O Confronto", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/O%20CONFRONTO%20DIARIOS%20DO%20VAMPIRO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/O%20CONFRONTO%20DIARIOS%20DO%20VAMPIRO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"75", title:"O Despertar", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/O%20DESPERTAR%20DIARIOS%20DO%20VAMPIRO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/O%20DESPERTAR%20DIARIOS%20DO%20VAMPIRO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"76", title:"Origens - Diário do Stefan", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/ORIGENS%20DIARIO%20DO%20STEFAN.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/ORIGENS%20DIARIO%20DO%20STEFAN.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"77", title:"Reunião Sombria", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/REUNIAO%20SOMBRIA%20DIARIOS%20DO%20VAMPIRO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/REUNIAO%20SOMBRIA%20DIARIOS%20DO%20VAMPIRO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"78", title:"Sede de Sangue - Diário do Stefan", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/SEDE%20DE%20SANGUE%20DIARIO%20DO%20STEFAN.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/SEDE%20DE%20SANGUE%20DIARIO%20DO%20STEFAN.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"79", title:"The Originals - A Ascensão", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/THE-ORIGINALS%20A%20ASCENCAO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/THE-ORIGINALS%20A%20ASCENCAO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"80", title:"The Originals - A Perda", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/THE-ORIGINALS%20A%20PERDA.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/THE-ORIGINALS%20A%20PERDA.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"81", title:"The Originals - A Ressurreição", author:"L. J. Smith", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/PDF/THE-ORIGINALS%20A%20RESSURREICAO.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/L.%20J.%20Smith/Di%C3%A1rios%20do%20Vampiro/CAPA/THE-ORIGINALS%20A%20RESSURREICAO.webp", collectionId:"Diários do Vampiro", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── As Crônicas de Nárnia ─────────────────────────────────────────────
  { id:"82", title:"O Sobrinho do Mago", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/O%20Sobrinho%20do%20Mago.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/O%20Sobrinho%20do%20Mago.jpg", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"83", title:"O Leão, a Feiticeira e o Guarda-Roupa", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/O%20Le%C3%A3o%2C%20a%20Feiticeira%20e%20o%20Guarda-Roupa.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/O%20Le%C3%A3o%2C%20a%20Feiticeira%20e%20o%20Guarda-Roupa.webp", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"84", title:"O Cavalo e seu Menino", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/O%20Cavalo%20e%20seu%20Menino.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/O%20Cavalo%20e%20seu%20Menino.jpg", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"85", title:"Príncipe Caspian", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/Pr%C3%ADncipe%20Caspian.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/Pr%C3%ADncipe%20Caspian.jpg", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"86", title:"A Viagem do Peregrino da Alvorada", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/A%20Viagem%20do%20Peregrino%20da%20Alvorada.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/A%20Viagem%20do%20Peregrino%20da%20Alvorada.jpg", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"87", title:"A Cadeira de Prata", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/A%20Cadeira%20de%20Prata.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/A%20Cadeira%20de%20Prata.jpg", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"88", title:"A Última Batalha", author:"C. S. Lewis", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/PDF/A%20%C3%9Altima%20Batalha.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20de%20N%C3%A1rnia/CAPA/A%20%C3%9Altima%20Batalha.jpg", collectionId:"As Crônicas de Nárnia", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── Cursos ────────────────────────────────────────────────────────────
  { id:"89", title:"Degradê Limpo", author:"Barbeiro", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/PDF/cabelo%20(1).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/CAPA/cabelo%20(1).png", collectionId:"Cursos", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"90", title:"Conexão do Topo com o degradê", author:"Barbeiro", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/PDF/cabelo%20(2).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/CAPA/cabelo%20(2).png", collectionId:"Cursos", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"91", title:"15 Modelos Prontos", author:"Barbeiro", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/PDF/cabelo%20(3).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/CAPA/cabelo%20(3).png", collectionId:"Cursos", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"92", title:"Seu Degradê Limpo", author:"Barbeiro", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/PDF/cabelo%20(4).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/CAPA/cabelo%20(4).png", collectionId:"Cursos", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"93", title:"Demonstração Guiada", author:"Barbeiro", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/PDF/cabelo%20(5).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cursos/Cabeleleiro%2001/CAPA/cabelo%20(5).png", collectionId:"Cursos", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── O Senhor dos Anéis ────────────────────────────────────────────────
  { id:"94", title:"O Silmarillion", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/O%20Silmarillion.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/O%20Silmarillion.webp", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"95", title:"Beren e Lúthien", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/Beren%20e%20L%C3%BAthien.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/Beren%20e%20L%C3%BAthien.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"96", title:"Os Filhos de Húrin", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/Os%20Filhos%20de%20H%C3%BArin.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/Os%20Filhos%20de%20H%C3%BArin.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"97", title:"A Queda de Gondolin", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/A%20Queda%20de%20Gondolin.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/A%20Queda%20de%20Gondolin.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"98", title:"Contos Inacabados", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/Contos%20Inacabados.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/Contos%20Inacabados.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"99", title:"O Hobbit", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/O%20Hobbit.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/O%20Hobbit.webp", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"100", title:"A Sociedade do Anel", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/A%20Sociedade%20do%20Anel.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/A%20Sociedade%20do%20Anel.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"101", title:"As Duas Torres", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/As%20Duas%20Torres.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/As%20Duas%20Torres.png", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"102", title:"O Retorno do Rei", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/O%20Retorno%20do%20Rei.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/O%20Retorno%20do%20Rei.png", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"103", title:"A Queda de Númenor", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/A%20Queda%20de%20N%C3%BAmenor.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/A%20Queda%20de%20N%C3%BAmenor.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"104", title:"A Natureza da Terra-média", author:"J. R. R. Tolkien", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/PDF/A%20Natureza%20da%20Terra-m%C3%A9dia.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/O%20Senhor%20dos%20An%C3%A9is/CAPA/A%20Natureza%20da%20Terra-m%C3%A9dia.jpg", collectionId:"O Senhor dos Anéis", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── Ciclo da Herança ──────────────────────────────────────────────────
  { id:"105", title:"Eragon", author:"Christopher Paolini", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/PDF/Eragon.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/CAPA/Eragon.webp", collectionId:"Ciclo da Herança", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"106", title:"Eldest", author:"Christopher Paolini", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/PDF/Eldest.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/CAPA/Eldest.jpg", collectionId:"Ciclo da Herança", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"107", title:"Brisingr", author:"Christopher Paolini", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/PDF/Brisingr.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/CAPA/Brisingr.jpg", collectionId:"Ciclo da Herança", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"108", title:"Herança", author:"Christopher Paolini", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/PDF/Heran%C3%A7a.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/CAPA/Heran%C3%A7a.jpg", collectionId:"Ciclo da Herança", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"109", title:"O Garfo, a Bruxa e o Dragão", author:"Christopher Paolini", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/PDF/O%20Garfo%2C%20a%20Bruxa%20e%20o%20Drag%C3%A3o.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/CAPA/O%20Garfo%2C%20a%20Bruxa%20e%20o%20Drag%C3%A3o.jpg", collectionId:"Ciclo da Herança", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"110", title:"Murtagh", author:"Christopher Paolini", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/PDF/Murtagh.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Ciclo%20da%20Heran%C3%A7a/CAPA/Murtagh.jpg", collectionId:"Ciclo da Herança", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── Crônicas de Duna ──────────────────────────────────────────────────
  { id:"111", title:"Duna", author:"Frank Herbert", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"112", title:"Messias de Duna", author:"Frank Herbert", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Messias%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Messias%20de%20Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"113", title:"Filhos de Duna", author:"Frank Herbert", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Filhos%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Filhos%20de%20Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"114", title:"Imperador Deus de Duna", author:"Frank Herbert", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Imperador-Deus%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Imperador-Deus%20de%20Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"115", title:"Hereges de Duna", author:"Frank Herbert", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Hereges%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Hereges%20de%20Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"116", title:"Herdeiras de Duna", author:"Frank Herbert", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Herdeiras%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Herdeiras%20de%20Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"127", title:"Caçadores de Duna", author:"Brian Herbert e Kevin J. Anderson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Ca%C3%A7adores%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Ca%C3%A7adores%20de%20Duna.png", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"128", title:"Vermes da Areia de Duna", author:"Brian Herbert e Kevin J. Anderson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Vermes%20da%20Areia%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Vermes%20da%20Areia%20de%20Duna.png", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"129", title:"Prelúdio de Duna", author:"Brian Herbert e Kevin J. Anderson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/PDF/Preludio%20de%20Duna.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Cr%C3%B4nicas%20de%20Duna/CAPA/Prel%C3%BAdio%20a%20Duna.jpg", collectionId:"Crônicas de Duna", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── Jogos Vorazes ─────────────────────────────────────────────────────
  { id:"117", title:"A Cantiga dos Pássaros e das Serpentes", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/PDF/A%20Cantiga%20dos%20P%C3%A1ssaros%20e%20das%20Serpentes.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/CAPA/A%20Cantiga%20dos%20P%C3%A1ssaros%20e%20das%20Serpentes.jpg", collectionId:"Jogos Vorazes", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"118", title:"Amanhecer na Colheita", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/PDF/Amanhecer%20na%20Colheita.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/CAPA/Amanhecer%20na%20Colheita.jpg", collectionId:"Jogos Vorazes", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"119", title:"Jogos Vorazes", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/PDF/Jogos%20Vorazes.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/CAPA/Jogos%20Vorazes.jpg", collectionId:"Jogos Vorazes", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"120", title:"Em Chamas", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/PDF/Em%20Chamas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/CAPA/Em%20Chamas.jpg", collectionId:"Jogos Vorazes", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"121", title:"A Esperança", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/PDF/A%20Esperan%C3%A7a.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Jogos%20Vorazes/CAPA/A%20Esperan%C3%A7a.jpg", collectionId:"Jogos Vorazes", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── As Crônicas do Subterrâneo ────────────────────────────────────────
  { id:"122", title:"Gregor, o Guerreiro da Superfície", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/PDF/Gregor%2C%20o%20Guerreiro%20da%20Superf%C3%ADcie.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/CAPA/Gregor%2C%20o%20Guerreiro%20da%20Superf%C3%ADcie.avif", collectionId:"As Crônicas do Subterrâneo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"123", title:"Gregor e a Segunda Profecia", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/PDF/Gregor%20e%20a%20Segunda%20Profecia.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/CAPA/Gregor%20e%20a%20Segunda%20Profecia.jpg", collectionId:"As Crônicas do Subterrâneo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"124", title:"Gregor e a Profecia de Sangue", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/PDF/Gregor%20e%20a%20Profecia%20de%20Sangue.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/CAPA/Gregor%20e%20a%20Profecia%20de%20Sangue.jpg", collectionId:"As Crônicas do Subterrâneo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"125", title:"Gregor e as Marcas Secretas", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/PDF/Gregor%20e%20as%20Marcas%20Secretas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/CAPA/Gregor%20e%20as%20Marcas%20Secretas.jpg", collectionId:"As Crônicas do Subterrâneo", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"126", title:"Gregor e o Código da Garra", author:"Suzanne Collins", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/PDF/Gregor%20e%20o%20C%C3%B3digo%20da%20Garra.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Cr%C3%B4nicas%20do%20Subterr%C3%A2neo/CAPA/Gregor%20e%20o%20C%C3%B3digo%20da%20Garra.jpg", collectionId:"As Crônicas do Subterrâneo", addedDate:"2026-06-09T00:00:00.000Z" },

  // ── Marvel ────────────────────────────────────────────────────────────
  { id:"130", title:"Guerras Secretas 01 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2001%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2001%20(1984).webp?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"131", title:"Guerras Secretas 02 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2002%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2002%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"132", title:"Guerras Secretas 03 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2003%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2003%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"133", title:"Guerras Secretas 04 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2004%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2004%20(1984).webp?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"134", title:"Guerras Secretas 05 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2005%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2005%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"135", title:"Guerras Secretas 06 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2006%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2006%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"136", title:"Guerras Secretas 07 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2007%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2007%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"137", title:"Guerras Secretas 08 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2008%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2008%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"138", title:"Guerras Secretas 09 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2009%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2009%20(1984).webp?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"139", title:"Guerras Secretas 10 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2010%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2010%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"140", title:"Guerras Secretas 11 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2011%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2011%20(1984).webp?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"141", title:"Guerras Secretas 12 (1984)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1984)/PDF/Guerras%20Secretas%2012%20(1984).pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(1984)/CAPA/Guerras%20Secretas%2012%20(1984).jpg?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (1984)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"142", title:"Guerras Secretas II 01 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"143", title:"Guerras Secretas II 02 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2002.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2002.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"144", title:"Guerras Secretas II 03 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2003.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2003.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"145", title:"Guerras Secretas II 04 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2004.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2004.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"146", title:"Guerras Secretas II 05 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2005.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2005.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"147", title:"Guerras Secretas II 06 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2006.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2006.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"148", title:"Guerras Secretas II 07 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2007.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2007.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"149", title:"Guerras Secretas II 08 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2008.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2008.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"150", title:"Guerras Secretas II 09 (1985)", author:"Jim Shooter", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/PDF/Guerras%20Secretas%20II%2009.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(1985)/CAPA/Guerras%20Secretas%20II%2009.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas II (1985)", addedDate:"2026-06-09T00:00:00.000Z" },
  { id:"151", title:"001 As Secretas Guerras Secretas de Deadpool 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/001%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/001%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20001.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"152", title:"002 As Secretas Guerras Secretas de Deadpool 002", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/002%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20002.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/002%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20002.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"153", title:"003 As Secretas Guerras Secretas de Deadpool 003", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/003%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20003.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/003%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20003.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"154", title:"004 As Secretas Guerras Secretas de Deadpool 004", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/004%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20004.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/004%20As%20Secretas%20Guerras%20Secretas%20de%20Deadpool%20004.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"155", title:"005 Mulher Aranha v5 10", author:"Dennis Hopeless", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/005%20Mulher%20Aranha%20v5%2010.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/005%20Mulher%20Aranha%20v5%2010.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"156", title:"005.1 Viuva Negra 19 (2015)", author:"Nathan Edmondson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/005.1%20Viuva%20Negra%2019%20(2015).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/005.1%20Viuva%20Negra%2019%20(2015).webp", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"157", title:"005.2 Viuva Negra 20 (2015)", author:"Nathan Edmondson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/005.2%20Viuva%20Negra%2020%20(2015).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/005.2%20Viuva%20Negra%2020%20(2015).jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"158", title:"006 Guerras Secretas 00 de 09", author:"Jonathan Hickman", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/006%20Guerras%20Secretas%2000%20de%2009.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/006%20Guerras%20Secretas%2000%20de%2009.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"159", title:"007 Guerras Secretas 01 de 09", author:"Jonathan Hickman", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/007%20Guerras%20Secretas%2001%20de%2009%20.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/007%20Guerras%20Secretas%2001%20de%2009.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"160", title:"008 Loki - Agente de Asgard 014", author:"Al Ewing", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/008%20Loki%20-%20Agente%20de%20Asgard%20014.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/008%20Loki%20-%20Agente%20de%20Asgard%20014.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"161", title:"009 Loki - Agente de Asgard 015", author:"Al Ewing", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/009%20Loki%20-%20Agente%20de%20Asgard%20015.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/009%20Loki%20-%20Agente%20de%20Asgard%20015.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"162", title:"010 Miss Marvel v3 016", author:"Willow Wilson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/010%20Miss%20Marvel%20v3%20016.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/010%20Miss%20Marvel%20v3%20016.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"163", title:"011 Miss Marvel v3 017", author:"Willow Wilson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/011%20Miss%20Marvel%20v3%20017.pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/011%20Miss%20Marvel%20v3%20017.png?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"164", title:"012 Miss Marvel v3 018", author:"Willow Wilson", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/012%20Miss%20Marvel%20v3%20018.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/012%20Miss%20Marvel%20v3%20018.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"165", title:"013 Miss Marvel v3 019", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/013%20Miss%20Marvel%20v3%20019.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/013%20Miss%20Marvel%20v3%20019.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"166", title:"014 Magneto v3 018", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/014%20Magneto%20v3%20018.pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/014%20Miss%20Marvel%20v3%20019.png?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"167", title:"015 Magneto v3 019", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/015%20Magneto%20v3%20019.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/015%20Magneto%20v3%20019.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"168", title:"016 Magneto v3 020", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/016%20Magneto%20v3%20020.pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/016%20Magneto%20v3%20019.png?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"169", title:"017 Magneto v3 021", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/017%20Magneto%20v3%20021.pdf", coverPath:"https://github.com/Mvin2006/HQ/blob/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/017%20Magneto%20v3%20019.png?raw=true", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"170", title:"018 O Justiceiro V9 019", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/018%20O%20Justiceiro%20V9%20019.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/018%20O%20Justiceiro%20V9%20019.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"171", title:"019 O Justiceiro V9 020", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/019%20O%20Justiceiro%20V9%20020.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/019%20O%20Justiceiro%20V9%20020.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"172", title:"020 Homem Formiga V2 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/020%20Homem%20Formiga%20V2%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/020%20Homem%20Formiga%20V2%20001.png", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"173", title:"021 Seda 07", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/021%20Seda%2007.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/021%20Seda%2007.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z"},
  { id:"174", title:"022 Loki - Agente de Asgard 016", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/022%20Loki%20-%20Agente%20de%20Asgard%20016.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/022%20Loki%20-%20Agente%20de%20Asgard%20016.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"175", title:"023 Loki - Agente de Asgard 017", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/023%20Loki%20-%20Agente%20de%20Asgard%20017.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/023%20Loki%20-%20Agente%20de%20Asgard%20017.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"176", title:"024 Guerras Secretas 02 de 09 ", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/024%20Guerras%20Secretas%2002%20de%2009%20.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/024%20Guerras%20Secretas%2002%20de%2009%20.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"177", title:"025 Ultimate - O Fim 01 de 05 (2015)", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/025%20Ultimate%20-%20O%20Fim%2001%20de%2005%20(2015).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/025%20Ultimate%20-%20O%20Fim%2001%20de%2005%20(2015).jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"178", title:"026 Mundo de Batalha 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/026%20Mundo%20de%20Batalha%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/026%20Mundo%20de%20Batalha%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"179", title:"027 Mundo de Batalha 002", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/027%20Mundo%20de%20Batalha%20002.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/027%20Mundo%20de%20Batalha%20002.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"180", title:"028 Mestre do Kung Fu V2 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/028%20Mestre%20do%20Kung%20Fu%20V2%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/028%20Mestre%20do%20Kung%20Fu%20V2%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"181", title:"029 V-Force V1 001 - Guerras Secretas", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/029%20V-Force%20V1%20001%20-%20Guerras%20Secretas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/029%20V-Force%20V1%20001%20-%20Guerras%20Secretas.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"182", title:"030 Planeta Hulk V2 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/030%20Planeta%20Hulk%20V2%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/030%20Planeta%20Hulk%20V2%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"183", title:"031 Universo Aranha V2 001 - Guerras Secreta", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/031%20Universo%20Aranha%20V2%20001%20-%20Guerras%20Secreta.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/031%20Universo%20Aranha%20V2%20001%20-%20Guerras%20Secreta.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"184", title:"032 Inumanos - A Ascensão de Attilan 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/032%20Inumanos%20-%20A%20Ascens%C3%A3o%20de%20Attilan%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/032%20Inumanos%20-%20A%20Ascens%C3%A3o%20de%20Attilan%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"185", title:"033 MODOC Assassino 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/033%20MODOC%20Assassino%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/033%20MODOC%20Assassino%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"186", title:"034 Guerras Secretas - Desafio Infinito V2 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/034%20Guerras%20Secretas%20-%20Desafio%20Infinito%20V2%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/034%20Guerras%20Secretas%20-%20Desafio%20Infinito%20V2%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"187", title:"035 O Velho Logan V2 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/035%20O%20Velho%20Logan%20V2%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/035%20O%20Velho%20Logan%20V2%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"188", title:"036 Guerras Secretas - Inferno V1 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/036%20Guerras%20Secretas%20-%20Inferno%20V1%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/036%20Guerras%20Secretas%20-%20Inferno%20V1%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"189", title:"037 Guerras Secretas 2099 V1 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/037%20Guerras%20Secretas%202099%20V1%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/037%20Guerras%20Secretas%202099%20V1%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"190", title:"038 Diário das Guerras Secretas 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/038%20Di%C3%A1rio%20das%20Guerras%20Secretas%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/038%20Di%C3%A1rio%20das%20Guerras%20Secretas%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"191", title:"039 Onde os Monstros Habitam V2 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/039%20Onde%20os%20Monstros%20Habitam%20V2%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/039%20Onde%20os%20Monstros%20Habitam%20V2%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"192", title:"040 X-Men _92 V1 001 - Guerras Secretas", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/040%20X-Men%20_92%20V1%20001%20-%20Guerras%20Secretas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/040%20X-Men%20_92%20V1%20001%20-%20Guerras%20Secretas.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"193", title:"041 Guerras Secretas 03 de 09 ", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/041%20Guerras%20Secretas%2003%20de%2009%20.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/041%20Guerras%20Secretas%2003%20de%2009%20.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"194", title:"042 Mestre do Kung Fu V2 002", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/042%20Mestre%20do%20Kung%20Fu%20V2%20002.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/042%20Mestre%20do%20Kung%20Fu%20V2%20002.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"195", title:"043 Anos de um Futuro Esquecido V1 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/043%20Anos%20de%20um%20Futuro%20Esquecido%20V1%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/043%20Anos%20de%20um%20Futuro%20Esquecido%20V1%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"196", title:"044 Programa de Extermínio 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/044%20Programa%20de%20Exterm%C3%ADnio%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/044%20Programa%20de%20Exterm%C3%ADnio%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"197", title:"045 Gigantesca Pequena Marvel Vingadores vs X-Men 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/045%20Gigantesca%20Pequena%20Marvel%20Vingadores%20vs%20X-Men%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/045%20Gigantesca%20Pequena%20Marvel%20Vingadores%20vs%20X-Men%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"198", title:"046 Guerras Secretas - Futuro Imperfeito 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/046%20Guerras%20Secretas%20-%20Futuro%20Imperfeito%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/046%20Guerras%20Secretas%20-%20Futuro%20Imperfeito%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"199", title:"047 O Espetacular Homem-Aranha - Renovando Seus Votos 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/047%20O%20Espetacular%20Homem-Aranha%20-%20Renovando%20Seus%20Votos%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/047%20O%20Espetacular%20Homem-Aranha%20-%20Renovando%20Seus%20Votos%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"200", title:"048 Guerras Secretas - Guerra das Armaduras 001", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/048%20Guerras%20Secretas%20-%20Guerra%20das%20Armaduras%20001.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/048%20Guerras%20Secretas%20-%20Guerra%20das%20Armaduras%20001.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"201", title:"049 Ultimate - O Fim 02 de 05 (2015)", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/049%20Ultimate%20-%20O%20Fim%2002%20de%2005%20(2015).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/049%20Ultimate%20-%20O%20Fim%2002%20de%2005%20(2015).jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },
  { id:"202", title:"050 Inumanos - A Ascensão de Attilan 002", author:"Cullen Bunn", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/PDF/050%20Inumanos%20-%20A%20Ascens%C3%A3o%20de%20Attilan%20002.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Marvel/Guerras%20Secretas%20(2015)/CAPA/050%20Inumanos%20-%20A%20Ascens%C3%A3o%20de%20Attilan%20002.jpg", collectionId:"Marvel", subCollectionId:"Guerras Secretas (2015)", addedDate:"2026-08-27T00:00:00.000Z" },

  // ── Trono de Vidro ────────────────────────────────────────────────────
  { id:"203", title:"Trono de Vidro", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/PDF/Trono%20de%20Vidro.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/CAPA/Trono%20de%20Vidro.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"204", title:"Coroa da Meia-Noite", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Coroa%20da%20Meia-Noite.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Coroa%20da%20Meia-Noite.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"205", title:"Herdeira do Fogo", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Herdeira%20do%20Fogo.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Herdeira%20do%20Fogo.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"206", title:"Império de Tempestades - 5.2", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Imp%C3%A9rio%20de%20Tempestades%20-%205.2.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Imp%C3%A9rio%20de%20Tempestades%20-%205.2.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"207", title:"Império de Tempestades", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Imp%C3%A9rio%20de%20Tempestades.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Imp%C3%A9rio%20de%20Tempestades.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"208", title:"Rainha das Sombras", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Rainha%20das%20Sombras.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Rainha%20das%20Sombras.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"209", title:"Reino de Cinzas", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Reino%20de%20Cinzas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trono%20de%20Vidro/Reino%20de%20Cinzas.webp", collectionId:"Trono de Vidro", addedDate:"2026-09-01T00:00:00.000Z" },

  // ── Sherlock Holmes ───────────────────────────────────────────────────
  { id:"210", title:"O Cão dos Baskervilles", author:"Arthur Conan Doyle", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/O%20C%C3%A3o%20dos%20Baskervilles.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/O%20C%C3%A3o%20dos%20Baskervilles.webp", collectionId:"Sherlock Holmes", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"211", title:"O Signo dos Quatro", author:"Arthur Conan Doyle", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/O%20Signo%20dos%20Quatro.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/O%20Signo%20dos%20Quatro.webp", collectionId:"Sherlock Holmes", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"212", title:"O Vale do Medo", author:"Arthur Conan Doyle", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/O%20Vale%20do%20Medo.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/O%20Vale%20do%20Medo.webp", collectionId:"Sherlock Holmes", addedDate:"2026-09-01T00:00:00.000Z" },
  { id:"213", title:"Um Estudo em Vermelho", author:"Arthur Conan Doyle", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/Um%20Estudo%20em%20Vermelho.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Sherlock%20Holmes/Um%20Estudo%20em%20Vermelho.webp", collectionId:"Sherlock Holmes", addedDate:"2026-09-01T00:00:00.000Z" },

  // ── A Seleção ─────────────────────────────────────────────────────────
  { id:"214", title:"A Seleção", author:"Kiera Cass", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Sele%C3%A7%C3%A3o.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Sele%C3%A7%C3%A3o.webp", collectionId:"A Seleção", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"215", title:"A Elite", author:"Kiera Cass", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Elite.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Elite.webp", collectionId:"A Seleção", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"216", title:"A Escolha", author:"Kiera Cass", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Escolha.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Escolha.webp", collectionId:"A Seleção", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"217", title:"A Herdeira", author:"Kiera Cass", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Herdeira.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Herdeira.webp", collectionId:"A Seleção", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"218", title:"A Coroa", author:"Kiera Cass", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Coroa.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/A%20Coroa.webp", collectionId:"A Seleção", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"219", title:"Felizes para Sempre", author:"Kiera Cass", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/Felizes%20Para%20Sempre.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Sele%C3%A7%C3%A3o/Felizes%20para%20Sempre.webp", collectionId:"A Seleção", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── As Peças Infernais ────────────────────────────────────────────────
  { id:"220", title:"Anjo Mecânico", author:"Cassandra Clare", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Pe%C3%A7as%20Infernais/Anjo%20Nec%C3%A2nico%20-%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Pe%C3%A7as%20Infernais/Anjo%20Nec%C3%A2nico.webp", collectionId:"As Peças Infernais", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"221", title:"Princesa Mecânica", author:"Cassandra Clare", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Pe%C3%A7as%20Infernais/Princesa%20Mec%C3%A2nica%20-%203.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Pe%C3%A7as%20Infernais/Princesa%20Mec%C3%A2nica.webp", collectionId:"As Peças Infernais", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"222", title:"Príncipe Mecânico", author:"Cassandra Clare", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Pe%C3%A7as%20Infernais/Pr%C3%ADncipe%20Mec%C3%A2nico%20-%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/As%20Pe%C3%A7as%20Infernais/Pr%C3%ADncipe%20Mec%C3%A2nico.webp", collectionId:"As Peças Infernais", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── Fallen ────────────────────────────────────────────────────────────
  { id:"223", title:"Fallen", author:"Lauren Kate", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Fallen/Fallen%20-%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Fallen/Fallen%20-%201.webp", collectionId:"Fallen", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"224", title:"Tormenta", author:"Lauren Kate", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Fallen/Tormenta%20-%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Fallen/Tormenta%20-%202.webp", collectionId:"Fallen", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"225", title:"Paixão", author:"Lauren Kate", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Fallen/Paix%C3%A3o%20-%203.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Fallen/Paix%C3%A3o%20-%203.webp", collectionId:"Fallen", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── A Saga dos Corvos ─────────────────────────────────────────────────
  { id:"226", title:"Os Garotos Corvos", author:"Maggie Stiefvater", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/1%20-%20Maggie%20Stiefvater.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/1%20-%20Maggie%20Stiefvater.webp", collectionId:"A Saga dos Corvos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"227", title:"Ladrões de Sonhos", author:"Maggie Stiefvater", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/2%20-%20Ladr%C3%B5es%20de%20Sonhos.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/2%20-%20Ladr%C3%B5es%20de%20Sonhos.webp", collectionId:"A Saga dos Corvos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"228", title:"Lírio Azul", author:"Maggie Stiefvater", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/3%20-%20L%C3%ADrio%20Azul.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/3%20-%20L%C3%ADrio%20Azul.webp", collectionId:"A Saga dos Corvos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"229", title:"O Rei Corvo", author:"Maggie Stiefvater", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/4%20-%20O%20Rei%20Corvo.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Saga%20dos%20Corvos/4%20-%20O%20Rei%20Corvo.webp", collectionId:"A Saga dos Corvos", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── After ─────────────────────────────────────────────────────────────
  { id:"230", title:"After", author:"Anna Todd", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/1%20-%20AFTER.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/1%20-%20AFTER.webp", collectionId:"After", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"231", title:"Depois da Verdade", author:"Anna Todd", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/2%20-%20After%20-%20Depois%20da%20Verdade.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/2%20-%20After%20-%20Depois%20da%20Verdade.webp", collectionId:"After", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"232", title:"Depois do Desencontro", author:"Anna Todd", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/3%20-%20After%20-%20Depois%20do%20Desencontro.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/3%20-%20After%20-%20Depois%20do%20Desencontro.webp", collectionId:"After", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"233", title:"Depois da Promessa", author:"Anna Todd", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/5%20-%20After%20-%20Depois%20da%20Promessa.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/5%20-%20After%20-%20Depois%20da%20Promessa.webp", collectionId:"After", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"234", title:"A história de Hardin antes de Tessa", author:"Anna Todd", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/6%20-%20Before%20%E2%80%93%20A%20hist%C3%B3ria%20de%20Hardin%20antes%20de%20Tessa%20(After).pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/AFTER/6%20-%20Before%20%E2%80%93%20A%20hist%C3%B3ria%20de%20Hardin%20antes%20de%20Tessa%20(After).webp", collectionId:"After", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── John Green ────────────────────────────────────────────────────────
  { id:"235", title:"A Culpa é das Estrelas", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/A%20Culpa%20%C3%A9%20das%20Estrelas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/A%20Culpa%20%C3%A9%20das%20Estrelas.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"236", title:"Cidades De Papel", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Cidades%20De%20Papel.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Cidades%20De%20Papel.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"237", title:"Deixe a Neve Cair", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Deixe%20a%20Neve%20Cair.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Deixe%20a%20Neve%20Cair.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"238", title:"O Teorema Katherine", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/O%20Teorema%20Katherine.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/O%20Teorema%20Katherine.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"239", title:"Quem é você, Alasca", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Quem%20%C3%A9%20voc%C3%AA%2C%20Alasca.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Quem%20%C3%A9%20voc%C3%AA%2C%20Alasca.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"240", title:"Tartarugas Até Lá Embaixo", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Tartarugas%20At%C3%A9%20L%C3%A1%20Embaixo.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Tartarugas%20At%C3%A9%20L%C3%A1%20Embaixo.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"241", title:"Will e Will, Um nome, Um Destino", author:"John Green", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Will%20e%20Will%2C%20Um%20nome%2C%20Um%20Destino.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/John%20Green/Will%20e%20Will%2C%20Um%20nome%2C%20Um%20Destino.webp", collectionId:"John Green", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── Percy Jackson e os Olimpianos ─────────────────────────────────────
  { id:"242", title:"A Batalha no labirinto", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/A%20Batalha%20no%20labirinto%20-%204.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/A%20Batalha%20no%20labirinto%20-%204.webp", collectionId:"Percy Jackson e os Olimpianos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"243", title:"A Maldição do Titã", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/A%20Maldi%C3%A7%C3%A3o%20do%20Tit%C3%A3%20-%203.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/A%20Maldi%C3%A7%C3%A3o%20do%20Tit%C3%A3%20-%203.webp", collectionId:"Percy Jackson e os Olimpianos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"244", title:"O Ladrão de Raios", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/O%20Ladr%C3%A3o%20de%20Raios%20-%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/O%20Ladr%C3%A3o%20de%20Raios%20-%201.webp", collectionId:"Percy Jackson e os Olimpianos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"245", title:"O Mar De Monstros", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/O%20Mar%20De%20Monstros%20-%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/O%20Mar%20De%20Monstros%20-%202.webp", collectionId:"Percy Jackson e os Olimpianos", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"246", title:"O Ultimo Olimpiano", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/O%20Ultimo%20Olimpiano%20-%20%205.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Percy%20Jackson%20e%20os%20Olimpianos/O%20Ultimo%20Olimpiano%20-%20%205.webp", collectionId:"Percy Jackson e os Olimpianos", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── Red Queen ─────────────────────────────────────────────────────────
  { id:"247", title:"Coroa Cruel", author:"Victoria Aveyard", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/5%20-%20Coroa%20Cruel.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/5%20-%20Coroa%20Cruel.webp", collectionId:"Red Queen", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"248", title:"A Rainha Vermelha", author:"Victoria Aveyard", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/1%20-%20A%20Rainha%20Vermelha.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/1%20-%20A%20Rainha%20Vermelha.webp", collectionId:"Red Queen", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"249", title:"Espada de Vidro", author:"Victoria Aveyard", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/2%20-%20Espada%20de%20Vidro.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/2%20-%20Espada%20de%20Vidro.webp", collectionId:"Red Queen", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"250", title:"A Prisão do Rei", author:"Victoria Aveyard", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/3%20-%20A%20Pris%C3%A3o%20do%20Rei.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/3%20-%20A%20Pris%C3%A3o%20do%20Rei.webp", collectionId:"Red Queen", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"251", title:"Tempestade De Guerra", author:"Victoria Aveyard", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/4%20-%20Tempestade%20De%20Guerra.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Red%20Queen/4%20-%20Tempestade%20De%20Guerra.webp", collectionId:"Red Queen", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── Os Deuses de Argard ───────────────────────────────────────────────
  { id:"252", title:"O Navio dos Mortos", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Deuses%20de%20Argard/O%20Navio%20dos%20Mortos.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Deuses%20de%20Argard/O%20Navio%20dos%20Mortos.webp", collectionId:"Os Deuses de Argard", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"253", title:"A espada do verao", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Deuses%20de%20Argard/A%20espada%20do%20verao%20-%20Rick%20Riordan.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Deuses%20de%20Argard/A%20espada%20do%20verao%20-%20Rick%20Riordan.webp", collectionId:"Os Deuses de Argard", addedDate:"2026-09-02T00:00:00.000Z" },
  { id:"254", title:"O Martelo de Thor", author:"Rick Riordan", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Deuses%20de%20Argard/O%20Martelo%20de%20Thor%20-%20Magnus%20Chase%20e%20os%20Deuses%20de%20Asgard%20Vol%2002%20-%20Rick%20Riordan.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Deuses%20de%20Argard/O%20Martelo%20de%20Thor%20-%20Magnus%20Chase%20e%20os%20Deuses%20de%20Asgard%20Vol%2002%20-%20Rick%20Riordan.webp", collectionId:"Os Deuses de Argard", addedDate:"2026-09-02T00:00:00.000Z" },

  // ── Acotar ────────────────────────────────────────────────────────────
  { id:"255", title:"Corte de Espinhos e Rosas", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/1%20-%20Corte%20de%20Espinhos%20e%20Rosas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/1%20-%20Corte%20de%20Espinhos%20e%20Rosas.webp", collectionId:"Acotar", addedDate:"2026-09-14T00:00:00.000Z" },
  { id:"256", title:"Corte de Névoa e Fúria", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/2%20-%20Corte%20de%20N%C3%A9voa%20e%20F%C3%BAria.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/2%20-%20Corte%20de%20N%C3%A9voa%20e%20F%C3%BAria-02.webp", collectionId:"Acotar", addedDate:"2026-09-14T00:00:00.000Z" },
  { id:"257", title:"Corte de Asas e Ruínas", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/3%20-%20Corte%20de%20Asas%20e%20Ru%C3%ADnas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/3%20-%20Corte%20de%20Asas%20e%20Ru%C3%ADnas.webp", collectionId:"Acotar", addedDate:"2026-09-14T00:00:00.000Z" },
  { id:"258", title:"Corte de Gelo e Estrelas", author:"Sarah J. Maas", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/4%20-%20Corte%20de%20Gelo%20e%20Estrelas.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Acotar/4%20-%20Corte%20de%20Gelo%20e%20Estrelas.webp", collectionId:"Acotar", addedDate:"2026-09-14T00:00:00.000Z" },

  // ── Entremundos ───────────────────────────────────────────────────────
  { id:"259", title:"A Roda da Eternidade", author:"Neil Gaiman", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Entremundos/A%20Roda%20da%20Eternidade%20-%20Neil%20Gaiman.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Entremundos/A%20Roda%20da%20Eternidade%20-%20Neil%20Gaiman.webp", collectionId:"Entremundos", addedDate:"2026-09-14T00:00:00.000Z" },
  { id:"261", title:"Entremundos", author:"Neil Gaiman", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Entremundos/Entremundos%20-%20Neil%20Gaiman.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Entremundos/Entremundos%20-%20Neil%20Gaiman.webp", collectionId:"Entremundos", addedDate:"2026-09-14T00:00:00.000Z" },
  { id:"262", title:"Sonho de Prata", author:"Neil Gaiman", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Entremundos/Sonho%20de%20Prata%20-%20Neil%20Gaiman.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Entremundos/Sonho%20de%20Prata%20-%20Neil%20Gaiman.webp", collectionId:"Entremundos", addedDate:"2026-09-14T00:00:00.000Z" },

  // ── Sinful Lust ───────────────────────────────────────────────────────
  { id:"263", title:"Nivel 18 Capítulo 1", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/%2B18/Nivel%2018%20Cap%C3%ADtulo%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/%2B18/Nivel%2018%20Cap%C3%ADtulo%201.webp", collectionId:"Sinful Lust", subCollectionId:"+18", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"264", title:"Lizana to Homeless Capítulo 1", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%201.webp", collectionId:"Sinful Lust", subCollectionId:"Lizana to Homeless", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"265", title:"Lizana to Homeless Capítulo 2", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%202.webp", collectionId:"Sinful Lust", subCollectionId:"Lizana to Homeless", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"266", title:"Lizana to Homeless Capítulo 3", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%203.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%203.webp", collectionId:"Sinful Lust", subCollectionId:"Lizana to Homeless", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"267", title:"Lizana to Homeless Capítulo 4", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%204.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%204.webp", collectionId:"Sinful Lust", subCollectionId:"Lizana to Homeless", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"268", title:"Lizana to Homeless Capítulo 5", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%205.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%205.webp", collectionId:"Sinful Lust", subCollectionId:"Lizana to Homeless", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"269", title:"Lizana to Homeless Capítulo 6", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%206.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Lizana%20to%20Homeless/Lizana%20to%20Homeless%20Cap%C3%ADtulo%206.webp", collectionId:"Sinful Lust", subCollectionId:"Lizana to Homeless", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"270", title:"stop seducing me! 1", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!%201.webp", collectionId:"Sinful Lust", subCollectionId:"stop seducing me!", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"271", title:"stop seducing me! 2", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!/My%20Daughter-in-Law%20won't%20stop%20seducing%20me!%202.webp", collectionId:"Sinful Lust", subCollectionId:"stop seducing me!", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"272", title:"Sinful Lust 0", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%200.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%200.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"273", title:"Sinful Lust 1", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%201.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"274", title:"Sinful Lust 2", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%202.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"275", title:"Sinful Lust 3", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%203.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%203.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"276", title:"Sinful Lust 4", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%204.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%204.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"277", title:"Sinful Lust 5", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%205.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%205.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"278", title:"Sinful Lust 6", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%206.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%206.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"279", title:"Sinful Lust 7", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%207.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%207.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"280", title:"Sinful Lust 8", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%208.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%208.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"281", title:"Sinful Lust 9", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%209.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%209.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"282", title:"Sinful Lust 10", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2010.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2010.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"283", title:"Sinful Lust 11", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2011.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2011.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"284", title:"Sinful Lust 12", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2012.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2012.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"285", title:"Sinful Lust 13", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2013.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2013.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"286", title:"Sinful Lust 14", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2014.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2014.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"287", title:"Sinful Lust 15", author:"Zetto", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2015.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Sinful%20Lust/Original/Sinful%20Lust%2015.webp", collectionId:"Sinful Lust", subCollectionId:"Original", addedDate:"2026-09-15T00:00:00.000Z" },

  // ── Os Artifícios das Trevas ──────────────────────────────────────────
  { id:"288", title:"Dama da Meia-Noite", author:"Cassandra Clare", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Artif%C3%ADcios%20das%20Trevas/Dama%20da%20Meia-Noite%20-%201.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Artif%C3%ADcios%20das%20Trevas/Dama%20da%20Meia-Noite%20-%201.webp", collectionId:"Os Artifícios das Trevas", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"289", title:"Rainha do Ar e da Escuridão", author:"Cassandra Clare", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Artif%C3%ADcios%20das%20Trevas/Rainha%20do%20Ar%20e%20da%20Escurid%C3%A3o%20-%203.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Artif%C3%ADcios%20das%20Trevas/Rainha%20do%20Ar%20e%20da%20Escurid%C3%A3o%20-%203.webp", collectionId:"Os Artifícios das Trevas", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"290", title:"Senhor das Sombras", author:"Cassandra Clare", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Artif%C3%ADcios%20das%20Trevas/Senhor%20das%20Sombras%20-%202.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Os%20Artif%C3%ADcios%20das%20Trevas/Senhor%20das%20Sombras%20-%202.webp", collectionId:"Os Artifícios das Trevas", addedDate:"2026-09-15T00:00:00.000Z" },

  // ── Uma Chama Entre as Cinzas ─────────────────────────────────────────
  { id:"291", title:"Uma Chama Entre as Cinzas", author:"Sabaa Tahir", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Uma%20Chama%20Entre%20as%20Cinzas/01%20-%20Uma%20Chama%20Entre%20as%20Cinzas.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Uma%20Chama%20Entre%20as%20Cinzas/01%20-%20Uma%20Chama%20Entre%20as%20Cinzas.webp", collectionId:"Uma Chama Entre as Cinzas", addedDate:"2026-09-15T00:00:00.000Z" },
  { id:"292", title:"Uma Tocha Na Escuridão", author:"Sabaa Tahir", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Uma%20Chama%20Entre%20as%20Cinzas/02%20-%20Uma%20Tocha%20Na%20Escurid%C3%A3o.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Uma%20Chama%20Entre%20as%20Cinzas/02%20-%20Uma%20Tocha%20Na%20Escurid%C3%A3o.webp", collectionId:"Uma Chama Entre as Cinzas", addedDate:"2026-09-15T00:00:00.000Z" },

// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: A MALDIÇÃO DO TIGRE
// ═══════════════════════════════════════════════════════════════════════

{ id:"306", title:"A Maldição do Tigre", author:"Colleen Houck", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/01%20-%20A%20Maldi%C3%A7%C3%A3o%20Do%20Tigre.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/01%20-%20A%20Maldi%C3%A7%C3%A3o%20Do%20Tigre.webp", collectionId:"A Maldição do Tigre", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"307", title:"O Resgate do Tigre", author:"Colleen Houck", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/02%20-%20O%20Resgate%20do%20Tigre.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/02%20-%20O%20Resgate%20do%20Tigre.webp", collectionId:"A Maldição do Tigre", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"308", title:"A Viagem do Tigre", author:"Colleen Houck", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/03%20-%20A%20Viagem%20do%20Tigre.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/03%20-%20A%20Viagem%20do%20Tigre.webp", collectionId:"A Maldição do Tigre", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"309", title:"O Destino do Tigre", author:"Colleen Houck", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/04%20-%20O%20Destino%20do%20Tigre.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/04%20-%20O%20Destino%20do%20Tigre.webp", collectionId:"A Maldição do Tigre", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"310", title:"O Sonho do Tigre", author:"Colleen Houck", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/05%20-%20O%20Sonho%E2%80%89do%E2%80%89Tigre.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/05%20-%20O%20Sonho%E2%80%89do%E2%80%89Tigre.webp", collectionId:"A Maldição do Tigre", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"311", title:"A Promessa do Tigre", author:"Colleen Houck", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/06%20-%20A%20Promessa%20do%20Tigre.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Maldi%C3%A7%C3%A3o%20do%20Tigre/06%20-%20A%20Promessa%20do%20Tigre.webp", collectionId:"A Maldição do Tigre", addedDate:"2026-09-17T00:00:00.000Z" },


// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: A QUINTA ESTAÇÃO
// ═══════════════════════════════════════════════════════════════════════

{ id:"312", title:"A Quinta Estação", author:"N. K. Jemisin", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Quinta%20Esta%C3%A7%C3%A3o/01-A-Quinta-Esta%C3%A7%C3%A3o.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Quinta%20Esta%C3%A7%C3%A3o/01-A-Quinta-Esta%C3%A7%C3%A3o.webp", collectionId:"A Quinta Estação", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"313", title:"O Portão do Obelisco", author:"N. K. Jemisin", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Quinta%20Esta%C3%A7%C3%A3o/02-O-Port%C3%A3o-do-Obelisco.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Quinta%20Esta%C3%A7%C3%A3o/02-O-Port%C3%A3o-do-Obelisco.webp", collectionId:"A Quinta Estação", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"314", title:"O Céu-de-Pedra", author:"N. K. Jemisin", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Quinta%20Esta%C3%A7%C3%A3o/03-O-C%C3%A9u-de-Pedra.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Quinta%20Esta%C3%A7%C3%A3o/03-O-C%C3%A9u-de-Pedra.webp", collectionId:"A Quinta Estação", addedDate:"2026-09-17T00:00:00.000Z" },


// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: A RAINHA DE TEARLING
// ═══════════════════════════════════════════════════════════════════════

{ id:"293", title:"A Rainha de Tearling", author:"Erika Johansen", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Rainha%20de%20Tearling/01%20-%20A%20Rainha%20de%20Tearling%20-%20Erika%20Johansen.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Rainha%20de%20Tearling/01%20-%20A%20Rainha%20de%20Tearling%20-%20Erika%20Johansen.webp", collectionId:"A Rainha de Tearling", addedDate:"2026-09-15T00:00:00.000Z" },
{ id:"294", title:"A Invasão de Tearling", author:"Erika Johansen", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Rainha%20de%20Tearling/02%20-%20A%20Invas%C3%A3o%20de%20Tearling%20-%20Erika%20Johansen.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Rainha%20de%20Tearling/02%20-%20A%20Invas%C3%A3o%20de%20Tearling%20-%20Erika%20Johansen.webp", collectionId:"A Rainha de Tearling", addedDate:"2026-09-15T00:00:00.000Z" },
{ id:"295", title:"O Destino de Tearling", author:"Erika Johansen", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Rainha%20de%20Tearling/03%20-%20O%20Destino%20de%20Tearling%20-%20Erika%20Johansen.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/A%20Rainha%20de%20Tearling/03%20-%20O%20Destino%20de%20Tearling%20-%20Erika%20Johansen.webp", collectionId:"A Rainha de Tearling", addedDate:"2026-09-15T00:00:00.000Z" },


// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: ASSASSIN'S CREED
// ═══════════════════════════════════════════════════════════════════════

{ id:"296", title:"A Cruzada Secreta", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/A%20Cruzada%20Secreta.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/A%20Cruzada%20Secreta.webp", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"297", title:"Bandeira Negra", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Bandeira%20negra.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Bandeira%20negra.webp", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"298", title:"Guia Definitivo", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Guia%20Definitivo.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Guia%20Definitivo.webp", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"299", title:"Irmandade", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Irmandade.pdf", coverPath:"https://github.com/Mvin2006/LIVROS/blob/main/Assassin's%20creed/Irmandade.webp?raw=true", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"300", title:"Renascença", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Renascen%C3%A7a.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Renascen%C3%A7a.webp", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"301", title:"Renegado", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Renegado.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Renegado.webp", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"302", title:"Submundo", author:"Oliver Bowden", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Submundo.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Assassin's%20creed/Submundo.webp", collectionId:"Assassin's creed", addedDate:"2026-09-17T00:00:00.000Z" },


// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: DRAGÕES DE ÉTER
// ═══════════════════════════════════════════════════════════════════════

{ id:"315", title:"Caçadores de Bruxas", author:"Raphael Draccon", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Drag%C3%B5es%20de%20%C3%89ter/01%20-%20Ca%C3%A7adores%20de%20Bruxas.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Drag%C3%B5es%20de%20%C3%89ter/01%20-%20Ca%C3%A7adores%20de%20Bruxas.webp", collectionId:"Dragões de Éter", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"316", title:"Corações de Neve", author:"Raphael Draccon", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Drag%C3%B5es%20de%20%C3%89ter/02%20-%20Cora%C3%A7%C3%B5es%20de%20Neve.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Drag%C3%B5es%20de%20%C3%89ter/02%20-%20Cora%C3%A7%C3%B5es%20de%20Neve.webp", collectionId:"Dragões de Éter", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"317", title:"Círculos de Chuva", author:"Raphael Draccon", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Drag%C3%B5es%20de%20%C3%89ter/03%20-%20C%C3%ADrculos%20de%20Chuva.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Drag%C3%B5es%20de%20%C3%89ter/03%20-%20C%C3%ADrculos%20de%20Chuva.webp", collectionId:"Dragões de Éter", addedDate:"2026-09-17T00:00:00.000Z" },


// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: MOSQUITO MEN
// ═══════════════════════════════════════════════════════════════════════

{ id:"318", title:"Okaa-san Itadakimasu w", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Okaa-san%20Itadakimasu%20w.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Okaa-san%20Itadakimasu%20w.png", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"319", title:"Bakunyuu Tsuma Namatamari Kyouko", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Bakunyuu%20Tsuma%20Namatamari%20Kyouko.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Bakunyuu%20Tsuma%20Namatamari%20Kyouko.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"320", title:"kyojiri Tsuma Keiko to Zetsurin! Sukebe Jii", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/kyojiri%20Tsuma%20Keiko%20to%20Zetsurin!%20Sukebe%20Jii.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/kyojiri%20Tsuma%20Keiko%20to%20Zetsurin!%20Sukebe%20Jii.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"321", title:"Kaa-chan to Charao Mom & Playboy", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Kaa-chan%20to%20Charao%20Mom%20%26%20Playboy.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Kaa-chan%20to%20Charao%20Mom%20%26%20Playboy.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"322", title:"Musuko no Migawari ni Ijimekko ni Karada o Sashidasu Kimajime de Okatai Bakunyuu Mama!", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Musuko%20no%20Migawari%20ni%20Ijimekko%20ni%20Karada%20o%20Sashidasu%20Kimajime%20de%20Okatai%20Bakunyuu%20Mama!.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Musuko%20no%20Migawari%20ni%20Ijimekko%20ni%20Karada%20o%20Sashidasu%20Kimajime%20de%20Okatai%20Bakunyuu%20Mama!.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"323", title:"Yoku Genkotsu o Omimai Suru Kusogaki no Chinko ga Otto", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Yoku%20Genkotsu%20o%20Omimai%20Suru%20Kusogaki%20no%20Chinko%20ga%20Otto.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Yoku%20Genkotsu%20o%20Omimai%20Suru%20Kusogaki%20no%20Chinko%20ga%20Otto.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"324", title:"Onsenyado de Charachan", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Onsenyado%20de%20Charachan.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Onsenyado%20de%20Charachan.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"325", title:"Yabai yo!! Bakunyuu Yankee Musume Ricchan!", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Yabai%20yo!!%20Bakunyuu%20Yankee%20Musume%20Ricchan!.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Yabai%20yo!!%20Bakunyuu%20Yankee%20Musume%20Ricchan!.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"326", title:"Konbini Uwaki Tsuma", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Konbini%20Uwaki%20Tsuma.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Konbini%20Uwaki%20Tsuma.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },
{ id:"327", title:"Tsuma no Bakunyuu ni Muragaru Otoko-tachi", author:"Mosquito Men", fileType:"pdf", filePath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Tsuma%20no%20Bakunyuu%20ni%20Muragaru%20Otoko-tachi.pdf", coverPath:"https://raw.githubusercontent.com/Mvin2006/HQ/main/Mosquito%20Men/Tsuma%20no%20Bakunyuu%20ni%20Muragaru%20Otoko-tachi.jpg", collectionId:"Mosquito Men", addedDate:"2026-10-09T00:00:00.000Z" },


// ═══════════════════════════════════════════════════════════════════════
// COLEÇÃO: TRILOGIA GRISHA
// ═══════════════════════════════════════════════════════════════════════

{ id:"303", title:"Sombra e Ossos", author:"Leigh Bardugo", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trilogia%20Grisha/01%20-%20Sombra%20e%20Ossos.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trilogia%20Grisha/01%20-%20Sombra%20e%20Ossos.webp", collectionId:"Trilogia Grisha", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"304", title:"Sol e Tormenta", author:"Leigh Bardugo", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trilogia%20Grisha/02%20-%20Sol%20e%20Tormenta.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trilogia%20Grisha/02%20-%20Sol%20e%20Tormenta.webp", collectionId:"Trilogia Grisha", addedDate:"2026-09-17T00:00:00.000Z" },
{ id:"305", title:"Ruína e Ascensão", author:"Leigh Bardugo", fileType:"epub", filePath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trilogia%20Grisha/03%20-%20%20Ru%C3%ADna%20e%20Ascens%C3%A3o.epub", coverPath:"https://raw.githubusercontent.com/Mvin2006/LIVROS/main/Trilogia%20Grisha/03%20-%20%20Ru%C3%ADna%20e%20Ascens%C3%A3o.webp", collectionId:"Trilogia Grisha", addedDate:"2026-09-17T00:00:00.000Z" },

];

// Corrige links do GitHub (blob → raw) e codifica espaços/acentos nas URLs.
const PRELOADED_BOOKS: Book[] = RAW_PRELOADED_BOOKS.map(book => ({
  ...book,
  filePath: normalizeUrl(book.filePath),
  coverPath: book.coverPath ? normalizeUrl(book.coverPath) : undefined,
}));

const STORAGE_KEY = 'estante_books_v2';
const HIDDEN_PRELOADED_STORAGE_KEY = 'estante_hidden_preloaded_v1';
const RECENT_STORAGE_KEY = 'estante_recent_v1';
const MAX_RECENT = 8;

const NAV_ITEMS = [
  { id: 'books', label: 'Livros', Icon: BookOpen },
  { id: 'collections', label: 'Coleções', Icon: FolderOpen },
] as const;

// ─── Storage / derived data ───────────────────────────────────────────────────

function readStoredJson(key: string): unknown {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadInitialBooks(): Book[] {
  const parsedBooks = readStoredJson(STORAGE_KEY);
  const userBooks = Array.isArray(parsedBooks) ? parsedBooks.filter(isValidBook) : [];
  const preloadedIds = new Set(PRELOADED_BOOKS.map(book => book.id));
  const extras = userBooks.filter(book => !preloadedIds.has(book.id));

  const hiddenRaw = readStoredJson(HIDDEN_PRELOADED_STORAGE_KEY);
  const hidden = new Set(
    Array.isArray(hiddenRaw) ? hiddenRaw.filter((id): id is string => typeof id === 'string') : []
  );

  return [...PRELOADED_BOOKS.filter(book => !hidden.has(book.id)), ...extras];
}

function loadRecentIds(): string[] {
  const raw = readStoredJson(RECENT_STORAGE_KEY);
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string').slice(0, MAX_RECENT) : [];
}

function saveRecentIds(ids: string[]) {
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* armazenamento cheio ou bloqueado — o histórico é opcional */
  }
}

// ─── Small components ─────────────────────────────────────────────────────────

/** Capa com plano B: se a imagem falhar, mostra o título em vez de um buraco preto. */
function BookCover({ book, priority }: { book: Book; priority: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!book.coverPath || failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center text-[var(--text-muted)] bg-gradient-to-b from-[var(--bg-4)] to-[var(--bg-3)]">
        {fileTypeIcon(book.fileType)}
        <span className="font-serif text-[11px] leading-tight line-clamp-4 text-[var(--text-sub)]">{book.title}</span>
      </div>
    );
  }

  return (
    <img
      src={book.coverPath}
      alt={book.title}
      className="w-full h-full object-cover"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/** Evita que um erro dentro do leitor derrube o app inteiro. */
class ReaderBoundary extends Component<
  { onClose: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[var(--bg)] p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-[var(--gold)]" />
        <h2 className="font-serif text-xl text-[var(--text)]">Não foi possível abrir este livro</h2>
        <p className="max-w-sm text-sm text-[var(--text-sub)]">Ocorreu um erro no leitor. Volte à estante e tente abrir o livro de novo.</p>
        <button type="button" onClick={this.props.onClose} className="px-5 py-2 rounded-full bg-[var(--gold)] text-[var(--bg)] text-sm font-semibold">
          Voltar à estante
        </button>
      </div>
    );
  }
}

const FORMAT_FILTERS: { id: FormatFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pdf', label: 'PDF' },
  { id: 'epub', label: 'EPUB' },
];

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'default', label: 'Ordem da estante' },
  { id: 'title', label: 'Título (A–Z)' },
  { id: 'recent', label: 'Mais recentes' },
];

// Marca que o popstate em andamento foi disparado pelo próprio app.
let selfInitiatedBack = false;

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const [books] = useState<Book[]>(loadInitialBooks);
  const collectionDefinitions = useMemo(() => buildCollectionDefinitions(books, DEFAULT_COLLECTIONS), [books]);

  const [activeTab,          setActiveTab]          = useState<'books' | 'collections'>('books');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{
    activeTab: 'books' | 'collections';
    selectedCollection: string | null;
  }>>([]);
  const [readingBook,        setReadingBook]        = useState<Book | null>(null);
  const [sortMode,          setSortMode]           = useState<SortMode>('default');
  const [formatFilter,      setFormatFilter]       = useState<FormatFilter>('all');
  const [recentIds,         setRecentIds]          = useState<string[]>(loadRecentIds);
  const isReading = readingBook !== null;

  // Botão/gesto "voltar" do navegador fecha só o leitor (e não o site inteiro).
  // O popstate gerado pelo nosso próprio history.back() (ao fechar pelo botão
  // do leitor) é ignorado — senão, no StrictMode, o leitor fechava sozinho.
  useEffect(() => {
    if (!isReading) return;

    window.history.pushState({ mvReader: true }, '');

    const handlePopState = () => {
      if (selfInitiatedBack) return;
      setReadingBook(null);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      if ((window.history.state as { mvReader?: boolean } | null)?.mvReader) {
        window.addEventListener('popstate', () => {
          selfInitiatedBack = true;
          window.setTimeout(() => { selfInitiatedBack = false; }, 0);
        }, { once: true });
        window.history.back();
      }
    };
  }, [isReading]);
  const [viewMode,           setViewMode]           = useState<'grid' | 'list'>('grid');

  // ── Collections ────────────────────────────────────────────────────────────
  const collections = useMemo(() => {
    return collectionDefinitions.map(collection => {
      const childIds = collectionDefinitions.filter(item => sameCollectionId(item.parentId, collection.id)).map(item => item.id);
      const collectionBooks = books.filter(book => bookInCollection(book, collection.id, childIds));
      return {
        ...collection,
        count: collectionBooks.length,
        covers: collectionBooks.filter(book => book.coverPath).slice(0, 3).map(book => book.coverPath!),
        authors: [...new Set(collectionBooks.map(book => book.author))].slice(0, 2),
      };
    });
  }, [books, collectionDefinitions]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const q = canonicalKey(searchQuery);
    const childIds = selectedCollection
      ? collectionDefinitions.filter(item => sameCollectionId(item.parentId, selectedCollection)).map(item => item.id)
      : [];

    const matches = books.filter(book => {
      const matchSearch = !q ||
        canonicalKey(book.title).includes(q) ||
        canonicalKey(book.author).includes(q);
      const matchCol = !selectedCollection || bookInCollection(book, selectedCollection, childIds);
      const matchFormat = formatFilter === 'all' || book.fileType === formatFilter;
      return matchSearch && matchCol && matchFormat;
    });

    return sortBooks(matches, sortMode);
  }, [books, collectionDefinitions, searchQuery, selectedCollection, formatFilter, sortMode]);

  const recentBooks = useMemo(
    () => recentIds.map(id => books.find(book => book.id === id)).filter((book): book is Book => Boolean(book)),
    [recentIds, books],
  );

  const openBook = useCallback((book: Book) => {
    setReadingBook(book);
    setRecentIds(prev => {
      const next = [book.id, ...prev.filter(id => id !== book.id)].slice(0, MAX_RECENT);
      saveRecentIds(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.title = readingBook
      ? `${readingBook.title} — Minha Estante`
      : selectedCollection
        ? `${selectedCollection} — Minha Estante`
        : 'Minha Estante — Biblioteca Digital';
  }, [readingBook, selectedCollection]);

  const selectCollection = useCallback((id: string) => {
    setNavigationHistory(prev => [...prev, { activeTab, selectedCollection }]);
    setSelectedCollection(id);
    setActiveTab(collectionDefinitions.some(collection => collection.parentId === id) ? 'collections' : 'books');
  }, [activeTab, collectionDefinitions, selectedCollection]);

  // Retorna exatamente para a tela anterior, preservando aba e coleção.
  const goBack = useCallback(() => {
    const previous = navigationHistory[navigationHistory.length - 1];

    if (!previous) {
      setSelectedCollection(null);
      setActiveTab('collections');
      return;
    }

    setSelectedCollection(previous.selectedCollection);
    setActiveTab(previous.activeTab);
    setNavigationHistory(navigationHistory.slice(0, -1));
  }, [navigationHistory]);

  // ── Reader renderer ────────────────────────────────────────────────────────
  const renderReader = () => {
    if (!readingBook) return null;
    const close = () => setReadingBook(null);
    const Reader = readingBook.fileType === 'epub' ? EpubReader : PDFReader;
    return (
      <ReaderBoundary key={readingBook.id} onClose={close}>
        <Suspense
          fallback={
            <div role="status" aria-label="Carregando leitor" className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
            </div>
          }
        >
          <Reader
            url={readingBook.filePath}
            title={readingBook.title}
            author={readingBook.author}
            coverUrl={readingBook.coverPath}
            onClose={close}
          />
        </Suspense>
      </ReaderBoundary>
    );
  };

  // ── Book card (grid) ───────────────────────────────────────────────────────
  const renderBookCard = (book: Book, index: number) => (
    <button
      key={book.id}
      className="book-card animate-cardIn text-left"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
      onClick={() => openBook(book)}
      aria-label={`Ler ${book.title}`}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[var(--bg-4)]">
        <BookCover book={book} priority={index < 6} />
        <div className="cover-overlay">
          <span className="px-3 py-1.5 bg-[var(--gold)] text-[var(--bg)] text-[10px] font-semibold uppercase tracking-wider rounded-full">
            Ler agora
          </span>
        </div>
        {/* Format badge */}
        <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${fileTypeBadgeColor(book.fileType)}`}>
          {book.fileType}
        </span>
      </div>
      <div className="p-2.5">
        <h3 className="font-serif font-semibold text-[13px] text-[var(--text)] line-clamp-2 leading-tight">{book.title}</h3>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{book.author}</p>
        {(book.collectionId || book.subCollectionId) && (
          <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[var(--gold-dim)] bg-[var(--gold-glow-2)] border border-[rgba(201,171,110,0.15)] rounded">
            {book.subCollectionId || book.collectionId}
          </span>
        )}
      </div>
    </button>
  );

  // ── Book row (list view) ───────────────────────────────────────────────────
  const renderBookRow = (book: Book, index: number) => (
    <button
      key={book.id}
      className="w-full flex items-center gap-4 p-3 bg-[var(--bg-3)] border border-[var(--border)] rounded-xl hover:border-[var(--border-2)] transition-all animate-cardIn text-left group"
      style={{ animationDelay: `${Math.min(index * 0.02, 0.4)}s` }}
      onClick={() => openBook(book)}
      aria-label={`Ler ${book.title}`}
    >
      <div className="relative flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-[var(--bg-4)]">
        <BookCover book={book} priority={index < 6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-[var(--text)] text-sm truncate group-hover:text-[var(--gold)] transition-colors">{book.title}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{book.author}</p>
        {(book.collectionId || book.subCollectionId) && (
          <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--gold-dim)] bg-[var(--gold-glow-2)] border border-[rgba(201,171,110,0.15)] rounded">
            {book.subCollectionId || book.collectionId}
          </span>
        )}
      </div>
      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase rounded border ${fileTypeBadgeColor(book.fileType)}`}>
        {fileTypeIcon(book.fileType)}{book.fileType}
      </span>
      <span className="text-[11px] text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity pr-1 flex-shrink-0">
        Ler →
      </span>
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 lg:pb-0">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 bg-[var(--bg-2)] border-r border-[var(--border)] flex-col z-50">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
              <Library className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-[var(--gold)]">Minha Estante</h1>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Biblioteca Digital</p>
            </div>
          </div>
        </div>

        <nav aria-label="Principal" className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setNavigationHistory([]); setActiveTab(id); if (id !== 'collections') setSelectedCollection(null); }}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                activeTab === id
                  ? 'bg-[var(--gold-glow)] text-[var(--gold)] border-l-2 border-[var(--gold)] pl-[10px]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-sub)] hover:bg-white/[0.025]'
              }`}
            >
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span><b className="text-[var(--gold-dim)]">{books.length}</b> livros</span>
            <span><b className="text-[var(--gold-dim)]">{collections.length}</b> coleções</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['pdf','epub'] as FileType[]).map(ft => {
              const count = books.filter(b => b.fileType === ft).length;
              if (count === 0) return null;
              return (
                <span key={ft} className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${fileTypeBadgeColor(ft)}`}>
                  {ft} {count}
                </span>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-2)] border-b border-[var(--border)] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center">
            <Library className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <h1 className="font-serif text-base font-semibold text-[var(--gold)]">Minha Estante</h1>
        </div>
        {activeTab === 'books' && (
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="icon-btn w-9 h-9"
            aria-label="Mudar visualização"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">

        {/* ── Books ── */}
        {activeTab === 'books' && (
          <section className="animate-fadeIn">
            <div className="px-4 lg:px-10 pt-6 lg:pt-10 pb-4">
              {selectedCollection ? (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={goBack} className="icon-btn w-9 h-9" aria-label="Voltar">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--text)]">
                      <em className="text-[var(--gold)] not-italic">{selectedCollection}</em>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">
                      {filteredBooks.length} {filteredBooks.length === 1 ? 'livro' : 'livros'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--text)]">
                      Todos os <em className="text-[var(--gold)] not-italic">Livros</em>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">
                      {filteredBooks.length} títulos disponíveis
                    </p>
                  </div>
                  {/* Desktop view toggle */}
                  <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-3)] rounded-lg p-1 border border-[var(--border)]">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-[var(--gold-glow)] text-[var(--gold)]' : 'text-[var(--text-muted)] hover:text-[var(--text-sub)]'}`} aria-label="Grade"><Grid3X3 className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-[var(--gold-glow)] text-[var(--gold)]' : 'text-[var(--text-muted)] hover:text-[var(--text-sub)]'}`} aria-label="Lista"><List className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
              <div className="gold-line mt-3" />
            </div>

            {/* Search + filters */}
            <div className="px-4 lg:px-10 pb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar título ou autor…"
                  className="pl-10 pr-10 bg-[var(--bg-3)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] h-10 focus:border-[var(--gold-dim)] transition-colors [&::-webkit-search-cancel-button]:hidden"
                  aria-label="Buscar livros"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5"
                    aria-label="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Filtrar por formato" className="flex items-center gap-1 bg-[var(--bg-3)] rounded-lg p-1 border border-[var(--border)]">
                  {FORMAT_FILTERS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormatFilter(id)}
                      aria-pressed={formatFilter === id}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        formatFilter === id
                          ? 'bg-[var(--gold-glow)] text-[var(--gold)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-sub)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortMode)}
                  aria-label="Ordenar livros"
                  className="h-9 px-3 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-xs text-[var(--text-sub)] focus:outline-none focus:border-[var(--gold-dim)]"
                >
                  {SORT_OPTIONS.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
                <span role="status" aria-live="polite" className="sr-only">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
                </span>
              </div>
            </div>

            {/* Abertos recentemente */}
            {!selectedCollection && !searchQuery && formatFilter === 'all' && recentBooks.length > 0 && (
              <div className="px-4 lg:px-10 pb-5">
                <h3 className="font-serif text-base text-[var(--text-sub)] mb-2">Continue de onde parou</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" data-testid="recent-shelf">
                  {recentBooks.map(book => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => openBook(book)}
                      aria-label={`Continuar ${book.title}`}
                      className="relative flex-shrink-0 w-20 aspect-[2/3] rounded-md overflow-hidden border border-[var(--border)] hover:border-[var(--border-3)] transition-colors"
                    >
                      <BookCover book={book} priority={false} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Books grid or list */}
            <div className="px-4 lg:px-10 pb-10">
              {filteredBooks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-3)] flex items-center justify-center">
                    <Search className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="font-serif text-xl text-[var(--text)] mb-2">Nenhum livro encontrado</h3>
                  <p className="text-sm text-[var(--text-muted)]">Tente outra busca ou ajuste os filtros.</p>
                  {(searchQuery || formatFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setFormatFilter('all'); }}
                      className="mt-4 px-4 py-2 rounded-full border border-[var(--border-2)] text-xs text-[var(--gold)] hover:bg-[var(--gold-glow)]"
                    >
                      Limpar busca e filtros
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
                  {filteredBooks.map(renderBookCard)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBooks.map(renderBookRow)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Collections ── */}
        {activeTab === 'collections' && (
          <section className="animate-fadeIn">
            <div className="px-4 lg:px-10 pt-6 lg:pt-10 pb-4">
              <h2 className="font-serif text-2xl lg:text-3xl font-light text-[var(--text)]">
                Suas <em className="text-[var(--gold)] not-italic">Coleções</em>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Séries e universos literários</p>
              <div className="gold-line mt-3" />
            </div>
            <div className="px-4 lg:px-10 pb-8">
              {collections.length === 0 ? (
                <div className="text-center py-20">
                  <FolderOpen className="w-10 h-10 mx-auto mb-4 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Adicione livros com coleções para vê-las aqui.</p>
                </div>
              ) : selectedCollection && collectionDefinitions.some(collection => collection.parentId === selectedCollection) ? (
                <div>
                  <button type="button" onClick={goBack} className="icon-btn w-9 h-9 mb-4" aria-label="Voltar às coleções">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-serif text-xl text-[var(--text)] mb-4">
                    <em className="text-[var(--gold)] not-italic">{selectedCollection}</em>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.filter(collection => collection.parentId === selectedCollection).map((child, i) => (
                      <button key={child.id} onClick={() => selectCollection(child.id)} className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-5 text-left card-hover animate-cardIn" style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="w-12 h-16 mb-4 bg-[var(--bg-4)] rounded flex items-center justify-center overflow-hidden">
                          {child.covers[0] ? <img src={child.covers[0]} alt="" className="w-full h-full object-cover" /> : <FolderOpen className="w-6 h-6 text-[var(--text-muted)]" />}
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-[var(--text)] mb-2">{child.name}</h4>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-4)] border border-[var(--border)] rounded-full text-xs text-[var(--gold)] font-medium">
                          <BookOpen className="w-3 h-3" />{child.count} {child.count === 1 ? 'livro' : 'livros'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.filter(col => !col.parentId).map((col, i) => (
                    <div
                      key={col.id}
                      className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-5 cursor-pointer card-hover animate-cardIn text-left"
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onClick={() => selectCollection(col.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') selectCollection(col.id); }}
                    >
                      <div className="flex gap-2 mb-4">
                        {col.covers.length > 0 ? col.covers.map((cover, idx) => (
                          <img key={idx} src={cover} alt="" loading="lazy"
                            fetchPriority="low" decoding="async"
                            className="w-12 h-16 object-cover rounded border border-[var(--border)] shadow-lg"
                            style={{ transform: idx === 1 ? 'rotate(2deg) translateX(-4px)' : idx === 2 ? 'rotate(-2deg) translateX(-8px)' : 'none' }}
                          />
                        )) : (
                          <div className="w-12 h-16 bg-[var(--bg-4)] rounded flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-[var(--text)] mb-1">{col.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] mb-3">{col.authors.join(', ')}</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-4)] border border-[var(--border)] rounded-full text-xs text-[var(--gold)] font-medium">
                        <BookOpen className="w-3 h-3" />
                        {col.count} {col.count === 1 ? 'livro' : 'livros'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Principal (celular)" className="lg:hidden bottom-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { setNavigationHistory([]); setActiveTab(id); if (id !== 'collections') setSelectedCollection(null); }}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`bottom-nav-item ${activeTab === id ? 'active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Reader */}
      {renderReader()}

    </div>
  );
}

export default App;
