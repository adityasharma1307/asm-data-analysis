"""
MATH F432 Applied Statistical Methods -- Assignment 2, Part A
Multiple Linear Regression: Sales ~ TV + Radio + Newspaper (advertising.csv)

Tasks:
(a) Fit a multiple linear regression model predicting Sales from TV, Radio,
    and Newspaper advertising spend.
(b) Test overall model significance (F-test) and each coefficient's
    significance (t-tests), report 95% CIs for each coefficient.
(c) Check regression assumptions: normality of residuals, homoscedasticity
    (Breusch-Pagan), and multicollinearity (VIF).
"""
import os

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
from scipy import stats
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.outliers_influence import variance_inflation_factor

sns.set(style="whitegrid")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, "advertising.csv")
FIG_CORR = os.path.join(BASE_DIR, "fig_correlation_heatmap.png")
FIG_DIAG = os.path.join(BASE_DIR, "fig_regression_diagnostics.png")
FIG_SCATTER = os.path.join(BASE_DIR, "fig_sales_vs_predictors.png")

ALPHA = 0.05

try:
    df = pd.read_csv(FILE_PATH)
except FileNotFoundError:
    print(f"Error: File not found at '{FILE_PATH}'")
    raise SystemExit(1)

predictors = ["TV", "Radio", "Newspaper"]
X = df[predictors]
y = df["Sales"]
n = len(df)

print("--- Descriptive Statistics ---")
print(df[predictors + ["Sales"]].describe().round(2))

print("\n--- Correlation Matrix ---")
corr = df[predictors + ["Sales"]].corr()
print(corr.round(3))

Xc = sm.add_constant(X)
model = sm.OLS(y, Xc).fit()

print("\n--- Multiple Linear Regression: Sales ~ TV + Radio + Newspaper ---")
print(model.summary())

print("\n--- Variance Inflation Factors (multicollinearity check) ---")
vif = pd.DataFrame({
    "feature": predictors,
    "VIF": [variance_inflation_factor(X.values, i) for i in range(X.shape[1])],
})
print(vif.round(3).to_string(index=False))

resid = model.resid
fitted = model.fittedvalues

sh_stat, sh_p = stats.shapiro(resid)
print(f"\nShapiro-Wilk on residuals: W={sh_stat:.4f}, p={sh_p:.4f}")
print("  -> Residuals are", "NOT normal" if sh_p < ALPHA else "approximately normal", f"at alpha={ALPHA}")

bp_stat, bp_p, _, _ = het_breuschpagan(resid, Xc)
print(f"Breusch-Pagan test for homoscedasticity: LM stat={bp_stat:.4f}, p={bp_p:.4f}")
print("  ->", "Heteroscedasticity detected" if bp_p < ALPHA else "Homoscedasticity holds", f"at alpha={ALPHA}")

print("\n--- Conclusion ---")
overall_p = model.f_pvalue
print(f"Overall F-test: F={model.fvalue:.1f}, p={overall_p:.3e} "
      f"-> model is {'statistically significant' if overall_p < ALPHA else 'not significant'}")
for pred in predictors:
    p = model.pvalues[pred]
    sig = "significant" if p < ALPHA else "NOT significant"
    print(f"  {pred}: coef={model.params[pred]:.4f}, p={p:.4f} -> {sig}")
print(f"R-squared = {model.rsquared:.3f}  (Adj. R-squared = {model.rsquared_adj:.3f})")

# ---------------------------------------------------------------------------
# Figures
# ---------------------------------------------------------------------------
plt.figure(figsize=(6, 5))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, square=True)
plt.title("Correlation Matrix: Ad Spend vs. Sales", fontsize=13, fontweight="bold")
plt.tight_layout()
plt.savefig(FIG_CORR, dpi=150)
plt.close()

fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
for ax, pred in zip(axes, predictors):
    sns.regplot(data=df, x=pred, y="Sales", ax=ax, scatter_kws={"alpha": 0.5, "s": 20},
                line_kws={"color": "red"})
    ax.set_title(f"Sales vs. {pred}")
plt.tight_layout()
plt.savefig(FIG_SCATTER, dpi=150)
plt.close()

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
axes[0].scatter(fitted, resid, alpha=0.6)
axes[0].axhline(0, color="red", linestyle="--")
axes[0].set_xlabel("Fitted values")
axes[0].set_ylabel("Residuals")
axes[0].set_title("Residuals vs. Fitted")
sm.qqplot(resid, line="45", fit=True, ax=axes[1])
axes[1].set_title("Normal Q-Q Plot of Residuals")
plt.tight_layout()
plt.savefig(FIG_DIAG, dpi=150)
plt.close()

print(f"\nFigures saved: {FIG_CORR}, {FIG_SCATTER}, {FIG_DIAG}")
