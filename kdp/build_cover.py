#!/usr/bin/env python3
"""Build the KDP paperback cover (full wrap) and the ebook cover.

The spine width follows KDP's formula for black-and-white interiors on white
paper (page count x 0.002252 in); the page count is read from the interior PDF.
Outputs: cover_wrap_KDP.pdf (upload this), cover_wrap_full_300dpi.jpg (preview)
and cover_front_ebook.jpg (1600 x 2400, Kindle).
Requires reportlab, Pillow and poppler-utils (pdfinfo, pdftoppm).
"""
import math
import random
import re
import subprocess
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Frame, Paragraph

HERE = Path(__file__).resolve().parent
INTERIOR = HERE / "Computational_Intelligence_KDP_Interior.pdf"
OUT_PDF = HERE / "cover_wrap_KDP.pdf"
TITLE = "Computational Intelligence for Enterprise Systems"
AUTHOR = "Srikanth Cherukupalli"

NAVY, LIGHT, MID, AMBER = HexColor("#14304F"), HexColor("#A9CBEA"), HexColor("#3A78B0"), HexColor("#F2A541")
TRIM_W, TRIM_H, BLEED = 6.0, 9.0, 0.125
SAFE = 0.5

def register_fonts():
    dirs = [Path("/usr/share/fonts/truetype/crosextra"), HERE / "fonts"]
    names = {"Body": "Carlito-Regular.ttf", "Body-Bold": "Carlito-Bold.ttf",
             "Body-Italic": "Carlito-Italic.ttf", "Body-BoldItalic": "Carlito-BoldItalic.ttf"}
    for name, file in names.items():
        path = next((d / file for d in dirs if (d / file).exists()), None)
        if path is None:
            raise SystemExit(f"font {file} not found (install fonts-crosextra-carlito)")
        pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-Bold",
                                  italic="Body-Italic", boldItalic="Body-BoldItalic")

def page_count():
    info = subprocess.run(["pdfinfo", str(INTERIOR)], capture_output=True, text=True, check=True).stdout
    return int(re.search(r"Pages:\s+(\d+)", info).group(1))

def fit_size(text, font, size, max_w):
    w = pdfmetrics.stringWidth(text, font, size)
    return size if w <= max_w else size * max_w / w

def spaced(c, x, y, text, font, size, spacing, color):
    """Draw centred text with extra letter spacing."""
    widths = [pdfmetrics.stringWidth(ch, font, size) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    cx = x - total / 2
    c.setFont(font, size); c.setFillColor(color)
    for ch, w in zip(text, widths):
        c.drawString(cx, y, ch); cx += w + spacing

def artwork(c, x0, w):
    """A network of nodes and a Pareto front of trade-off points."""
    rnd = random.Random(2026)
    nodes = [((x0 + rnd.uniform(0.6, w - 0.6)) * inch, rnd.uniform(1.55, 4.3) * inch) for _ in range(26)]
    c.setStrokeColor(MID); c.setLineWidth(0.6)
    for i, (xa, ya) in enumerate(nodes):
        near = sorted(nodes, key=lambda p: (p[0] - xa) ** 2 + (p[1] - ya) ** 2)[1:3]
        for xb, yb in near:
            c.line(xa, ya, xb, yb)
    c.setFillColor(LIGHT)
    for xa, ya in nodes:
        c.circle(xa, ya, 2.2, stroke=0, fill=1)
    c.setFillColor(AMBER)
    for k in range(14):
        t = k / 13
        px = (x0 + 0.9 + 4.2 * t) * inch
        py = (1.75 + 2.3 * (1 - t) ** 2.2) * inch
        c.circle(px, py, 3.4, stroke=0, fill=1)

def main():
    register_fonts()
    pages = page_count()
    spine = pages * 0.002252
    W, H = 2 * TRIM_W + spine + 2 * BLEED, TRIM_H + 2 * BLEED
    c = canvas.Canvas(str(OUT_PDF), pagesize=(W * inch, H * inch), initialFontName="Body")
    c.setTitle(TITLE + " — cover"); c.setAuthor(AUTHOR)
    c.setFillColor(NAVY); c.rect(0, 0, W * inch, H * inch, stroke=0, fill=1)

    # ---------------------------------------------------------------- front
    fx = BLEED + TRIM_W + spine            # front trim left edge (in)
    cx = (fx + TRIM_W / 2) * inch
    usable = (TRIM_W - 2 * SAFE) * inch
    artwork(c, fx, TRIM_W)
    top = (BLEED + TRIM_H) * inch
    s = fit_size("COMPUTATIONAL", "Body-Bold", 40, usable - 30)
    spaced(c, cx, top - 1.55 * inch, "COMPUTATIONAL", "Body-Bold", s, 2.5, white)
    spaced(c, cx, top - 2.15 * inch, "INTELLIGENCE", "Body-Bold", s, 2.5, white)
    c.setFillColor(LIGHT); c.setFont("Body-Italic", 25)
    c.drawCentredString(cx, top - 2.7 * inch, "for Enterprise Systems")
    c.setStrokeColor(AMBER); c.setLineWidth(2)
    c.line(cx - 1.2 * inch, top - 3.0 * inch, cx + 1.2 * inch, top - 3.0 * inch)
    c.setFillColor(white); c.setFont("Body", 13.5)
    c.drawCentredString(cx, top - 3.4 * inch, "Advanced Optimization Algorithms with Working Prototypes")
    c.setFillColor(LIGHT); c.setFont("Body", 10.5)
    c.drawCentredString(cx, top - 3.75 * inch,
                        "Genetic algorithms  ·  Simulated annealing  ·  Particle swarms  ·  Bessel-Fourier features")
    c.setFillColor(white); c.setFont("Body-Bold", 19)
    spaced(c, cx, (BLEED + 0.85) * inch, AUTHOR.upper(), "Body-Bold", 17, 1.5, white)

    # ----------------------------------------------------------------- spine
    if pages >= 100:
        c.saveState()
        c.translate((BLEED + TRIM_W + spine / 2) * inch, (H / 2) * inch)
        c.rotate(-90)
        c.setFillColor(white); c.setFont("Body-Bold", 9)
        c.drawCentredString(-0.35 * inch, -3, TITLE)
        c.setFillColor(AMBER); c.setFont("Body", 9)
        c.drawCentredString(3.25 * inch, -3, AUTHOR)
        c.restoreState()

    # ------------------------------------------------------------------ back
    bx = BLEED + SAFE + 0.1
    head = ParagraphStyle("h", fontName="Body-Bold", fontSize=15.5, leading=19, textColor=AMBER, spaceAfter=10)
    body = ParagraphStyle("b", fontName="Body", fontSize=10.3, leading=13.6, textColor=white, spaceAfter=7)
    sub = ParagraphStyle("s", parent=body, fontName="Body-Bold", textColor=AMBER, spaceBefore=3, spaceAfter=4)
    bul = ParagraphStyle("u", parent=body, leftIndent=11, bulletIndent=0, spaceAfter=3, bulletFontName="Body")
    story = [
        Paragraph("When the textbook solver runs out of road — and when it doesn't.", head),
        Paragraph("Real supply chains break the assumptions of classical optimization: costs jump at price "
                  "breaks, objectives pull against each other, and the fitness function is often a simulation. "
                  "This book is a practitioner's guide to five computational-intelligence methods for those "
                  "problems, each with working Python code, CSV datasets, a case study and a production blueprint.", body),
        Paragraph("What sets it apart is honesty. Every result is measured against an exact answer or a proven "
                  "bound — exhaustive enumeration, a MILP solver, an exact Pareto front. You will see where the "
                  "metaheuristic wins, and where a free solver beats it.", body),
        Paragraph("Inside", sub),
    ]
    for item in [
        "An adaptive genetic algorithm for supply-network design, benchmarked against enumeration and MILP",
        "Multi-objective simulated annealing that puts a price on every tonne of carbon avoided",
        "PSO and a hybrid PSO-GA for (Q, r) inventory with quantity discounts, compared at equal budgets",
        "Bessel-Fourier descriptors for visual inspection, tuned with PSO",
        "A capstone, the Margin Leak Finder: deterministic margin-leak detection with calibrated thresholds",
        "8 parts, 20 chapters, 14 figures, 33 exercises and a reproducible benchmark suite",
    ]:
        story.append(Paragraph(item, bul, bulletText="•"))
    story += [
        Paragraph("Who it's for", sub),
        Paragraph("Supply-chain architects, data scientists, ML engineers and technical managers who are "
                  "comfortable with first-year calculus and intermediate Python.", body),
        Paragraph("<b>Srikanth Cherukupalli</b> is a Chief SAP Architect who leads enterprise supply-chain "
                  "and data-platform engagements, and has architected two SAP-certified products.", body),
    ]
    frame_bottom = BLEED + 1.75
    frame = Frame(bx * inch, frame_bottom * inch, (TRIM_W - 2 * SAFE - 0.2) * inch,
                  (TRIM_H - SAFE - 1.75 + 0.1) * inch, showBoundary=0, leftPadding=0, rightPadding=0)
    left = frame.addFromList(story, c)
    if story:
        raise SystemExit("back-cover text does not fit")
    c.setFillColor(LIGHT); c.setFont("Body", 9)
    c.drawString(bx * inch, (BLEED + 0.58) * inch, "COMPUTERS / Artificial Intelligence")
    # the lower-right 2.2 x 1.4 in of the back cover is left clear for KDP's barcode
    c.showPage(); c.save()

    subprocess.run(["pdftoppm", "-r", "300", "-jpeg", "-singlefile", str(OUT_PDF),
                    str(HERE / "cover_wrap_full_300dpi")], check=True)
    wrap = Image.open(HERE / "cover_wrap_full_300dpi.jpg")
    x0 = round(fx * 300); y0 = round(BLEED * 300)
    front = wrap.crop((x0, y0, x0 + round(TRIM_W * 300), y0 + round(TRIM_H * 300)))
    front.resize((1600, 2400), Image.LANCZOS).save(HERE / "cover_front_ebook.jpg", quality=92)
    print(f"interior pages {pages}; spine {spine:.4f} in; full cover {W:.4f} x {H:.4f} in")

if __name__ == "__main__":
    main()
