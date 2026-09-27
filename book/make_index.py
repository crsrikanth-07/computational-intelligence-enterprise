#!/usr/bin/env python3
"""Build the back-of-book index from the typeset interior PDF.

Run after make_kdp.py has converged; it writes index_terms.json, and a second
make_kdp.py run typesets the index. Folios are arabic, counted from the Part I
divider. Each term lists up to six pages, those where it is used most often.
"""
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
PDF = HERE.parent / "kdp" / "Computational_Intelligence_KDP_Interior.pdf"
OUT = HERE / "index_terms.json"
TITLE = "Computational Intelligence for Enterprise Systems"
MAX_REFS = 6

TERMS = [
    ("Adaptive mutation rate", r"mutation rate"),
    ("AGOA (Adaptive Genetic Optimization Algorithm)", r"(?-i:\bAGOA\b)"),
    ("Archive MOSA", r"archive MOSA|Pareto archive"),
    ("Backorder cost", r"backorder"),
    ("Bessel functions", r"Bessel function"),
    ("Bessel-Fourier moments", r"Bessel-Fourier moment|full moments"),
    ("BLX-α crossover", r"BLX"),
    ("Break-even distance", r"break-even"),
    ("Confusion matrix", r"confusion matri"),
    ("Cooling schedule", r"cooling"),
    ("Coverage (evidence)", r"coverage"),
    ("Cross-pollination", r"cross-pollination"),
    ("Cross-validation", r"cross-validat"),
    ("Crossover", r"crossover"),
    ("Crowding distance", r"crowd"),
    ("Decision guide, MILP or metaheuristic", r"decision guide"),
    ("Demonstration policy", r"demonstration policy|demo policy"),
    ("Diversity, population", r"diversity"),
    ("Dominance, Pareto", r"dominat"),
    ("Economic order quantity (EOQ)", r"(?-i:\bEOQ\b)"),
    ("Elitism", r"elitis"),
    ("Emission factors", r"emission factor|GLEC"),
    ("Encoding, chromosome", r"encoding"),
    ("Equal evaluation budgets", r"equal budget|evaluation budget|same budget"),
    ("Exact Pareto front", r"exact (?:Pareto )?front"),
    ("Exhaustive enumeration", r"enumerat"),
    ("Fitness landscape", r"fitness landscape"),
    ("Genetic algorithm", r"genetic algorithm"),
    ("Golden catalogue", r"golden catalogue|golden case|golden test"),
    ("HiGHS solver", r"(?-i:HiGHS)"),
    ("Hold-out data", r"hold-out|held-out|held out"),
    ("Hybrid PSO-GA", r"hybrid PSO-GA"),
    ("Hypervolume", r"hypervolume"),
    ("Inertia weight", r"inertia"),
    ("Knee point", r"\bknee\b"),
    ("Lane merging, exact front", r"merging lanes|merged exactly|one lane at a time"),
    ("Margin bridge", r"\bbridge\b"),
    ("Margin Leak Finder", r"Margin Leak Finder"),
    ("Markov chain", r"Markov chain"),
    ("MILP (mixed-integer linear programming)", r"(?-i:\bMILP\b)"),
    ("Model Context Protocol (MCP)", r"Model Context Protocol|(?-i:\bMCP\b)"),
    ("Monte Carlo", r"Monte Carlo"),
    ("MOSA (multi-objective simulated annealing)", r"(?-i:\bMOSA\b)"),
    ("Mutation", r"mutation"),
    ("No Free Lunch theorem", r"No Free Lunch"),
    ("Normal loss function", r"loss function"),
    ("Optimality gap", r"optimality gap|\bgap\b"),
    ("Pareto front", r"Pareto front"),
    ("Particle swarm optimization (PSO)", r"particle swarm|(?-i:\bPSO\b)"),
    ("Penalty", r"penalt"),
    ("Premature convergence", r"premature convergence"),
    ("Price agreement", r"agreement"),
    ("Quantity discounts", r"quantity discount|price break"),
    ("Radial profile", r"radial profile"),
    ("Reorder point", r"reorder point"),
    ("Reproducibility", r"reproducib"),
    ("Rotation invariance", r"rotation[- ]invarian"),
    ("RunReport", r"RunReport"),
    ("Safety stock", r"safety stock"),
    ("Severity", r"severity"),
    ("Simulated annealing", r"simulated annealing"),
    ("Single sourcing", r"single-sourc|single sourc"),
    ("Stagnation", r"stagnation"),
    ("Supported points", r"supported point"),
    ("Threshold calibration", r"calibrat"),
    ("Tournament selection", r"tournament"),
    ("Value Lens", r"Value Lens"),
    ("Velocity clamping", r"clamp"),
    ("Visual inspection", r"visual inspection"),
    ("Weight sweep", r"weight sweep|weight-sweep"),
    ("Weighted sum", r"weighted sum|weighted-sum"),
    ("Wilson score interval", r"Wilson"),
]


def squash(s):
    return re.sub(r"\s+", "", s)


def ranges(pages):
    out, run = [], [pages[0]]
    for p in pages[1:]:
        if p == run[-1] + 1:
            run.append(p)
        else:
            out.append(run); run = [p]
    out.append(run)
    return ", ".join(str(r[0]) if len(r) == 1 else f"{r[0]}–{r[-1]}" for r in out)


def main():
    raw = subprocess.run(["pdftotext", "-layout", str(PDF), "-"], capture_output=True,
                         text=True, check=True).stdout.split("\f")
    flat = [squash(p) for p in raw]
    start = next(i for i, p in enumerate(flat) if i > 4 and "PARTIFoundations" in p)
    def line_page(text, lo, reverse=False):
        rng = range(len(raw) - 1, lo, -1) if reverse else range(lo, len(raw))
        return next(i for i in rng if any(l.strip() == text for l in raw[i].splitlines()))
    end = line_page("Index", start, reverse=True)
    refs_lo = next(i for i in range(start, end) if "AppendixC—References" in flat[i][:200])
    refs_hi = next(i for i in range(refs_lo, end) if "AppendixD—Worked" in flat[i][:200])
    text = {}
    for i in range(start, end):
        if refs_lo <= i < refs_hi:
            continue
        lines = [l for l in raw[i].splitlines()
                 if l.strip() and l.strip() != TITLE and not l.strip().isdigit()]
        text[i - start + 1] = " ".join(" ".join(lines).split())
    entries = []
    for term, pat in TERMS:
        rx = re.compile(pat, re.I)
        counts = {f: len(rx.findall(t)) for f, t in text.items()}
        hits = sorted((f for f, c in counts.items() if c), key=lambda f: (-counts[f], f))[:MAX_REFS]
        if hits:
            entries.append({"term": term, "pages": ranges(sorted(hits))})
    entries.sort(key=lambda e: e["term"].lower())
    OUT.write_text(json.dumps(entries, indent=1, ensure_ascii=False))
    print(f"index: {len(entries)} terms over folios 1-{end - start}; references pages skipped")


if __name__ == "__main__":
    main()
