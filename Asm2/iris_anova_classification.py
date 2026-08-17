"""
MATH F432 Applied Statistical Methods -- Assignment 2, Part B
One-Way ANOVA + Classification on the Iris dataset (iris.csv).

Tasks:
(a) One-way ANOVA: does mean Petal Length differ across the 3 species
    (setosa, versicolor, virginica)? H0: mu1 = mu2 = mu3, Ha: at least one differs.
(b) Check ANOVA assumptions: normality per group (Shapiro-Wilk) and
    homogeneity of variance (Levene's test); if variances are unequal, also
    run Welch's ANOVA and the non-parametric Kruskal-Wallis test as
    robustness checks, and Tukey's HSD as the post-hoc test.
(c) Extension: a Linear Discriminant Analysis (LDA) classifier predicting
    species from all four measurements, evaluated on a held-out test split.
"""
import os

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pingouin as pg
from scipy import stats
from statsmodels.stats.multicomp import pairwise_tukeyhsd
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

sns.set(style="whitegrid")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, "iris.csv")
FIG_BOX = os.path.join(BASE_DIR, "fig_petal_length_by_species.png")
FIG_PAIR = os.path.join(BASE_DIR, "fig_iris_pairplot.png")
FIG_CM = os.path.join(BASE_DIR, "fig_lda_confusion_matrix.png")

ALPHA = 0.05
SEED = 42
SPECIES_MAP = {0: "setosa", 1: "versicolor", 2: "virginica"}
FEATURES = ["SepalLength", "SepalWidth", "PetalLength", "PetalWidth"]

try:
    df = pd.read_csv(FILE_PATH)
except FileNotFoundError:
    print(f"Error: File not found at '{FILE_PATH}'")
    raise SystemExit(1)

df["SpeciesName"] = df["Species"].map(SPECIES_MAP)

print("--- Descriptive Statistics: Petal Length by Species ---")
print(df.groupby("SpeciesName")["PetalLength"].describe().round(3))

groups = [g["PetalLength"].values for _, g in df.groupby("SpeciesName")]
species_order = sorted(df["SpeciesName"].unique(), key=lambda s: list(SPECIES_MAP.values()).index(s))

# ---------------------------------------------------------------------------
# Assumption checks
# ---------------------------------------------------------------------------
print("\n--- Assumption Checks ---")
for name, g in zip(species_order, groups):
    sh_stat, sh_p = stats.shapiro(g)
    print(f"  Shapiro-Wilk ({name}): W={sh_stat:.4f}, p={sh_p:.4f} "
          f"-> {'not normal' if sh_p < ALPHA else 'approx. normal'}")

lev_stat, lev_p = stats.levene(*groups)
print(f"  Levene's test (equal variances): stat={lev_stat:.4f}, p={lev_p:.3e} "
      f"-> {'variances differ' if lev_p < ALPHA else 'variances equal'} at alpha={ALPHA}")

# ---------------------------------------------------------------------------
# One-way ANOVA
# ---------------------------------------------------------------------------
print("\n--- One-Way ANOVA: PetalLength ~ Species ---")
f_stat, anova_p = stats.f_oneway(*groups)
grand_mean = df["PetalLength"].mean()
ss_between = sum(len(g) * (g.mean() - grand_mean) ** 2 for g in groups)
ss_total = ((df["PetalLength"] - grand_mean) ** 2).sum()
eta_sq = ss_between / ss_total
print(f"  F({len(groups)-1}, {len(df)-len(groups)}) = {f_stat:.2f}, p = {anova_p:.3e}")
print(f"  Eta-squared (effect size) = {eta_sq:.4f}")
print(f"  Decision: {'Reject' if anova_p < ALPHA else 'Fail to reject'} H0 at alpha={ALPHA}")

print("\n--- Robustness Checks (variances were unequal per Levene's test) ---")
welch = pg.welch_anova(data=df, dv="PetalLength", between="SpeciesName")
print(welch.to_string(index=False))
kw_stat, kw_p = stats.kruskal(*groups)
print(f"  Kruskal-Wallis (non-parametric): H={kw_stat:.2f}, p={kw_p:.3e}")

print("\n--- Tukey HSD Post-hoc Test ---")
tukey = pairwise_tukeyhsd(df["PetalLength"], df["SpeciesName"], alpha=ALPHA)
print(tukey)

# ---------------------------------------------------------------------------
# Extension: LDA classification
# ---------------------------------------------------------------------------
print("\n--- Extension: LDA Classification (Species ~ all 4 measurements) ---")
X = df[FEATURES]
y = df["SpeciesName"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=SEED, stratify=y
)
lda = LinearDiscriminantAnalysis()
lda.fit(X_train, y_train)
y_pred = lda.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"  Train/test split: {len(X_train)}/{len(X_test)} (stratified, seed={SEED})")
print(f"  Test accuracy: {acc:.4f}")
print(classification_report(y_test, y_pred))
cm = confusion_matrix(y_test, y_pred, labels=species_order)
print("Confusion matrix (rows=true, cols=predicted):")
print(pd.DataFrame(cm, index=species_order, columns=species_order))

# ---------------------------------------------------------------------------
# Figures
# ---------------------------------------------------------------------------
plt.figure(figsize=(7, 5))
sns.boxplot(data=df, x="SpeciesName", y="PetalLength", order=species_order,
            hue="SpeciesName", palette="Set2", legend=False)
sns.stripplot(data=df, x="SpeciesName", y="PetalLength", order=species_order,
              color="black", alpha=0.35, size=3)
plt.title("Petal Length by Species", fontsize=14, fontweight="bold")
plt.xlabel("Species")
plt.ylabel("Petal Length (cm)")
plt.tight_layout()
plt.savefig(FIG_BOX, dpi=150)
plt.close()

g = sns.pairplot(df, vars=FEATURES, hue="SpeciesName", palette="Set2", diag_kind="kde")
g.fig.suptitle("Iris Measurements by Species", y=1.02, fontsize=14, fontweight="bold")
g.savefig(FIG_PAIR, dpi=150)
plt.close()

plt.figure(figsize=(5.5, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=species_order, yticklabels=species_order)
plt.title(f"LDA Confusion Matrix (Test Accuracy = {acc:.1%})", fontsize=12, fontweight="bold")
plt.xlabel("Predicted")
plt.ylabel("True")
plt.tight_layout()
plt.savefig(FIG_CM, dpi=150)
plt.close()

print(f"\nFigures saved: {FIG_BOX}, {FIG_PAIR}, {FIG_CM}")
