/* 不在清单上的灯 — 状态、路由、检索、夜景、棋盘、控制台、终场。 */
(function () {
  const G = window.G;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const now = () => performance.now() / 1000;

  /* ---------- 进度 ---------- */
  const KEY = 'lamp-not-on-the-list-v1';
  const fresh = () => ({ found: {}, board: false, unlocked: false, sent: null, nightDone: false, cut: false, ending: null, t0: Date.now(), t1: null, hints: 0, hintLv: {}, intro: true, cur: 'home' });
  let S = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* 无存储时照常运行 */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 同上 */ } };

  /* ---------- 字体（不阻塞首屏） ---------- */
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Long+Cang&family=Ma+Shan+Zheng&family=IBM+Plex+Mono:wght@400;500&display=swap';
  document.head.appendChild(font);

  /* ---------- 海图底纹：水深点与等深线 ---------- */
  (function chartbg() {
    const rnd = G.rng(1906); let s = '';
    for (let i = 0; i < 64; i++) s += `<span style="left:${(rnd() * 98).toFixed(1)}%;top:${(rnd() * 98).toFixed(1)}%">${Math.floor(4 + rnd() * 52)}</span>`;
    $('#chartbg').innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="none" stroke="#1d4fa3" stroke-opacity=".16" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="2 5"><path vector-effect="non-scaling-stroke" d="M-5 22Q20 10 38 26T70 30 105 14"/><path vector-effect="non-scaling-stroke" d="M-5 64Q16 52 30 66T64 74 105 58"/><path vector-effect="non-scaling-stroke" d="M-5 92Q30 80 52 92T105 86"/></g></svg>` + s;
  })();

  /* ---------- 页眉 ---------- */
  const bunting = $('#bunting');
  bunting.innerHTML = G.hoist(false);
  if (S.ending === 'A') bunting.classList.add('told');
  $('#nav').innerHTML = G.NAV.map((id) => `<button data-go="${id}" data-nav="${id}">${G.pages[id].title}</button>`).join('');

  /* ---------- 逐帧循环 ---------- */
  const loops = new Set();
  (function tick() { loops.forEach((f) => f()); requestAnimationFrame(tick); })();
  let pageLoops = [];
  const addLoop = (f) => { loops.add(f); pageLoops.push(f); };
  const clearLoops = () => { pageLoops.forEach((f) => loops.delete(f)); pageLoops = []; };

  /* =====================================================================
     夜景
     ===================================================================== */
  const SHORT = 0.24, LONG = 1.0, GAP = 0.3, GGAP = 1.55;
  function layout(groups, t0) {
    const iv = []; let t = t0;
    groups.forEach((g, gi) => {
      if (gi) t += GGAP - GAP;
      g.forEach((s) => { const d = s === 'L' ? LONG : SHORT; iv.push([t, t + d]); t += d + GAP; });
    });
    return { iv, end: t - GAP };
  }
  const env = (t, a, b) => (t < a ? 0 : t <= b ? 1 - Math.exp(-(t - a) / 0.035) : (1 - Math.exp(-(b - a) / 0.035)) * Math.exp(-(t - b) / 0.09));
  const MOVE47 = [['S'], ['S', 'S', 'S', 'S', 'S', 'S', 'S'], ['S', 'S'], ['S', 'S', 'S']];
  const LAST = [['L', 'S', 'S', 'S', 'S'], ['L', 'S', 'S', 'S', 'S', 'S']];
  const CYCLE = 16, AMBER_AT = 4.2;

  function buildScene(p, k7text) {
    const rnd = G.rng(77); let stars = '';
    for (let i = 0; i < 120; i++) {
      const x = rnd() * 1200, y = rnd() * 300, r = 0.4 + rnd() * 1.1, o = 0.25 + rnd() * 0.6;
      stars += `<circle${rnd() < 0.3 ? ` class="star" style="animation-delay:-${(rnd() * 4).toFixed(1)}s"` : ''} cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#dbe8ff" opacity="${o.toFixed(2)}"/>`;
    }
    const wave = (y, amp, cls, o, w) => {
      let d = `M-240 ${y}`; for (let x = -240; x < 1500; x += 120) d += ` q30 ${-amp} 60 0 t60 0`;
      return `<path class="wave ${cls}" d="${d}" fill="none" stroke="rgba(170,205,235,${o})" stroke-width="${w}"/>`;
    };
    const refl = (cx, color, key) => {
      let s = ''; const r2 = G.rng(cx);
      for (let i = 0; i < 13; i++) { const y = 338 + i * i * 1.02 + i * 2, w = 5 + i * 3.4 + r2() * 8; s += `<ellipse class="shim" style="animation-delay:-${(r2() * 2.4).toFixed(1)}s" cx="${cx + (r2() - 0.5) * 6}" cy="${y.toFixed(0)}" rx="${w.toFixed(0)}" ry="${(0.9 + i * 0.12).toFixed(1)}" fill="${color}" opacity="${(0.9 - i * 0.055).toFixed(2)}"/>`; }
      return `<g data-k="${key}" style="opacity:0">${s}</g>`;
    };
    return `<svg class="scene" viewBox="0 0 1200 520" role="img" aria-label="夜里的雾岬灯塔。主灯每十六秒连闪三下；塔身回廊上另有一盏黄色小灯，在主灯之后分组闪烁。">
    <defs>
      <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060e"/><stop offset=".68" stop-color="#0a1629"/><stop offset="1" stop-color="#17334d"/></linearGradient>
      <linearGradient id="${p}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2439"/><stop offset=".35" stop-color="#081524"/><stop offset="1" stop-color="#02050b"/></linearGradient>
      <radialGradient id="${p}glow"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="#e6f3ff" stop-opacity=".6"/><stop offset="1" stop-color="#9cc8ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}amb"><stop offset="0" stop-color="#fff2c4"/><stop offset=".28" stop-color="#f4a62a" stop-opacity=".75"/><stop offset="1" stop-color="#f4a62a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}cool"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#cfe6ff" stop-opacity=".7"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}bL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#eef7ff" stop-opacity=".95"/><stop offset=".5" stop-color="#eef7ff" stop-opacity=".3"/><stop offset="1" stop-color="#eef7ff" stop-opacity="0"/></linearGradient>
      <linearGradient id="${p}bR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef7ff" stop-opacity=".95"/><stop offset="1" stop-color="#eef7ff" stop-opacity=".1"/></linearGradient>
      <linearGradient id="${p}tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c3849"/><stop offset=".45" stop-color="#8794a6"/><stop offset="1" stop-color="#3a4658"/></linearGradient>
      <filter id="${p}b6" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="${p}b30" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="28"/></filter>
    </defs>
    <rect width="1200" height="331" fill="url(#${p}sky)"/>
    ${stars}
    <g filter="url(#${p}b30)" opacity=".5"><ellipse class="fog" cx="380" cy="300" rx="420" ry="22" fill="#b9d3e6" opacity=".16"/><ellipse class="fog" cx="900" cy="268" rx="300" ry="16" fill="#b9d3e6" opacity=".10" style="animation-duration:83s"/></g>
    <rect y="330" width="1200" height="190" fill="url(#${p}sea)"/>
    <path d="M0 330.5H1200" stroke="#3b5f7d" stroke-opacity=".5" stroke-width="1"/>
    <path d="M196 330.5q22-12 50-14 9-10 22-7 26 3 50 21z" fill="#050b15"/><rect x="261.5" y="304" width="3" height="8" fill="#050b15"/>
    <g filter="url(#${p}b6)"><polygon data-k="beamL" style="opacity:0" points="957,120 -60,-10 -60,236" fill="url(#${p}bL)"/><polygon data-k="beamR" style="opacity:0" points="963,120 1260,66 1260,190" fill="url(#${p}bR)"/></g>
    ${wave(352, 2.2, 'w1', 0.1, 1)}${wave(388, 3.2, 'w2', 0.09, 1.3)}${wave(436, 4.4, 'w3', 0.08, 1.8)}${wave(486, 6, 'w1', 0.07, 2.4)}
    <ellipse data-k="sheen" style="opacity:0" cx="560" cy="337" rx="470" ry="7" fill="#cfe6ff" filter="url(#${p}b6)"/>${refl(742, '#e6f3ff', 'refl')}${refl(668, '#f4a62a', 'arefl')}
    <polygon data-k="acone" style="opacity:0" points="934,142 250,298 250,332" fill="#f4a62a" filter="url(#${p}b6)"/>
    <path d="M748 520L786 384Q812 342 866 322L902 301Q958 286 1012 291L1200 262V520Z" fill="#04080f"/>
    <path d="M786 384Q812 342 866 322L902 301Q958 286 1012 291L1200 262" fill="none" stroke="#7f9bb8" stroke-opacity=".16" stroke-width="1.2"/>
    <polygon points="938,297 982,297 974,150 946,150" fill="url(#${p}tw)"/>
    <rect x="955" y="273" width="10" height="24" rx="5" fill="#0b111b"/><rect x="957" y="232" width="6" height="10" rx="3" fill="#0b111b"/><rect x="957" y="192" width="6" height="10" rx="3" fill="#0b111b"/>
    <rect x="950" y="157" width="5" height="7" fill="#0b111b"/>
    <rect x="933" y="145" width="54" height="6" fill="#141c29"/><path d="M934 145v-9M942 145v-9M950 145v-9M970 145v-9M978 145v-9M986 145v-9M933 136H987" stroke="#2a384c" stroke-width="1.2" fill="none"/>
    <rect x="949" y="108" width="22" height="37" fill="#0b121e" stroke="#33455c" stroke-width="1"/><path d="M956.3 108v37M963.6 108v37" stroke="#33455c" stroke-width=".8"/>
    <path d="M946 108Q960 88 974 108Z" fill="#111a28"/><path d="M960 92v-9" stroke="#111a28" stroke-width="2"/>
    <circle data-k="glow" style="opacity:0" cx="960" cy="124" r="170" fill="url(#${p}glow)"/>
    <circle data-k="core" style="opacity:.25" cx="960" cy="124" r="5" fill="#fff"/>
    <circle data-k="aglow" style="opacity:0" cx="933" cy="142" r="40" fill="url(#${p}amb)"/>
    <circle data-k="acore" style="opacity:.12" cx="933" cy="142" r="2.4" fill="#ffe9b0"/>
    <circle data-k="wglow" style="opacity:0" cx="952" cy="160" r="20" fill="url(#${p}cool)"/>
    <circle data-k="iglow" style="opacity:0" cx="263" cy="303" r="18" fill="url(#${p}amb)"/>
    <circle data-k="icore" style="opacity:0" cx="263" cy="303" r="1.5" fill="#ffe9b0"/>
    <g font-family="IBM Plex Mono,SF Mono,Menlo,monospace,PingFang SC" font-size="12" fill="#9fd3d8" stroke="none">
      <path d="M925 146L275 306" stroke="#9fd3d8" stroke-opacity=".3" stroke-dasharray="2 8" fill="none"/>
      <text x="548" y="212" opacity=".65" transform="rotate(-13.8 548 212)">4.2 n mile　白水门</text>
      <text x="150" y="286" opacity=".7">鹭屿　灯桩已撤 2001</text>
      <path d="M972 114L1030 90" stroke="#9fd3d8" stroke-opacity=".5" fill="none"/><text x="1036" y="92" opacity=".85">K1 主灯　Fl(3)W 16s</text>
      <path d="M927 140L870 112" stroke="#9fd3d8" stroke-opacity=".5" fill="none"/><text data-k="k7" x="864" y="108" text-anchor="end" fill="#f4c56a">${k7text}</text>
    </g>
    </svg>`;
  }

  function Scene(root, opt) {
    this.el = {}; $$('[data-k]', root).forEach((n) => { this.el[n.dataset.k] = n; });
    this.main = []; this.ch = { amber: [], win: [], isle: [] }; this.gain = { amber: 1, win: 1, isle: 1 };
    this.t0 = now(); this.k = -1; this.opt = opt || {};
  }
  Scene.prototype.play = function (ch, groups, gain) {
    const L = layout(groups, now() + 0.35);
    this.ch[ch].push(...L.iv); if (gain != null) this.gain[ch] = gain;
    return (L.end - now()) * 1000 + 250;
  };
  Scene.prototype.frame = function () {
    const t = now(), e = this.el, k = Math.floor((t - this.t0) / CYCLE);
    if (k !== this.k) {
      this.k = k; const b = this.t0 + k * CYCLE;
      this.main.push(b + 0.5, b + 1.5, b + 2.5);
      if (this.main.length > 9) this.main.splice(0, this.main.length - 9);
      if (this.opt.onCycle) this.opt.onCycle(k, b, this);
    }
    let im = 0; for (const c of this.main) { const d = (t - c) / 0.17; im = Math.max(im, Math.exp(-d * d)); }
    const I = {};
    for (const ch in this.ch) {
      const a = this.ch[ch]; let v = 0;
      for (const iv of a) v = Math.max(v, env(t, iv[0], iv[1]));
      I[ch] = v * this.gain[ch];
      while (a.length && t - a[0][1] > 3) a.shift();
    }
    e.beamL.style.opacity = im * 0.5; e.beamR.style.opacity = im * 0.42; e.glow.style.opacity = im;
    e.core.style.opacity = 0.25 + im * 0.75; e.refl.style.opacity = im * 0.55; e.sheen.style.opacity = im * 0.3;
    e.aglow.style.opacity = I.amber; e.acore.style.opacity = 0.12 + I.amber * 0.88; e.arefl.style.opacity = I.amber * 0.5; e.acone.style.opacity = I.amber * 0.15;
    e.wglow.style.opacity = I.win; e.iglow.style.opacity = I.isle; e.icore.style.opacity = I.isle;
  };

  function mountHome() {
    const lampOn = !(S.sent || S.cut);
    const home = $('#scene-home'), narrow = window.innerWidth < 700;
    home.innerHTML = buildScene('h', lampOn ? 'K7　未登记' : 'K7　无电流');
    home.scrollLeft = home.scrollWidth;
    const sc = new Scene($('#scene-home'), {
      onCycle(k, b, s) {
        if (lampOn) s.ch.amber.push(...layout(MOVE47, b + AMBER_AT).iv);
        else if (S.ending === 'A' && k % 3 === 1) { s.gain.isle = 0.5; s.ch.isle.push(...layout([['L', 'S', 'S', 'S', 'S', 'S']], b + 5).iv); }
      },
    });
    /* 记录带：K1、K7 两路支路电流，40 像素一秒 */
    const PX = 40, W = CYCLE * PX; let pulses = '', ticks = '';
    for (let c = 0; c < 4; c++) {
      [0.5, 1.5, 2.5].forEach((m) => { pulses += `<rect x="${(c * CYCLE + m - 0.17) * PX}" y="12" width="${0.34 * PX}" height="14" fill="#e6f3ff"/>`; });
      if (lampOn) layout(MOVE47, AMBER_AT).iv.forEach((iv) => { pulses += `<rect x="${(c * CYCLE + iv[0]) * PX}" y="38" width="${(iv[1] - iv[0]) * PX}" height="14" fill="#f4a62a"/>`; });
      for (let s = 0; s < CYCLE; s++) ticks += `<path d="M${(c * CYCLE + s) * PX} 58v${s % 4 === 0 ? 6 : 3}" stroke="#35506e"/>`;
    }
    const vx = narrow ? 340 : 0;
    $('#strip-home').innerHTML = `<svg class="strip" viewBox="${vx} 0 ${narrow ? 520 : 1200} 66" role="img" aria-label="支路电流记录带。K1 一行每周期三个脉冲；K7 一行的脉冲分四组。">
      <g id="stripG"><path d="M0 26H${W * 4}M0 52H${W * 4}" stroke="#1d2c44"/>${pulses}${ticks}</g>
      <rect x="${vx}" width="${narrow ? 44 : 64}" height="66" fill="#04070e"/><path d="M${vx + (narrow ? 44 : 64)} 0V66" stroke="#1d2c44"/>
      <g font-family="IBM Plex Mono,SF Mono,Menlo,monospace" font-size="${narrow ? 15 : 12}"><text x="${vx + (narrow ? 8 : 14)}" y="24" fill="#e6f3ff">K1</text><text x="${vx + (narrow ? 8 : 14)}" y="50" fill="#f4c56a">K7</text></g>
      <path d="M600 2V64" stroke="#9fd3d8" stroke-opacity=".8"/><path d="M595 2h10M595 64h10" stroke="#9fd3d8"/>
    </svg>`;
    const stripG = $('#stripG');
    addLoop(() => { sc.frame(); const tc = (now() - sc.t0) % CYCLE; stripG.setAttribute('transform', `translate(${(600 - tc * PX - W).toFixed(1)} 0)`); });
  }

  /* =====================================================================
     棋盘（第六十一局）
     ===================================================================== */
  const B0 = [['r', '帅', 4, 9], ['r', '仕', 3, 9], ['r', '仕', 5, 9], ['r', '车', 2, 9], ['r', '兵', 4, 4], ['b', '将', 4, 0], ['b', '士', 5, 0], ['b', '车', 8, 0], ['b', '马', 0, 4]];
  const MV = [
    { s: 'r', c: '7511', n: '兵五进一', m: [4, 4, 4, 3], no: 44 }, { s: 'b', c: '1913', n: '车9进3', m: [8, 0, 8, 3], no: 44 },
    { s: 'r', c: '1714', n: '车七进四', m: [2, 9, 2, 5], no: 45 }, { s: 'b', c: '2112', n: '马1进2', m: [0, 4, 1, 6], no: 45 },
    { s: 'r', c: '7511', n: '兵五进一', m: [4, 3, 4, 2], no: 46 }, { s: 'b', c: '1915', n: '车9进5', m: [8, 3, 8, 8], no: 46 },
  ];
  const GIFT = { s: 'r', c: '1723', n: '车七退三', m: [2, 5, 2, 8], no: 47 };
  const WIN = { s: 'r', c: '1715', n: '车七进五', m: [2, 5, 2, 0], no: 47, ghost: '他没有走这一手' };
  const MATE = { s: 'b', c: '', n: '马2进3', m: [1, 6, 2, 8], no: 47, ghost: '陈海生没有走这一手' };
  const CN = '零一二三四五六七八九';
  const bx = (x) => 46 + x * 54, by = (y) => 52 + y * 54;

  function mountBoard() {
    let g = '';
    for (let y = 0; y < 10; y++) g += `<path d="M${bx(0)} ${by(y)}H${bx(8)}"/>`;
    for (let x = 0; x < 9; x++) g += x === 0 || x === 8 ? `<path d="M${bx(x)} ${by(0)}V${by(9)}"/>` : `<path d="M${bx(x)} ${by(0)}V${by(4)}M${bx(x)} ${by(5)}V${by(9)}"/>`;
    g += `<path d="M${bx(3)} ${by(0)}L${bx(5)} ${by(2)}M${bx(5)} ${by(0)}L${bx(3)} ${by(2)}M${bx(3)} ${by(7)}L${bx(5)} ${by(9)}M${bx(5)} ${by(7)}L${bx(3)} ${by(9)}"/>`;
    let nums = '';
    for (let x = 0; x < 9; x++) nums += `<text x="${bx(x)}" y="22">${x + 1}</text><text x="${bx(x)}" y="${by(9) + 42}">${CN[9 - x]}</text>`;
    const pcs = B0.map((p, i) => `<g class="pc ${p[0]}" id="pc${i}" style="transform:translate(${bx(p[2])}px,${by(p[3])}px)"><circle r="23"/><circle class="in" r="19"/><text y="1">${p[1]}</text></g>`).join('');
    $('#board').innerHTML = `<svg class="board" viewBox="0 0 524 594" role="img" aria-label="象棋盘。上方黑方陈海生，下方红方沈望潮，中间的河界写着白水门。">
      <g stroke="#5d4319" stroke-width="1.3" fill="none">${g}<rect x="${bx(0) - 5}" y="${by(0) - 5}" width="${54 * 8 + 10}" height="${54 * 9 + 10}" stroke-width="2.4"/></g>
      <g font-family="Kaiti SC,STKaiti,KaiTi,serif" fill="#5d4319"><text x="${bx(0) + 12}" y="${by(4) + 34}" font-size="19" opacity=".8">↑ 鹭屿 · 黑</text><text x="262" y="${by(4) + 35}" font-size="23" letter-spacing="16" opacity=".6" text-anchor="middle">白水门</text><text x="${bx(8) - 12}" y="${by(4) + 34}" font-size="19" opacity=".8" text-anchor="end">雾岬 · 红 ↓</text></g>
      <g font-family="IBM Plex Mono,Menlo,monospace,Kaiti SC" font-size="13" fill="#5d4319" text-anchor="middle" opacity=".8">${nums}</g>
      <circle class="mark" id="mk0" r="9" style="opacity:0"/><circle class="mark" id="mk1" r="27" style="opacity:0"/>
      ${pcs}</svg>`;

    let line = MV.slice(), ply = 0, auto = null;
    if (S.board) line.push(GIFT);
    const banner = $('#banner');

    function show() {
      const pos = B0.map((p) => ({ x: p[2], y: p[3], dead: false }));
      let last = null;
      for (let i = 0; i < ply; i++) {
        const m = line[i].m; last = line[i];
        pos.forEach((p) => { if (!p.dead && p.x === m[2] && p.y === m[3]) p.dead = true; });
        const mover = pos.find((p) => !p.dead && p.x === m[0] && p.y === m[1]); mover.x = m[2]; mover.y = m[3];
      }
      pos.forEach((p, i) => { const el = $('#pc' + i); el.style.transform = `translate(${bx(p.x)}px,${by(p.y)}px)`; el.classList.toggle('dead', p.dead); });
      const mk0 = $('#mk0'), mk1 = $('#mk1');
      if (last) { mk0.setAttribute('cx', bx(last.m[0])); mk0.setAttribute('cy', by(last.m[1])); mk1.setAttribute('cx', bx(last.m[2])); mk1.setAttribute('cy', by(last.m[3])); mk0.style.opacity = mk1.style.opacity = 0.9; }
      else mk0.style.opacity = mk1.style.opacity = 0;
      banner.textContent = !last ? '' : last === WIN ? '绝杀　（他没有走这一手）' : last === MATE ? '绝杀　（陈海生没有走这一手）' : last === GIFT ? '红车退入马口' : '';
      $$('#moves button').forEach((b) => b.classList.toggle('on', +b.dataset.ply === ply));
    }
    function list() {
      let h = '';
      line.forEach((m, i) => {
        h += `<button data-ply="${i + 1}"><span class="n">${m.no}</span><span class="s ${m.s}">${m.s === 'r' ? '红' : '黑'}</span><span class="c">${m.c ? [...m.c].map((d) => CN[+d]).join('') : '——'}</span><span class="m">${m.n}${m.ghost ? `　<small>（${m.ghost}）</small>` : ''}</span></button>`;
      });
      if (!S.board) h += `<div class="ask"><p><b>47　红</b>　日志上写的是“（不记）”。可这一手，那盏灯夜夜都在发。</p>
        <div class="digits"><input id="d1" inputmode="numeric" maxlength="1" aria-label="第一数"><input id="d2" inputmode="numeric" maxlength="1" aria-label="第二数"><input id="d3" inputmode="numeric" maxlength="1" aria-label="第三数"><input id="d4" inputmode="numeric" maxlength="1" aria-label="第四数"><button class="btn" id="b-put">摆上</button></div>
        <p class="msg" id="msg61" aria-live="polite"></p></div>`;
      $('#moves').innerHTML = h;
      $$('#moves button[data-ply]').forEach((b) => { b.onclick = () => { stop(); ply = +b.dataset.ply; show(); }; });
      if (!S.board) wireAsk();
    }
    function stop() { clearInterval(auto); auto = null; }
    function wireAsk() {
      const ds = [1, 2, 3, 4].map((i) => $('#d' + i));
      ds.forEach((d, i) => {
        d.oninput = () => { d.value = d.value.replace(/[^0-9０-９]/g, '').slice(-1); if (d.value && ds[i + 1]) ds[i + 1].focus(); };
        d.onkeydown = (e) => { if (e.key === 'Backspace' && !d.value && ds[i - 1]) ds[i - 1].focus(); if (e.key === 'Enter') put(); };
      });
      $('#b-put').onclick = put;
      function put() {
        stop();
        const code = ds.map((d) => d.value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248))).join('');
        const msg = $('#msg61');
        if (code.length < 4) { msg.textContent = '四个数，一个格子填一个。'; return; }
        if (code === GIFT.c) {
          S.board = true; save(); line = MV.concat([GIFT]); list(); ply = 7; show(); solved(true); return;
        }
        if (code === WIN.c) {
          line = MV.concat([WIN]); ply = 7; show();
          msg.textContent = '车七进五，一步将死。这是他该走的一手，却不是那盏灯夜夜在发的一手。再数一遍。';
          setTimeout(() => { if (!S.board) { line = MV.slice(); ply = 6; show(); } }, 3600); return;
        }
        const pc = '车马炮相仕帅兵'[+code[0] - 1], act = '进退平'[+code[2] - 1];
        const box = $('.ask'); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
        msg.textContent = pc && act && +code[1] && +code[3]
          ? `照对照表译出来是“${pc}${CN[+code[1]]}${act}${CN[+code[3]]}”。盘面上走不出这一手。再数一遍那盏灯。`
          : '对照表上译不出这四个数。再数一遍那盏灯。';
      }
    }
    function solved(firstTime) {
      $('#after61').innerHTML = G.after61();
      if (!firstTime) $$('#after61 .reveal > *').forEach((n) => { n.style.animation = 'none'; });
      $('#b-alt').onclick = () => { stop(); line = MV.concat([WIN]); list(); ply = 7; show(); };
      $('#b-mate').onclick = () => { stop(); line = MV.concat([GIFT, MATE]); list(); ply = 8; show(); };
      $('#b-back').onclick = () => { stop(); line = MV.concat([GIFT]); list(); ply = 7; show(); };
    }
    $('#b-first').onclick = () => { stop(); ply = 0; show(); };
    $('#b-prev').onclick = () => { stop(); ply = Math.max(0, ply - 1); show(); };
    $('#b-next').onclick = () => { stop(); ply = Math.min(line.length, ply + 1); show(); };
    list(); show();
    if (S.board) solved(false);
    auto = setInterval(() => { if (ply >= line.length) return stop(); ply++; show(); }, 1150);
    pageCleanup = stop;
  }
  let pageCleanup = null;

  /* ---------- 凸轮盒：甲轮转动，齿过触点时小灯亮 ---------- */
  function mountCam() {
    const wheel = $('#camA'), lamp = $('#camLamp'), t0 = now();
    addLoop(() => {
      const th = ((now() - t0) * 15) % 360;
      wheel.setAttribute('transform', `rotate(${(-th).toFixed(2)})`);
      let on = false; for (const a of G.camAngles) if (Math.abs(((th - a + 540) % 360) - 180) < 4.2) on = true;
      lamp.setAttribute('opacity', on ? 1 : 0.12);
    });
  }

  /* =====================================================================
     控制台
     ===================================================================== */
  const glyphs = (seq) => [...seq].map((c) => `<i class="${c === 'L' ? 'l' : 's'}"></i>`).join('');
  function mountHMI() {
    const el = $('#hmi');
    if (!S.unlocked) {
      el.innerHTML = `<div class="hmi"><h2>PRB-21 航标遥测终端　雾岬<span>未登录</span></h2>
        <form class="login" id="loginf"><label for="pw">维护口令</label><input id="pw" type="text" inputmode="numeric" autocomplete="off" maxlength="12"><p class="err" id="pwerr" aria-live="polite"></p><div><button class="hbtn" type="submit">登录</button></div></form></div>`;
      $('#loginf').onsubmit = (e) => {
        e.preventDefault();
        const v = $('#pw').value.replace(/[^0-9０-９]/g, '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248));
        if (v === '28275') { S.unlocked = true; save(); mountHMI(); }
        else { const f = $('#loginf'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); $('#pwerr').textContent = '口令错误。'; }
      };
      return;
    }
    const k7 = S.sent ? `<span class="led off"></span>已自行断电（光敏回路动作）` : S.cut ? `<span class="led off"></span>人工断开` : `<span class="led amb"></span>每夜 22:00–22:05　累计 ${G.comma(G.nights)} 夜`;
    let right;
    if (S.sent) {
      right = `<div class="panel"><h3>K7 支路</h3><p>昨夜 22 时，柜背检修灯闪光后，K7 负载工作约二十秒，随后电流归零。</p><p>发出的闪光：</p><div class="keyline">${glyphs(S.sent)}</div><div><button class="hbtn go" data-go="night">看当晚回放</button>　<button class="hbtn" data-go="close">去写结案说明</button></div></div>`;
    } else if (S.cut) {
      right = `<div class="panel"><h3>K7 支路</h3><p>已人工断开。负载不再工作。</p><div><button class="hbtn go" id="restore">恢复 K7 供电</button></div></div>`;
    } else {
      right = `<div class="panel"><h3>K8　柜背检修灯　手动闪光</h3><p>这盏灯在控制柜背面，正对着凸轮盒的光敏管。编好一串闪光，今晚 22:00 发出。</p>
          <div class="keyline" id="keyline"><em>（空）</em></div>
          <div><button class="hbtn" id="k-s">短 ·</button> <button class="hbtn" id="k-l">长 ▬</button> <button class="hbtn" id="k-del">退一格</button> <button class="hbtn" id="k-clr">清空</button></div>
          <div><button class="hbtn go" id="k-send" disabled>今晚 22:00 发出</button></div><div id="k-confirm"></div></div>
        <div class="panel"><h3>K7　备用支路　断电</h3><p>断开后，未登记负载不再工作。工单要求的“屏蔽”，按这里就算完成。</p><div><button class="hbtn warn" id="k-cut">断开 K7</button></div><div id="c-confirm"></div></div>`;
    }
    el.innerHTML = `<div class="hmi"><h2>PRB-21 航标遥测终端　雾岬<span>在线　${G.fmt(G.today)}</span></h2>
      <div class="branches">
        <div><span>K1</span><span>主灯 PRB-21</span><span><span class="led"></span>自动　闪(3)白16秒</span></div>
        <div><span>K2</span><span>备用灯</span><span><span class="led"></span>待命</span></div>
        <div><span>K3</span><span>雾笛</span><span><span class="led off"></span>停用（1998）</span></div>
        <div><span>K4</span><span>日光阀</span><span><span class="led"></span>正常</span></div>
        <div><span>K5</span><span>蓄电池</span><span><span class="led"></span>浮充</span></div>
        <div><span>K6</span><span>遥测终端</span><span><span class="led"></span>在线</span></div>
        <div class="k7"><span>K7</span><span>备用支路（未登记负载）</span><span>${k7}</span></div>
        <div><span>K8</span><span>柜背检修灯</span><span><span class="led off"></span>手动</span></div>
      </div>
      <div class="panels">${right}</div></div>`;
    if (S.cut && !S.sent) { $('#restore').onclick = () => { S.cut = false; save(); mountHMI(); toast('K7 已恢复供电'); }; return; }
    if (S.sent) return;
    let seq = '';
    const draw = () => { $('#keyline').innerHTML = seq ? glyphs(seq) : '<em>（空）</em>'; $('#k-send').disabled = !seq; $('#k-confirm').innerHTML = ''; };
    $('#k-s').onclick = () => { if (seq.length < 14) seq += 'S'; draw(); };
    $('#k-l').onclick = () => { if (seq.length < 14) seq += 'L'; draw(); };
    $('#k-del').onclick = () => { seq = seq.slice(0, -1); draw(); };
    $('#k-clr').onclick = () => { seq = ''; draw(); };
    $('#k-send').onclick = () => {
      $('#k-confirm').innerHTML = `<div class="confirm"><p>乙轮只转一次。发出去的话收不回来。</p><p>这就是对岸的回话吗？</p><div class="keyline">${glyphs(seq)}</div><div><button class="hbtn go" id="k-yes">是。发出</button>　<button class="hbtn" id="k-no">再想想</button></div></div>`;
      $('#k-no').onclick = draw;
      $('#k-yes').onclick = () => { S.sent = seq; S.cut = false; S.nightDone = false; save(); go('night'); };
    };
    $('#k-cut').onclick = () => {
      $('#c-confirm').innerHTML = `<div class="confirm"><p>断开以后，那盏灯今晚不会再亮。</p><div><button class="hbtn warn" id="c-yes">确认断开</button>　<button class="hbtn" id="c-no">取消</button></div></div>`;
      $('#c-no').onclick = () => { $('#c-confirm').innerHTML = ''; };
      $('#c-yes').onclick = () => { S.cut = true; save(); go('close'); };
    };
  }

  /* =====================================================================
     当晚 22:00
     ===================================================================== */
  const nightEl = $('#night');
  let nightRun = 0, nightLoop = null;
  function closeNight() { nightRun++; if (nightLoop) loops.delete(nightLoop); nightLoop = null; nightEl.hidden = true; nightEl.innerHTML = ''; $('#ticket-btn').hidden = false; }
  function mountNight() {
    if (nightLoop) loops.delete(nightLoop);
    const run = ++nightRun; let skipped = false;
    nightEl.hidden = false; $('#ticket-btn').hidden = true;
    nightEl.innerHTML = `<button class="skip" id="n-skip">跳过</button><div class="stage">${buildScene('n', 'K7　未登记')}</div><div class="caps" id="caps" aria-live="polite"></div>`;
    if (window.innerWidth < window.innerHeight * 0.9) { const sv = $('svg.scene', nightEl); sv.setAttribute('viewBox', '560 0 640 520'); sv.style.aspectRatio = '640/520'; sv.style.width = 'min(100%, 62vh * 640 / 520)'; }
    const sc = new Scene(nightEl), caps = $('#caps');
    nightLoop = () => sc.frame(); loops.add(nightLoop);
    const alive = () => run === nightRun && !nightEl.hidden && !skipped;
    const wait = (ms) => new Promise((res, rej) => setTimeout(() => (alive() ? res() : rej(new Error('stop'))), ms));
    const say = (t, cls) => { const p = document.createElement('p'); p.className = 'line ' + (cls || ''); p.innerHTML = t; caps.appendChild(p); };
    const clear = () => { caps.innerHTML = ''; };
    const truth = S.sent === 'LSSS';
    const seqGroups = [[...S.sent]];
    function finish() {
      sc.el.k7.textContent = 'K7　无电流';
      clear();
      say('然后它灭了。铁盒断了自己的电。');
      const row = document.createElement('div'); row.className = 'row';
      row.innerHTML = `<button class="nbtn" id="n-again">再看一遍最后那两组</button><button class="nbtn" id="n-close">回工单，写结案说明</button>`;
      caps.appendChild(row);
      $('#n-skip').hidden = true;
      $('#n-again').onclick = () => { sc.ch.amber.length = 0; sc.play('amber', LAST); };
      $('#n-close').onclick = () => { closeNight(); go('close'); };
      if (!S.nightDone) { S.nightDone = true; save(); }
    }
    $('#n-skip').onclick = () => { skipped = true; sc.ch.amber.length = 0; sc.ch.win.length = 0; finish(); };
    if (S.nightDone) { finish(); return; }
    (async () => {
      try {
        await wait(1200); say('当晚 22:00　　雾岬');
        await wait(3400); clear(); say(`第${G.cn(G.nights)}夜。`); say('它又发了一遍那一手。', 'dim');
        await wait(sc.play('amber', MOVE47));
        await wait(2000); clear(); say('控制柜背面，检修灯亮了。');
        await wait(sc.play('win', seqGroups) + 600);
        say(truth ? '这句话，陈海生发了两千四百九十一夜。<br>今夜是第一次被收到。' : '光敏管不认内容。有光，棘爪就松。', truth ? '' : 'dim');
        await wait(5200); clear(); say('铁盒里响了一声。乙轮转了。', 'dim');
        await wait(2600);
        await wait(sc.play('amber', LAST));
        await wait(2400); finish();
      } catch (e) { /* 中途离开 */ }
    })();
  }

  /* =====================================================================
     结案
     ===================================================================== */
  function mountClose() {
    const el = $('#closing');
    if (S.cut && !S.sent) {
      el.innerHTML = `<div class="arch-body" style="border-top-width:1.5px"><div class="sheet typed report"><h3>结 案 说 明</h3>
        <div class="item"><span>处理方式</span><p class="ni">已于今日断开控制柜 K7 备用支路。该灯不再发光。在用设备清单与现场一致。</p></div>
        <div class="item"><span>原因</span><p class="ni">未查明。</p></div></div>
        <div class="epi"><p>灯灭了。清单现在对了。</p><p class="soft">它发了${G.cn(G.nights)}夜。到底在发什么，不会有人知道了。</p>
        <div class="ctl"><button class="btn" id="undo-cut">恢复 K7 供电，接着查</button></div></div></div>`;
      $('#undo-cut').onclick = () => { S.cut = false; save(); toast('K7 已恢复供电'); go('console'); };
      return;
    }
    if (!S.nightDone) {
      el.innerHTML = `<div class="arch-body" style="border-top-width:1.5px"><div class="sheet typed report"><h3>结 案 说 明</h3>
        <div class="item"><span>该灯来源</span><p class="ni">（未查明）</p></div><div class="item"><span>处理方式</span><p class="ni">（未处理）</p></div></div>
        <p class="prose">还没有查清，不能结案。${S.sent ? '<button class="btn" data-go="night">看当晚回放</button>' : ''}</p></div>`;
      return;
    }
    const truth = S.sent === 'LSSS';
    const head = `<div class="item"><span>该灯来源</span><p class="ni">末任守塔人沈望潮 1998 年 7 月 1 日离塔前私接的旧信号灯，由定时凸轮盒驱动，不在设备清单上。不是故障。</p></div>
        <div class="item"><span>处理方式</span><p class="ni">未屏蔽。该灯于昨夜 22 时收到应答后，发出最后一句，自行断电。</p></div>`;
    if (S.ending !== 'A') {
      el.innerHTML = `<div class="arch-body" style="border-top-width:1.5px"><div class="sheet typed report"><h3>结 案 说 明</h3>${head}
        <form class="item" id="closef"><span><label for="lastwords">最后一句的译文</label></span><div><input id="lastwords" type="text" autocomplete="off" placeholder="它最后说了什么"><p class="msg" id="closemsg" aria-live="polite"></p><div class="ctl"><button class="btn" type="submit">提交结案</button><button class="btn ghost" type="button" data-go="night">再看一遍回放</button></div></div></form></div></div>`;
      $('#closef').onsubmit = (e) => {
        e.preventDefault();
        const v = $('#lastwords').value.replace(/\s/g, '');
        if (v.includes('明晚见')) { S.ending = 'A'; S.t1 = Date.now(); save(); setTimeout(() => { if (S.ending === 'A') bunting.classList.add('told'); }, 9400); $('#ticket-btn').classList.add('done'); mountClose(true); window.scrollTo(0, 0); }
        else {
          const f = $('#closef'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
          $('#closemsg').textContent = !v ? '还空着。' : v.includes('和') ? '“和”是陈海生说的。这里要填的，是那盏灯最后说的。' : '和对照表对不上。最后两组都是长闪起头，对照表在《橘中秘》的扉页上。';
        }
      };
      return;
    }
    const firstTime = arguments[0] === true;
    const mins = Math.max(1, Math.round(((S.t1 || Date.now()) - S.t0) / 60000));
    const nFound = Object.keys(S.found).filter((id) => G.pages[id] && G.pages[id].no).length;
    const nEx = Object.keys(S.found).filter((id) => G.pages[id] && G.pages[id].ex).length;
    const parts = [
      `<div class="big">认。明晚见。</div>`,
      `<p>第六十一局，红方说“认”，黑方说“和”。<br>总账该记二十八比二十七，还是二十八比二十八，<br>已经没有人能定了。</p>`,
      truth
        ? `<p>沈望潮的灯问了${G.cn(G.nights)}夜。<br>陈海生回了两千四百九十一夜。<br>中间隔着四海里水，和一面铁皮。</p>`
        : `<p>你递进去的那句话，陈海生没有说过。<br>机器分不出来。沈望潮的回答还是这一句。</p><div class="ctl"><button class="btn ghost" id="resend">回到发出之前</button></div>`,
      `<p class="soft">对了。</p>`,
      `<div class="bigflags">${G.hoist(true)}</div>`,
      `<p class="soft">页眉上那串旗，沈望潮逢年过节挂一次，朝着鹭屿。<br>陈列室照旧照片复原，挂了${G.cn(Math.max(1, G.year - 2019))}年，一直当它是装饰。</p>`,
      `<div class="credits">《不在清单上的灯》　完<br>用时 <b>${mins}</b> 分钟　·　调阅档案 <b>${nFound} / ${G.TOTAL}</b>　·　彩蛋 <b>${nEx} / 3</b>　·　看了 <b>${S.hints}</b> 条提示<br>${nEx < 3 ? '还有彩蛋没找到。简介的大事记、交接的那个人、旗串上的那句话，都可以搜一搜。<br>' : ''}首页的海，可以再去看一眼。</div>`,
      `<div class="ctl"><button class="btn" data-go="home">回首页</button><button class="btn ghost" id="again">重新开始</button></div>`,
    ];
    el.innerHTML = `<div class="arch-body" style="border-top-width:1.5px"><div class="sheet typed report" style="justify-self:center;width:100%"><span class="stamp${firstTime ? ' fresh' : ''}" style="top:14px;right:18px">已结案</span><h3>结 案 说 明</h3>${head}
      <div class="item"><span>最后一句</span><p class="ni hand">认。明晚见。</p></div></div>
      <div class="epi">${parts.map((h, i) => h.replace(/^<(\w+)/, `<$1 style="animation-delay:${firstTime ? (0.8 + i * 2.1).toFixed(1) : 0}s"`)).join('')}</div></div>`;
    $$('.bigflags .fl').forEach((n, i) => { n.style.animationDelay = (firstTime ? 0.8 + 4 * 2.1 + i * 0.22 : i * 0.05).toFixed(2) + 's'; });
    const rs = $('#resend'); if (rs) rs.onclick = () => { S.sent = null; S.nightDone = false; S.ending = null; S.t1 = null; save(); bunting.classList.remove('told'); $('#ticket-btn').classList.remove('done'); go('console'); };
    armReset($('#again'));
  }
  function armReset(btn) {
    let armed = false;
    btn.onclick = () => {
      if (!armed) { armed = true; btn.textContent = '进度会清空。再点一次确认'; return; }
      try { localStorage.removeItem(KEY); } catch (e) { /* 无存储 */ }
      S = fresh(); bunting.classList.remove('told'); $('#ticket-btn').classList.remove('done'); go('home'); openDesk(true);
    };
  }

  /* =====================================================================
     路由与检索
     ===================================================================== */
  const view = $('#view'), foot = $('#foot');
  const after = { home: mountHome, game61: mountBoard, cam: mountCam, console: mountHMI, night: mountNight, close: mountClose };
  const KEYS = {};
  const norm = (q) => q.trim().replace(/[\s《》〈〉「」『』“”"'‘’·.。，,、！!？?]/g, '').replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).toUpperCase();
  Object.keys(G.pages).forEach((id) => (G.pages[id].keys || []).forEach((k) => { KEYS[norm(k)] = id; }));
  const allowed = (id) => !!G.pages[id] && (G.NAV.includes(id) || S.found[id] || id === 'close');

  function toast(text) {
    const old = $('#toast'); if (old) old.remove();
    const t = document.createElement('div'); t.id = 'toast'; t.textContent = text; document.body.appendChild(t);
    setTimeout(() => t.remove(), 3300);
  }
  function go(id) {
    if (!G.pages[id]) id = 'home';
    if (id === 'night' && !S.sent) id = 'console';
    clearLoops(); if (pageCleanup) { pageCleanup(); pageCleanup = null; }
    if (id !== 'night' && !nightEl.hidden) closeNight();
    const p = G.pages[id], isNew = !S.found[id];
    S.found[id] = true; S.cur = id; save();
    view.innerHTML = p.render(S);
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    $$('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.nav === id));
    const n = Object.keys(S.found).filter((k) => G.pages[k] && G.pages[k].no).length;
    foot.innerHTML = `<span>${p.ex ? `彩蛋 <b>EX ${p.ex} / 3</b>` : `档案 <b>${pad(p.no)} / ${G.TOTAL}</b>`}　${p.title}</span><span>已调阅 <b>${n} / ${G.TOTAL}</b>　·　临海县航标文化陈列室　·　雾天闭馆</span>`;
    window.scrollTo(0, 0);
    if (isNew && (p.keys || p.ex)) {
      const st = $('#stamp'); if (st) st.classList.add('fresh');
      toast(p.ex ? `找到彩蛋　EX ${p.ex} / 3` : `调阅新档案　第 ${pad(p.no)} 号`);
    }
    if (after[id]) after[id]();
    try { if (location.hash.slice(1) !== id) location.hash = id; } catch (e) { /* 沙箱里改不了地址也无妨 */ }
  }
  G.go = go;

  const seek = $('#seek'); let seekTimer = null;
  const MISS = ['档案里没有这个词。换一个更具体的：人名、物件名、书名。', '没有检索到。一次只输一个词，不要带标点。', '没有这一条。页面上那些专有名词，都可以试试。'];
  let missN = 0;
  function search(raw) {
    const q = norm(raw); if (!q) return;
    clearTimeout(seekTimer);
    seek.hidden = false; seek.classList.remove('miss');
    $('#seek-t').textContent = '检索中……'; $('#seek-s').textContent = '';
    const multi = /[\s,，、]/.test(raw.trim());
    seekTimer = setTimeout(() => {
      const id = !multi && KEYS[q];
      if (id) { seek.hidden = true; $('#q').value = ''; $('#q').blur(); go(id); return; }
      seek.classList.add('miss');
      $('#seek-t').textContent = `未检索到“${raw.trim()}”`;
      $('#seek-s').textContent = multi ? '一次只输入一个词。' : G.special[q] || MISS[missN++ % MISS.length];
      seekTimer = setTimeout(() => { seek.hidden = true; }, 3200);
    }, 760);
  }
  seek.onclick = () => { if (seek.classList.contains('miss')) { clearTimeout(seekTimer); seek.hidden = true; } };
  $('#searchform').onsubmit = (e) => { e.preventDefault(); search($('#q').value); };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) { closeDesk(); go(b.dataset.go); } });
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && id !== S.cur && allowed(id)) go(id); });

  /* =====================================================================
     工单（开场、提示、进度）
     ===================================================================== */
  const desk = $('#desk'), tbtn = $('#ticket-btn');
  function stage() {
    const f = S.found;
    if (S.ending) return 12;
    if (!f.lamp) return 0; if (!f.shen) return 1; if (!f.log) return 2; if (!f.book) return 3; if (!f.game61) return 4;
    if (!S.board) return 5; if (!f.luyu) return 6; if (!f.notebook) return 7; if (!f.cam) return 8; if (!S.unlocked) return 9;
    if (!S.sent) return 10; return 11;
  }
  function openDesk(intro) {
    desk.hidden = false; desk.className = intro ? '' : 'over'; tbtn.hidden = true; desk.scrollTop = 0;
    let side;
    if (intro) {
      side = `${G.handover}<button class="enterbtn" id="enter">打开官网</button>${G.howto}`;
    } else {
      const st = stage(), lv = S.hintLv[st] || 0, hs = G.hints[st];
      const founds = Object.keys(G.pages).filter((id) => S.found[id] && (G.pages[id].keys || G.pages[id].ex || id === 'close'))
        .map((id) => `<button data-go="${id}" class="${G.pages[id].ex ? 'ex' : ''}">${G.pages[id].no ? pad(G.pages[id].no) : 'EX'}　${G.pages[id].title}</button>`).join('');
      side = `<div class="hintbox"><h3>何屿的提示</h3>${hs.slice(0, lv).map((h) => `<p>${h}</p>`).join('') || '<span style="color:#7f93a3">卡住的时候再看。一共三层，越往后说得越明白。</span>'}
          ${lv < 3 ? `<div><button class="dbtn" id="hint">${['给一点提示', '再明白一点', '直接告诉我'][lv]}</button></div>` : ''}</div>
        <div class="hintbox"><h3>已调阅的档案</h3><div class="found">${founds || '<span style="color:#7f93a3">还没有。档案要靠检索框搜出来。</span>'}</div></div>
        <div style="display:flex;flex-wrap:wrap;gap:10px"><button class="enterbtn" id="enter" style="font-size:15px;padding:10px 18px">回到官网</button><button class="dbtn" data-go="close">结案说明</button><button class="dbtn" id="showhow">玩法</button><button class="dbtn danger" id="reset">重新开始</button></div><div id="howslot"></div>`;
    }
    desk.innerHTML = `<div class="deskin"><div class="gtitle"><h1>不在清单上的<i>灯</i></h1><p>网页解谜　·　约 40 分钟</p></div>${G.ticket()}<div class="side">${side}</div></div>`;
    $('#enter').onclick = () => { if (S.intro) { S.intro = false; S.t0 = Date.now(); save(); } closeDesk(); };
    if (!intro) {
      const hb = $('#hint'); if (hb) hb.onclick = () => { const st = stage(); S.hintLv[st] = (S.hintLv[st] || 0) + 1; S.hints++; save(); openDesk(false); };
      $('#showhow').onclick = () => { $('#howslot').innerHTML = G.howto; };
      armReset($('#reset'));
    }
  }
  function closeDesk() { if (desk.hidden) return; desk.hidden = true; desk.innerHTML = ''; tbtn.hidden = !nightEl.hidden; }
  tbtn.onclick = () => openDesk(false);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !desk.hidden && !S.intro) closeDesk(); });

  /* ---------- 切走标签页时，标题栏替它说一句 ---------- */
  const TITLE = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = !document.hidden ? TITLE : S.ending === 'A' ? '明晚见' : (S.sent || S.cut) ? TITLE : '（它还在发）';
  });

  /* ---------- 启动 ---------- */
  if (S.ending === 'A') tbtn.classList.add('done');
  const h = location.hash.slice(1);
  go(allowed(h) ? h : G.pages[S.cur] ? S.cur : 'home');
  if (S.intro) openDesk(true); else tbtn.hidden = !nightEl.hidden;
})();
