// Builds AdityaSharma_Assignment2_ASM.docx from the analysis in
// advertising_regression.py (Part A) and iris_anova_classification.py (Part B).
// Run: node build_report.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, PageBreak, ShadingType,
  Header, Footer, PageNumber,
} = require("docx");

const DIR = __dirname;
const img = (name) => fs.readFileSync(path.join(DIR, name));
const pngDims = (name) => {
  // minimal PNG header dimension reader (IHDR is bytes 16-23)
  const buf = img(name);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};
const scaledImage = (name, maxWidthPx) => {
  const { width, height } = pngDims(name);
  const w = Math.min(maxWidthPx, width);
  const h = Math.round(height * (w / width));
  return { data: img(name), transformation: { width: w, height: h } };
};

const FONT = "Calibri";
const NAVY = "1F2937";

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text, bold: true, size: 30, color: NAVY, font: FONT })],
});
const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 220, after: 100 },
  children: [new TextRun({ text, bold: true, size: 26, color: NAVY, font: FONT })],
});
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 160 },
  children: [new TextRun({ text, size: 22, font: FONT, ...opts })],
});
const Bold = (text) => new TextRun({ text, bold: true, size: 22, font: FONT });
const Code = (lines) => new Paragraph({
  shading: { type: ShadingType.CLEAR, fill: "1E1E1E" },
  spacing: { after: 40 },
  children: lines.map((l, i) => new TextRun({
    text: l, font: "Consolas", size: 17, color: "D4D4D4",
    break: i > 0 ? 1 : 0,
  })),
});
const CENTER = AlignmentType.CENTER;

const cellBorder = { style: BorderStyle.SINGLE, size: 2, color: "D1D5DB" };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
function headerCell(text, widthPct) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    borders,
    children: [new Paragraph({
      alignment: CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20, font: FONT })],
    })],
  });
}
function dataCell(text, widthPct, opts = {}) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    children: [new Paragraph({
      alignment: opts.left ? AlignmentType.LEFT : CENTER,
      children: [new TextRun({ text: String(text), size: 20, font: FONT, bold: !!opts.bold })],
    })],
  });
}
function makeTable(headers, rows, widths) {
  const w = widths || headers.map(() => Math.floor(100 / headers.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, w[i])) }),
      ...rows.map((r) => new TableRow({
        children: r.map((c, i) => dataCell(c, w[i])),
      })),
    ],
  });
}

const codeA = fs.readFileSync(path.join(DIR, "advertising_regression.py"), "utf-8").split("\n");
const codeB = fs.readFileSync(path.join(DIR, "iris_anova_classification.py"), "utf-8").split("\n");

const children = [];

// --- Cover page ---
children.push(
  new Paragraph({ spacing: { before: 1200 }, alignment: CENTER, children: [new TextRun({ text: "AN ASSIGNMENT", bold: true, size: 44, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "ON", size: 28, font: FONT })] }),
  new Paragraph({ spacing: { after: 400 }, alignment: CENTER, children: [new TextRun({ text: "MULTIPLE LINEAR REGRESSION & ONE-WAY ANOVA", bold: true, size: 34, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "(with a Classification Extension)", italics: true, size: 24, font: FONT })] }),
  new Paragraph({ spacing: { before: 600 }, alignment: CENTER, children: [new TextRun({ text: "BY", size: 24, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "2023A7PS0265U Aditya Sharma", bold: true, size: 26, font: FONT })] }),
  new Paragraph({ spacing: { before: 600 }, alignment: CENTER, children: [new TextRun({ text: "Instructor In-Charge: Dr. Maneesha", size: 24, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "prepared for assignment 2 fulfillment of the course", size: 22, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "MATH F432 APPLIED STATISTICAL METHODS", bold: true, size: 24, font: FONT })] }),
  new Paragraph({ spacing: { before: 400 }, alignment: CENTER, children: [new TextRun({ text: "BITS PILANI, DUBAI CAMPUS", size: 22, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "DUBAI INTERNATIONAL ACADEMIC CITY, DUBAI", size: 22, font: FONT })] }),
  new Paragraph({ alignment: CENTER, children: [new TextRun({ text: "UAE", size: 22, font: FONT })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// =====================================================================
// PART A — Advertising Regression
// =====================================================================
children.push(H1("PART A — Multiple Linear Regression: Advertising Spend and Sales"));

children.push(H2("1.0 Introduction to Dataset and Tasks"));
children.push(P("The dataset used is advertising.csv (200 observations), containing advertising spend (in thousands of dollars) across three media -- TV, Radio, and Newspaper -- and the resulting Sales (in thousands of units) for a product. You are required to determine the following:"));
children.push(P("(a) Fit a multiple linear regression model predicting Sales from TV, Radio, and Newspaper spend."));
children.push(P("(b) Test overall model significance (F-test) and each predictor's individual significance (t-tests), and report 95% confidence intervals for each coefficient."));
children.push(P("(c) Check the regression assumptions: normality of residuals, homoscedasticity, and multicollinearity among predictors."));

children.push(H2("2.0 Objective and Hypotheses"));
children.push(P("This analysis investigates which advertising channels are significant predictors of sales, and how much of the variation in sales the three channels jointly explain."));
children.push(new Paragraph({ spacing: { after: 80 }, children: [Bold("Overall model (F-test):")] }));
children.push(P("H0: β(TV) = β(Radio) = β(Newspaper) = 0   (none of the predictors explain sales)"));
children.push(P("Ha: at least one β(j) ≠ 0"));
children.push(new Paragraph({ spacing: { after: 80 }, children: [Bold("Each coefficient (t-test):")] }));
children.push(P("H0: β(j) = 0   vs.   Ha: β(j) ≠ 0, for j ∈ {TV, Radio, Newspaper}, at α = 0.05."));

children.push(H2("3.0 Descriptive Statistics"));
children.push(makeTable(
  ["Variable", "Mean", "Std. Dev.", "Min", "Median", "Max"],
  [
    ["TV", "147.04", "85.85", "0.70", "149.75", "296.40"],
    ["Radio", "23.26", "14.85", "0.00", "22.90", "49.60"],
    ["Newspaper", "30.55", "21.78", "0.30", "25.75", "114.00"],
    ["Sales", "15.13", "5.28", "1.60", "16.00", "27.00"],
  ],
));

children.push(H2("4.0 Correlation Analysis"));
children.push(P("TV spend is strongly correlated with Sales (r = 0.901); Radio shows a moderate correlation (r = 0.350); Newspaper is weakly correlated (r = 0.158). Radio and Newspaper are themselves moderately correlated (r = 0.354), which is checked for multicollinearity in Section 6.0."));
children.push(new Paragraph({
  alignment: CENTER, spacing: { before: 120, after: 160 },
  children: [new ImageRun(scaledImage("fig_correlation_heatmap.png", 380))],
}));
children.push(new Paragraph({
  alignment: CENTER, spacing: { after: 200 },
  children: [new ImageRun(scaledImage("fig_sales_vs_predictors.png", 620))],
}));

children.push(H2("5.0 Regression Results"));
children.push(P("Fitted model: Sales = 4.6251 + 0.0544 × TV + 0.1070 × Radio + 0.0003 × Newspaper"));
children.push(makeTable(
  ["Predictor", "Coefficient", "Std. Error", "t", "p-value", "95% CI"],
  [
    ["Intercept", "4.6251", "0.308", "15.041", "< 0.001", "(4.019, 5.232)"],
    ["TV", "0.0544", "0.001", "39.592", "< 0.001", "(0.052, 0.057)"],
    ["Radio", "0.1070", "0.008", "12.604", "< 0.001", "(0.090, 0.124)"],
    ["Newspaper", "0.0003", "0.006", "0.058", "0.954", "(-0.011, 0.012)"],
  ],
  [22, 16, 15, 13, 15, 19],
));
children.push(P("Overall F-test: F(3, 196) = 605.4, p = 8.13 × 10⁻⁹⁹ — the model as a whole is highly statistically significant.", { bold: false }));
children.push(P("R² = 0.903, Adjusted R² = 0.901 — the model explains about 90% of the variance in Sales."));
children.push(P("Decision on individual predictors: TV and Radio are statistically significant predictors of Sales (p < 0.001 each). Newspaper is NOT statistically significant (p = 0.954) — its 95% CI for the coefficient, (-0.011, 0.012), contains 0."));

children.push(H2("6.0 Model Diagnostics"));
children.push(new Paragraph({ spacing: { after: 80 }, children: [Bold("Multicollinearity (Variance Inflation Factor):")] }));
children.push(makeTable(
  ["Predictor", "VIF"],
  [["TV", "2.487"], ["Radio", "3.285"], ["Newspaper", "3.055"]],
  [50, 50],
));
children.push(P("All VIF values are well below the common threshold of 5, so multicollinearity is not a concern."));
children.push(new Paragraph({ spacing: { before: 100, after: 80 }, children: [Bold("Normality of residuals (Shapiro-Wilk):")] }));
children.push(P("W = 0.9758, p = 0.0016 — normality is formally rejected at α = 0.05 (the residuals are slightly left-skewed with a few heavy-tailed points, skew = -0.431, kurtosis = 4.605), but with n = 200 the F- and t-tests remain reasonably robust to mild non-normality by the Central Limit Theorem."));
children.push(new Paragraph({ spacing: { after: 80 }, children: [Bold("Homoscedasticity (Breusch-Pagan test):")] }));
children.push(P("LM statistic = 3.979, p = 0.264 — homoscedasticity holds; there is no evidence that residual variance changes with the fitted values."));
children.push(new Paragraph({
  alignment: CENTER, spacing: { before: 120, after: 160 },
  children: [new ImageRun(scaledImage("fig_regression_diagnostics.png", 620))],
}));

children.push(H2("7.0 Conclusion"));
children.push(P("TV and Radio advertising spend are statistically significant, positive predictors of Sales; Newspaper spend shows no significant relationship with Sales once TV and Radio are accounted for. The model explains 90.3% of the variance in Sales (R² = 0.903) and passes the homoscedasticity and multicollinearity checks; residuals show only mild non-normality, which is not a serious concern at this sample size. Practically, this suggests that of the three channels studied, advertising budget is better allocated to TV and Radio than to Newspaper."));

children.push(H2("8.0 Python Code (Part A)"));
children.push(Code(codeA));

children.push(new Paragraph({ children: [new PageBreak()] }));

// =====================================================================
// PART B — Iris ANOVA + Classification
// =====================================================================
children.push(H1("PART B — One-Way ANOVA and Classification: Iris Dataset"));

children.push(H2("9.0 Introduction to Dataset and Tasks"));
children.push(P("The dataset used is iris.csv (150 observations, Fisher's classic Iris dataset), containing four measurements -- Sepal Length, Sepal Width, Petal Length, and Petal Width, in cm -- for 50 flowers from each of 3 species: setosa, versicolor, and virginica. You are required to determine the following:"));
children.push(P("(a) Test whether mean Petal Length differs across the three species using a one-way ANOVA."));
children.push(P("(b) Check the ANOVA assumptions (normality per group, homogeneity of variance) and apply appropriate post-hoc and robustness checks."));
children.push(P("(c) Extension: build a classifier that predicts species from all four measurements, and evaluate it on held-out data."));

children.push(H2("10.0 Objective and Hypotheses"));
children.push(P("This analysis investigates whether Petal Length -- the single most discriminative measurement in this dataset -- differs meaningfully across the three iris species."));
children.push(P("H0: μ(setosa) = μ(versicolor) = μ(virginica)"));
children.push(P("Ha: at least one species mean differs from the others"));
children.push(P("Test used: one-way ANOVA (F-test), α = 0.05."));

children.push(H2("11.0 Descriptive Statistics"));
children.push(makeTable(
  ["Species", "n", "Mean Petal Length", "Std. Dev.", "Min", "Max"],
  [
    ["setosa", "50", "1.464", "0.174", "1.0", "1.9"],
    ["versicolor", "50", "4.260", "0.470", "3.0", "5.1"],
    ["virginica", "50", "5.552", "0.552", "4.5", "6.9"],
  ],
));
children.push(new Paragraph({
  alignment: CENTER, spacing: { before: 160, after: 160 },
  children: [new ImageRun(scaledImage("fig_petal_length_by_species.png", 420))],
}));

children.push(H2("12.0 Assumption Checks"));
children.push(makeTable(
  ["Check", "Statistic", "p-value", "Conclusion"],
  [
    ["Shapiro-Wilk (setosa)", "W = 0.9549", "0.0547", "approx. normal"],
    ["Shapiro-Wilk (versicolor)", "W = 0.9660", "0.1585", "approx. normal"],
    ["Shapiro-Wilk (virginica)", "W = 0.9622", "0.1098", "approx. normal"],
    ["Levene's test (equal variances)", "stat = 19.72", "2.59 × 10⁻⁸", "variances differ"],
  ],
  [34, 22, 22, 22],
));
children.push(P("All three groups pass the normality check individually, but Levene's test shows the assumption of equal variances across groups is violated (larger species have more variable petal lengths). Section 13.0 therefore also reports Welch's ANOVA, which does not assume equal variances, and the non-parametric Kruskal-Wallis test, which assumes neither normality nor equal variances."));

children.push(H2("13.0 ANOVA Results"));
children.push(P("Classical one-way ANOVA: F(2, 147) = 1179.03, p = 3.05 × 10⁻⁹¹ — reject H0. Eta-squared = 0.941, meaning species membership explains about 94% of the variance in petal length -- an extremely large effect."));
children.push(P("Welch's ANOVA (robust to unequal variances): F(2, 78.05) = 1826.58, p = 2.85 × 10⁻⁶⁶ — same conclusion."));
children.push(P("Kruskal-Wallis (non-parametric, robust to both normality and variance violations): H = 130.41, p = 4.80 × 10⁻²⁹ — same conclusion."));
children.push(P("All three tests agree: mean petal length differs significantly across the three species."));
children.push(new Paragraph({ spacing: { before: 100, after: 80 }, children: [Bold("Tukey HSD post-hoc (pairwise comparisons):")] }));
children.push(makeTable(
  ["Group 1", "Group 2", "Mean Diff.", "p (adj.)", "95% CI", "Reject H0?"],
  [
    ["setosa", "versicolor", "2.796", "< 0.001", "(2.592, 3.000)", "Yes"],
    ["setosa", "virginica", "4.088", "< 0.001", "(3.884, 4.292)", "Yes"],
    ["versicolor", "virginica", "1.292", "< 0.001", "(1.088, 1.496)", "Yes"],
  ],
  [18, 18, 16, 14, 20, 14],
));
children.push(P("Every pairwise comparison is significant: all three species have distinct mean petal lengths."));

children.push(H2("14.0 Extension: LDA Classification"));
children.push(P("A Linear Discriminant Analysis (LDA) classifier was trained on all four measurements (Sepal Length, Sepal Width, Petal Length, Petal Width) using a stratified 70/30 train/test split (105 training, 45 test observations, seed = 42)."));
children.push(makeTable(
  ["Species", "Precision", "Recall", "F1-score", "Support"],
  [
    ["setosa", "1.00", "1.00", "1.00", "15"],
    ["versicolor", "0.94", "1.00", "0.97", "15"],
    ["virginica", "1.00", "0.93", "0.97", "15"],
  ],
  [30, 17, 17, 18, 18],
));
children.push(P("Overall test accuracy: 97.8% (44/45 correct) — a single virginica flower was misclassified as versicolor, consistent with the small overlap visible between those two species in the pairplot below."));
children.push(new Paragraph({
  alignment: CENTER, spacing: { before: 120, after: 160 },
  children: [new ImageRun(scaledImage("fig_lda_confusion_matrix.png", 320))],
}));
children.push(new Paragraph({
  alignment: CENTER, spacing: { before: 120, after: 200 },
  children: [new ImageRun(scaledImage("fig_iris_pairplot.png", 620))],
}));

children.push(H2("15.0 Conclusion"));
children.push(P("Mean petal length differs significantly across all three iris species (classical ANOVA, Welch's ANOVA, and Kruskal-Wallis all agree, with an extremely large effect size of η² = 0.941), and Tukey's post-hoc test confirms every pairwise difference is significant. This strong separation is also reflected in the LDA classifier, which predicts species from the four measurements with 97.8% test accuracy, misclassifying only a single borderline versicolor/virginica flower."));

children.push(H2("16.0 Python Code (Part B)"));
children.push(Code(codeB));

const doc = new Document({
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "MATH F432 — Assignment 2 — Aditya Sharma", size: 16, color: "9CA3AF", font: FONT })] })] }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(DIR, "AdityaSharma_Assignment2_ASM.docx"), buf);
  console.log("Report written: AdityaSharma_Assignment2_ASM.docx");
});
