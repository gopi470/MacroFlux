/* ── Background Theme Manager ───────────────────────────────── */
/* To add a new theme:
 *   BgThemes.register({ id, label, init(), destroy() });
 *   Call BgThemes.register() BEFORE BgThemes.init() to include it on load.
 * ─────────────────────────────────────────────────────────────── */

const BgThemes = (() => {
  const STORAGE_KEY = 'remote_bg_theme';
  const DEFAULT     = 'particles';

  const themes   = [];
  let current    = null;
  let raf        = null; // shared animation frame handle

  /* ── Public API ────────────────────────────────────────────── */
  function register(theme) {
    themes.push(theme);
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT;
    switchTo(saved);
  }

  function switchTo(id) {
    // Destroy current
    if (current && current.destroy) current.destroy();
    if (raf) { cancelAnimationFrame(raf); raf = null; }

    const theme = themes.find(t => t.id === id) || themes[0];
    if (!theme) return;

    current = theme;
    localStorage.setItem(STORAGE_KEY, theme.id);

    if (theme.init) {
      raf = theme.init((nextRaf) => { raf = nextRaf; });
    }

    // Update active indicators in nav dropdown
    document.querySelectorAll('[data-bg-theme]').forEach(el => {
      const isActive = el.dataset.bgTheme === theme.id;
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
    ctx.strokeStyle = `rgba(0, 220, 160, ${0.15 * pulse})`;
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
