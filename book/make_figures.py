"""Generate every figure in the book from the code (python book/make_figures.py).
Grayscale-safe for black-and-white print. Needs poc/results/benchmarks.json."""
import json, sys, textwrap
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from poc.common import make_supply_network, make_inventory_dataset, load_transport_csv
from poc.common.utils import FREIGHT_MODES
from poc.agoa.agoa_scm import SupplyNetworkProblem, AGOAConfig, run_agoa, brute_force_optimum
from poc.pso.pso_inventory import InventoryProblem, _best_r, exact_optimum
from poc.bessel_bfd.bfd_classifier import make_synthetic_dataset
from poc.value_lens.margin_leak import golden_fixtures, run_analysis
from poc.value_lens import threshold_calibration as tc

OUT = Path(__file__).resolve().parent / "figures"; OUT.mkdir(exist_ok=True)
R = json.loads((Path(__file__).resolve().parent.parent / "poc/results/benchmarks.json").read_text())
plt.rcParams.update({"font.size": 7.5, "axes.titlesize": 8, "axes.labelsize": 7.5, "legend.fontsize": 6.5,
                     "xtick.labelsize": 7, "ytick.labelsize": 7, "lines.linewidth": 1.1, "axes.linewidth": 0.6,
                     "savefig.dpi": 300, "font.family": "DejaVu Sans"})
W = 4.6
def save(fig, name):
    fig.savefig(OUT / name, bbox_inches="tight", pad_inches=0.04, facecolor="white"); plt.close(fig)

def box(ax, x, y, w, h, text, fill="white", lw=0.8, style="round,pad=0.02", size=6.8, dashed=False):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle=style, fc=fill, ec="black", lw=lw,
                                ls="--" if dashed else "-"))
    ax.text(x, y, text, ha="center", va="center", fontsize=size, wrap=True)
def arrow(ax, x1, y1, x2, y2, label=None, dashed=False):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="-|>", lw=0.7, color="black",
                ls="--" if dashed else "-", shrinkA=0, shrinkB=0))
    if label: ax.text((x1 + x2) / 2 + 0.08, (y1 + y2) / 2, label, fontsize=6.5, style="italic", ha="left", va="center")

# 1.1 decision guide
fig, ax = plt.subplots(figsize=(W, 3.3)); ax.set_xlim(0, 10); ax.set_ylim(0, 7); ax.axis("off")
box(ax, 5, 6.3, 5.6, 0.8, "Are the objective and every constraint linear\n(or piecewise-linear)?", fill="#EEEEEE")
box(ax, 2.5, 4.5, 4.2, 0.85, "Can a MILP solver prove optimality\nwithin your time budget?", fill="#EEEEEE")
box(ax, 7.5, 4.5, 4.2, 0.85, "Black-box, simulation-based or\nstrongly multimodal objective?", fill="#EEEEEE")
box(ax, 1.25, 2.3, 2.35, 0.95, "MILP:\nproven optimum", size=6.2)
box(ax, 3.75, 2.3, 2.35, 0.95, "MILP with time limit;\nbound = yardstick", size=6.2)
box(ax, 6.25, 2.3, 2.35, 0.95, "Convex / NLP solver;\nmetaheuristic if stalled", size=6.2)
box(ax, 8.75, 2.3, 2.35, 0.95, "Metaheuristic:\nAGOA · MOSA · PSO", fill="#DDDDDD", lw=1.1, size=6.2)
arrow(ax, 3.6, 5.9, 2.9, 4.95, "yes"); arrow(ax, 6.4, 5.9, 7.1, 4.95, "no")
arrow(ax, 1.9, 4.07, 1.4, 2.8, "yes"); arrow(ax, 3.0, 4.07, 3.6, 2.8, "no")
arrow(ax, 7.0, 4.07, 6.4, 2.8, "no"); arrow(ax, 8.1, 4.07, 8.6, 2.8, "yes")
ax.text(5, 0.75, "In every branch: report results against an exact answer or a proven bound whenever one exists.",
        ha="center", fontsize=6.8, style="italic")
save(fig, "fig_1_1_decision_guide.png")

# 7.x network design
data = make_supply_network(5, 3, 6, seed=11); prob = SupplyNetworkProblem(data)
opt, chrom, _ = brute_force_optimum(prob); sup, dcp = prob.decode(chrom)
fig, ax = plt.subplots(figsize=(W, 2.7)); ax.set_xlim(-0.6, 2.8); ax.set_ylim(-0.5, 5.6); ax.axis("off")
ys = {"S": np.linspace(5, 0.5, 5), "P": np.array([4.2, 2.75, 1.3]), "D": np.linspace(5.2, 0.2, 6)}
load = np.bincount(dcp, weights=data["dc_demand"], minlength=3)
for p in range(3):
    order = np.flatnonzero(sup == p)[np.argsort(data["sp_cost"][np.flatnonzero(sup == p), p])]; rem = load[p]
    for s in order:
        q = min(rem, data["supplier_capacity"][s]); rem -= q
        if q > 0: ax.plot([0.25, 1.05], [ys["S"][s], ys["P"][p]], color="black", lw=0.4 + q / 250)
for d in range(6):
    ax.plot([1.35, 2.15], [ys["P"][dcp[d]], ys["D"][d]], color="black", lw=0.4 + data["dc_demand"][d] / 250)
for s in range(5): box(ax, 0.0, ys["S"][s], 0.5, 0.42, f"S{s+1}\n{data['supplier_capacity'][s]:.0f}", size=5.8)
for p in range(3):
    closed = load[p] == 0
    box(ax, 1.2, ys["P"][p], 0.34, 0.55, f"P{p+1}\n{data['plant_capacity'][p]:.0f}" + ("\nclosed" if closed else ""),
        fill="#F2F2F2" if closed else "#DDDDDD", dashed=closed, size=5.8)
for d in range(6): box(ax, 2.4, ys["D"][d], 0.5, 0.42, f"DC{d+1}\n{data['dc_demand'][d]:.0f}", size=5.8)
for x, t in [(0.0, "Suppliers\n(capacity)"), (1.2, "Plants\n(capacity)"), (2.4, "DCs\n(demand)")]:
    ax.text(x, 5.55, t, ha="center", va="bottom", fontsize=6.5, weight="bold")
save(fig, "fig_7_1_network_design.png")

# 7.x convergence + adaptation
a = R["agoa_small"]; opt_small = a["optimum"]
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(W, 1.9))
for (name, v), st in zip(a["variants"].items(), ["-", "--", ":"]):
    tr = np.array(v["traces"]); share = (tr <= opt_small + 1e-6).mean(axis=0) * 100
    ax1.plot(share, st, color="black", label=name.replace("GA fixed", "fixed"))
ax1.set_xlabel("Generation"); ax1.set_ylabel("Runs at proven optimum (%)"); ax1.set_ylim(0, 100)
ax1.legend(frameon=False, loc="center right", fontsize=5.6); ax1.set_title("(a) Reliability, 20 seeds")
r0 = run_agoa(prob, AGOAConfig(population_size=80, generations=150), seed=0)
ax2.plot(r0.extra["mutation_trace"], color="black", label="mutation rate")
ax2b = ax2.twinx(); ax2b.plot(r0.extra["diversity_trace"], color="gray", ls="--", label="diversity")
ax2.set_xlabel("Generation"); ax2.set_ylabel("Mutation rate"); ax2b.set_ylabel("Diversity (entropy)")
ax2.set_title("(b) Mutation (solid), diversity (dashed)"); fig.tight_layout()
save(fig, "fig_7_2_agoa_convergence.png")

# 8.x mode economics
m = FREIGHT_MODES; dist = np.linspace(0, 1600, 200)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(W, 1.8))
for i, st in zip(range(2), ["-", "--"]):
    ax1.plot(dist, dist * m["mode_cost_per_tkm"][i] + m["mode_handling_cost_per_t"][i], st, color="black", label=m["mode_names"][i])
    ax2.plot(dist, dist * m["mode_co2_kg_per_tkm"][i] + m["mode_handling_co2_kg_per_t"][i], st, color="black", label=m["mode_names"][i])
be_c = m["mode_handling_cost_per_t"][1] / (m["mode_cost_per_tkm"][0] - m["mode_cost_per_tkm"][1])
be_e = m["mode_handling_co2_kg_per_t"][1] / (m["mode_co2_kg_per_tkm"][0] - m["mode_co2_kg_per_tkm"][1])
for ax in (ax1, ax2):
    ax.axvspan(be_e, be_c, color="0.88", lw=0); ax.set_xlabel("Lane distance (km)"); ax.legend(frameon=False)
ax1.set_ylabel("Cost ($ per tonne)"); ax2.set_ylabel("CO$_2$ (kg per tonne)")
ax1.set_title(f"(a) Cost: rail cheaper beyond {be_c:.0f} km"); ax2.set_title(f"(b) CO$_2$: rail cleaner beyond {be_e:.0f} km")
fig.tight_layout(); save(fig, "fig_8_1_mode_economics.png")

# 9.x Pareto fronts (CSV network)
mo = R["mosa"]["csv"]; ex = np.array(mo["exact_front"]); ar = np.array(mo["archive MOSA"]["front_seed0"]); sw = np.array(mo["weight sweep"]["front_seed0"])
fig, ax = plt.subplots(figsize=(W, 2.4))
ax.step(ex[:, 0] / 1e3, ex[:, 1] / 1e3, where="post", color="0.6", lw=0.6)
ax.plot(ex[:, 0] / 1e3, ex[:, 1] / 1e3, ".", color="0.45", ms=3, label=f"exact front ({len(ex)} points)")
ax.plot(ar[:, 0] / 1e3, ar[:, 1] / 1e3, "o", mfc="none", mec="black", ms=4.2, mew=0.6, label=f"archive MOSA ({len(ar)})")
ax.plot(sw[:, 0] / 1e3, sw[:, 1] / 1e3, "s", color="black", ms=3.6, label=f"weight sweep ({len(sw)})")
z = (ex - ex.min(0)) / (ex.max(0) - ex.min(0)); kn = ex[np.argmin(np.hypot(z[:, 0], z[:, 1]))]
ax.plot(kn[0] / 1e3, kn[1] / 1e3, "*", color="black", ms=9, label="knee point")
ax.set_xlabel("Weekly freight cost ($ thousands)"); ax.set_ylabel("Weekly CO$_2$ (tonnes)"); ax.legend(frameon=False)
save(fig, "fig_9_1_pareto_front.png")

# 10.x discount cost curve
inv = InventoryProblem(make_inventory_dataset(8, seed=42), use_discounts=True); i = 0; n = inv.n_products
Qs = np.linspace(50, inv.breaks[i, 1] * 1.25, 900); cost = []
for Q in Qs:
    rate = inv.discount_rate(np.full(n, Q))[i]; r = _best_r(inv, i, Q, inv.h[i] * (1 - rate))
    cost.append(inv.product_costs(np.full(n, Q), np.full(n, r))[i] - inv.D[i] * inv.price[i])
cost = np.array(cost); _, xs = exact_optimum(inv)
fig, ax = plt.subplots(figsize=(W, 1.9))
ax.plot(Qs, cost / 1e3, color="black")
for b in inv.breaks[i]: ax.axvline(b, color="0.6", ls=":", lw=0.8)
ax.axvline(inv.eoq[i], color="0.4", ls="--", lw=0.8); ax.text(inv.eoq[i], ax.get_ylim()[1], " EOQ", va="top", fontsize=6.5)
ax.plot(xs[i], (inv.product_costs(xs[:n], xs[n:])[i] - inv.D[i] * inv.price[i]) / 1e3, "*", color="black", ms=8)
ax.set_xlabel("Order quantity Q (units), reorder point re-optimized for each Q")
ax.set_ylabel("Annual cost vs. list price ($k)"); save(fig, "fig_10_1_discount_curve.png")

# 13.x PSO vs hybrid at equal budgets
fig, axes = plt.subplots(1, 2, figsize=(W, 1.9))
for ax, (label, key) in zip(axes, [("(a) Base (Q, r) model", "base"), ("(b) With quantity discounts", "discounts")]):
    d = R["pso_vs_hybrid"][key]
    for name, st, per in [("PSO 30x200", ":", 30), ("PSO 60x200", "--", 60), ("Hybrid 30x200", "-", 60)]:
        tr = np.maximum(np.array(d[name]["trace_median"]), 0) + 1
        ax.plot(np.arange(len(tr)) * per + per, tr, st, color="black", label=name.replace("x", "×"))
    ax.set_yscale("log"); ax.set_xlabel("Fitness evaluations"); ax.set_title(label); ax.set_xlim(0, 12000)
axes[0].set_ylabel("Median excess ($/yr, +1)"); axes[1].legend(frameon=False); fig.tight_layout()
for _a in fig.axes: _a.set_xticks([0, 4000, 8000, 12000])
save(fig, "fig_13_1_pso_vs_hybrid.png")

# 14.x Bessel bases
from scipy.special import jn, jv, jn_zeros
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(W, 1.8)); r = np.linspace(0, 33, 300)
for k, st in zip(range(5), ["-", "--", "-.", ":", (0, (5, 1, 1, 1))]): ax1.plot(r, jn(k, 0.22 * r), ls=st, color="black", label=f"n={k}")
ax1.set_title(r"(a) Radial filter bank $J_n(0.22\,r)$"); ax1.set_xlabel("Radius (pixels)"); ax1.legend(frameon=False, ncol=2, fontsize=5.3, loc="upper right")
rr = np.linspace(0, 1, 300); lam = jn_zeros(1, 4)
for k, st in zip(range(4), ["-", "--", "-.", ":"]): ax2.plot(rr, jv(1, lam[k] * rr), ls=st, color="black", label=f"n={k+1}")
ax2.set_title(r"(b) Orthogonal basis $J_1(\lambda_n r)$"); ax2.set_xlabel("Normalized radius r"); ax2.legend(frameon=False, fontsize=5.3, loc="lower left")
fig.tight_layout(); save(fig, "fig_14_1_bessel_bases.png")

# 15.x shapes and confusion matrices
X, y, names = make_synthetic_dataset(n_per_class=4, size=48, seed=7)
fig, axes = plt.subplots(4, 4, figsize=(W * 0.62, W * 0.62))
for c in range(4):
    for j in range(4):
        ax = axes[c, j]; ax.imshow(X[y == c][j], cmap="gray_r", vmin=0, vmax=1); ax.set_xticks([]); ax.set_yticks([])
        if j == 0: ax.set_ylabel(names[c], fontsize=7)
fig.tight_layout(pad=0.2); save(fig, "fig_15_1_shapes.png")
fig, axes = plt.subplots(1, 2, figsize=(W, 2.0))
for ax, (title, key) in zip(axes, [("(a) Radial BFD, 80.0%", "radial BFD (14)"), ("(b) Bessel-Fourier moments, 97.5%", "Bessel-Fourier moments (30)")]):
    cm = np.array(R["bfd"][key]["confusion_seed7"]); ax.imshow(cm, cmap="Greys", vmin=0, vmax=25)
    for (a_, b_), v in np.ndenumerate(cm): ax.text(b_, a_, v, ha="center", va="center", color="white" if v > 12 else "black", fontsize=7)
    ax.set_xticks(range(4)); ax.set_xticklabels(names, fontsize=6.5); ax.set_yticks(range(4)); ax.set_yticklabels(names, fontsize=6.5)
    ax.set_xlabel("Predicted"); ax.set_title(title)
axes[0].set_ylabel("True"); fig.tight_layout(); save(fig, "fig_15_2_confusion.png")

# 17.x reference architecture
fig, ax = plt.subplots(figsize=(W, 2.6)); ax.set_xlim(0, 10); ax.set_ylim(0, 8); ax.axis("off")
layers = [("Client layer", "Planner review UI  ·  BI dashboards  ·  scheduled jobs"),
          ("Service layer", "API gateway  ·  POST /optimize/{algorithm}  ·  auth, validation, rate limits"),
          ("Algorithm layer", "poc library: AGOA · MOSA · PSO · Hybrid · BFD  →  RunReport"),
          ("Data layer", "ERP adapters (SAP, Oracle)  ·  run registry  ·  trace storage")]
for k, (name, desc) in enumerate(layers):
    yy = 7 - k * 1.9; box(ax, 5, yy, 9.4, 1.35, f"{name}\n{desc}", fill=["#FFFFFF", "#EEEEEE", "#DDDDDD", "#EEEEEE"][k], size=6.8)
    if k < 3: arrow(ax, 5, yy - 0.7, 5, yy - 1.2)
save(fig, "fig_17_1_architecture.png")

# 18.x trust architecture
fig, ax = plt.subplots(figsize=(W, 3.0)); ax.set_xlim(0, 10); ax.set_ylim(0, 9); ax.axis("off")
steps = ["SAP-like sources (synthetic)", "Mock SAP adapter", "Read-only MCP business tools", "Normalize & validate (BLOCK, never zero)",
         "Deterministic margin bridge (integer cents)", "Rules MLF-R-01…R-09 · severity · patterns", "Cases + audit trail  →  review UI"]
for k, s in enumerate(steps):
    yy = 8.4 - k * 1.25; box(ax, 3.3, yy, 5.8, 0.8, s, fill="#DDDDDD" if k in (4, 5) else "white", size=6.5)
    if k < len(steps) - 1: arrow(ax, 3.3, yy - 0.4, 3.3, yy - 0.85)
box(ax, 8.4, 3.4, 3.0, 2.3, "Bounded AI agent\nexplains cases only\n≤ 3 extra tool reads\nno money, thresholds\nor severity", fill="#F2F2F2", dashed=True, size=5.9)
arrow(ax, 7.0, 3.4, 6.25, 1.05, dashed=True); arrow(ax, 7.0, 4.2, 6.25, 5.9, dashed=True)
save(fig, "fig_18_1_trust_architecture.png")

# 18.x bridge components per golden case
biz, ctrl, agr = golden_fixtures(); res, _, _, _ = run_analysis(biz + ctrl[:1], agr)
res = [r for r in res if r.status == "CALCULATED" and (r.rules or r.line.line_id == "GC-N01")]
comps = ["discount", "override", "residual_price", "cost", "charge"]; hatches = ["", "////", "xxxx", "....", "\\\\\\\\"]
fills = ["0.25", "white", "white", "white", "0.75"]
fig, ax = plt.subplots(figsize=(W, 2.6)); yl = [r.line.line_id for r in res]
for yi, r in enumerate(res):
    pos = neg = 0.0
    for c, h, f in zip(comps, hatches, fills):
        v = r.bridge[c] / 100
        if v > 0: ax.barh(yi, v, left=pos, color=f, hatch=h, ec="black", lw=0.5, label=c if yi == 0 else None); pos += v
        elif v < 0: ax.barh(yi, v, left=neg, color=f, hatch=h, ec="black", lw=0.5); neg += v
handles = [plt.Rectangle((0, 0), 1, 1, fc=f, hatch=h, ec="black", lw=0.5) for h, f in zip(hatches, fills)]
ax.legend(handles, [c.replace("_", " ") for c in comps], frameon=False, ncol=5, loc="upper center", bbox_to_anchor=(0.45, -0.2), fontsize=6)
ax.axvline(0, color="black", lw=0.6); ax.set_yticks(range(len(yl))); ax.set_yticklabels(yl, fontsize=6); ax.invert_yaxis()
ax.set_xlabel("Signed bridge component ($): adverse > 0, favourable < 0"); save(fig, "fig_18_2_bridge.png")

# 19.x calibration front
h = tc.simulate_history(); tr_ = h["week"] < 39; D, M = tc.outcome_tables(h, tr_); F, Xs = tc.exact_front(D, M)
Fa, _ = tc.archive_mosa(D, M, seed=0); conf = h["amount"][tr_ & h["confirmed"]].sum()
fig, ax = plt.subplots(figsize=(W, 2.3))
ax.plot(F[:, 0], F[:, 1] / 1e3, ".", color="0.45", ms=3, label=f"exact front ({len(F)} settings)")
ax.plot(Fa[:, 0], Fa[:, 1] / 1e3, "o", mfc="none", mec="black", ms=3.5, mew=0.5, label=f"archive MOSA ({len(Fa)})")
b = tc.evaluate(np.zeros(8, int), D, M); ax.plot(b[0], b[1] / 1e3, "s", color="black", ms=5, label="current $50 policy")
for cap in (0.02, 0.05, 0.10):
    k = int(np.argmin(np.where(F[:, 1] <= cap * conf, F[:, 0], np.inf)))
    ax.annotate(f"≤{cap:.0%} missed", (F[k, 0], F[k, 1] / 1e3), xytext=(10, 10), textcoords="offset points", fontsize=6.3,
                arrowprops=dict(arrowstyle="-", lw=0.5))
ax.set_xlabel("Cases dismissed by reviewers (training weeks)"); ax.set_ylabel("Confirmed leakage missed ($k)")
ax.legend(frameon=False); save(fig, "fig_19_1_calibration_front.png")

print("median generation to optimum:", {k: v["median_gen_to_optimum"] for k, v in a["variants"].items()})
print("figures:", sorted(p.name for p in OUT.glob("*.png")))
