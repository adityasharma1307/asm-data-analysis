# Applied Statistical Methods — Assignments

[![Python](https://img.shields.io/badge/python-3.9%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![pandas](https://img.shields.io/badge/pandas-2.x-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![SciPy](https://img.shields.io/badge/scipy-hypothesis%20testing-8CAAE6?logo=scipy&logoColor=white)](https://scipy.org/)
[![statsmodels](https://img.shields.io/badge/statsmodels-regression%20%26%20ANOVA-3776AB)](https://www.statsmodels.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-LDA%20classifier-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Live Dashboard](https://img.shields.io/badge/dashboard-live%20demo-2563eb)](https://<your-username>.github.io/<repo>/)

Two assignments for **MATH F432 Applied Statistical Methods** (BITS Pilani, Dubai Campus), covering interval estimation, hypothesis testing, multiple linear regression, one-way ANOVA, and a short classification extension — each with a reproducible Python script, a full Word/PDF report, and a summary Excel dashboard.

---

## Table of Contents

- [Assignment 1 — Interval Estimation & Hypothesis Testing](#assignment-1--interval-estimation--hypothesis-testing)
- [Assignment 2 — Regression, ANOVA & Classification](#assignment-2--regression-anova--classification)
- [Dashboard](#dashboard)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Reproducing the Results](#reproducing-the-results)
- [Data Sources](#data-sources)
- [License](#license)

---

## Assignment 1 — Interval Estimation & Hypothesis Testing

**Dataset:** `healthcare-dataset-stroke-data.csv` (Kaggle stroke prediction dataset).

**Task:** for stroke patients (n = 209 with valid BMI), (a) compute a 95% confidence interval for true mean BMI, and (b) test H0: μ = 28.5 kg/m² (the national average) against Ha: μ ≠ 28.5 at α = 0.05.

**Result:** sample mean BMI = 30.47, t(208) = 4.503 > critical value 1.971 → **reject H0**. 95% CI = (29.61, 31.33), which excludes 28.5, confirming the decision.

Since the raw BMI values are right-skewed (Shapiro–Wilk p < 0.0001) and fail a formal normality check, the analysis also includes a robustness extension: Cohen's d (effect size = 0.311, small-to-medium), a Wilcoxon signed-rank test (non-parametric, p = 3.6 × 10⁻⁴), and a 10,000-resample bootstrap CI (29.63, 31.33) — all three agree with the t-test, so the conclusion holds regardless of the normality violation.

Files: `Asm1/Aditya_ASM_Assignment_1.py`, `Asm1/AdityaSharma_Assignment1_ASM.docx` / `.pdf`.

---

## Assignment 2 — Regression, ANOVA & Classification

### Part A — Multiple linear regression (`advertising.csv`)

**Task:** fit Sales ~ TV + Radio + Newspaper (200 observations), test overall and per-predictor significance, and check regression assumptions.

**Result:** the model is highly significant overall (F(3,196) = 605.4, p ≈ 8 × 10⁻⁹⁹, R² = 0.903). TV and Radio are significant positive predictors (p < 0.001 each); **Newspaper is not significant** (p = 0.954, its 95% CI (-0.011, 0.012) contains 0). VIFs are all below 3 (no multicollinearity), and a Breusch–Pagan test confirms homoscedasticity; residuals show only mild non-normality, not a concern at n = 200.

### Part B — One-way ANOVA + classification (`iris.csv`)

**Task:** test whether mean Petal Length differs across the 3 iris species, check ANOVA assumptions, and (extension) classify species from all four measurements.

**Result:** Petal Length differs significantly across species (F(2,147) = 1179.03, p ≈ 3 × 10⁻⁹¹, η² = 0.941 — a very large effect). Levene's test shows unequal variances across groups, so the analysis also reports Welch's ANOVA and the non-parametric Kruskal-Wallis test as robustness checks — both agree with the classical ANOVA. Tukey's HSD confirms every pairwise species comparison is significant. A Linear Discriminant Analysis (LDA) classifier trained on all four measurements reaches **97.8% test accuracy** (44/45, stratified 70/30 split), misclassifying only one borderline versicolor/virginica flower.

Files: `Asm2/advertising_regression.py`, `Asm2/iris_anova_classification.py`, `Asm2/AdityaSharma_Assignment2_ASM.docx` / `.pdf`, `Asm2/build_report.js` (regenerates the Word report from the two scripts' results and figures).

---

## Dashboard

### Excel dashboard

`ASM_Assignments_Dashboard.xlsx` is a single Excel workbook summarizing all three analyses: a **Dashboard** sheet with KPI cards and four native charts (BMI CI, regression coefficients, ANOVA group means, LDA per-species F1-score), plus one detail sheet per analysis with the full numeric results. Regenerate it with `python build_dashboard.py` after re-running the three analysis scripts.

### Live web dashboard

`docs/index.html` is a single self-contained HTML page (Chart.js via CDN, no backend, no build step) covering all three analyses: KPI cards, four charts, and full results tables (including the Tukey HSD post-hoc comparisons). It's generated by `build_web_dashboard.py` from the same source data as the Excel dashboard:

```bash
python Asm1/Aditya_ASM_Assignment_1.py
python Asm2/advertising_regression.py
python Asm2/iris_anova_classification.py
python build_dashboard.py
python build_web_dashboard.py
```

Open `docs/index.html` directly in a browser to preview it locally. To publish it, push this repo to GitHub and enable **Settings → Pages** with source `main` branch, `/docs` folder — no separate account or deploy step needed. The same folder also deploys as-is to Vercel (`npx vercel deploy docs --prod`) or Netlify (drag `docs/` onto [app.netlify.com/drop](https://app.netlify.com/drop)) if you'd rather use those.

---

## Repository Structure

```
.
├── README.md
├── LICENSE
├── requirements.txt
├── build_dashboard.py                       # builds ASM_Assignments_Dashboard.xlsx
├── build_web_dashboard.py                   # builds docs/index.html (GitHub Pages / Vercel / Netlify)
├── ASM_Assignments_Dashboard.xlsx
│
├── docs/
│   └── index.html                           # live, self-contained web dashboard (Chart.js)
│
├── Asm1/
│   ├── Aditya_ASM_Assignment_1.py            # BMI one-sample t-test + robustness checks
│   ├── healthcare-dataset-stroke-data.csv
│   ├── fig.png                               # generated by the script
│   ├── AdityaSharma_Assignment1_ASM.docx
│   └── AdityaSharma_Assignment1_ASM.pdf
│
└── Asm2/
    ├── advertising_regression.py             # Part A: multiple linear regression
    ├── iris_anova_classification.py          # Part B: one-way ANOVA + LDA
    ├── build_report.js                       # builds the combined Word report (Node + docx)
    ├── advertising.csv
    ├── iris.csv
    ├── iris/                                 # original UCI iris.data / iris.names
    ├── fig_*.png                             # generated by the two scripts
    ├── AdityaSharma_Assignment2_ASM.docx
    └── AdityaSharma_Assignment2_ASM.pdf
```

All Python scripts resolve their input/output paths relative to their own location (`BASE_DIR = os.path.dirname(os.path.abspath(__file__))`), so the repo runs correctly from any clone location.

**Not tracked in git** (see `.gitignore`): `Asm2/SPSSStatistics.exe` (905MB SPSS installer — over GitHub's 100MB file limit and a licensed installer that shouldn't be redistributed) and the raw `iris.zip` archives (duplicates of `Asm2/iris/`, which is what's actually used).

---

## Installation

```bash
git clone https://github.com/<your-username>/asm-assignments.git
cd asm-assignments

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

The Word-report builder for Assignment 2 (`Asm2/build_report.js`) additionally needs Node.js and the `docx` npm package:

```bash
cd Asm2
npm install docx
node build_report.js
```

---

## Reproducing the Results

```bash
# Assignment 1
python Asm1/Aditya_ASM_Assignment_1.py

# Assignment 2
python Asm2/advertising_regression.py
python Asm2/iris_anova_classification.py

# Dashboards (after the three scripts above)
python build_dashboard.py
python build_web_dashboard.py
```

Each script prints its full statistical output to the console and saves its figures as `.png` files next to the script.

---

## Data Sources

- **Stroke prediction dataset**: `healthcare-dataset-stroke-data.csv`, originally published on Kaggle. Used here for Assignment 1's BMI hypothesis test.
- **Advertising dataset**: `advertising.csv`, the classic TV/Radio/Newspaper spend vs. Sales dataset from *An Introduction to Statistical Learning* (James, Witten, Hastie & Tibshirani).
- **Iris dataset**: R.A. Fisher (1936), via the UCI Machine Learning Repository (`Asm2/iris/iris.data`, `iris.names`).

---

## License

The code and written reports in this repository are released under the **MIT License** (see `LICENSE`). The three datasets above each carry their own separate terms from their original sources and are not covered by this license.
