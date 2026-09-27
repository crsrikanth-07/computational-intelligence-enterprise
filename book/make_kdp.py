#!/usr/bin/env python3
"""
Build the KDP paperback interior (DOCX + print-ready PDF).

    python book/make_kdp.py                 # from the repository root
    ISBN=978-... python book/make_kdp.py    # also print the ISBN on the copyright page

Steps
  1. node build_book_kdp.js  -> DOCX (contents-page numbers from toc_pages.json)
  2. switch on mirrored margins (w:mirrorMargins) so the 0.75" gutter is always
     on the spine side — the docx library cannot set this itself
  3. LibreOffice -> PDF
  4. locate every heading in the PDF, work out its printed page number
     (roman in the front matter, arabic from Part I), write toc_pages.json,
     and rebuild until the contents page matches the body exactly
  5. print checks: trim size, embedded fonts, mirrored margins, blank pages

Requires: node + the `docx` package, LibreOffice (soffice), poppler-utils.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
KDP = HERE.parent / "kdp"
DOCX = KDP / "Computational_Intelligence_KDP_Interior.docx"
PDF = KDP / "Computational_Intelligence_KDP_Interior.pdf"
PAGES_FILE = HERE / "toc_pages.json"
ENTRIES_FILE = HERE / "toc_entries.json"
ABOUT_MARKER = "This book is a practitioner"


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def build_docx() -> None:
    print(run(["node", str(HERE / "build_book_kdp.js"), str(DOCX)]).strip())
    tmp = DOCX.with_suffix(".tmp")
    with zipfile.ZipFile(DOCX) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "word/settings.xml":
                s = data.decode("utf-8")
                if "<w:mirrorMargins/>" not in s:
                    # schema order: mirrorMargins follows displayBackgroundShape
                    anchor = "<w:displayBackgroundShape/>"
                    s = s.replace(anchor, anchor + "<w:mirrorMargins/>", 1) if anchor in s else \
                        re.sub(r"(<w:settings[^>]*>)", r"\1<w:mirrorMargins/>", s, count=1)
                data = s.encode("utf-8")
            zout.writestr(item, data)
    tmp.replace(DOCX)


def build_pdf() -> list[str]:
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(KDP), str(DOCX)],
                   check=True, capture_output=True, timeout=600)
    pages = run(["pdftotext", "-layout", str(PDF), "-"]).split("\f")
    return pages[:-1] if pages and not pages[-1].strip() else pages


def squash(s: str) -> str:
    return re.sub(r"\s+", "", s)


def roman(n: int) -> str:
    out = ""
    for v, r in [(1000, "m"), (900, "cm"), (500, "d"), (400, "cd"), (100, "c"), (90, "xc"),
                 (50, "l"), (40, "xl"), (10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i")]:
        while n >= v:
            out += r
            n -= v
    return out


def locate(pages: list[str]) -> dict[str, str]:
    """Printed page number of every contents entry, found in document order."""
    entries = json.loads(ENTRIES_FILE.read_text())
    flat = [squash(p) for p in pages]
    about = next(i for i, p in enumerate(flat) if squash(ABOUT_MARKER) in p)
    cursor, found = about, {}
    for e in entries:
        target = squash(e["match"])
        hit = next((i for i in range(cursor, len(flat)) if target in flat[i]), None)
        if hit is None:
            sys.exit(f"Contents entry not found in PDF: {e['match']!r}")
        found[e["key"]] = hit
        cursor = hit
    main_start = found["part:PART I"]           # arabic 1 = Part I divider
    return {k: (roman(i + 1) if i < main_start else str(i - main_start + 1)) for k, i in found.items()}


def checks(pages: list[str]) -> None:
    info = run(["pdfinfo", "-f", "1", "-l", str(len(pages)), str(PDF)])
    sizes = set(re.findall(r"size:\s+([\d.]+ x [\d.]+) pts", info))
    fonts = run(["pdffonts", str(PDF)]).splitlines()[2:]
    not_embedded = [f.split()[0] for f in fonts if len(f.split()) > 4 and f.split()[-5] != "yes"]
    xmins = []
    for p in (13, 14, 15, 16):
        box = run(["pdftotext", "-f", str(p), "-l", str(p), "-bbox", str(PDF), "-"])
        xs = [float(x) for x in re.findall(r'xMin="([\d.]+)"', box)]
        xmins.append(round(min(xs), 1) if xs else None)
    blank = [i + 1 for i, p in enumerate(pages) if not p.strip()]
    print(f"Pages: {len(pages)}   page sizes: {sizes}")
    print(f"Fonts not embedded: {not_embedded or 'none'}")
    print(f"Left text edge on pages 13-16 (mirrored margins alternate 54/36 pt): {xmins}")
    print(f"Completely blank pages: {blank or 'none'}")


def main() -> None:
    previous = json.loads(PAGES_FILE.read_text()) if PAGES_FILE.exists() else None
    for attempt in range(1, 6):
        build_docx()
        pages = build_pdf()
        current = locate(pages)
        if current == previous:
            print(f"Contents page verified against the body after {attempt} build(s): "
                  f"{len(current)} entries, {len(pages)} pages.")
            checks(pages)
            return
        PAGES_FILE.write_text(json.dumps(current, indent=1))
        previous = current
    sys.exit("Contents-page numbers did not stabilise after 5 builds")


if __name__ == "__main__":
    main()
