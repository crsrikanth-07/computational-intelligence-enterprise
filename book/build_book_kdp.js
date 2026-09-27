// build_book_kdp.js — KDP paperback interior build (6" x 9")
//
// Usage:  node build_book_kdp.js <out.docx>
// Normally run through make_kdp.py, which also:
//   * switches on mirrored margins (inside/outside) in the DOCX settings,
//   * converts to PDF with LibreOffice, and
//   * fills in the contents-page numbers (two passes, verified).
//
// Page layout
//   Trim 6" x 9" (height 12945 DXA compensates LibreOffice's ~0.03" overshoot,
//   so the PDF lands at exactly 432 x 648 pt). Margins: 0.75" inside (gutter),
//   0.5" outside, 0.75" top and bottom.
//
// Section plan
//   1. Title page + copyright page ........ no running head, no page number
//   2. Contents, About This Book, Preface . no running head, roman folios (iii, iv, ...)
//   3. One section per part (I-VIII) and the appendices; arabic folios start at 1
//      on the Part I divider. Part-divider pages carry no running head or folio.
//
// Environment
//   ISBN=978-...   print the ISBN on the copyright page (omitted when unset)

process.env.KDP_BUILD = '1';

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, PageNumber, NumberFormat, LevelFormat, HeadingLevel,
  BorderStyle, TabStopType,
} = require('docx');

const A = require('./content_part_a');
const B = require('./content_part_b');
const E = require('./content_part_e');
const V0 = require('./content_v2_front');
const V3 = require('./content_v2_p3');
const V4 = require('./content_v2_p4');
const V5 = require('./content_v2_p5');
const V6 = require('./content_v2_p6');
const V8 = require('./content_v2_p8');
const VA = require('./content_v2_app');
const { FONT, ACCENT, H1, P } = require('./helpers');
const INDEX_FILE = path.join(__dirname, 'index_terms.json');

const AUTHOR = 'Srikanth Cherukupalli';
const TITLE = 'Computational Intelligence for Enterprise Systems';
const SUBTITLE = 'Advanced Optimization Algorithms with Working Prototypes';
const ISBN = (process.env.ISBN || '').trim();
const HERE = __dirname;
const TOC_PAGES_FILE = path.join(HERE, 'toc_pages.json');
const TOC_ENTRIES_FILE = path.join(HERE, 'toc_entries.json');

const KDP_PAGE = {
  size: { width: 8640, height: 12945 },
  margin: { top: 1080, bottom: 1080, right: 720, left: 1080, header: 540, footer: 540 },
};
const CONTENT_WIDTH = 8640 - 1080 - 720;   // 6840 DXA = 4.75"

// ---------------------------------------------------------------------------
// Book structure (assembly order). Chapter arrays keep their historical names.
// ---------------------------------------------------------------------------
const partDivider = (label, title, blurb) => [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 160 },
    children: [new TextRun({ text: label, font: FONT, size: 56, bold: true, color: ACCENT, characterSpacing: 60 })] }),
  ...(title ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 },
    children: [new TextRun({ text: title, font: FONT, size: 34, italics: true, color: '404040' })] })] : []),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, line: 300 }, indent: { left: 600, right: 600 },
    children: [new TextRun({ text: blurb, font: FONT, size: 21, color: '595959' })] }),
];

// Index (filled in by make_index.py after the page numbers are final)
const indexTerms = fs.existsSync(INDEX_FILE) ? JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')) : [];
const indexBlock = [
  H1('Index'),
  ...(indexTerms.length
    ? indexTerms.map((t) => new Paragraph({ spacing: { before: 0, after: 16, line: 250 }, indent: { left: 240, hanging: 240 },
        children: [new TextRun({ text: t.term, font: FONT, size: 18 }),
                   new TextRun({ text: ', ' + t.pages, font: FONT, size: 18, color: '404040' })] }))
    : [P('The index is generated in the final build pass.')]),
];

const MODULES = { a: A, b: B, e: E, f: V0, p3: V3, p4: V4, p5: V5, p6: V6, p8: V8, app: VA, idx: { index: indexBlock } };
const PARTS = [
  { label: 'PART I', title: 'Foundations', chapters: [['a', 'ch1'], ['a', 'ch2']],
    blurb: 'Why metaheuristics matter in the enterprise, when an exact solver is the better tool, and how this book measures results.' },
  { label: 'PART II', title: 'Mathematical Machinery', chapters: [['e', 'ch3_meta'], ['e', 'ch4_stoch']],
    blurb: 'A unified framework for metaheuristics and the probability needed to analyze and compare them.' },
  { label: 'PART III', title: 'Adaptive Genetic Optimization', chapters: [['p3', 'ch5'], ['p3', 'ch6'], ['p3', 'ch7']],
    blurb: 'A genetic algorithm that tunes its own mutation and crossover rates, applied to supply-network design and measured against exhaustive enumeration and MILP.' },
  { label: 'PART IV', title: 'Multi-Objective Simulated Annealing', chapters: [['p4', 'ch8'], ['p4', 'ch9']],
    blurb: 'Trading freight cost against CO\u2082: weighted sums, Pareto archives, and an exact front to judge them by.' },
  { label: 'PART V', title: 'Swarm Intelligence for Inventory', chapters: [['p5', 'ch10'], ['p5', 'ch11'], ['p5', 'ch12'], ['p5', 'ch13']],
    blurb: 'Particle swarm optimization and a hybrid PSO-GA for multi-product (Q, r) inventory policies with quantity discounts.' },
  { label: 'PART VI', title: 'Bessel Functions for Visual Inspection', chapters: [['p6', 'ch14'], ['p6', 'ch15']],
    blurb: 'Rotation-invariant shape descriptors for inspection cameras, with their settings tuned by PSO.' },
  { label: 'PART VII', title: 'Integration and Deployment', chapters: [['p6', 'ch16'], ['b', 'ch15']],
    blurb: 'One library, one result format, benchmarks, tests, and a production blueprint.' },
  { label: 'PART VIII', title: 'Capstone and Outlook', chapters: [['p8', 'ch18'], ['p8', 'ch19'], ['b', 'ch16']],
    blurb: 'The Margin Leak Finder \u2014 deterministic detection with multi-objective threshold calibration \u2014 and directions for future work.' },
  { label: 'APPENDICES', title: '', chapters: [['app', 'appA'], ['app', 'appB'], ['app', 'appC'], ['app', 'appD'], ['app', 'appE'], ['idx', 'index'], ['app', 'aboutAuthor']],
    blurb: 'Running the code, dataset specifications, references, worked examples, and exercises.' },
].map((p) => ({ ...p, divider: partDivider(p.label, p.title, p.blurb) }));

// Headings (H1/H2) come from runtime tags set by helpers.H1/H2, so spliced-in
// sections always appear on the contents page.
const headingsOf = (arr) => (arr || []).filter((x) => x && x.__toc).map((x) => x.__toc);

// ---------------------------------------------------------------------------
// Contents page
// ---------------------------------------------------------------------------
const tocPages = fs.existsSync(TOC_PAGES_FILE) ? JSON.parse(fs.readFileSync(TOC_PAGES_FILE, 'utf8')) : {};
const tocEntries = [];   // written out for make_kdp.py: { key, match, level }

const pageRun = (key) => new TextRun({
  children: ['\t', tocPages[key] || '000'], font: FONT, size: 20, color: '404040',
});
const tocLine = (key, text, level, match) => {
  tocEntries.push({ key, match: match || text, level });
  const style = {
    part:    { indent: 0,   before: 220, after: 60, size: 20, bold: true,  color: ACCENT, caps: true },
    front:   { indent: 0,   before: 60,  after: 30, size: 21, bold: true,  color: '2F2F2F' },
    chapter: { indent: 0,   before: 90,  after: 20, size: 21, bold: true,  color: '2F2F2F' },
    section: { indent: 360, before: 0,   after: 12, size: 19, bold: false, color: '595959' },
  }[level];
  return new Paragraph({
    keepNext: level === 'part' || level === 'chapter',
    spacing: { before: style.before, after: style.after },
    indent: { left: style.indent, right: 560, hanging: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH, leader: 'dot' }],
    children: [
      new TextRun({ text, font: FONT, size: style.size, bold: style.bold, color: style.color, allCaps: !!style.caps }),
      pageRun(key),
    ],
  });
};

function buildToc() {
  const lines = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({ text: 'Contents', font: FONT, size: 44, bold: true, color: ACCENT })],
    }),
    tocLine('front:About This Book', 'About This Book', 'front'),
    tocLine('front:Preface', 'Preface', 'front'),
  ];
  for (const part of PARTS) {
    const label = part.title ? `${part.label}  —  ${part.title}` : part.label;
    const match = part.title ? `${part.label} ${part.title}` : part.label;
    lines.push(tocLine(`part:${part.label}`, label, 'part', match));
    for (const [mod, name] of part.chapters) {
      for (const h of headingsOf(MODULES[mod][name])) {
        lines.push(tocLine(`${h.level}:${h.text}`, h.text, h.level === 'H1' ? 'chapter' : 'section'));
      }
    }
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Title page, copyright page, About This Book
// ---------------------------------------------------------------------------
const centered = (text, opts = {}, spacing = {}) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing,
  children: [new TextRun({ text, font: FONT, ...opts })],
});

const titlePage = [
  centered('COMPUTATIONAL', { size: 48, bold: true, color: ACCENT, characterSpacing: 80 }, { before: 2800 }),
  centered('INTELLIGENCE', { size: 48, bold: true, color: ACCENT, characterSpacing: 80 }, { before: 80, after: 80 }),
  centered('for Enterprise Systems', { size: 34, italics: true, color: '404040' }, { before: 120, after: 320 }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0 },
    indent: { left: 1400, right: 1400 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
    children: [new TextRun({ text: '', font: FONT, size: 8 })],
  }),
  centered(SUBTITLE, { size: 22, italics: true, color: '595959' }, { before: 240, after: 60 }),
  centered(AUTHOR, { size: 30, bold: true, color: '2F2F2F' }, { before: 3400 }),
];

const small = (text, opts = {}, spacing = {}) => new Paragraph({
  spacing, children: [new TextRun({ text, font: FONT, size: 18, color: '404040', ...opts })],
});
const copyrightPage = [
  new Paragraph({ pageBreakBefore: true, spacing: { before: 4200 }, children: [
    new TextRun({ text: TITLE, font: FONT, size: 22, bold: true }),
  ] }),
  small(SUBTITLE, { italics: true, color: '595959' }, { before: 60 }),
  small('First Edition, 2026', { color: '2F2F2F' }, { before: 360 }),
  small(`© 2024–2026 ${AUTHOR}. All rights reserved.`, { color: '2F2F2F' }, { before: 240 }),
  small('No part of this publication may be reproduced, stored in a retrieval system, or transmitted in any form or by any means — electronic, mechanical, photocopying, recording, or otherwise — without the prior written permission of the copyright holder, except for brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.', {}, { before: 240 }),
  small("Portions of this book are adapted from the author's research preprints (2024). The accompanying source code is released under an open-source license; see the companion repository for terms.", {}, { before: 200 }),
  small('SAP is a trademark or registered trademark of SAP SE or its affiliates in Germany and other countries. All other trademarks are the property of their respective owners. This book is independent and is not affiliated with, sponsored by, or endorsed by SAP SE.', {}, { before: 200 }),
  small('All datasets in this book are synthetic. Company, supplier, customer, and product names are invented. Financial rules in Part VIII are a demonstration policy, not approved accounting logic.', {}, { before: 200 }),
  ...(ISBN ? [small(`ISBN ${ISBN} (paperback)`, { color: '2F2F2F' }, { before: 240 })] : []),
  small('The information in this book is distributed on an "as is" basis, without warranty. While every precaution has been taken in its preparation, the author shall have no liability for any loss or damage caused, or alleged to be caused, directly or indirectly by the instructions or code it contains.', { size: 16, italics: true, color: '707070' }, { before: 320 }),
];

// "About This Book" (listed on the contents page; the trade build's version
// ends with a copyright line, which the copyright page already covers).
const aboutBook = V0.about;

// ---------------------------------------------------------------------------
// Headers and footers
// ---------------------------------------------------------------------------
const emptyHeader = () => new Header({ children: [new Paragraph({ children: [] })] });
const emptyFooter = () => new Footer({ children: [new Paragraph({ children: [] })] });
const runningHeader = () => new Header({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: TITLE, font: FONT, size: 16, italics: true, color: '707070' })],
})] });
const folioFooter = () => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 17, color: '505050' })],
})] });

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
const tocBlock = buildToc();
const sections = [
  {
    properties: { page: { ...KDP_PAGE, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } }, titlePage: true },
    headers: { default: emptyHeader(), first: emptyHeader() },
    footers: { default: emptyFooter(), first: emptyFooter() },
    children: [...titlePage, ...copyrightPage],
  },
  {
    properties: { page: { ...KDP_PAGE, pageNumbers: { start: 3, formatType: NumberFormat.LOWER_ROMAN } } },
    headers: { default: emptyHeader() },
    footers: { default: folioFooter() },
    children: [...tocBlock, ...aboutBook, ...V0.preface],
  },
  ...PARTS.map((part, i) => ({
    properties: {
      page: { ...KDP_PAGE, ...(i === 0 ? { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } : {}) },
      titlePage: true,
    },
    headers: { default: runningHeader(), first: emptyHeader() },
    footers: { default: folioFooter(), first: emptyFooter() },
    children: [...part.divider, ...part.chapters.flatMap(([m, name]) => MODULES[m][name])],
  })),
];

const doc = new Document({
  creator: AUTHOR,
  title: TITLE,
  subject: SUBTITLE,
  description: 'KDP paperback interior (6x9)',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 38, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: '595959' },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 } },
      { id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, italics: true, font: FONT, color: '595959' },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 3 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 280 } } } },
      ] },
      { reference: 'numbers', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 320 } } } },
      ] },
    ],
  },
  sections,
});

Packer.toBuffer(doc).then((buffer) => {
  const out = process.argv[2] || path.join(HERE, '..', 'kdp', 'Computational_Intelligence_KDP_Interior.docx');
  fs.writeFileSync(out, buffer);
  fs.writeFileSync(TOC_ENTRIES_FILE, JSON.stringify(tocEntries, null, 1));
  const missing = tocEntries.filter((e) => !tocPages[e.key]).length;
  console.log(`Wrote ${out} (${buffer.length} bytes); contents entries: ${tocEntries.length}, without page numbers: ${missing}`);
}).catch((err) => { console.error('Failed:', err); process.exit(1); });
