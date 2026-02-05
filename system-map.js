/**
 * System Map - Interactive SVG Network Graph
 */

const svg = document.getElementById("system-map");
const tooltip = document.getElementById("tooltip");
const drawerBody = document.getElementById("drawerBody");
const drawerClose = document.getElementById("drawerClose");
const drawerCrumb = document.getElementById("drawerCrumb");
const canvasCta = document.getElementById("canvasCta");
const pulseDot = canvasCta ? canvasCta.querySelector(".pulse-dot") : null;

const NS = "http://www.w3.org/2000/svg";
const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

let activeId = null;
let hasInteracted = false;

/* ==========================================================================
   Utility Functions
   ========================================================================== */

function el(name) {
  return document.createElementNS(NS, name);
}

function escapeHTML(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ==========================================================================
   CTA State Management
   ========================================================================== */

function stopPulse() {
  if (!pulseDot) return;
  pulseDot.style.animation = "none";
}

function deEmphasizeCta() {
  if (!canvasCta) return;
  canvasCta.classList.add("interacted");
}

/* ==========================================================================
   Scroll Lock (Safari scroll-jump prevention)
   ========================================================================== */

function freezeScroll(callback) {
  const x = window.scrollX || 0;
  const y = window.scrollY || 0;

  callback();

  // Restore scroll position multiple times to catch Safari's delayed scroll
  window.scrollTo(x, y);
  requestAnimationFrame(() => {
    window.scrollTo(x, y);
    requestAnimationFrame(() => window.scrollTo(x, y));
  });
  setTimeout(() => window.scrollTo(x, y), 0);
  setTimeout(() => window.scrollTo(x, y), 50);
  setTimeout(() => window.scrollTo(x, y), 100);
}

/* ==========================================================================
   Drawer: Empty State
   ========================================================================== */

function emptyDrawer() {
  drawerCrumb.innerHTML = `<strong>Start here</strong><span class="sep">·</span>Click a node to explore`;
  drawerBody.innerHTML = `
    <div class="empty">
      <div class="empty-title">Start here</div>
      <div class="empty-text"><strong>Click a domain</strong> to view relevant projects and experience.</div>
    </div>
  `;
}

/* ==========================================================================
   SVG Definitions (patterns, markers)
   ========================================================================== */

function defineDefs() {
  const defs = el("defs");

  // Small grid pattern
  const pattern = el("pattern");
  pattern.setAttribute("id", "grid");
  pattern.setAttribute("width", "50");
  pattern.setAttribute("height", "50");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  
  const p1 = el("path");
  p1.setAttribute("d", "M 50 0 L 0 0 0 50");
  p1.setAttribute("fill", "none");
  p1.setAttribute("stroke", "var(--grid-line)");
  p1.setAttribute("stroke-width", "1");
  pattern.appendChild(p1);

  // Large grid pattern
  const pattern2 = el("pattern");
  pattern2.setAttribute("id", "gridLarge");
  pattern2.setAttribute("width", "200");
  pattern2.setAttribute("height", "200");
  pattern2.setAttribute("patternUnits", "userSpaceOnUse");
  
  const p2 = el("path");
  p2.setAttribute("d", "M 200 0 L 0 0 0 200");
  p2.setAttribute("fill", "none");
  p2.setAttribute("stroke", "var(--grid-line-strong)");
  p2.setAttribute("stroke-width", "1");
  pattern2.appendChild(p2);

  // Arrow marker (default)
  const mk = el("marker");
  mk.setAttribute("id", "arrow");
  mk.setAttribute("markerWidth", "10");
  mk.setAttribute("markerHeight", "10");
  mk.setAttribute("refX", "7");
  mk.setAttribute("refY", "3");
  mk.setAttribute("orient", "auto");
  
  const mkPath = el("path");
  mkPath.setAttribute("d", "M0,0 L0,6 L6,3 z");
  mkPath.setAttribute("fill", "var(--border-strong)");
  mk.appendChild(mkPath);

  // Arrow marker (active - data)
  const mkA = el("marker");
  mkA.setAttribute("id", "arrowActive");
  mkA.setAttribute("markerWidth", "10");
  mkA.setAttribute("markerHeight", "10");
  mkA.setAttribute("refX", "7");
  mkA.setAttribute("refY", "3");
  mkA.setAttribute("orient", "auto");
  
  const mkPathA = el("path");
  mkPathA.setAttribute("d", "M0,0 L0,6 L6,3 z");
  mkPathA.setAttribute("fill", "var(--accent)");
  mkA.appendChild(mkPathA);

  // Arrow marker (active - ops)
  const mkOps = el("marker");
  mkOps.setAttribute("id", "arrowOpsActive");
  mkOps.setAttribute("markerWidth", "10");
  mkOps.setAttribute("markerHeight", "10");
  mkOps.setAttribute("refX", "7");
  mkOps.setAttribute("refY", "3");
  mkOps.setAttribute("orient", "auto");
  
  const mkPathOps = el("path");
  mkPathOps.setAttribute("d", "M0,0 L0,6 L6,3 z");
  mkPathOps.setAttribute("fill", "var(--ops)");
  mkOps.appendChild(mkPathOps);

  defs.appendChild(pattern);
  defs.appendChild(pattern2);
  defs.appendChild(mk);
  defs.appendChild(mkA);
  defs.appendChild(mkOps);
  svg.appendChild(defs);
}

/* ==========================================================================
   Background Grid
   ========================================================================== */

function drawBackground() {
  const bg = el("rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", "1000");
  bg.setAttribute("height", "600");
  bg.setAttribute("fill", "url(#gridLarge)");
  svg.appendChild(bg);

  const bg2 = el("rect");
  bg2.setAttribute("x", "0");
  bg2.setAttribute("y", "0");
  bg2.setAttribute("width", "1000");
  bg2.setAttribute("height", "600");
  bg2.setAttribute("fill", "url(#grid)");
  svg.appendChild(bg2);
}

/* ==========================================================================
   Region Labels (layer backgrounds)
   ========================================================================== */

function drawRegions() {
  const g = el("g");
  g.setAttribute("aria-hidden", "true");

  for (const r of regions) {
    const rect = el("rect");
    rect.setAttribute("x", r.x);
    rect.setAttribute("y", r.y);
    rect.setAttribute("width", r.width);
    rect.setAttribute("height", r.height);
    rect.setAttribute("rx", "8");
    rect.setAttribute("fill", "rgba(252, 251, 247, 0.5)");
    rect.setAttribute("stroke", "rgba(26, 31, 38, 0.06)");
    rect.setAttribute("stroke-width", "1");
    g.appendChild(rect);

    const label = el("text");
    label.setAttribute("x", r.x + 10);
    label.setAttribute("y", r.y + 18);
    label.setAttribute("fill", "rgba(26, 31, 38, 0.36)");
    label.setAttribute("font-size", "10.5");
    label.setAttribute("font-weight", "600");
    label.setAttribute("letter-spacing", "0.12em");
    label.textContent = r.label.toUpperCase();
    g.appendChild(label);
  }

  svg.appendChild(g);
}

/* ==========================================================================
   Edge Helpers
   ========================================================================== */

function edgeBaseStroke(type) {
  return type === "control" ? "var(--edge-ops)" : "var(--edge-data)";
}

function edgeActiveStroke(type) {
  return type === "control" ? "var(--edge-ops-active)" : "var(--edge-data-active)";
}

function edgeActiveMarker(type) {
  return type === "control" ? "url(#arrowOpsActive)" : "url(#arrowActive)";
}

function makeEdgeLabelChip(x, y, text) {
  const g = el("g");
  g.classList.add("edge-label");
  g.setAttribute("transform", `translate(${x},${y})`);
  g.setAttribute("opacity", "0");
  g.setAttribute("pointer-events", "none");

  const padX = 8;
  const padY = 5;

  const t = el("text");
  t.setAttribute("x", "0");
  t.setAttribute("y", "0");
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "middle");
  t.setAttribute("font-size", "11");
  t.setAttribute("font-weight", "600");
  t.setAttribute("fill", "rgba(26, 31, 38, 0.7)");
  t.textContent = text;

  g.appendChild(t);
  svg.appendChild(g);
  const bb = t.getBBox();
  svg.removeChild(g);

  const rect = el("rect");
  rect.setAttribute("x", `${bb.x - padX}`);
  rect.setAttribute("y", `${bb.y - padY}`);
  rect.setAttribute("width", `${bb.width + padX * 2}`);
  rect.setAttribute("height", `${bb.height + padY * 2}`);
  rect.setAttribute("rx", "8");
  rect.setAttribute("fill", "rgba(252, 251, 247, 0.96)");
  rect.setAttribute("stroke", "rgba(26, 31, 38, 0.1)");
  rect.setAttribute("stroke-width", "1");

  const g2 = el("g");
  g2.classList.add("edge-label");
  g2.setAttribute("transform", `translate(${x},${y})`);
  g2.setAttribute("opacity", "0");
  g2.setAttribute("pointer-events", "none");
  g2.appendChild(rect);
  g2.appendChild(t);

  return g2;
}

/* ==========================================================================
   Draw Edges
   ========================================================================== */

function drawEdges() {
  const g = el("g");
  g.setAttribute("aria-hidden", "true");

  const labelLayer = el("g");
  labelLayer.setAttribute("aria-hidden", "true");

  for (const edge of edges) {
    const from = nodeById[edge.from];
    const to = nodeById[edge.to];

    const line = el("line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    line.classList.add("edge");
    line.dataset.from = edge.from;
    line.dataset.to = edge.to;
    line.dataset.type = edge.type;

    line.setAttribute("stroke", edgeBaseStroke(edge.type));
    line.setAttribute("stroke-width", edge.type === "control" ? "1.5" : "1.8");
    if (edge.type === "control") {
      line.setAttribute("stroke-dasharray", "5 4");
    }
    line.setAttribute("marker-end", "url(#arrow)");

    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const chip = makeEdgeLabelChip(mx, my - 12, edge.label);
    labelLayer.appendChild(chip);

    line.addEventListener("mouseenter", (e) => {
      showTooltip(e, "Edge", edge.label);
      chip.setAttribute("opacity", "1");
    });
    line.addEventListener("mousemove", moveTooltip);
    line.addEventListener("mouseleave", () => {
      hideTooltip();
      chip.setAttribute("opacity", "0");
    });

    g.appendChild(line);
  }

  svg.appendChild(g);
  svg.appendChild(labelLayer);
}

/* ==========================================================================
   Draw Nodes
   ========================================================================== */

function drawNodes() {
  const g = el("g");

  for (const node of nodes) {
    const group = el("g");
    group.classList.add("node");
    group.setAttribute("transform", `translate(${node.x},${node.y})`);
    group.dataset.id = node.id;

    // Prevent default on mousedown to stop Safari focus/scroll
    group.addEventListener("mousedown", (e) => {
      e.preventDefault();
    }, { passive: false });

    group.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      freezeScroll(() => selectNode(node.id));
    });

    // Outer ring
    const ring = el("circle");
    ring.setAttribute("r", "40");
    ring.setAttribute("fill", "rgba(255, 255, 255, 0)");
    ring.setAttribute("stroke", "rgba(26, 31, 38, 0.08)");
    ring.setAttribute("stroke-width", "1");
    ring.classList.add("node-ring");
    group.appendChild(ring);

    // Main circle
    const circle = el("circle");
    circle.setAttribute("r", "32");
    circle.setAttribute("fill", node.tint || "rgba(252, 251, 247, 0.96)");
    circle.setAttribute("stroke", "rgba(26, 31, 38, 0.18)");
    circle.setAttribute("stroke-width", "1.5");
    circle.classList.add("node-circle");
    group.appendChild(circle);

    // Node label
    const text = el("text");
    text.setAttribute("y", "-3");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "12.5");
    text.setAttribute("font-weight", "750");
    text.setAttribute("fill", "var(--fg)");
    text.setAttribute("letter-spacing", "-0.01em");
    text.textContent = node.label;
    group.appendChild(text);

    // Sub-label
    const sub = el("text");
    sub.setAttribute("y", "12");
    sub.setAttribute("text-anchor", "middle");
    sub.setAttribute("dominant-baseline", "middle");
    sub.setAttribute("font-size", "10");
    sub.setAttribute("font-weight", "500");
    sub.setAttribute("fill", "var(--fg-muted)");
    sub.textContent = node.short;
    group.appendChild(sub);

    // Tooltip events
    group.addEventListener("mouseenter", (e) => showTooltip(e, node.label, node.short));
    group.addEventListener("mousemove", moveTooltip);
    group.addEventListener("mouseleave", hideTooltip);

    g.appendChild(group);
  }

  svg.appendChild(g);
}

/* ==========================================================================
   Inject SVG-specific CSS
   ========================================================================== */

function injectSvgCss() {
  const style = document.createElement("style");
  style.textContent = `
    .node {
      cursor: pointer;
      transition: opacity 180ms ease;
    }
    .node text {
      pointer-events: none;
    }
    .node .node-ring {
      transition: stroke 180ms ease, stroke-width 180ms ease;
    }
    .node .node-circle {
      transition: stroke 180ms ease, stroke-width 180ms ease;
    }
    .node:hover .node-ring {
      stroke: rgba(47, 91, 234, 0.2);
      stroke-width: 2;
    }
    .node:hover .node-circle {
      stroke: rgba(47, 91, 234, 0.4);
    }
    .node.dim {
      opacity: 0.22;
    }
    .node.dim:hover {
      opacity: 0.4;
    }
    .node.neighbor {
      opacity: 0.75;
    }
    .node.active .node-circle {
      stroke: var(--accent);
      stroke-width: 2.5;
    }
    .node.active .node-ring {
      stroke: rgba(47, 91, 234, 0.25);
      stroke-width: 2;
    }
    .edge {
      transition: stroke 180ms ease, opacity 180ms ease, stroke-width 180ms ease;
    }
    .edge.dim {
      opacity: 0.12;
    }
    .edge.neighbor {
      opacity: 0.55;
    }
    .edge.active {
      opacity: 1 !important;
    }
    .edge-label {
      transition: opacity 150ms ease;
    }
  `;
  document.head.appendChild(style);
}

/* ==========================================================================
   Tooltip
   ========================================================================== */

function showTooltip(evt, title, body) {
  tooltip.innerHTML = `
    <p class="t-title">${escapeHTML(title)}</p>
    <p class="t-body">${escapeHTML(body)}</p>
  `;
  tooltip.classList.remove("hidden");
  moveTooltip(evt);
}

function moveTooltip(evt) {
  const rect = svg.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;

  const pad = 12;
  const tw = tooltip.offsetWidth || 240;
  const th = tooltip.offsetHeight || 60;

  let left = x + pad;
  let top = y + pad;

  if (left + tw > rect.width - pad) left = x - tw - pad;
  if (top + th > rect.height - pad) top = y - th - pad;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  tooltip.classList.add("hidden");
}

/* ==========================================================================
   Drawer Rendering
   ========================================================================== */

function iconSvg(kind) {
  const stroke = "rgba(26, 31, 38, 0.65)";
  const fillA = "rgba(47, 91, 234, 0.08)";
  const fillB = "rgba(61, 107, 46, 0.08)";

  if (kind === "dashboard") {
    return `<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="${fillA}" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M6 13v-3M10 13V7M14 13v-5" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`;
  }
  if (kind === "extension") {
    return `<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="3" fill="${fillA}" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M7 10h6" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M10 7v6" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`;
  }
  if (kind === "diagram") {
    return `<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="6" cy="6" r="2" fill="${fillB}" stroke="${stroke}" stroke-width="1.2"/>
      <circle cx="14" cy="7.5" r="2" fill="${fillA}" stroke="${stroke}" stroke-width="1.2"/>
      <circle cx="10" cy="14" r="2" fill="${fillB}" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M7.8 7.1 L12.2 8.6 M7.2 7.8 L9.2 12.2 M13.2 9.3 L10.8 12.4" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
    </svg>`;
  }
  if (kind === "report") {
    return `<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6 3h6l2 2v12H6z" fill="${fillB}" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M12 3v2h2" stroke="${stroke}" stroke-width="1.1" fill="none"/>
      <path d="M7.5 9h5M7.5 12h5" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
    <rect x="3" y="4" width="14" height="12" rx="3" fill="${fillB}" stroke="${stroke}" stroke-width="1.2"/>
    <path d="M9 8L7 10l2 2M11 8l2 2-2 2" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function renderLinksRow(links) {
  if (!links) return "";
  const out = [];
  if (links.code && links.code !== "#") {
    out.push(`<a class="smalllink" href="${links.code}" target="_blank" rel="noreferrer">Code</a>`);
  }
  if (links.demo && links.demo !== "#") {
    out.push(`<a class="smalllink" href="${links.demo}" target="_blank" rel="noreferrer">Demo</a>`);
  }
  if (links.writeup && links.writeup !== "#") {
    out.push(`<a class="smalllink" href="${links.writeup}" target="_blank" rel="noreferrer">Write-up</a>`);
  }
  return out.length ? `<div class="links-row">${out.join("")}</div>` : "";
}

function renderItem(it) {
  const title = it.links?.code && it.links.code !== "#"
    ? `<a href="${it.links.code}" target="_blank" rel="noreferrer">${escapeHTML(it.title)}</a>`
    : escapeHTML(it.title);

  const bullets = (it.hiringBullets || it.technicalBullets || []).slice(0, 3);
  const bulletHtml = bullets.length
    ? `<ul class="bullets">${bullets.map(b => `<li>${escapeHTML(b)}</li>`).join("")}</ul>`
    : "";

  const chips = (it.chips || []).slice(0, 3).map(c => {
    const opsy = /observ|monitor|cost|deploy|infra/i.test(c);
    return `<span class="tag ${opsy ? "ops" : ""}">${escapeHTML(c)}</span>`;
  }).join("");

  return `
    <div class="item" data-item-id="${escapeHTML(it.id)}">
      <div class="art">${iconSvg(it.artifact)}</div>
      <div class="item-main">
        <div class="item-top">
          <div class="item-title">${title}</div>
          <div class="item-meta">${escapeHTML(it.meta)}</div>
        </div>
        ${it.metric ? `<div class="metric">${it.metric}</div>` : ""}
        <div class="item-desc">${escapeHTML(it.desc)}</div>
        ${bulletHtml}
        ${chips ? `<div class="item-tags">${chips}</div>` : ""}
        ${renderLinksRow(it.links)}
      </div>
    </div>
  `;
}

function renderDrawerForNode(id) {
  const node = nodeById[id];
  drawerCrumb.innerHTML = `<strong>${escapeHTML(node.label)}</strong><span class="sep">·</span>${escapeHTML(node.short)}`;

  const relevant = items
    .filter(it => it.tags.includes(id))
    .sort((a, b) => (b.roleOrder ?? 0) - (a.roleOrder ?? 0));

  const projects = relevant.filter(it => it.type === "project");
  const exps = relevant.filter(it => it.type === "experience");

  const projHtml = projects.length ? projects.map(renderItem).join("") : `<div class="empty-text">—</div>`;
  const expHtml = exps.length ? exps.map(renderItem).join("") : `<div class="empty-text">—</div>`;

  drawerBody.innerHTML = `
    <div class="block">
      <h3>Projects</h3>
      ${projHtml}
    </div>
    <div class="block">
      <h3>Experience</h3>
      ${expHtml}
    </div>
  `;

  wireDrawerItemHover();
}

/* ==========================================================================
   Graph Highlighting
   ========================================================================== */

function neighborSetForNode(id) {
  const s = new Set([id]);
  for (const e of edges) {
    if (e.from === id) s.add(e.to);
    if (e.to === id) s.add(e.from);
  }
  return s;
}

function highlightGraphByNodes(nodeIds) {
  svg.querySelectorAll(".node").forEach(n => {
    const nid = n.dataset.id;
    const isIn = nodeIds.has(nid);
    n.classList.toggle("active", activeId === nid);
    n.classList.toggle("neighbor", isIn && activeId !== nid);
    n.classList.toggle("dim", !isIn && activeId !== nid);
  });

  svg.querySelectorAll(".edge").forEach(e => {
    const from = e.dataset.from;
    const to = e.dataset.to;
    const type = e.dataset.type;
    const keep = nodeIds.has(from) && nodeIds.has(to);
    const isActive = from === activeId || to === activeId;

    e.classList.toggle("dim", !keep);
    e.classList.toggle("neighbor", keep && !isActive);
    e.classList.toggle("active", isActive);

    if (isActive) {
      e.setAttribute("stroke", edgeActiveStroke(type));
      e.setAttribute("stroke-width", type === "control" ? "2" : "2.5");
      e.setAttribute("marker-end", edgeActiveMarker(type));
    } else {
      e.setAttribute("stroke", edgeBaseStroke(type));
      e.setAttribute("stroke-width", type === "control" ? "1.5" : "1.8");
      e.setAttribute("marker-end", "url(#arrow)");
    }
  });
}

function selectNode(id) {
  activeId = id;

  if (!hasInteracted) {
    hasInteracted = true;
    stopPulse();
    deEmphasizeCta();
  }

  highlightGraphByNodes(neighborSetForNode(id));
  renderDrawerForNode(id);
}

function clearActive() {
  activeId = null;

  svg.querySelectorAll(".node").forEach(n => {
    n.classList.remove("active", "dim", "neighbor");
  });

  svg.querySelectorAll(".edge").forEach(e => {
    e.classList.remove("active", "dim", "neighbor");
    e.setAttribute("stroke", edgeBaseStroke(e.dataset.type));
    e.setAttribute("stroke-width", e.dataset.type === "control" ? "1.5" : "1.8");
    e.setAttribute("marker-end", "url(#arrow)");
  });

  emptyDrawer();
}

/* ==========================================================================
   Drawer Item Hover → Graph Highlight
   ========================================================================== */

function wireDrawerItemHover() {
  const els = drawerBody.querySelectorAll("[data-item-id]");
  els.forEach(elm => {
    const id = elm.getAttribute("data-item-id");
    const it = items.find(x => x.id === id);
    if (!it) return;

    const itemNodeIds = new Set(it.tags);

    elm.addEventListener("mouseenter", () => {
      elm.classList.add("is-hover");
      if (activeId) itemNodeIds.add(activeId);
      highlightGraphByNodes(itemNodeIds);
    });

    elm.addEventListener("mouseleave", () => {
      elm.classList.remove("is-hover");
      if (activeId) highlightGraphByNodes(neighborSetForNode(activeId));
    });
  });
}

/* ==========================================================================
   Global Event Wiring
   ========================================================================== */

function wireGlobal() {
  // Prevent focus on SVG
  svg.setAttribute("focusable", "false");

  // Prevent default on SVG mousedown
  svg.addEventListener("mousedown", (e) => {
    e.preventDefault();
  }, { passive: false });

  // Click on empty space clears selection
  svg.addEventListener("click", (e) => {
    const clickedNode = e.target.closest(".node");
    if (!clickedNode) {
      freezeScroll(() => clearActive());
    }
  });

  // Escape key clears selection
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeId) {
      freezeScroll(() => clearActive());
    }
  });

  // Drawer close button
  drawerClose.addEventListener("click", (e) => {
    e.preventDefault();
    freezeScroll(() => clearActive());
  });

  drawerClose.addEventListener("mousedown", (e) => {
    e.preventDefault();
  }, { passive: false });

  // Initialize
  emptyDrawer();
}

/* ==========================================================================
   Initialize
   ========================================================================== */

defineDefs();
drawBackground();
drawRegions();
drawEdges();
drawNodes();
injectSvgCss();
wireGlobal();
