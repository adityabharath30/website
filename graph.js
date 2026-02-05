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
      shortDesc: 'End-to-end ML: modeling, evaluation, deployment patterns that survive production.',
      x: 0.28,
      y: 0.28
    },
    {
      id: 'data-engineering',
      label: 'Data Engineering',
      shortDesc: 'Data pipelines and modeling that keep analytics and ML fed with reliable signals.',
      x: 0.72,
      y: 0.25
    },
    {
      id: 'mlops',
      label: 'MLOps & Infra',
      shortDesc: 'Bridging ML code to infra: logging, monitoring, deployment, and cost-awareness.',
      x: 0.5,
      y: 0.52
    },
    {
      id: 'analytics',
      label: 'Analytics & BI',
      shortDesc: 'Transforming messy data and KPIs into dashboards and decision tools.',
      x: 0.22,
      y: 0.72
    },
    {
      id: 'product',
      label: 'Product & Comms',
      shortDesc: 'Explaining complex systems in language that PMs, execs, and engineers share.',
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

  // Panel content keyed by node ID - concise problem statements
  const PANEL_CONTENT = {
    'ml-systems': {
      title: 'ML Systems',
      summary: 'End-to-end ML: modeling, evaluation, deployment patterns that survive production.',
      sections: [
        {
          title: 'Projects & Experience',
          items: [
            {
              title: 'Tata 1MG – User Return Forecasting',
              desc: 'Predicted which users would return next month with 83% accuracy, serving 3.2M+ users via production API.'
            },
            {
              title: 'NBA DuoFit – Player Pair Analysis',
              desc: 'Built a tool to forecast how any two NBA All-Stars would perform together using clustering on 500+ combinations.'
            }
          ]
        }
      ],
      tags: ['Python', 'scikit-learn', 'Streamlit', 'APIs', 'Forecasting', 'Clustering']
    },
    'data-engineering': {
      title: 'Data Engineering',
      summary: 'Data pipelines and modeling that keep analytics and ML fed with reliable signals.',
      sections: [
        {
          title: 'Experience',
          items: [
            {
              title: 'CVS Health – Data Engineer',
              desc: 'Migrated 10+ data projects from Teradata to GCP and automated monitoring for 20+ engineers.'
            },
            {
              title: 'CVS Health – Data Engineering Intern',
              desc: 'Improved Tableau report performance by 19.8% through query and extract optimization.'
            }
          ]
        }
      ],
      tags: ['SQL', 'ETL', 'GCP', 'Data Warehousing', 'Performance Tuning', 'Tableau']
    },
    'mlops': {
      title: 'MLOps & Infra',
      summary: 'Bridging ML code to infra: logging, monitoring, deployment, and cost-awareness.',
      sections: [
        {
          title: 'Projects',
          items: [
            {
              title: 'LLM Analytics Dashboard',
              desc: 'Built observability for LLM usage—tracking tokens, latency, and cost across GPT models in real-time.'
            },
            {
              title: 'Tata 1MG – Model Deployment',
              desc: 'Deployed ML model as REST API consumed by 5+ business applications with logging and monitoring.'
            }
          ]
        }
      ],
      tags: ['MLOps', 'Observability', 'Cost-awareness', 'APIs', 'PostgreSQL']
    },
    'analytics': {
      title: 'Analytics & BI',
      summary: 'Transforming messy data and KPIs into dashboards and decision tools.',
      sections: [
        {
          title: 'Experience',
          items: [
            {
              title: 'CVS Health – Dashboard Development',
              desc: 'Created 15+ dashboards serving 150+ clients, becoming go-to reporting for business units.'
            },
            {
              title: 'MakeMyTrip – Demand Forecasting',
              desc: 'Built ARIMA model for inventory planning (~85% accuracy) and improved click-through by ~10%.'
            }
          ]
        }
      ],
      tags: ['Time Series', 'Forecasting', 'Tableau', 'KPI Design', 'Business Storytelling']
    },
    'product': {
      title: 'Product & Comms',
      summary: 'Explaining complex systems in language that PMs, execs, and engineers share.',
      sections: [
        {
          title: 'Projects',
          items: [
            {
              title: 'Bullseye – AI Financial News Extension',
              desc: 'Chrome extension that translates financial news into clear first/second-order market impacts.'
            },
            {
              title: 'Decision-Oriented Reporting',
              desc: 'Framed all dashboards as decision aids—not data dumps—with clear actionable takeaways.'
            }
          ]
        }
      ],
      tags: ['Prompt Engineering', 'Communication', 'Product Thinking', 'UX for Data']
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
      radius: Math.max(48, Math.min(65, baseRadius)) // Clamp between 48-65px
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
    
    edges.forEach(edge => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'graph-edge');
      line.setAttribute('data-source', edge.source);
      line.setAttribute('data-target', edge.target);
      line.setAttribute('x1', edge.sourceNode.cx);
      line.setAttribute('y1', edge.sourceNode.cy);
      line.setAttribute('x2', edge.targetNode.cx);
      line.setAttribute('y2', edge.targetNode.cy);
      // Edges always visible with base color
      line.setAttribute('stroke', 'var(--color-edge)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '1'); // Always visible
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
      glowCircle.setAttribute('r', node.radius + 10);
      glowCircle.setAttribute('fill', 'var(--color-accent-soft)');
      glowCircle.setAttribute('opacity', '0');
      g.appendChild(glowCircle);
      
      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'node-circle');
      circle.setAttribute('r', node.radius);
      circle.setAttribute('fill', 'var(--color-node-fill)');
      circle.setAttribute('stroke', 'var(--color-node-stroke)');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);
      
      // Label - larger, more prominent text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--color-text)');
      text.setAttribute('pointer-events', 'none');
      
      // Smart word wrapping for labels
      const words = node.label.split(/\s+/);
      
      // Larger font sizes for better visibility
      let fontSize;
      if (node.label.length <= 10) {
        fontSize = Math.min(15, node.radius * 0.3);
      } else if (node.label.length <= 14) {
        fontSize = Math.min(13, node.radius * 0.26);
      } else {
        fontSize = Math.min(12, node.radius * 0.22);
      }
      fontSize = Math.max(11, fontSize); // Minimum 11px
      
      text.setAttribute('font-size', fontSize);
      text.setAttribute('font-weight', '700'); // Bolder
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
      
      // Render lines with better spacing
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
    
    // Click outside to maintain selection (don't deselect)
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
    const nodeElements = svg.querySelectorAll('.graph-node');
    
    switch (e.key) {
      case 'Tab':
        // Allow natural tab behavior but track focus
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
        glow.setAttribute('opacity', isActive ? '1' : '0');
      }
      
      // Update circle stroke
      const circle = g.querySelector('.node-circle');
      if (circle) {
        if (isActive) {
          circle.setAttribute('stroke', 'var(--color-node-stroke-active)');
          circle.setAttribute('stroke-width', '3');
        } else if (isHovered) {
          circle.setAttribute('stroke', 'var(--color-node-stroke-hover)');
          circle.setAttribute('stroke-width', '2.5');
        } else {
          circle.setAttribute('stroke', 'var(--color-node-stroke)');
          circle.setAttribute('stroke-width', '2');
        }
      }
    });
    
    // Update edges - always visible, highlighted when connected to active node
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
        // Default state - always visible
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
    
    // Position tooltip
    const canvasRect = canvas.getBoundingClientRect();
    const x = node.cx;
    const y = node.cy - node.radius - 15;
    
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
    
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  // ==========================================================================
  // Panel Updates
  // ==========================================================================
  
  function updatePanel(nodeId) {
    const content = PANEL_CONTENT[nodeId];
    if (!content) return;
    
    let html = `
      <div class="panel__header">
        <h2 class="panel__title">${escapeHtml(content.title)}</h2>
        <p class="panel__summary">${escapeHtml(content.summary)}</p>
      </div>
    `;
    
    content.sections.forEach(section => {
      html += `
        <div class="panel__section">
          <h3 class="panel__section-title">${escapeHtml(section.title)}</h3>
          ${section.items.map(item => `
            <div class="panel__item">
              <h4 class="panel__item-title">${escapeHtml(item.title)}</h4>
              <p class="panel__item-desc">${escapeHtml(item.desc)}</p>
            </div>
          `).join('')}
        </div>
      `;
    });
    
    html += `
      <div class="panel__section">
        <h3 class="panel__section-title">Stack</h3>
        <div class="panel__pills">
          ${content.tags.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
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
  // Start
  // ==========================================================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
