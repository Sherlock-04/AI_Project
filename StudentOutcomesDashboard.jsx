import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  SlidersHorizontal,
  BookOpen,
  Landmark,
  FileText,
  Stamp,
  Info,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  AUTHORITATIVE DATA — Exact methodology & metrics from the Jupyter     */
/*  notebook ("Student Dropout_AI Project.ipynb") and dataset             */
/*  ("student_dropout.csv").                                              */
/*  Cohort: 4,424 students, 36 features (37 total columns).               */
/*  80/20 Stratified Train/Test Split (random_state=42).                   */
/* ---------------------------------------------------------------------- */

const COLORS = {
  navy: "#141E36",
  navyDeep: "#0D1526",
  navyPanel: "#1B2740",
  paper: "#E9E1C9",
  paperLine: "#CBBE97",
  ink: "#211A0F",
  inkSoft: "#5B5442",
  onNavy: "#EDE6D3",
  onNavySoft: "#A9AFC7",
  brass: "#C9A227",
  brassDeep: "#8A6B14",
  dropout: "#B23A3A",
  dropoutBg: "#F5DEDE",
  dropoutTx: "#6B1F1F",
  enrolled: "#BE8A2C",
  enrolledBg: "#F6E8CE",
  enrolledTx: "#7A5518",
  graduate: "#2F6D4F",
  graduateBg: "#DCEBE1",
  graduateTx: "#1F4A36",
};

const CLASS_META = {
  Dropout: { color: COLORS.dropout, bg: COLORS.dropoutBg, tx: COLORS.dropoutTx },
  Enrolled: { color: COLORS.enrolled, bg: COLORS.enrolledBg, tx: COLORS.enrolledTx },
  Graduate: { color: COLORS.graduate, bg: COLORS.graduateBg, tx: COLORS.graduateTx },
};

const TOTAL_STUDENTS = 4424;
const TOTAL_FEATURES = 36;
const TOTAL_COLUMNS = 37;
const TARGET_COUNTS = { Dropout: 1421, Enrolled: 794, Graduate: 2209 };
const TARGET_PCT = { Dropout: 32.1, Enrolled: 17.9, Graduate: 49.9 };

const CROSSTABS = [
  {
    feature: "Tuition fees up to date",
    icon: Wallet,
    groups: [
      { label: "Behind on fees", n: 583, split: { Dropout: 86.6, Enrolled: 8.0, Graduate: 5.5 } },
      { label: "Fees current", n: 3841, split: { Dropout: 24.7, Enrolled: 19.3, Graduate: 56.0 } },
    ],
    note: "The single sharpest split in the cohort — students behind on tuition drop out at over 3x the rate of those with fees current.",
  },
  {
    feature: "Scholarship holder",
    icon: Award,
    groups: [
      { label: "No scholarship", n: 3325, split: { Dropout: 38.7, Enrolled: 20.0, Graduate: 41.3 } },
      { label: "Scholarship holder", n: 1099, split: { Dropout: 12.2, Enrolled: 11.8, Graduate: 76.0 } },
    ],
    note: "Scholarship holders graduate at nearly double the rate of non-holders (76.0% vs 41.3%).",
  },
  {
    feature: "Debtor status",
    icon: Landmark,
    groups: [
      { label: "Not a debtor", n: 3921, split: { Dropout: 28.3, Enrolled: 18.0, Graduate: 53.8 } },
      { label: "Registered debtor", n: 503, split: { Dropout: 62.0, Enrolled: 17.9, Graduate: 20.1 } },
    ],
    note: "Registered debtor status is strongly associated with higher dropout (62.0%) and reduced graduation rates.",
  },
  {
    feature: "Gender",
    icon: Users,
    groups: [
      { label: "Female", n: 2868, split: { Dropout: 25.1, Enrolled: 17.0, Graduate: 57.9 } },
      { label: "Male", n: 1556, split: { Dropout: 45.1, Enrolled: 19.7, Graduate: 35.2 } },
    ],
    note: "Demographic breakdown shows male students drop out at a higher rate (45.1%) than female students (25.1%).",
  },
];

const BOX = {
  "2nd sem. approved units": {
    domainMin: 0,
    domainMax: 20,
    rows: {
      Dropout: { min: 0, q1: 0, median: 0, q3: 4, max: 16, mean: 1.94 },
      Enrolled: { min: 0, q1: 3, median: 4, q3: 5, max: 12, mean: 4.06 },
      Graduate: { min: 0, q1: 5, median: 6, q3: 7, max: 20, mean: 6.18 },
    },
  },
  "1st sem. approved units": {
    domainMin: 0,
    domainMax: 26,
    rows: {
      Dropout: { min: 0, q1: 0, median: 2, q3: 4, max: 21, mean: 2.55 },
      Enrolled: { min: 0, q1: 3, median: 5, q3: 6, max: 15, mean: 4.32 },
      Graduate: { min: 0, q1: 5, median: 6, q3: 7, max: 26, mean: 6.23 },
    },
  },
  "2nd sem. grade": {
    domainMin: 0,
    domainMax: 18.6,
    rows: {
      Dropout: { min: 0, q1: 0, median: 0, q3: 11.83, max: 17.71, mean: 5.9 },
      Enrolled: { min: 0, q1: 11, median: 12, q3: 12.82, max: 17.6, mean: 11.12 },
      Graduate: { min: 0, q1: 12.17, median: 13, q3: 14, max: 18.57, mean: 12.7 },
    },
  },
  "1st sem. grade": {
    domainMin: 0,
    domainMax: 18.9,
    rows: {
      Dropout: { min: 0, q1: 0, median: 10.93, q3: 12.2, max: 18.0, mean: 7.26 },
      Enrolled: { min: 0, q1: 11, median: 12, q3: 12.86, max: 17.0, mean: 11.13 },
      Graduate: { min: 0, q1: 12.12, median: 13, q3: 13.86, max: 18.88, mean: 12.64 },
    },
  },
  "Age at enrollment": {
    domainMin: 17,
    domainMax: 70,
    rows: {
      Dropout: { min: 18, q1: 19, median: 23, q3: 30, max: 70, mean: 26.07 },
      Enrolled: { min: 17, q1: 19, median: 20, q3: 23, max: 54, mean: 22.37 },
      Graduate: { min: 17, q1: 18, median: 19, q3: 21, max: 62, mean: 21.78 },
    },
  },
};

/* Linear correlation with numerically encoded target (Dropout=0, Enrolled=1, Graduate=2) */
const CORRELATIONS = [
  { label: "2nd sem. approved units", value: 0.624 },
  { label: "2nd sem. grade", value: 0.567 },
  { label: "1st sem. approved units", value: 0.529 },
  { label: "1st sem. grade", value: 0.485 },
  { label: "Tuition fees up to date", value: 0.410 },
  { label: "Scholarship holder", value: 0.298 },
  { label: "2nd sem. course load", value: 0.176 },
  { label: "1st sem. course load", value: 0.156 },
  { label: "Prior qualification level", value: -0.056 },
  { label: "Application mode", value: -0.222 },
  { label: "Gender (male)", value: -0.229 },
  { label: "Debtor status", value: -0.241 },
  { label: "Age at enrollment", value: -0.243 },
];
const CORR_MAX = 0.65;

/* Authoritative model evaluation results from notebook */
const MODELS = [
  {
    name: "Logistic regression",
    subtitle: "Linear baseline (StandardScaler, 36 features)",
    accuracy: "76.84%",
    auc: "0.8961",
    cm: [
      [218, 29, 37],
      [43, 53, 63],
      [14, 19, 409],
    ],
    report: [
      { class: "Dropout", p: "0.79", r: "0.77", f1: "0.78" },
      { class: "Enrolled", p: "0.52", r: "0.33", f1: "0.41" },
      { class: "Graduate", p: "0.80", r: "0.93", f1: "0.86" },
    ],
    badge: "HIGHEST ACCURACY",
  },
  {
    name: "Decision tree",
    subtitle: "Depth-limited tree (max_depth=5, min_samples_leaf=5)",
    accuracy: "75.37%",
    auc: "0.8628",
    cm: [
      [196, 32, 56],
      [29, 54, 76],
      [14, 11, 417],
    ],
    report: [
      { class: "Dropout", p: "0.82", r: "0.69", f1: "0.75" },
      { class: "Enrolled", p: "0.56", r: "0.34", f1: "0.42" },
      { class: "Graduate", p: "0.76", r: "0.94", f1: "0.84" },
    ],
    badge: null,
  },
  {
    name: "Random forest",
    subtitle: "200 trees, ensemble bagging",
    accuracy: "76.50%",
    auc: "0.9040",
    cm: [
      [213, 24, 47],
      [42, 54, 63],
      [12, 20, 410],
    ],
    report: [
      { class: "Dropout", p: "0.80", r: "0.75", f1: "0.77" },
      { class: "Enrolled", p: "0.55", r: "0.34", f1: "0.42" },
      { class: "Graduate", p: "0.79", r: "0.93", f1: "0.85" },
    ],
    badge: "TOP ROC-AUC",
  },
];
const CM_LABELS = ["Dropout", "Enrolled", "Graduate"];

/* Feature importances explicitly calculated from the trained Random Forest model (random_state=42) */
const RF_IMPORTANCE = [
  { label: "2nd sem. approved units", value: 0.1552 },
  { label: "2nd sem. grade", value: 0.0916 },
  { label: "1st sem. approved units", value: 0.0892 },
  { label: "1st sem. grade", value: 0.0653 },
  { label: "Admission grade", value: 0.0435 },
  { label: "Tuition fees up to date", value: 0.0399 },
  { label: "Age at enrollment", value: 0.0396 },
  { label: "2nd sem. evaluations sat", value: 0.0381 },
];

/* Real coefficients & scaler parameters from notebook's Logistic Regression model (36 features).
   10 primary factors exposed as controls; remaining 26 features held at cohort training averages. */
const CLASSES = ["Dropout", "Enrolled", "Graduate"];
const INTERCEPT = [0.152159, 0.030129, -0.182288];
const PREDICTOR_FEATURES = [
  {
    key: "u2",
    name: "Curricular units 2nd sem (approved)",
    label: "2nd semester — units passed",
    type: "range",
    min: 0,
    max: 20,
    step: 1,
    mean: 4.4337,
    scale: 3.0277,
    coef: [-1.49884, -0.37368, 1.87252],
  },
  {
    key: "g2",
    name: "Curricular units 2nd sem (grade)",
    label: "2nd semester — average grade",
    type: "range",
    min: 0,
    max: 18.6,
    step: 0.1,
    mean: 10.2045,
    scale: 5.2349,
    coef: [-0.44194, 0.02025, 0.42170],
  },
  {
    key: "u1",
    name: "Curricular units 1st sem (approved)",
    label: "1st semester — units passed",
    type: "range",
    min: 0,
    max: 26,
    step: 1,
    mean: 4.7016,
    scale: 3.095,
    coef: [-0.74497, -0.44396, 1.18893],
  },
  {
    key: "g1",
    name: "Curricular units 1st sem (grade)",
    label: "1st semester — average grade",
    type: "range",
    min: 0,
    max: 18.9,
    step: 0.1,
    mean: 10.623,
    scale: 4.8705,
    coef: [0.11568, -0.06501, -0.05067],
  },
  {
    key: "age",
    name: "Age at enrollment",
    label: "Age at enrollment",
    type: "range",
    min: 17,
    max: 70,
    step: 1,
    mean: 23.2495,
    scale: 7.6041,
    coef: [0.23875, -0.16185, -0.07690],
  },
  {
    key: "tuition",
    name: "Tuition fees up to date",
    label: "Tuition fees current",
    type: "toggle",
    onLabel: "Current",
    offLabel: "Behind",
    mean: 0.8816,
    scale: 0.3231,
    coef: [-0.55744, 0.07859, 0.47885],
  },
  {
    key: "scholarship",
    name: "Scholarship holder",
    label: "Scholarship",
    type: "toggle",
    onLabel: "Holder",
    offLabel: "None",
    mean: 0.2526,
    scale: 0.4345,
    coef: [-0.12705, -0.09804, 0.22510],
  },
  {
    key: "debtor",
    name: "Debtor",
    label: "Debtor status",
    type: "toggle",
    onLabel: "Debtor",
    offLabel: "Clear",
    mean: 0.1099,
    scale: 0.3128,
    coef: [0.12565, 0.05782, -0.18347],
  },
  {
    key: "gender",
    name: "Gender",
    label: "Gender",
    type: "toggle",
    onLabel: "Male",
    offLabel: "Female",
    mean: 0.3507,
    scale: 0.4772,
    coef: [0.07430, 0.02349, -0.09779],
  },
  {
    key: "displaced",
    name: "Displaced",
    label: "Displaced from home",
    type: "toggle",
    onLabel: "Displaced",
    offLabel: "Local",
    mean: 0.5487,
    scale: 0.4976,
    coef: [0.11275, -0.04220, -0.07054],
  },
];

function defaultInputs() {
  const d = {};
  PREDICTOR_FEATURES.forEach((f) => {
    if (f.type === "range") d[f.key] = Math.round(f.mean * 10) / 10;
    else d[f.key] = f.mean >= 0.5 ? 1 : 0;
  });
  return d;
}

function predict(inputs) {
  const logits = CLASSES.map((_, ci) => {
    let z = INTERCEPT[ci];
    PREDICTOR_FEATURES.forEach((f) => {
      const raw = inputs[f.key];
      const scaled = (raw - f.mean) / f.scale;
      z += f.coef[ci] * scaled;
    });
    return z;
  });
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return CLASSES.map((c, i) => ({ label: c, p: exps[i] / sum }));
}

/* ---------------------------------------------------------------------- */
/*  Small building blocks                                                 */
/* ---------------------------------------------------------------------- */

function SectionTag({ n, title, icon: Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          color: COLORS.brass,
          letterSpacing: "0.08em",
        }}
      >
        {n}
      </span>
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(22px, 3vw, 30px)",
          fontWeight: 600,
          color: COLORS.onNavy,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {Icon && <Icon size={22} strokeWidth={1.6} color={COLORS.brass} />}
        {title}
      </h2>
    </div>
  );
}

function ProportionBar({ counts, pct }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 40,
          borderRadius: 6,
          overflow: "hidden",
          border: `1px solid ${COLORS.paperLine}`,
        }}
      >
        {["Graduate", "Dropout", "Enrolled"].map((k) => (
          <div
            key={k}
            title={`${k}: ${pct[k]}%`}
            style={{
              width: `${pct[k]}%`,
              background: CLASS_META[k].color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {pct[k] > 8 ? `${pct[k]}%` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedGroupRow({ label, n, split }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: COLORS.inkSoft,
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>n = {n.toLocaleString()}</span>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 26,
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${COLORS.paperLine}`,
        }}
      >
        {["Graduate", "Dropout", "Enrolled"].map((k) => (
          <div
            key={k}
            style={{
              width: `${split[k]}%`,
              background: CLASS_META[k].color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
            }}
          >
            {split[k] >= 12 ? `${split[k]}%` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBoxplot({ rows, domainMin, domainMax }) {
  const scale = (v) => ((v - domainMin) / (domainMax - domainMin)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {["Dropout", "Enrolled", "Graduate"].map((k) => {
        const r = rows[k];
        const meta = CLASS_META[k];
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 62,
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                color: meta.tx,
                flexShrink: 0,
              }}
            >
              {k}
            </span>
            <svg viewBox="0 0 100 14" style={{ flex: 1, height: 16, overflow: "visible" }} preserveAspectRatio="none">
              <line
                x1={scale(r.min)}
                x2={scale(r.max)}
                y1={7}
                y2={7}
                stroke={COLORS.inkSoft}
                strokeWidth={0.6}
              />
              <line x1={scale(r.min)} x2={scale(r.min)} y1={4} y2={10} stroke={COLORS.inkSoft} strokeWidth={0.6} />
              <line x1={scale(r.max)} x2={scale(r.max)} y1={4} y2={10} stroke={COLORS.inkSoft} strokeWidth={0.6} />
              <rect
                x={scale(r.q1)}
                y={2}
                width={Math.max(scale(r.q3) - scale(r.q1), 0.6)}
                height={10}
                fill={meta.color}
                opacity={0.85}
              />
              <line
                x1={scale(r.median)}
                x2={scale(r.median)}
                y1={1}
                y2={13}
                stroke={meta.tx}
                strokeWidth={1.1}
              />
            </svg>
            <span
              style={{
                width: 34,
                textAlign: "right",
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                color: COLORS.inkSoft,
                flexShrink: 0,
              }}
            >
              {r.median}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DivergingBar({ label, value }) {
  const pos = value >= 0;
  const widthPct = (Math.abs(value) / CORR_MAX) * 50;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
      <span
        style={{
          width: 160,
          fontSize: 12,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: COLORS.onNavySoft,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, position: "relative", height: 16, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.25)" }} />
        <div
          style={{
            position: "absolute",
            top: 1,
            bottom: 1,
            left: pos ? "50%" : `${50 - widthPct}%`,
            width: `${widthPct}%`,
            background: pos ? COLORS.graduate : COLORS.dropout,
            borderRadius: 2,
          }}
        />
      </div>
      <span
        style={{
          width: 48,
          fontSize: 11,
          fontFamily: "'IBM Plex Mono', monospace",
          color: pos ? "#8FC7AA" : "#E29B9B",
          flexShrink: 0,
        }}
      >
        {pos ? "+" : ""}
        {value.toFixed(3)}
      </span>
    </div>
  );
}

function ImportanceBar({ label, value, max }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.onNavySoft, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{value.toFixed(4)}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: COLORS.brass, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function ConfusionGrid({ cm }) {
  const max = Math.max(...cm.flat());
  return (
    <div style={{ display: "inline-block", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "56px repeat(3, 1fr)", gap: 3 }}>
        <div />
        {CM_LABELS.map((l) => (
          <div key={l} style={{ fontSize: 9, color: COLORS.onNavySoft, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace" }}>
            {l.slice(0, 4)}
          </div>
        ))}
        {cm.map((row, ri) => (
          <React.Fragment key={ri}>
            <div style={{ fontSize: 9, color: COLORS.onNavySoft, alignSelf: "center", fontFamily: "'IBM Plex Mono', monospace" }}>
              {CM_LABELS[ri].slice(0, 4)}
            </div>
            {row.map((v, ci) => {
              const intensity = v / max;
              const isDiag = ri === ci;
              return (
                <div
                  key={ci}
                  style={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    borderRadius: 3,
                    color: intensity > 0.5 ? "#fff" : COLORS.onNavy,
                    background: isDiag
                      ? `rgba(201,162,39,${0.25 + intensity * 0.55})`
                      : `rgba(178,58,58,${0.12 + intensity * 0.35})`,
                  }}
                >
                  {v}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontSize: 10, color: COLORS.onNavySoft, marginTop: 6, marginBottom: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        Rows = actual outcome, Columns = predicted outcome
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main component                                                        */
/* ---------------------------------------------------------------------- */

export default function StudentOutcomesDashboard() {
  const [inputs, setInputs] = useState(defaultInputs());
  const probs = useMemo(() => predict(inputs), [inputs]);
  const verdict = useMemo(() => probs.reduce((a, b) => (b.p > a.p ? b : a)), [probs]);

  const setVal = (key, val) => setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navyDeep} 100%)`,
        minHeight: "100%",
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: COLORS.onNavy,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.15);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #C9A227;
          border: 2px solid #EDE6D3;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #C9A227;
          border: 2px solid #EDE6D3;
          cursor: pointer;
        }
        .toggle-btn {
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: #A9AFC7;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          transition: all 0.15s ease;
        }
        .toggle-btn.active {
          background: #C9A227;
          border-color: #C9A227;
          color: #1B1500;
          font-weight: 600;
        }
        .navlink { color: #A9AFC7; text-decoration: none; font-size: 13px; font-family: 'IBM Plex Mono', monospace; }
        .navlink:hover { color: #EDE6D3; }
        a { color: inherit; }
        .stat-tile { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px 18px; }
        .paper-card { background: #E9E1C9; border-radius: 10px; padding: 20px 22px; color: #211A0F; }
        .navy-card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; padding: 22px; }
        @media (max-width: 860px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ---------------- NAV ---------------- */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(13,21,38,0.92)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, letterSpacing: "0.02em" }}>
            Registrar's Analysis &nbsp;·&nbsp; Cohort {TOTAL_STUDENTS.toLocaleString()}
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            <a className="navlink" href="#cohort">The cohort</a>
            <a className="navlink" href="#drivers">Drivers</a>
            <a className="navlink" href="#correlations">Signals</a>
            <a className="navlink" href="#models">Models</a>
            <a className="navlink" href="#predictor">Predictor</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* ---------------- HERO ---------------- */}
        <div style={{ padding: "64px 0 48px", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              color: COLORS.brass,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Predicting student dropout &amp; academic success
          </p>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(34px, 5.5vw, 58px)",
              lineHeight: 1.06,
              fontWeight: 600,
              margin: "0 0 20px",
              maxWidth: 780,
            }}
          >
            Evaluating machine learning models for predicting student dropout &amp; graduation outcomes
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: COLORS.onNavySoft, maxWidth: 680, margin: "0 0 32px" }}>
            A record of {TOTAL_STUDENTS.toLocaleString()} students at enrollment across two semesters ({TOTAL_FEATURES} features, {TOTAL_COLUMNS} total columns) was used to train three classifiers (Logistic Regression, Decision Tree, Random Forest). This dashboard displays the verified notebook evaluations and provides an interactive simulation tool.
          </p>
          <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Students in cohort", value: TOTAL_STUDENTS.toLocaleString(), icon: Users },
              { label: "Outcome categories", value: "3", icon: GraduationCap },
              { label: "Model features", value: `${TOTAL_FEATURES}`, icon: FileText },
              { label: "Top ROC-AUC (Random Forest)", value: "0.9040", icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="stat-tile">
                <s.icon size={16} color={COLORS.brass} strokeWidth={1.6} />
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, margin: "8px 0 2px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: COLORS.onNavySoft }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- COHORT ---------------- */}
        <div id="cohort" style={{ padding: "56px 0", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <SectionTag n="01" title="The cohort" icon={GraduationCap} />
          <p style={{ color: COLORS.onNavySoft, maxWidth: 640, marginBottom: 28, lineHeight: 1.7 }}>
            Roughly a third of the cohort dropped out ({TARGET_COUNTS.Dropout.toLocaleString()} students, {TARGET_PCT.Dropout}%). Almost exactly half graduated ({TARGET_COUNTS.Graduate.toLocaleString()} students, {TARGET_PCT.Graduate}%). The remaining {TARGET_PCT.Enrolled}% ({TARGET_COUNTS.Enrolled.toLocaleString()} students) were still enrolled when the record was taken.
          </p>
          <ProportionBar counts={TARGET_COUNTS} pct={TARGET_PCT} />
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 20 }}>
            {["Graduate", "Dropout", "Enrolled"].map((k) => (
              <div
                key={k}
                style={{
                  background: `${CLASS_META[k].color}1A`,
                  border: `1px solid ${CLASS_META[k].color}55`,
                  borderRadius: 10,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 12, color: COLORS.onNavySoft, marginBottom: 4 }}>{k}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600 }}>
                  {TARGET_PCT[k]}%
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.onNavySoft }}>
                  {TARGET_COUNTS[k].toLocaleString()} students
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- DRIVERS ---------------- */}
        <div id="drivers" style={{ padding: "56px 0", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <SectionTag n="02" title="What separates them" icon={BookOpen} />
          <p style={{ color: COLORS.onNavySoft, maxWidth: 640, marginBottom: 28, lineHeight: 1.7 }}>
            Academic performance and financial stability show strong empirical associations with outcome distributions. Boxes below show the interquartile range for each outcome group, with the line marking the median.
          </p>

          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 32 }}>
            {Object.entries(BOX).map(([feature, box]) => (
              <div key={feature} className="navy-card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: COLORS.onNavy }}>{feature}</div>
                <MiniBoxplot rows={box.rows} domainMin={box.domainMin} domainMax={box.domainMax} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.onNavySoft, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                  <span>{box.domainMin}</span>
                  <span>{box.domainMax}</span>
                </div>
              </div>
            ))}
            <div className="navy-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <AlertTriangle size={20} color={COLORS.brass} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.onNavySoft, margin: 0 }}>
                At least a quarter of eventual dropouts recorded <strong style={{ color: COLORS.onNavy, fontWeight: 500 }}>zero approved units and a zero grade</strong> by the end of their second semester — serving as an early indicator of academic difficulty.
              </p>
            </div>
          </div>

          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {CROSSTABS.map((c) => (
              <div key={c.feature} className="navy-card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <c.icon size={16} color={COLORS.brass} strokeWidth={1.6} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.feature}</span>
                </div>
                {c.groups.map((g) => (
                  <StackedGroupRow key={g.label} label={g.label} n={g.n} split={g.split} />
                ))}
                <p style={{ fontSize: 12.5, lineHeight: 1.6, color: COLORS.onNavySoft, margin: "10px 0 0" }}>{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- CORRELATIONS ---------------- */}
        <div id="correlations" style={{ padding: "56px 0", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <SectionTag n="03" title="Linear correlation with outcome" icon={TrendingUp} />
          <p style={{ color: COLORS.onNavySoft, maxWidth: 680, marginBottom: 28, lineHeight: 1.7 }}>
            Bivariate linear correlations with the target variable (encoded low-to-high as Dropout = 0, Enrolled = 1, Graduate = 2). Academic progress shows strong positive linear association, whereas financial debt, male gender, higher age, and application mode exhibit negative linear associations. <em>Note: Linear correlation measures bivariate association, not multi-class tree feature importance.</em>
          </p>
          <div className="navy-card">
            {CORRELATIONS.map((c) => (
              <DivergingBar key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </div>

        {/* ---------------- MODELS ---------------- */}
        <div id="models" style={{ padding: "56px 0", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <SectionTag n="04" title="Model evaluation leaderboard" icon={Award} />
          <p style={{ color: COLORS.onNavySoft, maxWidth: 680, marginBottom: 28, lineHeight: 1.7 }}>
            Three classifiers were evaluated on an 80/20 stratified test split (885 test samples). Logistic Regression achieved the highest accuracy (76.84%), while Random Forest achieved the highest weighted ROC-AUC (0.9040). Decision Tree recorded the lowest ROC-AUC (0.8628). None of these models are intended for autonomous admissions or academic decision-making.
          </p>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {MODELS.map((m) => (
              <div
                key={m.name}
                className="navy-card"
                style={{ position: "relative", border: m.badge ? `1px solid ${COLORS.brass}` : undefined }}
              >
                {m.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -11,
                      right: 16,
                      background: COLORS.brass,
                      color: "#1B1500",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {m.badge}
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: COLORS.onNavySoft, marginBottom: 16 }}>{m.subtitle}</div>
                <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600 }}>{m.accuracy}</div>
                    <div style={{ fontSize: 11, color: COLORS.onNavySoft }}>accuracy</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600 }}>{m.auc}</div>
                    <div style={{ fontSize: 11, color: COLORS.onNavySoft }}>ROC-AUC</div>
                  </div>
                </div>
                
                <ConfusionGrid cm={m.cm} />

                {/* Class-wise Precision / Recall / F1 */}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.onNavySoft, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Class Metrics (Precision / Recall / F1)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 40px)", gap: "4px 8px", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <div style={{ color: COLORS.onNavySoft }}>Class</div>
                    <div style={{ color: COLORS.onNavySoft, textAlign: "right" }}>P</div>
                    <div style={{ color: COLORS.onNavySoft, textAlign: "right" }}>R</div>
                    <div style={{ color: COLORS.onNavySoft, textAlign: "right" }}>F1</div>
                    {m.report.map((r) => (
                      <React.Fragment key={r.class}>
                        <div style={{ color: CLASS_META[r.class].tx, fontWeight: 500 }}>{r.class}</div>
                        <div style={{ textAlign: "right", color: COLORS.onNavy }}>{r.p}</div>
                        <div style={{ textAlign: "right", color: COLORS.onNavy }}>{r.r}</div>
                        <div style={{ textAlign: "right", color: COLORS.onNavy }}>{r.f1}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="navy-card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              Random Forest Gini Feature Importances (Top 8 features, calculated from trained RF model)
            </div>
            {RF_IMPORTANCE.map((f) => (
              <ImportanceBar key={f.label} label={f.label} value={f.value} max={RF_IMPORTANCE[0].value} />
            ))}
          </div>
        </div>

        {/* ---------------- PREDICTOR ---------------- */}
        <div id="predictor" style={{ padding: "56px 0 72px" }}>
          <SectionTag n="05" title="Interactive Logistic Regression Simulation" icon={SlidersHorizontal} />
          
          <div
            style={{
              background: "rgba(201,162,39,0.08)",
              border: `1px solid ${COLORS.brass}44`,
              borderRadius: 8,
              padding: "14px 18px",
              marginBottom: 28,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <Info size={18} color={COLORS.brass} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.onNavy }}>
              <strong>Simulation notice:</strong> The simulation exposes 10 primary factors below. The remaining 26 model features are held at fixed reference values (cohort averages), so this is an exploratory estimate rather than an exact reproduction of the full 36-feature prediction pipeline. This tool is designed for exploratory analysis and is not an official decision-making or admissions tool.
            </div>
          </div>

          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
            <div className="navy-card">
              {PREDICTOR_FEATURES.map((f) => (
                <div key={f.key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: COLORS.onNavy }}>{f.label}</span>
                    {f.type === "range" && (
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.brass }}>
                        {inputs[f.key]}
                      </span>
                    )}
                  </div>
                  {f.type === "range" ? (
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={inputs[f.key]}
                      onChange={(e) => setVal(f.key, parseFloat(e.target.value))}
                    />
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className={`toggle-btn ${inputs[f.key] === 0 ? "active" : ""}`}
                        onClick={() => setVal(f.key, 0)}
                      >
                        {f.offLabel}
                      </button>
                      <button
                        className={`toggle-btn ${inputs[f.key] === 1 ? "active" : ""}`}
                        onClick={() => setVal(f.key, 1)}
                      >
                        {f.onLabel}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setInputs(defaultInputs())}
                className="toggle-btn"
                style={{ marginTop: 4 }}
              >
                Reset to cohort average
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <div
                className="paper-card"
                style={{
                  border: `1.5px solid ${COLORS.paperLine}`,
                  boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderBottom: `1px solid ${COLORS.paperLine}`,
                    paddingBottom: 10,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600 }}>
                      Simulation transcript
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.inkSoft }}>
                      Exploratory model estimate (Not for official decisions)
                    </div>
                  </div>
                </div>

                {probs
                  .slice()
                  .sort((a, b) => b.p - a.p)
                  .map((row) => {
                    const meta = CLASS_META[row.label];
                    return (
                      <div key={row.label} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                          <span
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 12,
                              fontWeight: 600,
                              color: meta.tx,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {row.label}
                          </span>
                          <span style={{ flex: 1, borderBottom: `1px dotted ${COLORS.paperLine}`, position: "relative", top: -3 }} />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                            {(row.p * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ height: 7, background: "rgba(0,0,0,0.08)", borderRadius: 3 }}>
                          <div
                            style={{
                              width: `${row.p * 100}%`,
                              height: "100%",
                              background: meta.color,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div
                style={{
                  position: "absolute",
                  top: -18,
                  right: -14,
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: `2.5px solid ${CLASS_META[verdict.label].tx}`,
                  color: CLASS_META[verdict.label].tx,
                  background: `${CLASS_META[verdict.label].bg}EE`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "rotate(-9deg)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  textAlign: "center",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                }}
              >
                <Stamp size={14} style={{ marginBottom: 2 }} />
                <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.15, textTransform: "uppercase" }}>
                  {verdict.label}
                </div>
                <div style={{ fontSize: 9 }}>{(verdict.p * 100).toFixed(0)}% estimate</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- FOOTER ---------------- */}
        <div style={{ padding: "28px 0 56px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: 12, lineHeight: 1.8, color: COLORS.onNavySoft, maxWidth: 780 }}>
            Data: Realinho, V., Vieira Martins, M., Machado, J. &amp; Baptista, L. (2021),
            <em> Predict students' dropout and academic success</em>, UCI Machine Learning
            Repository. Dataset contains 4,424 records across 36 predictor features and 1 target column (37 total). Models were evaluated using scikit-learn with an 80/20 stratified split (<code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>random_state=42</code>). The interactive predictor is an exploratory simulation, not an official academic counseling or admissions decision tool.
          </p>
        </div>
      </div>
    </div>
  );
}
