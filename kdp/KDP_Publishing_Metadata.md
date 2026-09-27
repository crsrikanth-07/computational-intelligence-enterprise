# Amazon KDP Publishing Metadata — v2 (September 2026)

Everything needed to fill in the KDP forms for the paperback and the Kindle ebook.
Figures that depend on KDP's current rates are marked *verify*; check them in KDP's calculators before publishing.

## 1. Book details

| Field | Value |
|---|---|
| Title | Computational Intelligence for Enterprise Systems |
| Subtitle | Advanced Optimization Algorithms with Working Prototypes |
| Author (primary) | Srikanth Cherukupalli |
| Edition | First Edition (2026) |
| Publisher / imprint | Leave blank (Amazon shows "Independently published") |
| Language | English |
| ISBN | Free KDP ISBN, or your own. To print it on the copyright page, rebuild with `ISBN=978-... npm run build` in `book/` |

## 2. Description (book page)

Real supply chains break the assumptions of classical optimization. Costs jump at price breaks, objectives pull against each other, and the fitness function is often a simulation rather than a formula. This book is a practitioner's guide to five computational-intelligence methods built for exactly those problems — each with working Python code, CSV datasets, a case study and a production blueprint.

What sets it apart is honesty. Every result is measured against an exact answer or a proven bound: exhaustive enumeration, a MILP solver, an exact Pareto front, a per-product optimum. You will see where the metaheuristic wins — and where a free solver beats it.

Inside you will find:
- An adaptive genetic algorithm (AGOA) for supply-network design, benchmarked against enumeration and MILP
- Multi-objective simulated annealing that turns "how green should we be?" into a priced menu of freight plans
- Particle swarm optimization and a hybrid PSO-GA for (Q, r) inventory with quantity discounts, compared at equal budgets
- Bessel-Fourier descriptors for rotation-invariant visual inspection, tuned with PSO
- A capstone, the Margin Leak Finder: deterministic margin-leakage detection with multi-objective threshold calibration
- A unified library, a reproducible benchmark suite, tests, and a deployment blueprint

8 parts, 20 chapters, 14 figures and 33 exercises. For supply-chain architects, data scientists, ML engineers and technical managers comfortable with first-year calculus and intermediate Python.

## 3. Keywords (7 slots)

1. metaheuristics supply chain optimization
2. genetic algorithm python
3. particle swarm optimization inventory
4. multi-objective simulated annealing pareto
5. SAP supply chain architecture
6. carbon aware logistics optimization
7. operations research machine learning python

## 4. Categories (choose up to three in KDP's category picker)

- Computers & Technology › Artificial Intelligence / Machine Learning
- Business & Money › Production & Operations (supply chain management)
- Science & Math › Mathematics › Applied (optimization)

## 5. Paperback interior

| Item | Value |
|---|---|
| File | `Computational_Intelligence_KDP_Interior.pdf` |
| Trim | 6 × 9 in, no bleed |
| Ink and paper | Black & white interior, white paper |
| Pages | 143 |
| Fonts | All embedded (checked by the build) |
| Margins | 0.75 in inside (gutter), 0.5 in outside, 0.75 in top and bottom, mirrored |

## 6. Paperback cover

| Item | Value |
|---|---|
| File | `cover_wrap_KDP.pdf` (all fonts embedded) |
| Full size | 12.572 × 9.250 in, including 0.125 in bleed on all sides |
| Spine | 0.322 in (143 pages × 0.002252 in, white paper); spine text included (KDP allows it above 79 pages) |
| Barcode | Lower right of the back cover is left clear; let KDP add the barcode |

If the page count changes, rebuild the interior first and then run `python kdp/build_cover.py`, which reads the page count from the PDF.

## 7. Kindle ebook

- Cover: `cover_front_ebook.jpg` (1,600 × 2,400 px).
- Manuscript: KDP accepts the DOCX, but tables, code blocks and figures need checking in Kindle Previewer; consider a print replica or fixed-layout edition.

## 8. Pricing (*verify*)

- Paperback: KDP's US printing cost for a black-and-white paperback of 110–828 pages is $1.00 + $0.012 per page, about **$2.72** for 143 pages. The royalty is 60% of list price minus printing: at $34.99 about $18.28; at $29.99 about $15.28.
- Ebook: the 70% royalty applies only to list prices from $2.99 to $9.99 (less a delivery fee per MB). At $19.99 the royalty is 35%, about $7.00 — roughly the same as $9.99 at 70%. Pick the price for positioning, not royalty.

## 9. Distribution and rights

- **KDP Select** (ebook only) requires digital exclusivity: while enrolled, the ebook — including a free PDF of the interior — must not be available anywhere else, GitHub included. The paperback is unaffected. The repository's `.gitignore` keeps the built book files out of Git.
- **Capstone material (Part VIII):** the Margin Leak Finder chapters describe your Value Lens design. Before publishing, confirm that you hold the rights to it and that it contains no employer or client confidential information.
- **Trademarks:** the copyright page carries an SAP trademark notice and states that the book is independent of SAP SE.

## 10. AI-content disclosure

KDP asks whether a book's text, images or translations were generated by AI tools, and requires disclosure even when you edited the output substantially. Much of this edition's text, code and figures was drafted with an AI assistant, so answer **Yes** for text, and describe the extent. The cover and figures are drawn by code rather than by an image generator; if you are unsure how KDP classifies that, disclose it as well. AI-assisted editing of your own writing does not need disclosure.

## 11. Author Central bio

Srikanth Cherukupalli is a Chief SAP Architect who leads enterprise supply-chain and data-platform engagements for Fortune 500 clients, and he has architected two SAP-certified products. His work combines classical operations research with modern computational methods and has produced a series of research preprints — on adaptive genetic optimization, multi-objective simulated annealing, particle swarm optimization for inventory, hybrid PSO-GA algorithms and Bessel-Fourier descriptors — that form the basis of this book. He has deep experience in SAP supply-chain architecture and has deployed production optimization systems across retail, manufacturing, healthcare and logistics. He is based in Rhode Island, USA.

## 12. Before you press Publish

1. Read the whole interior PDF once; you are the author of record.
2. Decide on the ISBN and rebuild if you want it printed.
3. Order a printed proof copy and check the spine alignment and the figures in print.
4. Answer the AI-content questions (section 10) and confirm the capstone rights (section 9).
5. Push the updated repository (see `GITHUB_PUSH_GUIDE.md`) so the book's repository link shows the v2 code.
