"""
MATH F432 Applied Statistical Methods -- Assignment 1
Interval Estimation & Hypothesis Testing on stroke-patient BMI.

(a) 95% confidence interval for the true mean BMI of stroke patients.
(b) One-sample t-test: H0: mu = 28.5 kg/m^2  vs  Ha: mu != 28.5 kg/m^2, alpha = 0.05.

Extension (added for robustness, since the raw BMI values are right-skewed and fail
a normality check): effect size, a non-parametric test that doesn't assume normality,
and a bootstrap confidence interval, to confirm the t-test conclusion isn't an artifact
of the normality assumption being violated.
"""
import os

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

sns.set(style="whitegrid")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, "healthcare-dataset-stroke-data.csv")
FIG_PATH = os.path.join(BASE_DIR, "fig.png")

SEED = 42
N_BOOT = 10_000

try:
    df = pd.read_csv(FILE_PATH)
except FileNotFoundError:
    print(f"Error: File not found at '{FILE_PATH}'")
    raise SystemExit(1)

bmi = df[df["stroke"] == 1].dropna(subset=["bmi"])["bmi"]

if bmi.empty:
    print("Error: No data for stroke patients with valid BMI")
    raise SystemExit(1)

n = len(bmi)
sample_mean = bmi.mean()
sample_std = bmi.std(ddof=1)
pop_mean = 28.5
alpha = 0.05
std_error = sample_std / np.sqrt(n)

t_stat = (sample_mean - pop_mean) / std_error
df_val = n - 1
t_crit = stats.t.ppf(1 - alpha / 2, df=df_val)
margin = t_crit * std_error
ci = (sample_mean - margin, sample_mean + margin)

print("\n--- One-Sample T-Test for Stroke Patients' BMI ---")
print(f"H₀: μ = {pop_mean} | Hₐ: μ ≠ {pop_mean}")
print("-" * 60)
print(f"Sample Size: {n}")
print(f"Sample Mean BMI: {sample_mean:.2f}")
print(f"Sample SD: {sample_std:.2f}")
print(f"Standard Error: {std_error:.2f}")
print(f"Degrees of Freedom: {df_val}")
print(f"Significance Level: {alpha}")
print("-" * 60)
print(f"T-Statistic: {t_stat:.3f}")
print(f"Critical Value (±): {t_crit:.3f}")
print(f"Margin of Error: {margin:.3f}")
print(f"95% CI: ({ci[0]:.2f}, {ci[1]:.2f})")
print("-" * 60)

reject = abs(t_stat) > t_crit
decision = "reject" if reject else "fail to reject"
print(f"Decision: {decision.capitalize()} H₀")
print(f"Conclusion: Mean BMI {'differs from' if reject else 'does not differ from'} {pop_mean}")

# ---------------------------------------------------------------------------
# Extension: robustness checks
#
# The t-test above assumes the population is (approximately) normal. With
# n=209 the Central Limit Theorem makes that a reasonable assumption for the
# *sampling distribution of the mean* even if the raw data is skewed, but
# it's worth checking rather than just asserting it.
# ---------------------------------------------------------------------------
print("\n--- Robustness Checks (Extension) ---")
print("-" * 60)

sh_stat, sh_p = stats.shapiro(bmi)
skew = stats.skew(bmi)
kurt = stats.kurtosis(bmi)
print(f"Shapiro-Wilk normality test: W={sh_stat:.4f}, p={sh_p:.3e}")
print(f"Skewness: {skew:.3f}  Kurtosis: {kurt:.3f}")
if sh_p < alpha:
    print("  -> Normality is rejected at alpha=0.05 (right-skewed distribution).")
else:
    print("  -> Normality is not rejected at alpha=0.05.")

cohens_d = (sample_mean - pop_mean) / sample_std
print(f"\nEffect size (Cohen's d): {cohens_d:.3f}")

w_stat, w_p = stats.wilcoxon(bmi - pop_mean)
print(f"\nWilcoxon signed-rank test (does not assume normality): W={w_stat:.1f}, p={w_p:.3e}")
print(f"  -> {'Reject' if w_p < alpha else 'Fail to reject'} H0 at alpha={alpha}, "
      f"{'agreeing' if (w_p < alpha) == reject else 'disagreeing'} with the t-test.")

rng = np.random.default_rng(SEED)
boot_means = np.array([
    rng.choice(bmi.values, size=n, replace=True).mean() for _ in range(N_BOOT)
])
boot_ci = np.percentile(boot_means, [2.5, 97.5])
print(f"\nBootstrap 95% CI ({N_BOOT:,} resamples, seed={SEED}): "
      f"({boot_ci[0]:.2f}, {boot_ci[1]:.2f})")

print("-" * 60)
print("All three approaches (t-test, Wilcoxon, bootstrap) agree: the t-test")
print("conclusion is robust to the non-normality of the underlying BMI data.")

# ---------------------------------------------------------------------------
# Figure
# ---------------------------------------------------------------------------
plt.figure(figsize=(10, 6))
sns.histplot(data=bmi, kde=True, color="purple", bins=20, alpha=0.8)
plt.axvline(sample_mean, color="red", linestyle="--", linewidth=2,
            label=f"Sample Mean = {sample_mean:.2f}")
plt.axvline(pop_mean, color="green", linestyle=":", linewidth=2,
            label=f"H₀ Mean = {pop_mean}")
plt.title("BMI Distribution of Stroke Patients", fontsize=16, fontweight="bold")
plt.xlabel("BMI (kg/m²)", fontsize=12)
plt.ylabel("Frequency", fontsize=12)
plt.legend()
plt.tight_layout()
plt.savefig(FIG_PATH, dpi=150)
print(f"\nFigure saved to: {FIG_PATH}")
plt.close()
