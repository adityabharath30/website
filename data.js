// Regions: architectural layers behind everything
const regions = [
  { id: "r-data",  label: "Data Layer",        x: 90,  y: 150, width: 340, height: 300 },
  { id: "r-ml",    label: "Modeling Layer",    x: 380, y: 80,  width: 360, height: 260 },
  { id: "r-cons",  label: "Consumption Layer", x: 380, y: 355, width: 360, height: 190 },
  { id: "r-infra", label: "Infrastructure",    x: 720, y: 150, width: 220, height: 300 }
];

// Nodes: micro-tints (paper-safe), no loud gradients
const nodes = [
  {
    id: "de",
    label: "Data Engineering",
    x: 260,
    y: 300,
    short: "SQL • pipelines • migration",
    description: "Pipelines, data validation, and platform migrations with reliability and performance in mind.",
    tint: "rgba(47,91,234,.06)"   // cool paper-blue
  },
  {
    id: "ml",
    label: "ML Systems",
    x: 560,
    y: 200,
    short: "build → deploy → operate",
    description: "End-to-end ML work: modeling, evaluation, and deployment patterns that survive production.",
    tint: "rgba(47,91,234,.05)"
  },
  {
    id: "analytics",
    label: "Analytics",
    x: 560,
    y: 440,
    short: "KPIs • dashboards • insight",
    description: "Analytics delivery: KPI design, dashboards, and decision support.",
    tint: "rgba(91,111,58,.05)"   // olive paper-wash
  },
  {
    id: "infra",
    label: "Infrastructure",
    x: 830,
    y: 300,
    short: "cloud • platforms • cost",
    description: "Cloud and platform surface area across data + ML systems.",
    tint: "rgba(91,111,58,.06)"
  }
];

// Edge semantics
const edges = [
  { from: "de", to: "ml",        type: "data",    label: "curated features / training inputs" },
  { from: "de", to: "analytics", type: "data",    label: "modeled datasets / reporting tables" },
  { from: "ml", to: "infra",     type: "control", label: "deploy / monitor / runtime" },
  { from: "analytics", to: "infra", type: "control", label: "BI + platform dependencies" }
];

/**
 * Items: proof objects. Includes both Hiring + Technical view content.
 * Dummy bullets/metrics are intentionally editable.
 *
 * artifact: "dashboard" | "code" | "extension" | "diagram" | "report"
 * links: { code, demo, writeup }
 */
const items = [
  // Projects
  {
    id: "p-llm-dashboard",
    type: "project",
    title: "LLM Analytics Dashboard",
    meta: "Python · Streamlit · OpenAI · PostgreSQL",
    desc: "Interactive dashboard for prompt logs: token usage, latency, and cost across models with persistent logging.",
    metric: "Impact: <strong>+XX%</strong> faster debugging · <strong>-$X</strong> cost waste prevented (dummy)",
    tags: ["ml", "de", "analytics", "infra"],
    artifact: "dashboard",
    chips: ["LLM ops", "Observability", "Cost/latency"],
    links: {
      code: "https://github.com/adityabharath30/llm-analytics-dashboard",
      demo: "#",
      writeup: "#"
    },
    hiringBullets: [
      "Built an end-to-end workflow that surfaces the right metrics at the right time (dummy).",
      "Designed for recruiter clarity: one click shows proof + scope (dummy).",
      "Operationalized logging + cost visibility (dummy)."
    ],
    technicalBullets: [
      "Schema + indexing strategy for logs & aggregates (dummy).",
      "Token/cost estimation module with caching (dummy).",
      "UI patterns: filters, drilldowns, export (dummy)."
    ],
    roleOrder: 110
  },
  {
    id: "p-bullseye",
    type: "project",
    title: "Bullseye (Chrome Extension)",
    meta: "OpenAI · Prompting · Product",
    desc: "AI-assisted interpretation of financial news emphasizing first/second-order impacts and clear reasoning.",
    metric: "Metric: <strong>XX</strong> weekly active users / or demo usage (dummy)",
    tags: ["ml", "analytics"],
    artifact: "extension",
    chips: ["Prompting", "Product thinking"],
    links: { demo: "https://usebullseye.app", code: "#", writeup: "#" },
    hiringBullets: [
      "Shipped a user-facing tool with tight feedback loop (dummy).",
      "Optimized for clarity & trust in output format (dummy)."
    ],
    technicalBullets: [
      "Prompt templates + guardrails + response formatting (dummy).",
      "Client-side integration architecture (dummy)."
    ],
    roleOrder: 75
  },
  {
    id: "p-nbaduofit",
    type: "project",
    title: "NBA DuoFit",
    meta: "Python · PCA · KMeans · Streamlit",
    desc: "Interactive app forecasting pair performance with similarity models and exploration of combinations.",
    metric: "Metric: explored <strong>500+</strong> combinations (dummy)",
    tags: ["ml", "analytics"],
    artifact: "diagram",
    chips: ["Clustering", "Visualization"],
    links: { code: "https://github.com/adityabharath30/nbaduofit", demo: "#", writeup: "#" },
    hiringBullets: [
      "Turns a messy problem into an explorable interface (dummy)."
    ],
    technicalBullets: [
      "Dimensionality reduction pipeline + clustering evaluation (dummy).",
      "Feature engineering and similarity scoring (dummy)."
    ],
    roleOrder: 55
  },

  // Experience
  {
    id: "e-cvs-de",
    type: "experience",
    title: "CVS Health — Data Engineer",
    meta: "Jul 2025 – Present • New York, NY",
    desc: "Monitoring automation, migration support, SQL validation and efficiency checks across teams.",
    metric: "Scale: supported <strong>20+</strong> engineers · <strong>10+</strong> migrations (dummy)",
    tags: ["de", "infra", "analytics"],
    artifact: "report",
    chips: ["SQL", "GCP", "Migration"],
    links: { writeup: "#", code: "#", demo: "#" },
    hiringBullets: [
      "Own reliability: monitors, alerts, and automation that reduce manual work (dummy).",
      "Cross-team impact: unblocked multiple project migrations (dummy)."
    ],
    technicalBullets: [
      "Validation queries, quality checks, and performance patterns (dummy).",
      "Migration mapping and compatibility testing (dummy)."
    ],
    roleOrder: 120
  },
  {
    id: "e-tata-1mg",
    type: "experience",
    title: "Tata 1MG — Data Science Intern",
    meta: "Jul 2023 – Aug 2023 • New Delhi, India",
    desc: "End-to-end ML pipeline to forecast monthly user return; deployed via API consumed by business apps.",
    metric: "Result: <strong>~83%</strong> forecast accuracy (dummy) · validated on <strong>3.2M+</strong> users (dummy)",
    tags: ["ml", "infra", "de"],
    artifact: "code",
    chips: ["API deployment", "Scale", "Modeling"],
    links: { writeup: "#", code: "#", demo: "#" },
    hiringBullets: [
      "Delivered production-facing ML, not just notebooks (dummy).",
      "Communicated model tradeoffs in business terms (dummy)."
    ],
    technicalBullets: [
      "Training/validation split strategy and drift considerations (dummy).",
      "Serving API + monitoring hooks (dummy)."
    ],
    roleOrder: 105
  },
  {
    id: "e-cvs-intern",
    type: "experience",
    title: "CVS Health — Data Engineering Intern",
    meta: "Jun 2024 – Aug 2024 • Hartford, CT",
    desc: "Built dashboards and improved report performance through query + data model optimization.",
    metric: "Result: <strong>+19.8%</strong> performance improvement (dummy)",
    tags: ["analytics", "de"],
    artifact: "dashboard",
    chips: ["Tableau", "Performance"],
    links: { writeup: "#", code: "#", demo: "#" },
    hiringBullets: [
      "Built dashboards used by real stakeholders (dummy).",
      "Improved performance by targeting the bottleneck (dummy)."
    ],
    technicalBullets: [
      "Extract optimization, calculated fields cleanup, model tuning (dummy)."
    ],
    roleOrder: 70
  },
  {
    id: "e-mmt",
    type: "experience",
    title: "MakeMyTrip — Data Science Intern",
    meta: "Aug 2022 – Sep 2022 • New Delhi, India",
    desc: "Demand forecasting and recommendation insights with KPI reporting.",
    metric: "Result: <strong>~85%</strong> forecasting performance (dummy)",
    tags: ["analytics", "ml"],
    artifact: "report",
    chips: ["Time series", "Forecasting"],
    links: { writeup: "#", code: "#", demo: "#" },
    hiringBullets: [
      "Built forecasting work that influenced planning (dummy)."
    ],
    technicalBullets: [
      "ARIMA baselines + seasonality handling (dummy)."
    ],
    roleOrder: 45
  }
];
