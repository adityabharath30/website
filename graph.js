/**
 * Interactive Skill Network Graph
 *
 * A force-directed network visualization with:
 * - Click/keyboard selection
 * - Dynamic panel content updates
 * - Smooth animations
 * - Full accessibility support
 */

(function() {
  'use strict';

  // ==========================================================================
  // Data Configuration
  // ==========================================================================

  const NODES = [
    {
      id: 'ml-systems',
      label: 'ML Systems',
      shortDesc: 'ML Models that are explainable and reflect user needs.',
      x: 0.28,
      y: 0.28
    },
    {
      id: 'data-engineering',
      label: 'Data Engineering',
      shortDesc: 'Reliable pipelines + modeling that keep analytics and ML fed with trustworthy data.',
      x: 0.72,
      y: 0.25
    },
    {
      id: 'mlops',
      label: 'MLOps & Infra',
      shortDesc: 'Bridging ML to infra: CI/CD, deployment, observability, and cost-aware operations.',
      x: 0.5,
      y: 0.52
    },
    {
      id: 'analytics',
      label: 'Analytics & BI',
      shortDesc: 'Turning messy data into metrics, experiments, and dashboards that drive decisions.',
      x: 0.22,
      y: 0.72
    },
    {
      id: 'product',
      label: 'Product Thinking',
      shortDesc: 'Clear narratives and specs: aligning engineers + stakeholders on what to build and why.',
      x: 0.78,
      y: 0.75
    }
  ];

  const EDGES = [
    { source: 'ml-systems', target: 'data-engineering' },
    { source: 'ml-systems', target: 'mlops' },
    { source: 'ml-systems', target: 'analytics' },
    { source: 'data-engineering', target: 'mlops' },
    { source: 'data-engineering', target: 'analytics' },
    { source: 'mlops', target: 'product' },
    { source: 'analytics', target: 'product' },
    { source: 'mlops', target: 'analytics' }
  ];

  // Panel content keyed by node ID - unified entries (no Projects vs Experience split)
  const PANEL_CONTENT = {
    'ml-systems': {
      title: 'ML Systems',
      summary: 'Production-minded ML: training, evaluation, and serving patterns that scale beyond notebooks.',
      entries: [
        {
          title: 'Synapse — Local Semantic Search',
          githubUrl: 'https://github.com/adityabharath30/Synapse',
          bullets: [
            'Built a Spotlight-style semantic search for personal documents using local embeddings',
            'Implemented FAISS vector search with extractive answer pipeline',
            'Added privacy controls including export/delete and audit logging'
          ]
        },
        {
          title: 'Tata 1MG – User Return Forecasting',
          bullets: [
            'Developed end-to-end ML pipeline predicting user return with 83% accuracy',
            'Deployed Random Forest model via REST API consumed by 5+ business apps',
            'Established repeatable training runs with basic logging and monitoring'
          ]
        },
        {
          title: 'NBA DuoFit – Player Pair Analysis',
          githubUrl: 'https://github.com/adityabharath30/nbaduofit',
          bullets: [
            'Analyzed lineup chemistry using PCA + KMeans clustering on historical pairs',
            'Built Streamlit app to explore 500+ player combinations interactively',
            'Forecasted net rating for user-selected All-Star duos'
          ]
        }
      ],
      tags: [
        'Python',
        'scikit-learn',
        'FastAPI',
        'RAG / Embeddings',
        'FAISS',
        'Feature Engineering',
        'Model Evaluation',
        'Streamlit',
        'SQL'
      ]
    },

    'data-engineering': {
      title: 'Data Engineering',
      summary: 'Reliable pipelines + modeling that keep analytics and ML fed with trustworthy data.',
      entries: [
        {
          title: 'CVS Health – Data Engineer',
          bullets: [
            'Built automation pipelines for report monitoring supporting 20+ engineers',
            'Supported migration of 10+ projects from Teradata to Google Cloud Platform',
            'Wrote SQL scripts validating post-migration reports and performance'
          ]
        },
        {
          title: 'CVS Health – Data Engineering Intern',
          bullets: [
            'Created 15+ interactive dashboards serving 150+ stakeholders',
            'Improved Tableau report performance by 19.8% via extract and query optimization',
            'Documented data models and established quality check patterns'
          ]
        }
      ],
      tags: [
        'SQL',
        'ETL / ELT',
        'GCP',
        'BigQuery',
        'Data Modeling',
        'Tableau',
        'Airflow Concepts',
        'Performance Tuning'
      ]
    },

    'mlops': {
      title: 'MLOps & Infra',
      summary: 'Bridging ML to infra: CI/CD, deployment, observability, and cost-aware operations.',
      entries: [
        {
          title: 'LLM Analytics Dashboard',
          githubUrl: 'https://github.com/adityabharath30/LLM-Analytics',
          bullets: [
            'Built an LLMOps monitoring and cost-analytics system for production LLM inference',
            'Enabled request-level observability including prompts, latency, tokens, and cost attribution',
            'Designed a production-ready analytics pipeline with PostgreSQL, SQLAlchemy, and Streamlit'
          ]
        },
        {
          title: 'Tata 1MG – Model Deployment',
          bullets: [
            'Packaged and served ML model via REST API for internal consumers',
            'Added structured logging and basic monitoring for inference requests',
            'Established versioned configs and reproducible deployment patterns'
          ]
        }
      ],
      tags: [
        'Docker',
        'CI/CD',
        'FastAPI / REST',
        'PostgreSQL',
        'Logging & Monitoring',
        'Cost Awareness',
        'Model Versioning',
        'GCP / AWS Basics'
      ]
    },

    'analytics': {
      title: 'Analytics & BI',
      summary: 'Turning messy data into metrics, experiments, and dashboards that drive decisions.',
      entries: [
        {
          title: 'CVS Health – Dashboard Development',
          bullets: [
            'Built 15+ dashboards prioritizing clarity and actionability for stakeholders',
            'Designed KPIs with clear business meaning and consistent computation',
            'Conducted cohort and funnel analysis to inform product decisions'
          ]
        },
        {
          title: 'MakeMyTrip – Demand Forecasting',
          bullets: [
            'Built seasonal ARIMA model for inventory demand with ~85% accuracy',
            'Created recommendation report improving click-through rate by ~10%',
            'Designed Tableau dashboards tracking 15+ KPIs across sales and engagement'
          ]
        }
      ],
      tags: [
        'SQL (Advanced)',
        'Tableau',
        'KPI Design',
        'Time Series',
        'Forecasting',
        'Cohort Analysis',
        'A/B Testing Basics',
        'Data Storytelling'
      ]
    },

    'product': {
      title: 'Product Thinking',
      summary: 'Translating data to stories and stories to actions.',
      entries: [
        {
          title: 'Bullseye – AI Financial News Extension',
          githubUrl: 'https://github.com/adityabharath30/Bullseye',
          bullets: [
            'Built Chrome extension simplifying financial news interpretation',
            'Prompt-engineered LLM responses for first/second-order market impacts',
            'Designed UX focused on clear, actionable insights for investors'
          ]
        },
        {
          title: 'Decision-Oriented Reporting',
          bullets: [
            'Framed dashboards as decision aids with recommended actions',
            'Documented known limitations and data caveats for stakeholders',
            'Wrote clear specs translating technical constraints into product tradeoffs'
          ]
        }
      ],
      tags: [
        'Writing & Narrative',
        'Stakeholder Alignment',
        'Product Thinking',
        'Prompt Engineering',
        'UX for Data',
        'PRDs & Specs',
        'Prioritization'
      ]
    }
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let activeNodeId = null;
  let hoveredNodeId = null;
  let focusedNodeIndex = 0;
  let nodes = [];
  let edges = [];

  // DOM Elements
  let svg = null;
  let canvas = null;
  let panel = null;
  let tooltip = null;

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    svg = document.getElementById('networkSvg');
    canvas = document.getElementById('graphCanvas');
    panel = document.getElementById('detailsPanel');

    if (!svg || !canvas || !panel) {
      console.error('Required elements not found');
      return;
    }

    // Create tooltip
    createTooltip();

    // Initialize graph
    initGraph();

    // Set up event listeners
    setupEventListeners();

    // Pre-select first node
    selectNode('ml-systems');

    // Handle resize
    window.addEventListener('resize', debounce(handleResize, 150));
  }

  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.innerHTML = `
      <div class="graph-tooltip__title"></div>
      <div class="graph-tooltip__desc"></div>
    `;
    canvas.appendChild(tooltip);
  }

  function initGraph() {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Set SVG viewBox
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Clear existing content
    svg.innerHTML = '';

    // Calculate node positions - larger nodes for better readability
    const baseRadius = Math.min(width, height) * 0.11;
    nodes = NODES.map(node => ({
      ...node,
      cx: node.x * width,
      cy: node.y * height,
      radius: Math.max(48, Math.min(65, baseRadius))
    }));

    // Create edge data
    edges = EDGES.map(edge => ({
      ...edge,
      sourceNode: nodes.find(n => n.id === edge.source),
      targetNode: nodes.find(n => n.id === edge.target)
    }));

    // Render
    renderEdges();
    renderNodes();
  }

  function renderEdges() {
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'edges');
    edgeGroup.setAttribute('aria-hidden', 'true');

    edges.forEach(edge => {
      const source = edge.sourceNode;
      const target = edge.targetNode;
      
      // Calculate direction vector from source to target
      const dx = target.cx - source.cx;
      const dy = target.cy - source.cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize the direction
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Calculate edge endpoints at circle boundaries (with small padding)
      const padding = 2;
      const x1 = source.cx + nx * (source.radius + padding);
      const y1 = source.cy + ny * (source.radius + padding);
      const x2 = target.cx - nx * (target.radius + padding);
      const y2 = target.cy - ny * (target.radius + padding);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'graph-edge');
      line.setAttribute('data-source', edge.source);
      line.setAttribute('data-target', edge.target);
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'var(--color-edge)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '1');
      edgeGroup.appendChild(line);
    });

    svg.appendChild(edgeGroup);
  }

  function renderNodes() {
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'nodes');

    nodes.forEach((node, index) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'graph-node');
      g.setAttribute('data-id', node.id);
      g.setAttribute('data-index', index);
      g.setAttribute('transform', `translate(${node.cx}, ${node.cy})`);
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${node.label}: ${node.shortDesc}`);
      g.setAttribute('tabindex', '-1');

      // Outer glow circle (for active state)
      const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glowCircle.setAttribute('class', 'node-glow');
      glowCircle.setAttribute('r', node.radius + 12);
      glowCircle.setAttribute('fill', 'var(--color-glow)');
      glowCircle.setAttribute('opacity', '0');
      g.appendChild(glowCircle);

      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'node-circle');
      circle.setAttribute('r', node.radius);
      circle.setAttribute('fill', 'var(--color-node-fill)');
      circle.setAttribute('stroke', 'var(--color-node-stroke)');
      circle.setAttribute('stroke-width', '2.5');
      g.appendChild(circle);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--color-text)');
      text.setAttribute('pointer-events', 'none');

      // Smart word wrapping for labels
      const words = node.label.split(/\s+/);

      let fontSize;
      if (node.label.length <= 10) {
        fontSize = Math.min(15, node.radius * 0.3);
      } else if (node.label.length <= 14) {
        fontSize = Math.min(13, node.radius * 0.26);
      } else {
        fontSize = Math.min(12, node.radius * 0.22);
      }
      fontSize = Math.max(11, fontSize);

      text.setAttribute('font-size', fontSize);
      text.setAttribute('font-weight', '700');
      text.setAttribute('letter-spacing', '-0.01em');

      // Split into lines intelligently
      let lines = [];
      if (words.length === 1) {
        lines = [words[0]];
      } else if (words.length === 2) {
        lines = words;
      } else if (words.length === 3) {
        if (words[1] === '&' || words[1] === 'and') {
          lines = [words[0] + ' ' + words[1], words[2]];
        } else {
          lines = [words[0], words.slice(1).join(' ')];
        }
      } else {
        const mid = Math.ceil(words.length / 2);
        lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      }

      const lineHeight = fontSize * 1.25;
      const totalHeight = lines.length * lineHeight;
      const startY = -totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, i) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('y', startY + i * lineHeight);
        tspan.setAttribute('dominant-baseline', 'middle');
        tspan.textContent = line;
        text.appendChild(tspan);
      });

      g.appendChild(text);
      nodeGroup.appendChild(g);

      // Event listeners
      g.addEventListener('mouseenter', () => handleNodeHover(node.id, true));
      g.addEventListener('mouseleave', () => handleNodeHover(null, false));
      g.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectNode(node.id);
      });
      g.addEventListener('mousedown', (e) => e.preventDefault());
    });

    svg.appendChild(nodeGroup);
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  function setupEventListeners() {
    // Keyboard navigation on canvas
    canvas.addEventListener('keydown', handleKeydown);

    // Click outside to maintain selection
    canvas.addEventListener('click', (e) => {
      if (e.target === svg || e.target === canvas) {
        // Don't deselect on background click
      }
    });

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav__toggle');
    const headerNav = document.querySelector('.header__nav');
    if (navToggle && headerNav) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
        headerNav.style.display = expanded ? 'none' : 'block';
      });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function handleKeydown(e) {
    switch (e.key) {
      case 'Tab':
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusedNodeIndex = (focusedNodeIndex + 1) % nodes.length;
        focusNode(focusedNodeIndex);
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusedNodeIndex = (focusedNodeIndex - 1 + nodes.length) % nodes.length;
        focusNode(focusedNodeIndex);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        selectNode(nodes[focusedNodeIndex].id);
        break;
    }
  }

  function focusNode(index) {
    const nodeElements = svg.querySelectorAll('.graph-node');
    nodeElements.forEach((el, i) => {
      if (i === index) {
        el.focus();
        handleNodeHover(nodes[i].id, true);
      }
    });
  }

  function handleNodeHover(nodeId, show) {
    hoveredNodeId = show ? nodeId : null;

    if (show && nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        showTooltip(node);
      }
    } else {
      hideTooltip();
    }

    updateGraphStyles();
  }

  function selectNode(nodeId) {
    activeNodeId = nodeId;
    focusedNodeIndex = nodes.findIndex(n => n.id === nodeId);

    updateGraphStyles();
    updatePanel(nodeId);
  }

  // ==========================================================================
  // Visual Updates
  // ==========================================================================

  function updateGraphStyles() {
    // Update nodes
    svg.querySelectorAll('.graph-node').forEach(g => {
      const id = g.dataset.id;
      const isActive = id === activeNodeId;
      const isHovered = id === hoveredNodeId;
      const isConnected = isNodeConnected(id, activeNodeId);

      g.classList.toggle('active', isActive);
      g.classList.toggle('dimmed', activeNodeId && !isActive && !isConnected);

      // Update glow
      const glow = g.querySelector('.node-glow');
      if (glow) {
        glow.setAttribute('opacity', isActive ? '0.6' : '0');
      }

      // Update circle stroke
      const circle = g.querySelector('.node-circle');
      if (circle) {
        if (isActive) {
          circle.setAttribute('stroke', 'var(--color-node-stroke-active)');
          circle.setAttribute('stroke-width', '3.5');
        } else if (isHovered) {
          circle.setAttribute('stroke', 'var(--color-node-stroke-hover)');
          circle.setAttribute('stroke-width', '3');
        } else {
          circle.setAttribute('stroke', 'var(--color-node-stroke)');
          circle.setAttribute('stroke-width', '2.5');
        }
      }
    });

    // Update edges
    svg.querySelectorAll('.graph-edge').forEach(edge => {
      const source = edge.dataset.source;
      const target = edge.dataset.target;
      const isActive = activeNodeId && (source === activeNodeId || target === activeNodeId);
      const isDimmed = activeNodeId && !isActive;

      edge.classList.toggle('active', isActive);
      edge.classList.toggle('dimmed', isDimmed);

      if (isActive) {
        edge.setAttribute('stroke', 'var(--color-edge-active)');
        edge.setAttribute('stroke-width', '2.5');
        edge.setAttribute('opacity', '1');
      } else if (isDimmed) {
        edge.setAttribute('stroke', 'var(--color-edge)');
        edge.setAttribute('stroke-width', '1.5');
        edge.setAttribute('opacity', '0.35');
      } else {
        edge.setAttribute('stroke', 'var(--color-edge)');
        edge.setAttribute('stroke-width', '1.5');
        edge.setAttribute('opacity', '1');
      }
    });
  }

  function isNodeConnected(nodeId, activeId) {
    if (!activeId || nodeId === activeId) return true;
    return edges.some(e =>
      (e.source === activeId && e.target === nodeId) ||
      (e.target === activeId && e.source === nodeId)
    );
  }

  function showTooltip(node) {
    const titleEl = tooltip.querySelector('.graph-tooltip__title');
    const descEl = tooltip.querySelector('.graph-tooltip__desc');

    titleEl.textContent = node.label;
    descEl.textContent = node.shortDesc;

    const x = node.cx;
    const y = node.cy - node.radius - 15;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';

    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // ==========================================================================
  // Panel Updates
  // ==========================================================================

  function updatePanel(nodeId) {
    const content = PANEL_CONTENT[nodeId];
    if (!content) return;

    let html = `
      <header class="panel__header">
        <h2 class="panel__title">${escapeHtml(content.title)}</h2>
        <p class="panel__summary">${escapeHtml(content.summary)}</p>
      </header>
      <section class="panel__entries" aria-label="Highlights">
        <h3 class="panel__section-title">Highlights</h3>
    `;

    content.entries.forEach(entry => {
      const titleHtml = entry.githubUrl
        ? `<a href="${escapeHtml(entry.githubUrl)}" target="_blank" rel="noopener noreferrer" class="panel__entry-link">${escapeHtml(entry.title)}</a>`
        : `<span class="panel__entry-name">${escapeHtml(entry.title)}</span>`;

      html += `
        <article class="panel__entry">
          <h4 class="panel__entry-title">${titleHtml}</h4>
          <ul class="panel__bullets" role="list">
            ${entry.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}
          </ul>
        </article>
      `;
    });

    html += `
      </section>
      <section class="panel__stack" aria-label="Stack">
        <h3 class="panel__section-title">Stack</h3>
        <div class="panel__pills" role="list">
          ${content.tags.map((tag, i) => `<span class="pill pill--${i % 4}" role="listitem">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </section>
    `;

    panel.innerHTML = html;
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  function handleResize() {
    initGraph();
    if (activeNodeId) {
      updateGraphStyles();
    }
  }

  function debounce(fn, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // Typing Animation
  // ==========================================================================

  function initTypingAnimation() {
    const locationEl = document.getElementById('typeLocation');
    if (!locationEl) return;

    const text = 'NYC';
    const typeSpeed = 150;      // ms per character
    const deleteSpeed = 100;    // ms per character when deleting
    const pauseBeforeDelete = 3000;  // pause before deleting
    const pauseBeforeType = 500;     // pause before typing again

    let charIndex = 0;
    let isDeleting = false;

    function type() {
      if (!isDeleting) {
        // Typing
        if (charIndex < text.length) {
          locationEl.textContent = text.substring(0, charIndex + 1);
          charIndex++;
          setTimeout(type, typeSpeed);
        } else {
          // Finished typing, pause then delete
          setTimeout(() => {
            isDeleting = true;
            type();
          }, pauseBeforeDelete);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          charIndex--;
          locationEl.textContent = text.substring(0, charIndex);
          setTimeout(type, deleteSpeed);
        } else {
          // Finished deleting, pause then type again
          isDeleting = false;
          setTimeout(type, pauseBeforeType);
        }
      }
    }

    // Start the animation
    setTimeout(type, 500);
  }

  // ==========================================================================
  // Start
  // ==========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initTypingAnimation();
    });
  } else {
    init();
    initTypingAnimation();
  }
})();
