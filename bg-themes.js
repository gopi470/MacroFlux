/* ── Background Theme Manager ───────────────────────────────── */
/* To add a new theme:
 *   BgThemes.register({ id, label, init(), destroy() });
 *   Call BgThemes.register() BEFORE BgThemes.init() to include it on load.
 * ─────────────────────────────────────────────────────────────── */

const BgThemes = (() => {
  const STORAGE_KEY = 'remote_bg_theme';
  const DEFAULT     = 'grid'; // Grid Matrix is the safe fallback

  const themes   = [];
  let current    = null;
  let raf        = null;

  /* ── Public API ────────────────────────────────────────────── */
  function register(theme) {
    themes.push(theme);
  }

  function init() {
    let saved = localStorage.getItem(STORAGE_KEY) || DEFAULT;

    // Validate: ensure the saved ID actually exists in registered themes
    const exists = themes.some(t => t.id === saved);
    if (!exists) {
      console.warn(`[BgThemes] Saved theme "${saved}" not found — falling back to "${DEFAULT}"`);
      saved = DEFAULT;
    }

    switchTo(saved);
  }

  function switchTo(id) {
    // Safely destroy current theme
    if (current && current.destroy) {
      try { current.destroy(); } catch(e) {
        console.warn('[BgThemes] Error destroying theme:', e);
      }
    }
    if (raf) { cancelAnimationFrame(raf); raf = null; }

    // Find target theme, fall back to first registered (Grid Matrix) if not found
    const theme = themes.find(t => t.id === id) || themes[0];
    if (!theme) return;

    try {
      current = theme;
      localStorage.setItem(STORAGE_KEY, theme.id);

      if (theme.init) {
        raf = theme.init((nextRaf) => { raf = nextRaf; });
      }
    } catch(e) {
      // Theme failed to initialise — immediately fall back to Grid Matrix
      console.warn(`[BgThemes] Theme "${theme.id}" failed to init, falling back to "${DEFAULT}"`, e);
      localStorage.setItem(STORAGE_KEY, DEFAULT);
      const fallback = themes.find(t => t.id === DEFAULT);
      if (fallback && fallback !== theme) {
        current = fallback;
        try { if (fallback.init) fallback.init(); } catch(e2) {
          console.error('[BgThemes] Fallback theme also failed:', e2);
        }
      }
    }

    // Update active indicators in nav dropdown
    document.querySelectorAll('[data-bg-theme]').forEach(el => {
      const isActive = el.dataset.bgTheme === (current?.id);
      el.classList.toggle('bg-theme-active', isActive);
    });
  }

  function cycle() {
    if (!themes.length) return;
    const idx  = themes.findIndex(t => t.id === current?.id);
    const next = themes[(idx + 1) % themes.length];
    switchTo(next.id);
  }

  function getCurrentId() {
    return current?.id || DEFAULT;
  }

  function getAll() {
    return [...themes];
  }

  return { register, init, switchTo, cycle, getCurrentId, getAll };
})();


/* ══════════════════════════════════════════════════════════════
   THEME 1 — Grid Matrix (original scrolling CSS grid on canvas)
   ══════════════════════════════════════════════════════════════ */
BgThemes.register({
  id: 'grid',
  label: 'Grid Matrix',

  _canvas: null,
  _ctx: null,
  _mouse: { x: -9999, y: -9999 },
  _mouseHandlers: null,
  _offset: 0,
  _pulse: 0,

  init() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', this._resize.bind(this));

    // Parallax on mouse
    const onMove = (e) => { this._mouse.x = e.clientX; this._mouse.y = e.clientY; };
    const onLeave = () => { this._mouse.x = -9999; this._mouse.y = -9999; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    this._mouseHandlers = { onMove, onLeave };

    const loop = (ts) => {
      this._draw(ts);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },

  destroy() {
    window.removeEventListener('resize', this._resize.bind(this));
    if (this._mouseHandlers) {
      document.removeEventListener('mousemove', this._mouseHandlers.onMove);
      document.removeEventListener('mouseleave', this._mouseHandlers.onLeave);
    }
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  },

  _resize() {
    if (!this._canvas) return;
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  },

  _draw(ts) {
    const canvas = this._canvas;
    const ctx    = this._ctx;
    const W = canvas.width, H = canvas.height;
    const CELL = 40;

    ctx.clearRect(0, 0, W, H);

    // Pulse opacity — 15s cycle
    const pulse  = 0.6 + 0.4 * Math.sin((ts / 15000) * Math.PI * 2);
    // Scroll offset — 120s for 1000px (original speed)
    const scroll = (ts / 120000 * 1000) % CELL;
    // Parallax
    const px = this._mouse.x !== -9999 ? (this._mouse.x - W / 2) / 45 : 0;
    const py = this._mouse.y !== -9999 ? (this._mouse.y - H / 2) / 45 : 0;

    ctx.save();
    ctx.translate(px, py);
    ctx.strokeStyle = `rgba(0, 220, 160, ${0.10 * pulse})`;
    ctx.lineWidth   = 1;

    // Horizontal lines
    for (let y = (scroll % CELL) - CELL; y < H + CELL; y += CELL) {
      ctx.beginPath(); ctx.moveTo(-CELL, y); ctx.lineTo(W + CELL, y); ctx.stroke();
    }
    // Vertical lines
    for (let x = -CELL; x < W + CELL * 2; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, -CELL); ctx.lineTo(x, H + CELL); ctx.stroke();
    }
    ctx.restore();
  },
});


/* ══════════════════════════════════════════════════════════════
   THEME 2 — Node Network (particle constellation)
   ══════════════════════════════════════════════════════════════ */
BgThemes.register({
  id: 'particles',
  label: 'Node Network',

  _canvas: null,
  _ctx: null,
  _nodes: [],
  _mouse: { x: -9999, y: -9999 },
  _mouseHandlers: null,
  _resizeHandler: null,
  _raf: null,

  // Config
  NODE_COUNT_BASE:  70,
  CONNECTION_DIST:  160,
  CURSOR_DIST:      180,
  CURSOR_ATTRACT:   0.012,
  DRIFT_SPEED:      0.28,
  NODE_RADIUS:      1.5,
  LINE_ALPHA_MAX:   0.18,
  CURSOR_LINE_ALPHA:0.25,

  init() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');

    this._resize();

    const onResize = () => { this._resize(); this._initNodes(); };
    const onMove   = (e) => { this._mouse.x = e.clientX; this._mouse.y = e.clientY; };
    const onLeave  = () =>  { this._mouse.x = -9999; this._mouse.y = -9999; };

    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    this._mouseHandlers  = { onResize, onMove, onLeave };

    this._initNodes();

    const loop = () => {
      this._update();
      this._draw();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },

  destroy() {
    if (this._mouseHandlers) {
      window.removeEventListener('resize', this._mouseHandlers.onResize);
      document.removeEventListener('mousemove', this._mouseHandlers.onMove);
      document.removeEventListener('mouseleave', this._mouseHandlers.onLeave);
    }
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    this._nodes = [];
  },

  _resize() {
    if (!this._canvas) return;
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  },

  _initNodes() {
    const W = this._canvas.width, H = this._canvas.height;
    const count = Math.min(this.NODE_COUNT_BASE + Math.floor(W * H / 22000), 130);
    this._nodes = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.DRIFT_SPEED * (0.5 + Math.random() * 0.8);
      return {
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        alpha: 0.4 + Math.random() * 0.6,
        r:     this.NODE_RADIUS * (0.6 + Math.random() * 0.9),
      };
    });
  },

  _update() {
    const W = this._canvas.width, H = this._canvas.height;
    const { CURSOR_DIST, CURSOR_ATTRACT, DRIFT_SPEED } = this;

    this._nodes.forEach(n => {
      const dx   = this._mouse.x - n.x;
      const dy   = this._mouse.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CURSOR_DIST && dist > 1) {
        n.vx += (dx / dist) * CURSOR_ATTRACT;
        n.vy += (dy / dist) * CURSOR_ATTRACT;
      }

      const speed    = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      const maxSpeed = DRIFT_SPEED * 2.2;
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }

      if (dist > CURSOR_DIST) {
        n.vx *= 0.995; n.vy *= 0.995;
        const s = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (s < DRIFT_SPEED * 0.5) {
          const a = Math.atan2(n.vy, n.vx);
          n.vx = Math.cos(a) * DRIFT_SPEED * 0.5;
          n.vy = Math.sin(a) * DRIFT_SPEED * 0.5;
        }
      }

      n.x += n.vx; n.y += n.vy;
      if (n.x < -20)    n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20)    n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    });
  },

  _draw() {
    const canvas = this._canvas;
    const ctx    = this._ctx;
    const nodes  = this._nodes;
    const { CONNECTION_DIST, CURSOR_DIST, LINE_ALPHA_MAX, CURSOR_LINE_ALPHA } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Node-to-node lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,220,160,${LINE_ALPHA_MAX * (1 - dist / CONNECTION_DIST)})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Cursor lines
    if (this._mouse.x !== -9999) {
      nodes.forEach(n => {
        const dx   = this._mouse.x - n.x;
        const dy   = this._mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,220,160,${CURSOR_LINE_ALPHA * (1 - dist / CURSOR_DIST)})`;
          ctx.lineWidth   = 0.7;
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(this._mouse.x, this._mouse.y);
          ctx.stroke();
        }
      });
    }

    // Nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,220,160,${n.alpha})`;
      ctx.fill();
    });
  },
});


/* ══════════════════════════════════════════════════════════════
   THEME 3 — Hex Matrix (reactive hexagonal cell grid)
   ══════════════════════════════════════════════════════════════ */
BgThemes.register({
  id: 'hexgrid',
  label: 'Hex Matrix',

  _canvas: null,
  _ctx: null,
  _mouse: { x: -9999, y: -9999 },
  _mouseHandlers: null,
  _raf: null,
  _cells: [],

  init() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', this._resize.bind(this));

    const onMove = (e) => { this._mouse.x = e.clientX; this._mouse.y = e.clientY; };
    const onLeave = () => { this._mouse.x = -9999; this._mouse.y = -9999; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    this._mouseHandlers = { onMove, onLeave };

    this._initCells();

    const loop = (ts) => {
      this._update(ts);
      this._draw();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },

  destroy() {
    window.removeEventListener('resize', this._resize.bind(this));
    if (this._mouseHandlers) {
      document.removeEventListener('mousemove', this._mouseHandlers.onMove);
      document.removeEventListener('mouseleave', this._mouseHandlers.onLeave);
    }
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    this._cells = [];
  },

  _resize() {
    if (!this._canvas) return;
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._initCells();
  },

  _initCells() {
    if (!this._canvas) return;
    const W = this._canvas.width;
    const H = this._canvas.height;

    const r = 24; // Hexagon radius
    const w = Math.sqrt(3) * r;
    const xSpacing = w;
    const ySpacing = 1.5 * r;

    const cols = Math.ceil(W / xSpacing) + 2;
    const rows = Math.ceil(H / ySpacing) + 2;

    this._cells = [];
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        let cx = col * xSpacing;
        if (row % 2 !== 0) {
          cx += xSpacing / 2;
        }
        let cy = row * ySpacing;

        this._cells.push({
          cx: cx,
          cy: cy,
          r: r,
          basePulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.0006 + Math.random() * 0.0012,
          currentAlpha: 0,
          targetAlpha: 0
        });
      }
    }
  },

  _update(ts) {
    const mouse = this._mouse;
    const radiusThreshold = 180;

    this._cells.forEach(cell => {
      const pulseVal = Math.sin(ts * cell.pulseSpeed + cell.basePulse);
      const baseAlpha = 0.015 + 0.03 * (pulseVal + 1) / 2;

      let hoverAlpha = 0;
      if (mouse.x !== -9999) {
        const dx = mouse.x - cell.cx;
        const dy = mouse.y - cell.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radiusThreshold) {
          hoverAlpha = 0.25 * (1 - dist / radiusThreshold);
        }
      }

      cell.targetAlpha = baseAlpha + hoverAlpha;
      cell.currentAlpha += (cell.targetAlpha - cell.currentAlpha) * 0.08;
    });
  },

  _drawHex(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  },

  _draw() {
    const canvas = this._canvas;
    const ctx = this._ctx;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this._cells.forEach(cell => {
      if (cell.currentAlpha > 0.002) {
        ctx.strokeStyle = `rgba(0, 220, 160, ${cell.currentAlpha})`;
        ctx.lineWidth = 0.7;
        this._drawHex(ctx, cell.cx, cell.cy, cell.r);
        ctx.stroke();

        if (cell.currentAlpha > 0.04) {
          ctx.fillStyle = `rgba(0, 220, 160, ${(cell.currentAlpha - 0.02) * 0.10})`;
          ctx.fill();
        }
      }
    });
  }
});


/* ══════════════════════════════════════════════════════════════
   THEME 4 — Circuit Board Traces (glowing paths with data flow & clicks)
   ══════════════════════════════════════════════════════════════ */
BgThemes.register({
  id: 'circuit',
  label: 'Circuit Traces',

  _canvas: null,
  _ctx: null,
  _paths: [],
  _packets: [],
  _ripples: [],
  _eventHandlers: null,
  _raf: null,

  init() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', this._resize.bind(this));

    const onClick = (e) => {
      const isInteractive = e.target.closest('button, a, input, select, .sidebar-section, .top-left-menu, #errorModal, #confirmModal');
      if (isInteractive) return;

      this._ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 0,
        maxR: Math.max(window.innerWidth, window.innerHeight) * 1.2,
        speed: 12
      });
    };

    document.addEventListener('click', onClick);
    this._eventHandlers = { onClick };

    this._generateCircuit();
    this._initPackets();

    const loop = () => {
      this._update();
      this._draw();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },

  destroy() {
    window.removeEventListener('resize', this._resize.bind(this));
    if (this._eventHandlers) {
      document.removeEventListener('click', this._eventHandlers.onClick);
    }
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    this._paths = [];
    this._packets = [];
    this._ripples = [];
  },

  _resize() {
    if (!this._canvas) return;
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._generateCircuit();
    this._initPackets();
  },

  _generateCircuit() {
    if (!this._canvas) return;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const gridSize = 40;
    const cols = Math.floor(W / gridSize) + 1;
    const rows = Math.floor(H / gridSize) + 1;

    this._paths = [];
    const numPaths = Math.min(25 + Math.floor((W * H) / 40000), 55);

    const dirs = [
      {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1},
      {x: 1, y: 1}, {x: -1, y: 1}, {x: 1, y: -1}, {x: -1, y: -1}
    ];

    for (let i = 0; i < numPaths; i++) {
      let cx = Math.floor(Math.random() * cols) * gridSize;
      let cy = Math.floor(Math.random() * rows) * gridSize;

      const path = [{ x: cx, y: cy }];
      const numSegments = 2 + Math.floor(Math.random() * 2);
      let lastDir = dirs[Math.floor(Math.random() * dirs.length)];

      for (let j = 0; j < numSegments; j++) {
        const len = (2 + Math.floor(Math.random() * 4)) * gridSize;
        cx += lastDir.x * len;
        cy += lastDir.y * len;

        cx = Math.max(0, Math.min(W, cx));
        cy = Math.max(0, Math.min(H, cy));

        path.push({ x: cx, y: cy });

        if (Math.random() < 0.6) {
          const allowed = dirs.filter(d => (d.x * lastDir.x + d.y * lastDir.y) >= 0);
          lastDir = allowed[Math.floor(Math.random() * allowed.length)];
        }
      }
      this._paths.push(path);
    }
  },

  _initPackets() {
    this._packets = [];
    const numPackets = Math.min(8 + Math.floor(this._paths.length / 4), 16);
    for (let i = 0; i < numPackets; i++) {
      this._spawnPacket();
    }
  },

  _spawnPacket() {
    if (this._paths.length === 0) return;
    const pathIdx = Math.floor(Math.random() * this._paths.length);
    const path = this._paths[pathIdx];
    if (path.length < 2) return;

    this._packets.push({
      pathIdx: pathIdx,
      segmentIdx: 0,
      t: 0,
      speed: 0.008 + Math.random() * 0.015,
      size: 1.0 + Math.random() * 1.5
    });
  },

  _update() {
    // Update Packets
    for (let i = this._packets.length - 1; i >= 0; i--) {
      const p = this._packets[i];
      p.t += p.speed;
      if (p.t >= 1) {
        p.t = 0;
        p.segmentIdx++;
        const path = this._paths[p.pathIdx];
        if (p.segmentIdx >= path.length - 1) {
          this._packets.splice(i, 1);
          this._spawnPacket();
        }
      }
    }

    // Update Ripples
    for (let i = this._ripples.length - 1; i >= 0; i--) {
      const ripple = this._ripples[i];
      ripple.r += ripple.speed;
      if (ripple.r > ripple.maxR) {
        this._ripples.splice(i, 1);
      }
    }
  },

  _draw() {
    const canvas = this._canvas;
    const ctx = this._ctx;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base paths in low opacity
    ctx.strokeStyle = 'rgba(0, 220, 160, 0.14)';
    ctx.lineWidth = 1.0;
    this._paths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // End points (pads)
      ctx.fillStyle = 'rgba(0, 220, 160, 0.28)';
      ctx.beginPath();
      ctx.arc(path[0].x, path[0].y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(path[path.length - 1].x, path[path.length - 1].y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw active click ripples along paths
    this._ripples.forEach(ripple => {
      const startGrad = Math.max(0, ripple.r - 40);
      const endGrad = ripple.r + 40;
      const grad = ctx.createRadialGradient(ripple.x, ripple.y, startGrad, ripple.x, ripple.y, endGrad);
      grad.addColorStop(0, 'rgba(0, 220, 160, 0)');
      grad.addColorStop(0.5, 'rgba(0, 220, 160, 0.95)');
      grad.addColorStop(1, 'rgba(0, 220, 160, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.4;

      this._paths.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        // Highlight nodes within range
        path.forEach(pt => {
          const dx = pt.x - ripple.x;
          const dy = pt.y - ripple.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > ripple.r - 40 && dist < ripple.r + 40) {
            const factor = 1 - Math.abs(dist - ripple.r) / 40;
            ctx.fillStyle = `rgba(0, 220, 160, ${factor * 1.0})`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
    });

    // Draw packets
    ctx.fillStyle = 'rgba(0, 220, 160, 0.95)';
    this._packets.forEach(p => {
      const path = this._paths[p.pathIdx];
      const p1 = path[p.segmentIdx];
      const p2 = path[p.segmentIdx + 1];
      if (!p1 || !p2) return;

      const x = p1.x + (p2.x - p1.x) * p.t;
      const y = p1.y + (p2.y - p1.y) * p.t;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
});


/* ══════════════════════════════════════════════════════════════
   THEME 5 — Data Streams (subdued cascading matrix streams)
   ══════════════════════════════════════════════════════════════ */
BgThemes.register({
  id: 'matrix',
  label: 'Data Streams',

  _canvas: null,
  _ctx: null,
  _columns: [],
  _speedBoost: 0,
  _eventHandlers: null,
  _raf: null,

  fontSize: 10,
  charList: '0123456789ABCDEFabcdef-+_/:[]{}#@$&SYS_OK_NETMONSTER_ACTIVE_TELEMETRY_COMMS',

  init() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', this._resize.bind(this));

    const onScroll = () => {
      this._speedBoost = Math.min(this._speedBoost + 2.5, 12);
    };

    const onClick = (e) => {
      const isInteractive = e.target.closest('button, a, input, select, .sidebar-section, .top-left-menu, #errorModal, #confirmModal');
      if (isInteractive) return;
      this._speedBoost = Math.min(this._speedBoost + 4.0, 15);
    };

    const onWheel = () => {
      this._speedBoost = Math.min(this._speedBoost + 1.5, 12);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('click', onClick);

    this._eventHandlers = { onScroll, onClick, onWheel };
    this._initColumns();

    const loop = () => {
      this._update();
      this._draw();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },

  destroy() {
    window.removeEventListener('resize', this._resize.bind(this));
    if (this._eventHandlers) {
      window.removeEventListener('scroll', this._eventHandlers.onScroll);
      window.removeEventListener('wheel', this._eventHandlers.onWheel);
      document.removeEventListener('click', this._eventHandlers.onClick);
    }
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    this._columns = [];
  },

  _resize() {
    if (!this._canvas) return;
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._initColumns();
  },

  _initColumns() {
    if (!this._canvas) return;
    const W = this._canvas.width;
    const H = this._canvas.height;

    const colsCount = Math.floor(W / this.fontSize) + 1;
    this._columns = [];

    for (let i = 0; i < colsCount; i++) {
      this._columns.push({
        x: i * this.fontSize,
        y: Math.random() * -H,
        speed: 0.5 + Math.random() * 1.5,
        chars: this._generateStringStream(),
        opacity: 0.08 + Math.random() * 0.16
      });
    }
  },

  _generateStringStream() {
    const len = 15 + Math.floor(Math.random() * 25);
    let stream = [];
    for (let i = 0; i < len; i++) {
      stream.push(this.charList[Math.floor(Math.random() * this.charList.length)]);
    }
    return stream;
  },

  _update() {
    const H = this._canvas.height;

    this._speedBoost *= 0.95;
    if (this._speedBoost < 0.01) this._speedBoost = 0;

    this._columns.forEach(col => {
      col.y += col.speed + this._speedBoost;

      if (col.y > H + (col.chars.length * this.fontSize)) {
        col.y = -col.chars.length * this.fontSize;
        col.speed = 0.5 + Math.random() * 1.5;
        col.chars = this._generateStringStream();
        col.opacity = 0.08 + Math.random() * 0.16;
      }

      if (Math.random() < 0.02) {
        const idx = Math.floor(Math.random() * col.chars.length);
        col.chars[idx] = this.charList[Math.floor(Math.random() * this.charList.length)];
      }
    });
  },

  _draw() {
    const canvas = this._canvas;
    const ctx = this._ctx;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${this.fontSize}px 'Share Tech Mono', monospace`;

    this._columns.forEach(col => {
      const len = col.chars.length;
      for (let i = 0; i < len; i++) {
        const charY = col.y - (i * this.fontSize);

        if (charY < -this.fontSize || charY > canvas.height + this.fontSize) continue;

        const fadeRatio = 1 - (i / len);
        const alpha = col.opacity * fadeRatio;

        if (i === 0) {
          ctx.fillStyle = `rgba(120, 255, 230, ${alpha * 2.8})`;
        } else {
          ctx.fillStyle = `rgba(0, 220, 160, ${alpha * 1.6})`;
        }

        ctx.fillText(col.chars[i], col.x, charY);
      }
    });
  }
});

