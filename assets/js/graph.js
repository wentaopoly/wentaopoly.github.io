// Hero background: a random DAG drawn on the blue band. Every few seconds one
// collider (a → b ← c with a, c not adjacent) is highlighted, the one pattern
// whose direction correlations alone can pin down.
(() => {
  const canvas = document.querySelector(".hero-graph");
  if (!canvas) return;
  const band = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ORANGE = "243, 154, 91";

  let W = 0, H = 0, dpr = 1, wide = true, nodes = [], edges = [], colliders = [], bandColor = "#1f4fbf";
  let pointer = null, hot = null, shown = null, shownAt = 0, running = false, frame = 0;

  const rand = (() => {
    let s = 20261017;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  })();

  function build() {
    const r = band.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    bandColor = getComputedStyle(band).backgroundColor;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    // Wide screens: keep the graph to the right of the name and intro. Narrow: whole band, drawn fainter.
    wide = W >= 900;
    const x0 = wide ? W * 0.57 : 16, x1 = W - 20, y0 = wide ? 76 : 16, y1 = H - 24;
    const target = Math.max(14, Math.min(44, Math.round(((x1 - x0) * (y1 - y0)) / 11000)));
    const minGap = wide ? 72 : 52;
    nodes = [];
    for (let tries = 0; nodes.length < target && tries < target * 60; tries++) {
      const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0);
      if (nodes.every((n) => (n.x0 - x) ** 2 + (n.y0 - y) ** 2 > minGap * minGap)) {
        nodes.push({ x0: x, y0: y, x, y, ax: 4 + rand() * 9, ay: 4 + rand() * 9, w: 0.00025 + rand() * 0.0003, p: rand() * 6.28, rank: rand(), dx: 0, dy: 0 });
      }
    }
    // Each node links to its two nearest neighbours; direction follows a random rank, so the graph is acyclic.
    const seen = new Set();
    edges = [];
    nodes.forEach((n, i) => {
      nodes
        .map((m, j) => [j, (m.x0 - n.x0) ** 2 + (m.y0 - n.y0) ** 2])
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .forEach(([j]) => {
          const key = Math.min(i, j) + "-" + Math.max(i, j);
          if (seen.has(key)) return;
          seen.add(key);
          edges.push(nodes[i].rank < nodes[j].rank ? [i, j] : [j, i]);
        });
    });
    const adj = new Set(edges.map(([a, b]) => Math.min(a, b) + "-" + Math.max(a, b)));
    colliders = [];
    nodes.forEach((_, b) => {
      const parents = edges.filter((e) => e[1] === b).map((e) => e[0]);
      for (let i = 0; i < parents.length; i++)
        for (let j = i + 1; j < parents.length; j++) {
          const a = parents[i], c = parents[j];
          if (!adj.has(Math.min(a, c) + "-" + Math.max(a, c))) colliders.push([a, b, c]);
        }
    });
  }

  // Narrow screens put text over the graph, so draw it fainter there.
  const fade = () => (wide ? 1 : 0.38);

  function arrow(x1, y1, x2, y2, color, width) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const r = 6, ex = x2 - ux * (r + 2), ey = y2 - uy * (r + 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1 + ux * r, y1 + uy * r);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * 7 - uy * 3.5, ey - uy * 7 + ux * 3.5);
    ctx.lineTo(ex - ux * 7 + uy * 3.5, ey - uy * 7 - ux * 3.5);
    ctx.closePath();
    ctx.fill();
  }

  function draw(time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (const n of nodes) {
      let tx = 0, ty = 0;
      if (pointer) {
        const ddx = n.x0 - pointer.x, ddy = n.y0 - pointer.y, d = Math.hypot(ddx, ddy);
        if (d < 150 && d > 0.1) {
          const push = (1 - d / 150) * 26;
          tx = (ddx / d) * push;
          ty = (ddy / d) * push;
        }
      }
      n.dx += (tx - n.dx) * 0.08;
      n.dy += (ty - n.dy) * 0.08;
      const t = still ? 0 : time;
      n.x = n.x0 + Math.sin(t * n.w + n.p) * n.ax + n.dx;
      n.y = n.y0 + Math.cos(t * n.w * 0.9 + n.p) * n.ay + n.dy;
    }

    hot = null;
    if (pointer) {
      for (let i = 0; i < nodes.length; i++)
        if (Math.hypot(nodes[i].x - pointer.x, nodes[i].y - pointer.y) < 16) hot = i;
    }

    // Highlighted collider: a new one every 2.9 s.
    // On narrow screens the name sits on top of the graph, so no highlight there.
    if (wide && colliders.length && (!shown || time - shownAt > 2900)) {
      shown = colliders[Math.floor(rand() * colliders.length)];
      shownAt = time;
    }
    // Quick fade in, hold, quick fade out: half-transparent orange on blue reads as grey.
    const age = time - shownAt;
    const k = !shown ? 0 : still ? 1 : Math.max(0, Math.min(1, age / 350, (2600 - age) / 350));
    const lit = shown ? new Set([shown[0] + ">" + shown[1], shown[2] + ">" + shown[1]]) : new Set();

    for (const [a, b] of edges) {
      const A = nodes[a], B = nodes[b];
      const f = Math.min(fade(A.x), fade(B.x));
      const isHot = hot !== null && (a === hot || b === hot);
      arrow(A.x, A.y, B.x, B.y, `rgba(255,255,255,${isHot ? 0.85 : 0.22 * f})`, isHot ? 1.6 : 1.1);
      if (lit.has(a + ">" + b) && k > 0.01) arrow(A.x, A.y, B.x, B.y, `rgba(${ORANGE},${0.95 * k})`, 2.2);
    }
    nodes.forEach((n, i) => {
      const f = fade(n.x);
      const inShown = shown && shown.includes(i) && k > 0.01;
      ctx.beginPath();
      ctx.arc(n.x, n.y, i === hot ? 6.5 : 5, 0, Math.PI * 2);
      ctx.fillStyle = inShown ? `rgba(${ORANGE},${0.25 + 0.75 * k})` : bandColor;
      ctx.fill();
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = inShown ? `rgba(${ORANGE},${k})` : `rgba(255,255,255,${i === hot ? 0.95 : 0.45 * f})`;
      ctx.stroke();
    });
  }

  function loop(time) {
    draw(time);
    if (running) frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || still) return;
    running = true;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  build();
  draw(performance.now());
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(band);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  band.addEventListener("pointermove", (e) => {
    const r = band.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (still) draw(0);
  });
  band.addEventListener("pointerleave", () => (pointer = null));
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw(performance.now());
    }, 150);
  });
})();
