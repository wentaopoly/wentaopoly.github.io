/* 不在清单上的灯 — 页面内容与绘图函数。交互逻辑在 game.js。 */
(function () {
  const G = (window.G = {});
  const pad = (n) => String(n).padStart(2, '0');

  G.rng = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* ---------- 日期：故事的“今天”就是玩家的今天 ---------- */
  G.today = new Date();
  G.day = (n) => { const d = new Date(G.today); d.setDate(d.getDate() - n); return d; };
  G.fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  G.year = G.today.getFullYear();
  G.nights = Math.floor((G.today - new Date(1998, 6, 1)) / 864e5);
  G.cn = function (n) {
    const d = '零一二三四五六七八九', u = ['', '十', '百', '千', '万'];
    const str = String(n); let s = '', zero = false;
    for (let i = 0; i < str.length; i++) {
      const k = +str[i], p = str.length - 1 - i;
      if (k === 0) { zero = true; continue; }
      if (zero && s) s += '零';
      zero = false; s += d[k] + u[p];
    }
    return s.replace(/^一十/, '十') || '零';
  };
  G.comma = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  /* ---------- 国际信号旗 ---------- */
  const FC = { r: '#d6263a', b: '#1d4fa3', y: '#f7d417', k: '#14181c', w: '#ffffff' };
  G.flag = function (L) {
    const R = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${FC[c]}"/>`;
    const P = (pts, c) => `<polygon points="${pts}" fill="${FC[c]}"/>`;
    const X = (c) => `<path d="M0 0L30 20M30 0L0 20" stroke="${FC[c]}" stroke-width="4" fill="none"/>`;
    let s = '', outline = '<rect x=".4" y=".4" width="29.2" height="19.2" fill="none" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>';
    const tail = '<polygon points=".4,.4 29.2,.4 22.6,10 29.2,19.6 .4,19.6" fill="none" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>';
    switch (L) {
      case 'A': s = P('0,0 15,0 15,20 0,20', 'w') + P('15,0 30,0 23,10 30,20 15,20', 'b'); outline = tail; break;
      case 'B': s = P('0,0 30,0 23,10 30,20 0,20', 'r'); outline = tail; break;
      case 'C': s = R(0, 0, 30, 20, 'b') + R(0, 4, 30, 12, 'w') + R(0, 8, 30, 4, 'r'); break;
      case 'D': s = R(0, 0, 30, 20, 'y') + R(0, 5, 30, 10, 'b'); break;
      case 'E': s = R(0, 0, 30, 10, 'b') + R(0, 10, 30, 10, 'r'); break;
      case 'F': s = R(0, 0, 30, 20, 'w') + P('15,0 30,10 15,20 0,10', 'r'); break;
      case 'G': s = [0, 1, 2, 3, 4, 5].map((i) => R(i * 5, 0, 5, 20, i % 2 ? 'b' : 'y')).join(''); break;
      case 'H': s = R(0, 0, 15, 20, 'w') + R(15, 0, 15, 20, 'r'); break;
      case 'I': s = R(0, 0, 30, 20, 'y') + `<circle cx="15" cy="10" r="5" fill="${FC.k}"/>`; break;
      case 'J': s = R(0, 0, 30, 20, 'b') + R(0, 6.67, 30, 6.67, 'w'); break;
      case 'K': s = R(0, 0, 15, 20, 'y') + R(15, 0, 15, 20, 'b'); break;
      case 'L': s = R(0, 0, 15, 10, 'y') + R(15, 0, 15, 10, 'k') + R(0, 10, 15, 10, 'k') + R(15, 10, 15, 10, 'y'); break;
      case 'M': s = R(0, 0, 30, 20, 'b') + X('w'); break;
      case 'N': for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += R(i * 7.5, j * 5, 7.5, 5, (i + j) % 2 ? 'w' : 'b'); break;
      case 'O': s = P('0,0 30,0 30,20', 'r') + P('0,0 0,20 30,20', 'y'); break;
      case 'P': s = R(0, 0, 30, 20, 'b') + R(9, 6, 12, 8, 'w'); break;
      case 'Q': s = R(0, 0, 30, 20, 'y'); break;
      case 'R': s = R(0, 0, 30, 20, 'r') + R(13, 0, 4, 20, 'y') + R(0, 8, 30, 4, 'y'); break;
      case 'S': s = R(0, 0, 30, 20, 'w') + R(9, 6, 12, 8, 'b'); break;
      case 'T': s = R(0, 0, 10, 20, 'r') + R(10, 0, 10, 20, 'w') + R(20, 0, 10, 20, 'b'); break;
      case 'U': s = R(0, 0, 15, 10, 'r') + R(15, 0, 15, 10, 'w') + R(0, 10, 15, 10, 'w') + R(15, 10, 15, 10, 'r'); break;
      case 'V': s = R(0, 0, 30, 20, 'w') + X('r'); break;
      case 'W': s = R(0, 0, 30, 20, 'b') + R(5, 3.5, 20, 13, 'w') + R(10, 7, 10, 6, 'r'); break;
      case 'X': s = R(0, 0, 30, 20, 'w') + R(13, 0, 4, 20, 'b') + R(0, 8, 30, 4, 'b'); break;
      case 'Y': s = R(0, 0, 30, 20, 'y') + [-22, -10, 2, 14, 26].map((x) => P(`${x},20 ${x + 6},20 ${x + 26},0 ${x + 20},0`, 'r')).join(''); break;
      case 'Z': s = P('0,0 15,10 0,20', 'k') + P('0,0 30,0 15,10', 'y') + P('30,0 30,20 15,10', 'b') + P('0,20 30,20 15,10', 'r'); break;
    }
    return `<svg viewBox="0 0 30 20" preserveAspectRatio="none" aria-hidden="true">${s}${outline}</svg>`;
  };
  G.HOIST = ['M', 'I', 'N', 'G', 'W', 'A', 'N', 'J', 'I', 'A', 'N'];
  G.hoistBreak = { 4: 1, 7: 1 };
  G.hoist = (label) => G.HOIST.map((L, i) =>
    `<span class="fl${G.hoistBreak[i] ? ' sp' : ''}" style="animation-delay:${label ? (i * 0.22).toFixed(2) + 's' : ''}">${G.flag(L)}<b>${L}</b></span>`).join('');

  /* ---------- 手迹类小图 ---------- */
  const ZH = [[3, 5, 21, 5], [12, 5, 12, 20], [12, 12.5, 19, 12.5], [6, 11.5, 6, 20], [2, 20, 22, 20]];
  G.zheng = function (n, rnd, color) {
    const j = () => (rnd() - 0.5) * 1.8;
    const ls = ZH.slice(0, n).map((a) => `<line x1="${a[0] + j()}" y1="${a[1] + j()}" x2="${a[2] + j()}" y2="${a[3] + j()}"/>`).join('');
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="${color || '#3a3f4a'}" stroke-width="1.7" stroke-linecap="round" fill="none">${ls}</g></svg>`;
  };
  G.kid = function (text, seed) {
    const rnd = G.rng(seed || 7);
    return `<p class="kid">` + [...text].map((ch) => {
      const r = (rnd() - 0.5) * 7, y = (rnd() - 0.5) * 3.4, s = 0.93 + rnd() * 0.14;
      return `<span style="transform:rotate(${r.toFixed(1)}deg) translateY(${y.toFixed(1)}px) scale(${s.toFixed(2)})">${ch}</span>`;
    }).join('') + `</p>`;
  };
  G.sketch = function (groups, seed) {
    const rnd = G.rng(seed || 3); let x = 14, s = '';
    groups.forEach((g, gi) => {
      if (gi) x += 22;
      g.forEach((k) => {
        const y = 19 + (rnd() - 0.5) * 5;
        if (k === 'L') { s += `<path d="M${x} ${y} q16 ${(rnd() - 0.5) * 5} 34 ${(rnd() - 0.5) * 4}" stroke-width="5.5"/>`; x += 46; }
        else { s += `<path d="M${x} ${y} l${1 + rnd() * 2} ${rnd() - 0.5}" stroke-width="6.5"/>`; x += 16; }
      });
    });
    return `<svg class="sk" viewBox="0 0 ${Math.max(x + 8, 120)} 38" role="img" aria-label="手画的闪光记号"><g stroke="#3a3f4a" stroke-linecap="round" fill="none" opacity=".88">${s}</g></svg>`;
  };

  /* ---------- 版式小件 ---------- */
  const note = (html, wide) => `<aside class="sticky${wide ? ' wide' : ''}">${html}<footer>——何屿</footer></aside>`;
  function arch(id, body) {
    const p = G.pages[id];
    const no = p.ex ? `彩蛋 · EX ${p.ex}` : `馆藏档案 · 第 ${pad(p.no)} 号`;
    return `<article class="arch"><header class="arch-head"><span class="no">${no}</span><h1>${p.title}</h1><span class="q">检索词：${p.keys[0]}</span><span class="stamp" id="stamp">已调阅</span></header><div class="arch-body">${body}</div></article>`;
  }
  const CN4 = (code) => [...code].map((c) => '零一二三四五六七八九'[+c]).join('');

  /* =====================================================================
     页面
     ===================================================================== */
  G.NAV = ['home', 'about', 'visit', 'primer', 'guestbook'];
  G.TOTAL = 16;
  G.pages = {};
  const P = G.pages;

  /* ---- 01 首页 ---- */
  P.home = {
    no: 1, title: '首页',
    render(S) {
      const done = !!(S.sent || S.cut);
      const first = done
        ? `<li class="hot"><time>${G.fmt(G.today)}</time><p>关于“塔身黄灯”的说明：该灯已于昨夜熄灭。原因见结案说明，无需再作处理。</p></li>`
        : `<li class="hot"><time>${G.fmt(G.day(2))}</time><p>关于游客反映“塔身黄灯”的说明：经核对，我室在用设备清单中没有这盏灯。已派单排查，结果另行公布。</p></li>`;
      return `
      <div class="scene-wrap">
        <div class="scene-scroll" id="scene-home"></div>
        <div class="scene-cap"><span class="rec"></span>${done ? '<b>今夜灯光</b>　实时' : '<b>昨夜灯光回放</b>　22:00 – 22:05　循环播放'}<br>数据：塔上控制柜支路电流记录${done ? '　｜　K7 无电流' : ''}<span class="swipe"><br>画面可以左右拖动</span></div>
        <div id="strip-home"></div>
      </div>
      <section class="sec">
        <h2>公告</h2>
        <ul class="notices">
          ${first}
          <li><time>${G.fmt(G.day(23))}</time><p>“夜游灯塔”每周五、周六 19:30–22:30 开放，需提前一天预约。雾天取消。</p></li>
          <li><time>${G.fmt(G.day(51))}</time><p>建塔${G.cn(G.year - 1906)}周年特展“灯塔与守望”在一层展厅展出。</p></li>
        </ul>
      </section>
      <section class="sec">
        <h2>栏目</h2>
        <div class="trio">
          <button data-go="about"><i>1906 —</i><h3>灯塔简介</h3><p>塔高、灯质、白水门水道，以及一百多年里的几件大事。</p></button>
          <button data-go="visit"><i>97 级</i><h3>参观须知</h3><p>开放时间与登塔规定。雾天闭馆。</p></button>
          <button data-go="primer"><i>Fl · Iso · F</i><h3>航标常识</h3><p>怎样认一座灯塔的闪法，怎样读一串信号旗。</p></button>
        </div>
        <p class="cap" style="text-align:left;margin-top:12px">陈列室历年扫描的旧档案，可在页面右上角“档案检索”中查找。一次输入一个词。</p>
      </section>`;
    },
  };

  /* ---- 02 灯塔简介 ---- */
  P.about = {
    no: 2, title: '灯塔简介',
    render() {
      const rnd = G.rng(11); let snd = '';
      const placed = [];
      for (let i = 0; i < 60; i++) {
        const x = 20 + rnd() * 480, y = 20 + rnd() * 290;
        if ((x > 300 && y > 200 && x + y > 560) || (x < 170 && y < 120 && x > 80 && y > 50)) continue;
        if (placed.some((q) => Math.abs(q[0] - x) < 34 && Math.abs(q[1] - y) < 20)) continue;
        placed.push([x, y]);
        snd += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}">${Math.floor(6 + rnd() * 38)}</text>`;
      }
      return `
      <div class="two">
        <div class="prose">
          <p class="lede">雾岬灯塔立在临海县东北端的岬角上，清光绪三十二年（1906 年）由海关海务科建造。</p>
          <p>白色圆柱形砖石塔身，塔高 21.4 米，灯高 58 米。<strong>灯质：闪（3）白 16 秒</strong>，射程 18 海里。</p>
          <p>雾岬与西北面的鹭屿隔白水门水道相望，相距 4.2 海里。白水门多雾，年均雾日七十一天。旧时渔谚说：“过得白水门，才算讨海人。”</p>
          <p>1957 年起，鹭屿设灯桩一座，与雾岬共同标示水道。两处的灯，晴夜里彼此看得见。</p>
        </div>
        <figure style="margin:0">
          <svg class="chartmap" viewBox="0 0 520 330" role="img" aria-label="白水门水道海图：雾岬在东南，鹭屿在西北，相距 4.2 海里">
            <rect width="520" height="330" fill="#fbfdfd"/>
            <path d="M0 0H250Q230 70 190 120T60 170 0 150Z" fill="#cfe2e9"/>
            <path d="M520 330H250Q270 250 330 205T470 150 520 140Z" fill="#cfe2e9"/>
            <path d="M92 70q22-22 50-10 22 12 12 34-14 20-44 16-30-8-18-40z" fill="#f0e2ad" stroke="#15242b" stroke-width="1.2"/>
            <path d="M520 190q-60 4-96 26-36 12-52 20 14 12 30 30 22 30 30 64h88z" fill="#f0e2ad" stroke="#15242b" stroke-width="1.2"/>
            <g font-family="Georgia,serif" font-style="italic" font-size="10.5" fill="#4d5f66" opacity=".8">${snd}</g>
            <path d="M128 92L372 236" stroke="#a3237a" stroke-width="1" stroke-dasharray="6 5"/>
            <text x="262" y="150" font-family="Georgia,serif" font-style="italic" font-size="13" fill="#a3237a" transform="rotate(30.5 262 150)">4.2 M</text>
            <text x="150" y="232" font-family="Songti SC,STSong,serif" font-size="19" letter-spacing="14" fill="#1d4fa3" opacity=".75" transform="rotate(-38 150 232)" font-style="italic">白水门</text>
            <g transform="translate(372 236)"><path d="M0 0L-30-34Q-40-22-22-8Z" fill="#a3237a" opacity=".85"/><path d="M0-7l2 4.8 5.2.4-4 3.4 1.3 5L0 4l-4.5 2.6 1.3-5-4-3.4 5.2-.4z" fill="#15242b"/></g>
            <text x="388" y="262" font-size="13" font-weight="700" fill="#15242b">雾岬</text>
            <text x="388" y="278" font-family="Georgia,serif" font-style="italic" font-size="11" fill="#a3237a">Fl(3)W 16s 58m 18M</text>
            <g transform="translate(128 92)"><circle r="4" fill="none" stroke="#15242b" stroke-width="1.2"/><path d="M-7-7L7 7M7-7L-7 7" stroke="#15242b" stroke-width="1"/></g>
            <text x="100" y="52" font-size="13" font-weight="700" fill="#15242b">鹭屿</text>
            <text x="150" y="64" font-size="10.5" fill="#4d5f66">灯桩（2001 年撤销）</text>
            <g transform="translate(476 44)" stroke="#15242b" fill="none"><path d="M0 22V-22M-6-12L0-22 6-12" stroke-width="1.3"/><text x="-5" y="-27" font-size="12" stroke="none" fill="#15242b" font-family="Georgia,serif">N</text></g>
            <g transform="translate(24 304)" stroke="#15242b" stroke-width="1.2"><path d="M0 0H135M0-4V4M67.5-4V4M135-4V4"/><text x="0" y="-8" font-size="10" stroke="none" fill="#15242b" font-family="Georgia,serif">0</text><text x="63" y="-8" font-size="10" stroke="none" fill="#15242b" font-family="Georgia,serif">1</text><text x="124" y="-8" font-size="10" stroke="none" fill="#15242b" font-family="Georgia,serif">2 M</text></g>
          </svg>
          <figcaption class="cap">白水门水道示意。水深单位：米。不作航行使用。</figcaption>
        </figure>
      </div>
      <section class="sec">
        <h2>大事记</h2>
        <ol class="timeline">
          <li><b>1906</b><span>建成发光，煤油灯，旋转透镜。</span></li>
          <li><b>1938</b><span>战时熄灯。1946 年复明。</span></li>
          <li><b>1957</b><span>鹭屿设灯桩，由岛上渔民陈海生代管。</span></li>
          <li class="mark"><b>1961</b><span>沈望潮到任。此后三十七年，雾岬灯塔由他一人值守。</span></li>
          <li><b>1963</b><span>“六·一二”大雾。雾岬、鹭屿两处守灯人用信号灯接力，引十一条渔船回港。</span></li>
          <li><b>1984</b><span>沈望潮、陈海生同获全省航标系统先进个人，赴省城出席表彰大会。</span></li>
          <li class="mark"><b>1998</b><span>完成自动化改造，实行无人值守。末任守塔人沈望潮退休离塔。</span></li>
          <li><b>2001</b><span>鹭屿灯桩撤销。</span></li>
          <li><b>2019</b><span>辟为航标文化陈列室，对外开放。</span></li>
          <li><b>${G.year}</b><span>“夜游灯塔”项目开放。</span></li>
        </ol>
      </section>`;
    },
  };

  /* ---- 03 参观须知 ---- */
  P.visit = {
    no: 3, title: '参观须知',
    render() {
      return `
      <div class="two">
        <div class="facts">
          <div><span>日间开放</span><span>周二至周日 9:00–16:30（16:00 停止登塔）</span></div>
          <div><span>夜游灯塔</span><span>周五、周六 19:30–22:30，需预约</span></div>
          <div><span>闭馆</span><span>周一；雾天</span></div>
          <div><span>门票</span><span>免费。登塔每次限十二人</span></div>
          <div><span>位置</span><span>临海县雾岬镇岬角路尽头</span></div>
        </div>
        <p class="prose">塔是老塔，楼梯是老楼梯。请穿平底鞋，带上耐心。塔上风大，帽子和纸质门票请拿稳。</p>
      </div>
      <section class="sec">
        <h2>登塔规定</h2>
        <ol class="rules">
          <li>塔内楼梯陡而窄，共 97 级。请扶好栏杆，上行让下行。</li>
          <li>灯笼层为在用航标设施，不开放。</li>
          <li>回廊北侧的旧信号灯是陈列品，已于 1998 年断电。请勿触碰，勿拍打灯罩。</li>
          <li>值班室按原样陈列。请勿翻动桌上物品，勿在墙面刻画。</li>
          <li>夜游期间请勿用强光手电照射海面，以免干扰航行。</li>
          <li>发现展品有异常情况，请告知工作人员。</li>
        </ol>
      </section>`;
    },
  };

  /* ---- 04 航标常识 ---- */
  P.primer = {
    no: 4, title: '航标常识',
    render() {
      const flags = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => `<div>${G.flag(L)}<b>${L}</b></div>`).join('');
      return `
      <div class="prose">
        <p class="lede">每座灯塔都有自己的闪法，叫作灯质。夜里的船分不清塔的样子，只能靠闪法认塔。</p>
        <p>灯质的写法是固定的。雾岬的灯质写作<strong>闪（3）白 16 秒</strong>，海图上缩写为 <span class="kv">Fl(3)W 16s</span>：白光，每 16 秒一个周期，一个周期里连闪 3 下。</p>
      </div>
      <section class="sec">
        <h2>几种常见灯质</h2>
        <div class="lamps">
          <figure><div class="bulb b-f"></div><figcaption><b>F</b>定光<br>一直亮着</figcaption></figure>
          <figure><div class="bulb b-fl"></div><figcaption><b>Fl 4s</b>闪光<br>每 4 秒闪一下</figcaption></figure>
          <figure><div class="bulb b-fl2"></div><figcaption><b>Fl(2) 6s</b>联闪<br>每 6 秒连闪两下</figcaption></figure>
          <figure><div class="bulb b-iso"></div><figcaption><b>Iso 6s</b>等明暗<br>亮 3 秒，灭 3 秒</figcaption></figure>
          <figure><div class="bulb b-fl3"></div><figcaption><b>Fl(3) 16s</b>雾岬<br>每 16 秒连闪三下</figcaption></figure>
        </div>
        <p class="prose" style="margin-top:14px">认灯的办法很笨：盯住它，数。先数一组里闪几下，再数两组之间隔多久。老船工说，会数数的人就会认灯。</p>
      </section>
      <section class="sec">
        <h2>信号灯与灯语</h2>
        <div class="prose">
          <p>主灯只管按灯质发光，不能拿来说话。塔与塔、塔与船之间要通消息，旧时用的是另一盏小的信号灯，靠长短闪光组成电码。</p>
          <p>国际通用的是摩尔斯码。但相邻的灯站之间，常有只在两处通行的私下约定，外人看了不明白，也没有留下成文的记录。</p>
        </div>
      </section>
      <section class="sec">
        <h2>国际信号旗</h2>
        <p class="prose" style="margin-bottom:14px">白天说话用旗。国际信号旗一面代表一个拉丁字母，挂成一串就是一句话。本站页眉上的旗串，照末任守塔人沈望潮每逢节日的挂法复原。</p>
        <div class="flags">${flags}</div>
      </section>`;
    },
  };

  /* ---- 05 留言簿 ---- */
  P.guestbook = {
    no: 5, title: '留言簿',
    render(S) {
      const m = (name, n, text, re, cls, back) => `<article class="${cls || ''}"><header><b>${name}</b><time>${G.fmt(G.day(n))}</time></header><p>${text}</p>${re ? `<p class="re"><b>管理员回复</b>${re}</p>` : ''}${back ? `<p class="re"><b>${name}</b>${back}</p>` : ''}</article>`;
      const after = S.sent ? m('老船工', 0, '昨晚小灯发的不是往常那一手。发完就灭了，我在码头站到半夜，再没亮。<br>老沈等到了？', '', 'new') : '';
      return `
      <p class="prose" style="margin-bottom:16px">欢迎留下您的参观感受。留言经管理员审核后显示。</p>
      <div class="gb">
        ${after}
        ${m('陈小满', 9, '我是鹭屿陈海生的孙女。整理爷爷的遗物，找到一本他记灯的本子，上个月寄给陈列室了。封面上本来有三个字，被水泡过，只剩最后一个“簿”字还认得出。<br>爷爷不识字。里面的字是我小时候替他写的，他说一句，我记一句。那些点点道道是他自己画的。<br>希望对你们有用。', '本子已收到，已扫描入档。谢谢您。')}
        ${m('三年二班周一一', 12, '我数了！黄灯先闪 1 下，停一停，又闪了好多下，我数到 7。妈妈说车要开了，后面没数完。')}
        ${m('老船工', 16, '那是老沈的小灯。<br>以前夜夜十点，他叫对面，对面应他，一来一回，几十年。九八年以后只有这边叫，对面不应了。', '感谢留言。经核对，该信号灯已于 1998 年断电，现为陈列品。', '', '断没断电，你夜里自己来看。')}
        ${m('海风吹', 18, '夜游很值！快十点的时候塔腰上有个小黄灯在闪，一下一下的，不是大灯。问讲解员，讲解员说不知道。')}
        ${m('退休教师老周', 30, '九十七级台阶，上到一半腿就软了。值班室那张小床比我想的还窄。一个人在这里住三十七年，不容易。')}
        ${m('momo', 44, '页面顶上那排小旗子好可爱，有什么意思吗？', '是装饰。照老守塔人当年的挂法复原的。')}
      </div>`;
    },
  };

  /* ---- 06 信号灯 ---- */
  P.lamp = {
    no: 6, title: '旧信号灯', keys: ['信号灯', '旧信号灯', '黄灯', '小灯', '小黄灯', '塔身黄灯'],
    render() {
      return arch('lamp', `
      <div class="sheet typed">
        <h3>展 品 卡</h3>
        <div class="cardgrid" style="margin-top:14px">
          <span>名称</span><span>座式信号灯（带琥珀色滤光罩）</span>
          <span>年代</span><span>1958 年，上海航标厂</span>
          <span>用途</span><span>与对岸灯站及过往船只通联</span>
          <span>位置</span><span>塔身回廊北侧</span>
          <span>现状</span><span>陈列。已断电（据 1998 年验收单）</span>
        </div>
      </div>
      <div class="sheet typed">
        <h3>雾岬灯塔自动化改造验收单</h3>
        <p class="docno">一九九八年七月一日</p>
        <div class="tblwrap"><table class="form">
          <tr><th>项目</th><th>处理</th><th>经办</th></tr>
          <tr><td>主灯</td><td>换装 PRB-21 型灯器，日光阀控制</td><td>航标处工程队</td></tr>
          <tr><td>柴油发电机</td><td>拆除运回</td><td>航标处工程队</td></tr>
          <tr><td>雾笛</td><td>停用，留存</td><td>航标处工程队</td></tr>
          <tr><td>新控制柜</td><td>安装于回廊北窗内侧，接市电及蓄电池</td><td>航标处工程队</td></tr>
          <tr><td>旧信号灯</td><td>断电，留作陈列</td><td><span class="sig">沈望潮</span></td></tr>
          <tr><td>定时凸轮盒</td><td>随信号灯留存</td><td><span class="sig">沈望潮</span></td></tr>
        </table></div>
        <p class="ni" style="margin-top:12px">自即日起，雾岬灯塔实行无人值守。</p>
      </div>
      ${note(`<p>验收单上“断电”两个字，是沈望潮自己签的。整张单子，只有最后两项归他经手。</p><p>我上塔看过。线没有断，从灯座底下绕出来，接在新控制柜的备用支路 K7 上。首页回放里多出来的那一路电流，就是它。</p><p>灯座旁边有个铁盒，就是单子上写的<em>凸轮盒</em>。</p>`)}`);
    },
  };

  /* ---- 07 沈望潮 ---- */
  P.shen = {
    no: 7, title: '沈望潮', keys: ['沈望潮', '老沈', '守塔人', '末任守塔人', '守灯人'],
    render() {
      const rnd = G.rng(42);
      const row = (label, n, y) => {
        let g = `<text x="34" y="${y + 30}" font-size="34" fill="#57523f" font-family="Ma Shan Zheng,Kaiti SC,STKaiti,KaiTi,serif">${label}</text>`;
        let x = 96;
        for (let left = n; left > 0; left -= 5) {
          const k = Math.min(5, left);
          g += `<g transform="translate(${x} ${y - 6}) scale(1.75)" stroke="#57523f" stroke-width="1.5" stroke-linecap="round" fill="none">` +
            ZH.slice(0, k).map((a) => { const j = () => (rnd() - 0.5) * 1.6; return `<line x1="${a[0] + j()}" y1="${a[1] + j()}" x2="${a[2] + j()}" y2="${a[3] + j()}"/>`; }).join('') + `</g>`;
          x += 62;
        }
        return g;
      };
      let specks = '';
      for (let i = 0; i < 70; i++) specks += `<circle cx="${(rnd() * 560).toFixed(0)}" cy="${(rnd() * 250).toFixed(0)}" r="${(rnd() * 1.8).toFixed(1)}" fill="#8d8776" opacity="${(0.15 + rnd() * 0.3).toFixed(2)}"/>`;
      return arch('shen', `
      <div class="sheet typed">
        <h3>人 员 档 案</h3>
        <div class="cardgrid" style="margin:14px 0 16px">
          <span>姓名</span><span>沈望潮</span>
          <span>生卒</span><span>1938 — 2011</span>
          <span>到任</span><span>1961 年 4 月，雾岬灯塔守塔人</span>
          <span>离任</span><span>1998 年 7 月 1 日（自动化改造，退休）</span>
        </div>
        <p>沈望潮十八岁进航标处，二十三岁上雾岬，一个人守了三十七年。妻早亡，无子女。话少，处里的同事回忆，与他通电话，“三句话讲完，第四句就是挂了”。</p>
        <p>值守期间，主灯无一夜失明。所记《值班日志》共四十一册，现存本室。</p>
        <p>日志自 1963 年冬起，每夜多出“试灯”一栏，记“发”“收”两行数字，含义不详。处里问过，沈答：“试试灯好不好使。”</p>
        <p>据补给船工回忆，沈的床头常年只放两本书，一本《潮汐表》，一本《橘中秘》。</p>
        <p>1998 年 7 月 1 日交塔后，随侄迁居甘肃武威。2003 年曾来信一封，询问鹭屿灯桩是否还亮。处里回函：已于 2001 年撤销，岛上无人值守。此后再无来信。2011 年冬病故。</p>
      </div>
      <figure style="margin:0">
        <svg class="wall" viewBox="0 0 560 250" role="img" aria-label="墙上的刻痕：三行，每行开头一个字，后面是成组的正字">
          <rect width="560" height="250" fill="#d3ccb8"/>${specks}
          <path d="M0 214q120-10 240 2t320-6" stroke="#b9b29c" stroke-width="1.5" fill="none"/>
          ${row('我', 28, 34)}${row('他', 27, 106)}${row('平', 5, 178)}
        </svg>
        <figcaption class="cap">值班室北墙刻痕，原样保留。含义不详。</figcaption>
      </figure>
      ${note(`<p>含义不详，含义不详。这间屋子里的东西，档案上写的全是“含义不详”。</p><p>想知道那两行数字是什么，先去看原件：搜<em>值班日志</em>。</p>`)}`);
    },
  };

  /* ---- 08 值班日志 ---- */
  P.log = {
    no: 8, title: '值班日志', keys: ['值班日志', '日志', '试灯', '值班日记'],
    render() {
      const r = (d, w, v, a, b, memo) => `<tr><td>${d}</td><td>${w}</td><td>${v}</td><td>正常</td><td class="c">${a}</td><td class="c">${b}</td><td class="memo">${memo || ''}</td></tr>`;
      const head = `<tr><th>日期</th><th>天气</th><th>能见</th><th>主灯</th><th>试灯·发</th><th>试灯·收</th><th>记事</th></tr>`;
      return arch('log', `
      <div class="sheet logbook">
        <h3>雾岬灯塔值班日志　第三册<span>1963 年 12 月</span></h3>
        <div class="tblwrap"><table class="log">${head}
          ${r('十二月三日', '晴', '良', CN4('3235'), CN4('2817'), '与对岸约定，今夜起。')}
          ${r('四日', '晴', '良', CN4('2213'), CN4('1938'))}
          ${r('五日', '雾', '劣', '停', '停')}
          ${r('六日', '晴', '良', CN4('1132'), CN4('2213'))}
          ${r('七日', '多云', '良', CN4('7711'), CN4('7711'), '两边同数。')}
        </table></div>
      </div>
      <div class="sheet logbook">
        <span class="margin-note">六十一</span>
        <h3>雾岬灯塔值班日志　第四十一册（末册）　1998 年 6 月</h3>
        <div class="tblwrap"><table class="log">${head}
          ${r('六月廿一', '多云', '良', CN4('7511'), CN4('1913'))}
          ${r('廿二', '雾', '劣', '停', '停')}
          ${r('廿三', '晴', '良', CN4('1714'), CN4('2112'))}
          ${r('廿四', '雾', '劣', '停', '停')}
          ${r('廿五', '雾', '劣', '停', '停')}
          ${r('廿六', '晴', '良', CN4('7511'), CN4('1915'), '他漏了。')}
          ${r('廿七', '雾', '劣', '停', '停', '想了一夜。')}
          ${r('廿八', '雾', '劣', '停', '停')}
          ${r('廿九', '晴', '良', '（不记）', '无', '对岸灯未亮。')}
          ${r('三十', '晴', '良', '同昨', '无', '问补给船。说老陈廿七夜里发病，送县医院了。')}
        </table></div>
        <p class="handover">七月一日　交塔。<br>小灯我留着。验收单上我签了断电，责任在我。盒子里上了甲乙两个轮：甲轮夜夜替我发这一手，他几时回来，几时看得见。他回了话，乙轮自己会转。<br>往后的事，就不归我管了。</p>
      </div>
      ${note(`<p>“发”“收”，四个数一组。我对着这些数字熬了两个月。摩尔斯、电码本、潮高、经纬度，全试过，都不是。</p><p>后来想通了：别研究数字，研究人。</p><p>一个人在塔上住三十七年，<em>床头</em>只放两本书。一本是干活用的。另一本呢？</p>`, true)}`);
    },
  };

  /* ---- 09 橘中秘 ---- */
  P.book = {
    no: 9, title: '《橘中秘》', keys: ['橘中秘', '桔中秘', '橘中秘谱'],
    render() {
      const cell = (n, t) => `<span><i>${n}</i>${t}</span>`;
      return arch('book', `
      <div class="sheet typed">
        <div class="bookcover">
          <div class="cover">橘中秘</div>
          <div>
            <h3 style="text-align:left">藏 品 卡</h3>
            <div class="cardgrid" style="margin-top:12px">
              <span>名称</span><span>《橘中秘》，明·朱晋桢辑，象棋谱</span>
              <span>版本</span><span>铅印重排本，一册</span>
              <span>来源</span><span>沈望潮遗物，2012 年由其侄寄回</span>
              <span>现状</span><span>书脊开裂，页角翻烂。扉页有钢笔手写表格一张</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sheet">
        <div class="codebook">
          <h4><span>灯语</span><span>与海生约　六三年冬</span></h4>
          <p>四个数一组。短闪计数，数与数之间一停。</p>
          <div class="row"><b>第一数　子</b><div class="cells">${cell(1, '车')}${cell(2, '马')}${cell(3, '炮')}${cell(4, '相')}${cell(5, '仕')}${cell(6, '帅')}${cell(7, '兵')}</div></div>
          <div class="row"><b>第二数　路</b><div>一至九，各从各的右手边数起</div></div>
          <div class="row"><b>第三数</b><div class="cells">${cell(1, '进')}${cell(2, '退')}${cell(3, '平')}</div></div>
          <div class="row"><b>第四数</b><div>进退几步，或平到第几路</div></div>
          <p style="border-top:1.5px solid var(--blueink);padding-top:6px">长闪起头的是说话：</p>
          <div class="row"><b>长　一</b><div>雾，停一手</div></div>
          <div class="row"><b>长　二</b><div>好棋</div></div>
          <div class="row"><b>长　三</b><div>和</div></div>
          <div class="row"><b>长　四</b><div>认</div></div>
          <div class="row"><b>长　五</b><div>明晚见</div></div>
          <p>我执红，红先。每夜十点，一人一手。收灯前互道长五。</p>
        </div>
        <p class="cap">《橘中秘》扉页手迹（照原件誊录）</p>
      </div>
      ${note(`<p>象棋。</p><p>两个守灯的，隔着四海里水，用信号灯下象棋。一夜一手，逢雾就停。一盘棋要下大半年。</p><p>六三年十二月三日，“发：三二三五”。照这张表译出来是：炮二平五。当头炮。看见四个数变成四个字的时候，我在陈列室里坐了很久。</p><p>值班室墙上那三行，是三十五年的总账。</p><p>我照这张表，把日志最后一局摆出来了。搜<em>第六十一局</em>。</p>`, true)}`);
    },
  };

  /* ---- 10 第六十一局 ---- */
  P.game61 = {
    no: 10, title: '第六十一局', keys: ['第六十一局', '六十一局', '第61局', '61局', '六十一', '打谱', '打谱板'],
    render(S) {
      return arch('game61', `
      <p class="prose">何屿留下的打谱板。红方沈望潮（雾岬），黑方陈海生（鹭屿）。这一局从 1997 年 11 月下到 1998 年 6 月，前四十三手从略，下面是日志最后几夜。</p>
      <div class="boardwrap">
        <div>
          <div id="board"></div>
          <div class="banner" id="banner" aria-live="polite"></div>
        </div>
        <div>
          <div class="moves" id="moves"></div>
          <div class="ctl"><button class="btn ghost" id="b-first">回到第 43 手</button><button class="btn ghost" id="b-prev">上一手</button><button class="btn" id="b-next">下一手</button></div>
        </div>
      </div>
      <div id="after61"></div>`);
    },
  };
  G.after61 = function () {
    return `<div class="reveal" style="display:grid;gap:22px">
      ${note(`<p>车七退三。把车退到了黑马的蹄子底下。</p><p>可是第 46 手之后，红方明明有杀：车七进五，一步将死。黑方那手“车9进5”是漏着。日志上写着“他漏了”，写着“想了一夜”。他看见了。</p><p>他没有杀。他把车送了。黑方只要马2进3，吃车，就是绝杀。</p><p>去数数值班室墙上那三行。他赢下这一盘，就多赢两盘。他输掉这一盘，<em>正好平手</em>。</p><p>三十五年，下成平手。这是他留在塔上的最后一手棋，没写进日志，留给那盏小灯夜夜替他发。</p>`, true)}
      ${note(`<p>然后我就卡住了。</p><p>对面回了什么？日志上是“收：无”。那几天陈海生在医院。可他后来出院没有，回没回岛，看没看见这一手，回没回话——<em>鹭屿</em>那边的事，我一个字也没找到。</p>`)}
      <div class="ctl"><button class="btn ghost" id="b-alt">看他没走的那一手</button><button class="btn ghost" id="b-mate">看黑方吃车之后</button><button class="btn ghost" id="b-back">回到他走的这一手</button></div>
    </div>`;
  };

  /* ---- 11 鹭屿 ---- */
  P.luyu = {
    no: 11, title: '鹭屿灯桩', keys: ['鹭屿', '鹭屿灯桩', '陈海生', '老陈', '灯桩', '海生'],
    render() {
      const x = (t) => `<span class="redact">${t}</span>`;
      return arch('luyu', `
      <div class="sheet typed">
        <h3>内 部 情 况 反 映</h3>
        <p class="docno">临海航标处〔2001〕第 14 号</p>
        <p class="ni"><strong>关于鹭屿灯桩撤销后原代管人滞留岛上的情况</strong></p>
        <p>鹭屿灯桩已于本年三月撤销，灯器拆回。原代管人${x('陈海生')}（渔民，六十七岁，不识字）不愿迁离，仍住岛上旧屋。</p>
        <p>据渔民反映，该人自 1998 年秋出院回岛以后，每夜十时许提一盏手提信号灯，到原灯桩处向雾岬方向发光，几分钟即止。除雾夜外，从未间断。灯桩撤销后依然如此。</p>
        <p>问其缘故，答：“${x('他问我，我得回他')}。”</p>
        <p>该人称雾岬每夜有灯向他“问话”。经向雾岬方面核实：该塔已无人值守，旧信号灯已于 1998 年断电，不存在发光的可能。</p>
        <p>该人将每夜发光的情况记在自备的一个本子上，称作${x('回灯簿')}，不肯上交。</p>
        <p>处理意见：该人行为不妨碍航行，本人年事已高，建议不予干涉。${x('所谓对岸问话，应系久居孤岛所生的错觉')}。</p>
        <p class="ni" style="text-align:right;margin-top:14px">二〇〇一年五月九日</p>
      </div>
      <p class="scan-note">扫描员备注（${G.fmt(G.day(40))} 入库）：原件涂黑处是当年经办人用记号笔涂的。本次数字化按原样处理，在相应文字上加了黑色底纹。<br>待办：下回要学会真的删掉，不能只是盖住。</p>
      <div class="sheet typed">
        <h3 style="font-size:16px">附：鹭屿灯桩简况</h3>
        <div class="cardgrid" style="margin-top:12px">
          <span>设立</span><span>1957 年</span>
          <span>灯质</span><span>闪白 4 秒，射程 6 海里</span>
          <span>代管</span><span>岛上渔民，1957 — 2001</span>
          <span>撤销</span><span>2001 年 3 月（水道改线，已无标示必要）</span>
        </div>
      </div>`);
    },
  };

  /* ---- 12 凸轮盒 ---- */
  P.cam = {
    no: 12, title: '定时凸轮盒', keys: ['凸轮盒', '凸轮', '定时凸轮盒', '定时凸轮', '甲轮', '乙轮', '铁盒', '盒子'],
    render(S) {
      let teeth = '', a = 24; const angles = [];
      [1, 7, 2, 3].forEach((n) => { for (let i = 0; i < n; i++) { angles.push(a); a += 15; } a += 30; });
      angles.forEach((t) => { teeth += `<rect x="-5" y="-90" width="10" height="13" rx="2" transform="rotate(${t})" fill="#f3ecd6" stroke="#2b2a22" stroke-width="1.6"/>`; });
      G.camAngles = angles;
      return arch('cam', `
      <div class="sheet" style="padding:14px">
        <svg class="cam" viewBox="0 0 780 380" role="img" aria-label="凸轮盒手绘图：甲轮轮缘上有四组齿，依次是一个、七个、两个、三个；乙轮被棘爪卡住；光敏管对着北窗，被控制柜背板挡住">
          <rect class="ln" x="26" y="52" width="500" height="296" rx="6"/>
          <text x="40" y="40">铁盒（盖子已取下）</text>
          <g transform="translate(165 212)">
            <g id="camA"><circle class="ln" r="78"/>${teeth}<path class="thin" d="M0-78V-60"/><text x="-9" y="-44" font-size="15">起</text></g>
            <circle class="ln" r="9"/><circle r="2.5" fill="#2b2a22"/>
          </g>
          <path class="ln" d="M165 96v18M150 96h30"/>
          <circle id="camLamp" cx="165" cy="80" r="9" fill="#f4a62a" opacity=".12" stroke="#2b2a22" stroke-width="1.4"/>
          <text x="184" y="86">触点 → 小灯</text>
          <text x="128" y="332">甲轮</text>
          <g transform="translate(390 212)">
            <circle class="ln" r="70" stroke-dasharray="3 5"/>
            <g class="thin" opacity=".55"><path d="M-48-40l96 80M-58-12l100 84M-30-60l92 76M-64 18l74 62M-4-70l70 58"/></g>
            <circle class="ln" r="9"/><circle r="2.5" fill="#2b2a22"/>
            <text x="-10" y="-22" font-size="30">？</text>
          </g>
          <text x="352" y="332">乙轮（锈死）</text>
          <path class="ln" d="M448 150l-18 14 12 10z" fill="#2b2a22"/>
          <path class="ln" d="M448 150h34"/>
          <text x="404" y="120">棘爪</text>
          <rect class="ln" x="482" y="138" width="70" height="24" rx="4"/>
          <path class="thin" d="M552 150h30" stroke-dasharray="4 4"/>
          <text x="470" y="190">光敏管</text>
          <path class="thin" d="M165 212H390" stroke-dasharray="2 6"/>
          <text x="246" y="204" font-size="16">同一根轴</text>
          <rect x="604" y="40" width="34" height="310" fill="none" class="ln"/>
          <g class="thin" opacity=".7"><path d="M604 70l34-22M604 104l34-22M604 138l34-22M604 172l34-22M604 206l34-22M604 240l34-22M604 274l34-22M604 308l34-22M604 342l34-22"/></g>
          <circle cx="596" cy="150" r="7" class="ln" fill="#f3ecd6"/>
          <path class="thin" d="M596 143v-60h-32"/>
          <text x="456" y="78">柜背检修灯</text>
          <text x="646" y="30">控制柜背板</text>
          <text x="660" y="140">北窗</text>
          <path class="ln" d="M770 150H660M674 142l-14 8 14 8"/>
          <text x="656" y="186">鹭屿的光</text>
          <text x="656" y="210">到这里为止</text>
        </svg>
        <p class="cap">凸轮盒拆检草图　何屿绘</p>
      </div>
      ${note(`<p>铁盒里是一台上海产的定时电钟，带一根轴，轴上两个凸轮。电钟每晚十点接通，五分钟后断开。</p><p><em>甲轮</em>的轮缘上锉了齿。一个齿顶一下触点，小灯就亮一下。我数了，四组。首页那盏灯的闪法就是从这里来的。动画数不清的话，数这张图上的齿也一样。</p><p><em>乙轮</em>被一个棘爪卡着，不转。棘爪连着一只光敏管，管口朝北窗，对着鹭屿。</p><p>意思很清楚：北边有光照进来，棘爪松开，乙轮转一圈，然后整个盒子断电。乙轮上锉了什么，轮子锈在轴上，看不见。我没敢硬拆。</p>`, true)}
      ${note(`<p>那为什么二十几年都没有触发？</p><p>我蹲在盒子的位置，顺着光敏管往北看了一眼。看见的是一面铁皮。</p><p>九八年自动化，新控制柜就装在北窗里侧，把窗堵死了。光敏管对着的是控制柜的后背。</p><p>对岸就算夜夜回话，这只管子也看不见。</p>`)}
      ${note(`<p>控制柜背面有一盏检修灯，离光敏管不到一拃。柜子有网页控制台（我给首页接回放数据时开的），能开关这盏灯。</p><p>也就是说，可以替对岸把回话递进去。</p><p>光敏管不认内容，有光就松。随便闪一下，乙轮也会转。可我不想随便闪一下。对岸回的是什么，我不知道，我不想替人编一句。</p><p>口令我设成了值班室北墙那三行的数，从上到下连着写。</p>`, true)}
      <div class="ctl" style="justify-content:flex-end"><button class="btn" data-go="console">打开控制台</button></div>`);
    },
  };

  /* ---- 13 回灯簿 ---- */
  P.notebook = {
    no: 13, title: '回灯簿', keys: ['回灯簿'],
    render() {
      const rnd = G.rng(5); let i = 0;
      const k = (t) => G.kid(t, 100 + i++);
      const tally = (n, last) => { let s = ''; for (let j = 0; j < n; j++) s += G.zheng(5, rnd); if (last) s += G.zheng(last, rnd); return `<div class="tally">${s}</div>`; };
      const d = (t) => `<p class="date">${t}</p>`;
      return arch('notebook', `
      <div class="nbcover"><b><i>回</i><i>灯</i>簿</b></div>
      <div class="sheet nb">
        ${d('九八年　九月二十')}
        ${k('爷爷说：我住院三个月，回来一看，对面换了机器，没有人了。')}
        ${k('爷爷说：可是老沈的小灯还在发。夜夜十点，同一手。')}
        ${G.sketch([['S'], ['S', 'S', 'S', 'S', 'S', 'S', 'S'], ['S', 'S'], ['S', 'S', 'S']], 21)}
        ${k('爷爷说：他把车退到我马蹄子底下来了。')}
        ${k('爷爷说：上一手是我走漏了，我自己晓得。他有杀。他不杀。')}
        ${k('爷爷说：我一跳马，这盘就是我赢。二十八比二十八。他是算好了的。')}
        ${k('爷爷说：我不吃。')}
        ${k('爷爷说：我回他这个。')}
        ${G.sketch([['L', 'S', 'S', 'S']], 8)}
        ${k('爷爷说：总账还是他赢。赢就是赢，哪个要他让。')}
        ${k('爷爷说：往后我回一夜，你替我画一道。')}
      </div>
      <div class="sheet nb">
        ${d('九九年')}${tally(34)}
        ${d('两千年')}${tally(36)}
        ${d('〇一年　三月')}
        ${k('爷爷说：灯桩拆走了。不碍事，我有手提灯。')}
        ${tally(31)}
        ${d('〇三年')}
        ${k('爷爷说：对面还是那一手。他是没看见我回。')}
        ${k('爷爷说：他那边一定有个什么东西挡着。老沈不会不回我。')}
        ${tally(40)}
      </div>
      <div class="sheet nb">
        ${d('〇六年　冬')}
        ${k('爷爷手抖，灯提不动了。今天是我替他发的。长的一下，短的三下。')}
        ${k('对面还是那一手。')}
        ${tally(9, 3)}
        <p class="adult" style="margin-top:38px">爷爷是〇七年清明前走的。本子上的道道我数过，一共两千四百九十一道，一道是一夜。</p>
        <p class="adult">寄给你们，是因为听说雾岬那盏灯现在还在发。</p>
        <p class="adult" style="text-align:right">陈小满　${G.year} 年</p>
      </div>
      <p class="scan-note">扫描员备注：全本六十一页，后面画满了正字。此处节选三页。</p>`);
    },
  };

  /* ---- 14 控制台 ---- */
  P.console = { no: 14, title: '控制台', keys: ['控制台', '控制柜', '新控制柜'], render() { return `<div id="hmi"></div>`; } };

  /* ---- 15 那一夜（全屏演出，由 game.js 渲染） ---- */
  P.night = { no: 15, title: '当晚 22:00', render() { return `<p class="prose">当晚 22:00 的回放正在播放。</p>`; } };

  /* ---- 16 结案 ---- */
  P.close = { no: 16, title: '结案说明', render() { return `<div id="closing"></div>`; } };

  /* ---- 彩蛋 ---- */
  P.exaward = {
    ex: 1, title: '表彰大会', keys: ['表彰大会', '先进个人', '表彰', '全省航标系统先进个人'],
    render() {
      return arch('exaward', `
      <div class="sheet typed" style="max-width:34em;justify-self:center">
        <p class="docno" style="text-align:left;margin-bottom:6px">《临海报》1984 年 10 月 19 日　第二版</p>
        <h3 style="letter-spacing:.12em;font-size:22px">我县两名守灯人获省先进</h3>
        <p style="margin-top:12px">本报讯　全省航标系统表彰大会日前在省城举行。我县雾岬灯塔守塔人沈望潮、鹭屿灯桩代管人陈海生同获先进个人称号。</p>
        <p>两人守灯分别已有二十三年、二十七年，隔白水门相望，是我县最东边的两盏灯。</p>
        <p>会场上两人被安排在同一桌。记者问二人是否相熟，沈望潮答：“不熟。”陈海生答：“没讲过话。”</p>
        <p>散会合影，二人分立两端，中间隔着七个人。据同桌代表说，两人整场没有交谈，只在离席时互相点了点头。</p>
      </div>
      ${note(`<p>“没讲过话。”</p><p>我后来才明白，这是一句实话。</p>`)}`);
    },
  };
  P.exheyu = {
    ex: 2, title: '何屿', keys: ['何屿', '小何', '前任', '前任运维'],
    render() {
      return arch('exheyu', `
      ${note(`<p>会搜这个名字的，多半是接手的那位。你好。</p><p>我没有续约。文旅局的说法是“擅自上塔，拆动展品”。这是事实，我认。</p><p>这个网站我管了三年。头两年它只是个预约页面。第三年我接了塔上控制柜的数据，想在首页放一盏会亮的灯，觉得好看。结果多出来一路电流。</p><p>后面的事你都会看到。</p><p>只有一个请求：查清以后，结案说明里别写“故障”两个字。</p>`, true)}`);
    },
  };
  P.exflags = {
    ex: 3, title: '旗串', keys: ['明晚见', '旗串', 'MINGWANJIAN', 'MINGWANJIAN'],
    render() {
      return arch('exflags', `
      <div class="sheet typed">
        <h3>布 展 记 录（摘）</h3>
        <p class="docno">2019 年</p>
        <p>页眉及回廊旗串共十一面，照 1997 年国庆的一张旧照片复原。</p>
        <p>问过当年的补给船工。说沈望潮逢年过节都挂这一串，挂在回廊北侧，从来不换花样。有人问他什么意思，他说：“好看。”</p>
        <p>旗的读法见“航标常识”栏目。</p>
      </div>
      ${note(`<p>你既然搜得出这三个字，就已经知道它不只是好看。</p><p>白天挂旗，夜里打灯。说的是同一句。</p>`)}`);
    },
  };

  /* =====================================================================
     工单、提示
     ===================================================================== */
  G.ticket = function () {
    return `<div class="ticket">
      <h2>临海县文化和旅游局　信息化运维工单</h2>
      <div class="row"><span>工单号</span><span>第 0701 号</span></div>
      <div class="row"><span>派单日期</span><span>${G.fmt(G.today)}</span></div>
      <div class="row"><span>承接人</span><span>你（外包运维，上周刚接手“雾岬灯塔”官网）</span></div>
      <div class="row"><span>情况</span><span>今年“夜游灯塔”开放以来，多名游客反映：每晚 22 时前后，塔身回廊处有一盏黄色小灯闪烁数分钟。经查，《雾岬灯塔在用设备清单》中没有这盏灯。官网首页“昨夜灯光回放”里也出现了它。</span></div>
      <div class="row"><span>要求</span><span><ol><li>查明这盏灯的来源；</li><li>如属线路或页面故障，予以屏蔽；</li><li>填写结案说明。</li></ol></span></div>
      <div class="row" style="border:0"><span>备注</span><span>前任运维何屿已离职，交接事项见附条。</span></div>
    </div>`;
  };
  G.handover = `<aside class="sticky"><p>接手的朋友：</p><p>官网不难管。五个栏目，一个档案检索框。</p><p>检索框我动过。陈列室这些年扫描的旧档案，我都喂进去了，但没有挂链接。一次输一个词，输对了才出来。</p><p>那盏灯不是故障。我查到一半查不下去了，缺一样东西。也许你来的时候，它已经到了。</p><p>别急着屏蔽。先去首页，把那盏黄灯<em>数清楚</em>。</p><footer>——何屿</footer></aside>`;
  G.howto = `<div class="howto"><h3>玩法</h3><ul>
    <li>读页面，找出可疑的词，在右上角“档案检索”里搜。搜对了，会调出一份没有挂链接的档案。</li>
    <li>一次只搜一个词。人名、物名、书名、文件里出现的专有名词，都可能是。</li>
    <li>每页页脚有档案编号。数字越大，离真相越近。共 16 份，另有 3 份彩蛋。</li>
    <li>不需要任何编程知识，不用看源代码。所有线索都在肉眼看得见的地方，包括会动的地方。</li>
    <li>卡住了，点右下角的“工单”，那里有何屿留下的提示。全程约 40 分钟，进度自动保存。</li>
  </ul></div>`;

  G.hints = [
    ['“参观须知”里有一条规定，和游客夜里看到的对不上。', '规定说它“已断电”。它叫什么，就搜什么。', '搜：信号灯'],
    ['验收单上，“断电”那一栏是谁签的字？', '搜这个人的名字。', '搜：沈望潮'],
    ['他的档案里提到，那两行数字记在什么东西上。', '便条最后一行写着。', '搜：值班日志'],
    ['别研究数字，研究人。他床头有两本书。', '一本《潮汐表》是工具书。另一本是什么书？', '搜：橘中秘'],
    ['对照表有了。何屿说他把最后一局摆出来了。', '便条最后一句就是检索词。', '搜：第六十一局'],
    ['第 47 手日志没记，可那盏灯夜夜在发。回首页，数黄灯：一组闪几下，一共四组。', '首页回放下面那条记录带上，K7 那一行的脉冲也能数。凸轮盒的图上，甲轮的齿也是这四组。', '四组是 1、7、2、3。'],
    ['何屿卡在了对岸。对岸叫什么？', '“灯塔简介”里有它的名字，代管人的名字也在。', '搜：鹭屿'],
    ['文件里涂黑的地方，扫描员说只是“盖住”，没有删掉。', '用鼠标拖选涂黑的文字（手机上长按选中），底下的字会显出来。那个本子的名字就在里面。', '搜：回灯簿'],
    ['“旧信号灯”那份档案里，何屿提到灯座旁边还有一样东西。', '日志最后一页也提到“盒子”和“甲乙两个轮”。', '搜：凸轮盒'],
    ['控制台口令是值班室北墙那三行的数。墙在沈望潮的档案里。', '一个完整的“正”字是五。从上到下三行，连着写。', '口令：28275'],
    ['对岸回的是什么，回灯簿第一页画着：“我回他这个。”', '一道长的，三个短的。对照表上“长三”是一个字。', '在控制台里依次按：长、短、短、短，然后发送。'],
    ['最后那两组闪光，拿对照表译出来，填进结案说明。', '两组都是长闪起头。第一组后面四个短闪，第二组五个。', '长四是“认”，长五是“明晚见”。'],
    ['工单已经结了。', '回首页看看那片海。', '页眉上的旗，也可以再看一眼。'],
  ];

  G.special = {
    '灯塔': '就是本站。', '雾岬': '就是本站。', '雾岬灯塔': '就是本站。',
    '信号旗': '请看“航标常识”栏目。', '国际信号旗': '请看“航标常识”栏目。',
    '潮汐表': '《潮汐表》每年一册，陈列室未作扫描。那是一本干活用的书。',
    '白水门': '水道名。见“灯塔简介”。',
    '陈小满': '留言簿里有她的留言。她寄来的本子已扫描入档，要用本子的名字检索。',
    '象棋': '档案是按物件和人名编目的，这个词太大了。',
    '清单': '《在用设备清单》里确实没有那盏灯。所以才有这张工单。',
    '设备清单': '《在用设备清单》里确实没有那盏灯。所以才有这张工单。',
    '主灯': 'PRB-21 型灯器，闪（3）白 16 秒。它一切正常。',
    '光敏管': '它在凸轮盒里。',
    '检修灯': '它在控制柜背面。',
    '验收单': '附在“旧信号灯”那份档案里。',
    '簿': '只有一个字，查不出来。本子的名字还有两个字。',
    '认': '还没到说这个字的时候。',
    '1723': '四个数。先记下来，检索框不认数字。这盏灯是什么来历，“参观须知”里有一条提到它。',
    '28275': '这像是一个口令，不是检索词。',
    '何': '只有一个字，查不出来。',
    '和': '这个字不是说给检索框听的。',
  };
})();
