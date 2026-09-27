// helpers.js — shared builders for the tech book
const {
  Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, PageBreak,
  LevelFormat, Bookmark, InternalHyperlink,
} = require('docx');

const FONT = "Calibri";
const MONO = "Consolas";
const ACCENT = "1F4E79";     // deep blue
const SUBTLE = "595959";     // dark gray
const CODE_BG = "F2F2F2";
const FORMULA_BG = "FAFBFE";

// Content width (DXA). For KDP 6x9 with 0.75"/0.5" margins the content area is
// 4.75" = 6840 DXA. For the letter-size trade edition it is 6.5" = 9360 DXA.
// Builders (Formula, CodeBlock, Callout, SimpleTable) clamp to this width so
// nothing overflows into the outside/gutter margin on KDP uploads.
const CONTENT_WIDTH = process.env.KDP_BUILD === '1' ? 6840 : 9360;

// Scale an array of column widths down so that their sum does not exceed
// CONTENT_WIDTH. Up-scaling is never performed — narrow tables stay narrow.
const fitWidths = (widths) => {
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum <= CONTENT_WIDTH) return widths;
  const scale = CONTENT_WIDTH / sum;
  const scaled = widths.map(w => Math.max(1, Math.floor(w * scale)));
  // repair rounding drift so the final sum exactly matches CONTENT_WIDTH
  const drift = CONTENT_WIDTH - scaled.reduce((a, b) => a + b, 0);
  if (drift !== 0) scaled[scaled.length - 1] += drift;
  return scaled;
};

// ---- Paragraph helpers -----------------------------------------------------

const P = (text, opts = {}) => new Paragraph({
  spacing: { before: opts.before || 0, after: opts.after || 120, line: 320 },
  alignment: opts.align || AlignmentType.JUSTIFIED,
  children: [new TextRun({ text, font: FONT, size: opts.size || 22, bold: !!opts.bold, italics: !!opts.italic, color: opts.color })],
});

// rich paragraph built from an array of { text, bold?, italic?, mono? }
const PRich = (runs, opts = {}) => new Paragraph({
  spacing: { before: opts.before || 0, after: opts.after || 120, line: 320 },
  alignment: opts.align || AlignmentType.JUSTIFIED,
  children: runs.map(r => new TextRun({
    text: r.text,
    font: r.mono ? MONO : FONT,
    size: r.size || 22,
    bold: !!r.bold,
    italics: !!r.italic,
    color: r.color,
  })),
});

const H1 = (text, bookmark) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  keepNext: true,
  keepLines: true,
  pageBreakBefore: true,
  spacing: { before: 240, after: 200 },
  children: bookmark
    ? [new Bookmark({ id: bookmark, children: [new TextRun({ text, font: FONT, size: 44, bold: true, color: ACCENT })] })]
    : [new TextRun({ text, font: FONT, size: 44, bold: true, color: ACCENT })],
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  keepNext: true,
  keepLines: true,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: ACCENT })],
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  keepNext: true,
  keepLines: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: SUBTLE })],
});

const H4 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_4,
  keepNext: true,
  keepLines: true,
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text, font: FONT, size: 22, bold: true, italics: true, color: SUBTLE })],
});

// ---- Formula block (centered, italic-serif look, pale blue tint) ----------

const Formula = (line, opts = {}) => {
  const lines = Array.isArray(line) ? line : [line];
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D9E2F3" };
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: border, bottom: border, left: border, right: border },
        shading: { fill: FORMULA_BG, type: ShadingType.CLEAR },
        margins: { top: 140, bottom: 140, left: 240, right: 240 },
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        children: lines.map((ln, i) => new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: i === lines.length - 1 ? 0 : 60, line: 320 },
          children: [new TextRun({
            text: ln,
            font: "Cambria Math",
            size: 24,
            italics: true,
            color: "203864",
          })],
        })),
      })],
    })],
  });
};

// ---- Code block (monospace, gray background) -------------------------------

const CodeBlock = (code) => {
  const lines = code.split('\n');
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D0D7DE" };
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: border, bottom: border, left: border, right: border },
        shading: { fill: CODE_BG, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        children: lines.map(ln => new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 0, line: 260 },
          children: [new TextRun({
            text: ln.length ? ln : " ",
            font: MONO,
            size: 17,
            color: "1F2328",
          })],
        })),
      })],
    })],
  });
};

// ---- Callout / note box ----------------------------------------------------

const Callout = (title, body, color = "E3F2FD") => {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "90CAF9" };
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: border, bottom: border, left: border, right: border },
        shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [new TextRun({ text: title, font: FONT, size: 22, bold: true, color: "0D47A1" })],
          }),
          ...body.split('\n').map(b => new Paragraph({
            spacing: { before: 0, after: 40, line: 300 },
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: b, font: FONT, size: 21 })],
          })),
        ],
      })],
    })],
  });
};

// ---- Bullet / numbered list -----------------------------------------------

const Bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  spacing: { before: 0, after: 60, line: 300 },
  children: [new TextRun({ text, font: FONT, size: 22 })],
});

// Each run of consecutive Numbered() items forms its own list, restarting at 1.
// Any other helper call ends the current run (see the wrappers in module.exports).
let listInstance = 0;
let inList = false;
const Numbered = (text, level = 0) => {
  if (!inList) { listInstance += 1; inList = true; }
  return NumberedItem(text, level, listInstance);
};
const NumberedItem = (text, level, instance) => new Paragraph({
  numbering: { reference: "numbers", level, instance },
  spacing: { before: 0, after: 60, line: 300 },
  children: [new TextRun({ text, font: FONT, size: 22 })],
});

// ---- Simple two-column table ----------------------------------------------

const SimpleTable = (headers, rows, colWidths) => {
  const raw = colWidths || headers.map(() => Math.floor(CONTENT_WIDTH / headers.length));
  const widths = fitWidths(raw);
  const border = { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const headerCells = headers.map((h, i) => new TableCell({
    borders,
    shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text: h, font: FONT, size: 20, bold: true, color: ACCENT })],
    })],
  }));
  const bodyRows = rows.map(r => new TableRow({
    children: r.map((c, i) => new TableCell({
      borders,
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 70, bottom: 70, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: String(c), font: FONT, size: 20 })],
      })],
    })),
  }));
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [new TableRow({ tableHeader: true, children: headerCells }), ...bodyRows],
  });
};

// ---- Blank line -----------------------------------------------------------
const Blank = () => new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "" })] });

const HR = () => new Paragraph({
  spacing: { before: 120, after: 180 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
  children: [new TextRun({ text: "" })],
});

const endsList = (fn) => (...args) => { inList = false; return fn(...args); };

module.exports = {
  FONT, MONO, ACCENT, SUBTLE,
  P: endsList(P), PRich: endsList(PRich),
  H1: endsList(H1), H2: endsList(H2), H3: endsList(H3), H4: endsList(H4),
  Formula: endsList(Formula), CodeBlock: endsList(CodeBlock), Callout: endsList(Callout),
  Bullet: endsList(Bullet), Numbered, SimpleTable: endsList(SimpleTable),
  Blank: endsList(Blank), HR: endsList(HR),
  endList: () => { inList = false; },
};


// ---- v2 additions: contents tagging and figures ------------------------------
const __docx = require('docx');
const __fs = require('fs');
const __path = require('path');
const __tag = (fn, level) => (...args) => {
  const p = fn(...args);
  const target = Array.isArray(p) ? p[0] : p;
  target.__toc = { level, text: String(args[0]).replace(/\s+/g, ' ') };
  return p;
};
module.exports.H1 = __tag(module.exports.H1, 'H1');
module.exports.H2 = __tag(module.exports.H2, 'H2');
module.exports.Figure = (file, caption, maxWidthIn = 4.6) => {
  inList = false;
  const buf = __fs.readFileSync(__path.join(__dirname, 'figures', file));
  const wpx = buf.readUInt32BE(16), hpx = buf.readUInt32BE(20);
  const widthIn = Math.min(maxWidthIn, wpx / 300);
  const w = Math.round(widthIn * 96), h = Math.round(w * hpx / wpx);
  return [
    new __docx.Paragraph({ alignment: __docx.AlignmentType.CENTER, keepNext: true, keepLines: true,
      spacing: { before: 160, after: 60 },
      children: [new __docx.ImageRun({ type: 'png', data: buf, transformation: { width: w, height: h } })] }),
    new __docx.Paragraph({ alignment: __docx.AlignmentType.CENTER, spacing: { before: 0, after: 220 },
      indent: { left: 300, right: 300 },
      children: [new __docx.TextRun({ text: caption, font: FONT, size: 18, italics: true, color: '404040' })] }),
  ];
};

// ---- v2: SimpleTable that never breaks words mid-column ----------------------
// Estimates the longest word in each column and steps the font size and cell
// padding down (10 -> 9 -> 8 pt) until every word fits; warns if one still won't.
module.exports.SimpleTable = (headers, rows, colWidths) => {
  inList = false;
  const X = __docx;
  const raw = colWidths || headers.map(() => Math.floor(CONTENT_WIDTH / headers.length));
  const widths = fitWidths(raw);
  const words = (c) => String(c === undefined || c === null ? '' : c).split(/\s+/);
  const longest = (i) => Math.max(0, ...[headers[i], ...rows.map((r) => r[i])].flatMap(words).map((w) => w.length));
  const fits = (size, pad) => widths.every((w, i) => longest(i) * (size / 2) * 0.56 <= (w - 2 * pad) / 20);
  let size = 20, pad = 120;
  if (!fits(size, pad)) { size = 18; pad = 80; }
  if (!fits(size, pad)) { size = 16; pad = 60; }
  if (!fits(size, pad)) console.warn('[table] words may break: ' + headers.join(' | '));
  const border = { style: X.BorderStyle.SINGLE, size: 6, color: 'BFBFBF' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text, i, head) => new X.TableCell({
    borders, width: { size: widths[i], type: X.WidthType.DXA },
    margins: { top: head ? 80 : 60, bottom: head ? 80 : 60, left: pad, right: pad },
    ...(head ? { shading: { fill: 'D9E2F3', type: X.ShadingType.CLEAR } } : {}),
    children: [new X.Paragraph({ children: [new X.TextRun({ text: String(text), font: FONT, size,
      bold: head, color: head ? ACCENT : undefined })] })],
  });
  return new X.Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: X.WidthType.DXA },
    columnWidths: widths,
    rows: [new X.TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r) => new X.TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))],
  });
};
