/* Propr case study — live demos.
   Ported from Propr's React components (Board, PropCard/MiniCurve, GamesStrip, NewsPopups,
   LineExplorer, ui.jsx) into plain JS so they run on a static page. Sample data only. */
(function(){
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- sample slate ---------------- */
  const PROPS = [
    { id:1, games:[24,31,28,19,33,27,30,22,35,29], dvp:28, player:"Jalen Brunson",  team:"NYK", pos:"PG", opp:"BOS", home:true,  t:"7:30", stat:"Points",   line:26.5, side:"over",  proj:29.1, sd:6.1, odds:-115, book:"FanDuel",    l5:[4,5], l10:[7,10], h2h:[3,4], grade:"A", edge:8.4 },
    { id:2, games:[9,11,7,10,12,8,9,10,6,11], dvp:25, player:"Jayson Tatum",   team:"BOS", pos:"SF", opp:"NYK", home:false, t:"7:30", stat:"Rebounds", line:8.5,  side:"over",  proj:9.6,  sd:2.6, odds:-110, book:"DraftKings", l5:[4,5], l10:[8,10], h2h:[3,4], grade:"A", edge:6.9 },
    { id:3, games:[11,8,12,10,7,13,9,11,10,12], dvp:26, player:"Cade Cunningham",team:"DET", pos:"PG", opp:"CHI", home:true,  t:"7:00", stat:"Assists",  line:9.5,  side:"over",  proj:10.4, sd:2.9, odds:+102, book:"BetMGM",     l5:[3,5], l10:[7,10], h2h:[2,3], grade:"B", edge:5.2 },
    { id:4, games:[18,24,17,20,15,23,19,16,22,18], dvp:6, player:"Alperen Sengun", team:"HOU", pos:"C",  opp:"MEM", home:false, t:"8:00", stat:"Points",   line:21.5, side:"under", proj:19.2, sd:5.0, odds:-120, book:"Caesars",    l5:[4,5], l10:[7,10], h2h:[2,3], grade:"B", edge:4.6 },
    { id:5, games:[12,9,14,11,8,13,10,12,9,15], dvp:22, player:"Jalen Duren",    team:"DET", pos:"C",  opp:"CHI", home:true,  t:"7:00", stat:"Rebounds", line:10.5, side:"over",  proj:11.6, sd:3.1, odds:-105, book:"FanDuel",    l5:[3,5], l10:[6,10], h2h:[3,3], grade:"B", edge:4.1 },
    { id:6, games:[3,1,2,4,2,1,3,2,1,2], dvp:9, player:"Desmond Bane",   team:"MEM", pos:"SG", opp:"HOU", home:true,  t:"8:00", stat:"3PM",      line:2.5,  side:"under", proj:2.1,  sd:1.3, odds:+118, book:"DraftKings", l5:[3,5], l10:[6,10], h2h:[2,3], grade:"C", edge:3.0 },
  ];
  const GAMES = [
    { a:"BOS", h:"NYK", t:"7:30", n:14 }, { a:"CHI", h:"DET", t:"7:00", n:11 }, { a:"HOU", h:"MEM", t:"8:00", n:9 },
    { a:"LAL", h:"DEN", t:"9:00", n:16 }, { a:"MIA", h:"ORL", t:"7:00", n:8 },  { a:"OKC", h:"MIN", t:"8:00", n:13 },
    { a:"PHX", h:"SAC", t:"10:00", n:10 },{ a:"GSW", h:"LAC", t:"10:30", n:12 },{ a:"ATL", h:"CLE", t:"7:30", n:7 },
  ];
  const TEAMC = { BOS:"#007A33", NYK:"#F58426", CHI:"#CE1141", DET:"#1D42BA", HOU:"#CE1141", MEM:"#5D76A9", LAL:"#552583", DEN:"#FEC524",
    MIA:"#98002E", ORL:"#0077C0", OKC:"#007AC1", MIN:"#78BE20", PHX:"#E56020", SAC:"#5A2D81", GSW:"#FFC72C", LAC:"#C8102E", ATL:"#E03A3E", CLE:"#860038" };

  /* ---------------- helpers lifted from lib/format.js ---------------- */
  const fo = o => (o > 0 ? "+" + o : String(o));
  const imp = o => (o < 0 ? -o / (-o + 100) : 100 / (o + 100));
  const pct = p => Math.round(p * 100) + "%";
  const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const erf = x => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)); };
  const cdf = (x, m, sd) => .5 * (1 + erf((x - m) / (sd * Math.SQRT2)));
  const fairOdds = p => (p < .02 || p > .98 ? null : p >= .5 ? -Math.round(100 * p / (1 - p)) : Math.round(100 * (1 - p) / p));
  const pctTxt = p => (p < .01 ? "under 1%" : p > .99 ? "over 99%" : pct(p));

  /* Avatar: team-coloured silhouette, with the player's headshot laid over it when the file exists.
     Drop licensed images in assets/work/players/ named like jalen-brunson.png; a missing file falls back quietly. */
  const avatar = (team, size = 40, photo = "") => {
    const bg = `hsl(${hash("NBA" + team) % 360}, 42%, 30%)`;
    return `<span class="av" style="width:${size}px;height:${size}px;background:${bg}"><svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="15.5" r="7" fill="rgba(255,255,255,.86)"/><path d="M5.5 41c1.6-8.6 7.6-13.4 14.5-13.4S32.9 32.4 34.5 41z" fill="rgba(255,255,255,.86)"/></svg>${photo
      ? `<img class="hs" src="${photo}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span>`;
  };
  const headshot = name => `assets/work/players/${name.toLowerCase().replace(/[^a-z]+/g, "-")}.png`;
  PROPS.forEach(p => { p.photo = headshot(p.player); });
  const STAR = on => `<svg viewBox="0 0 24 24" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>`;
  const LOGO = s => `<svg width="${s}" height="${s}" viewBox="0 0 500 500" aria-hidden="true"><rect width="500" height="500" rx="110" fill="#0A0A0A"/>
    <g transform="translate(250 249) scale(.8) translate(-250 -249)"><path class="lg-line" d="M100 336 203 233l63 63 134-134" fill="none" stroke="#93C5FD" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="lg-head" d="M302 162h98v98" fill="none" stroke="#93C5FD" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  const REPLAY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>`;

  /* MiniCurve — the distribution of Propr's projection with the hit side filled and the line marked */
  /* Sportsbook mark: 16px logo, initials when there's no file (display only) */
  const BOOKS = { FanDuel:"fanduel", DraftKings:"draftkings", BetMGM:"betmgm", Caesars:"caesars", "ESPN BET":"espnbet", Bovada:"bovada" };
  const bk = name => BOOKS[name]
    ? `<img class="bk" src="assets/work/books/${BOOKS[name]}.png" alt="" width="16" height="16" loading="lazy">`
    : `<span class="bk bk-i" aria-hidden="true">${name.replace(/[^A-Z]/g, "").slice(0, 2) || name.slice(0, 2)}</span>`;
  /* American odds <-> decimal, for the per-book price list */
  const toDec = o => o > 0 ? 1 + o / 100 : 1 + 100 / -o;
  const toAm = d => d >= 2 ? Math.round((d - 1) * 100) : -Math.round(100 / (d - 1));

  function miniCurve(m, sd, L, side, h = 24) {
    sd = Math.max(sd, .3);
    const W = 600, H = 36, isOver = side === "over";
    let lo = Math.min(m - 3 * sd, L - sd); const hi = Math.max(m + 3 * sd, L + sd); if (lo < -.5) lo = -.5;
    const X = x => (x - lo) / (hi - lo) * W, f = x => x.toFixed(1);
    const pts = [];
    for (let i = 0; i <= 70; i++) { const x = lo + (hi - lo) * i / 70; pts.push([x, X(x), H - Math.exp(-.5 * ((x - m) / sd) ** 2) * (H - 4)]); }
    const path = pts.map(p => f(p[1]) + "," + f(p[2])).join(" L");
    const lx = X(L), ly = H - Math.exp(-.5 * ((L - m) / sd) ** 2) * (H - 4);
    const sp = pts.filter(p => (isOver ? p[0] >= L : p[0] <= L)).map(p => f(p[1]) + "," + f(p[2]));
    const hit = isOver ? `M${f(lx)},${H} L${f(lx)},${f(ly)}${sp.length ? " L" + sp.join(" L") : ""} L${W},${H} Z`
                       : `M0,${H}${sp.length ? " L" + sp.join(" L") : ""} L${f(lx)},${f(ly)} L${f(lx)},${H} Z`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="display:block;width:100%;height:${h}px" role="img" aria-label="Projection ${m} versus line ${L}">
      <path d="M0,${H} L${path} L${W},${H} Z" fill="var(--curveFill)"/>
      <path d="${hit}" fill="${isOver ? "var(--curveHit)" : "var(--curveHitU)"}"/>
      <line x1="${f(lx)}" x2="${f(lx)}" y1="2" y2="${H}" stroke="var(--lineMark)" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
      <line x1="${f(X(m))}" x2="${f(X(m))}" y1="4" y2="${H}" stroke="var(--proj)" stroke-width="1.5" stroke-dasharray="3 2" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /* Seg — a pill that slides under the chosen option, measured from the buttons */
  function seg(el, value, onChange) {
    const thumb = document.createElement("span"); thumb.className = "seg-thumb"; thumb.setAttribute("aria-hidden", "true");
    el.prepend(thumb);
    const place = () => { const b = $(`[data-v="${value}"]`, el); if (!b) return; thumb.style.width = b.offsetWidth + "px"; thumb.style.transform = `translateX(${b.offsetLeft - 2}px)`; };
    $$(".seg-btn", el).forEach(b => b.addEventListener("click", () => {
      value = b.dataset.v; $$(".seg-btn", el).forEach(x => x.setAttribute("aria-pressed", x === b)); place(); onChange && onChange(value);
    }));
    $$(".seg-btn", el).forEach(x => x.setAttribute("aria-pressed", x.dataset.v === value));
    requestAnimationFrame(place);
    new ResizeObserver(place).observe(el);
    return { set(v){ value = v; $$(".seg-btn", el).forEach(x => x.setAttribute("aria-pressed", x.dataset.v === v)); place(); } };
  }

  function starBtn(on = false) { return `<button type="button" class="star" aria-pressed="${on}" aria-label="Star this pick">${STAR(on)}</button>`; }
  function wireStars(root) {
    root.addEventListener("click", e => {
      const s = e.target.closest(".star"); if (!s) return;
      e.stopPropagation();
      const on = s.getAttribute("aria-pressed") !== "true";
      s.setAttribute("aria-pressed", on); s.innerHTML = STAR(on);
      s.classList.remove("pop"); if (on) { void s.offsetWidth; s.classList.add("pop"); }
    });
  }

  /* Rate: a coloured tick then hits/n (green at 60%+, red at 40% or less) */
  const rate = x => { const p = x[0] / x[1];
    return `<span class="rt num"><i class="tk" style="background:${p >= .6 ? "var(--good)" : p <= .4 ? "var(--danger)" : "var(--dotOff)"}"></i><span>${x[0]}<i>/${x[1]}</i></span></span>`; };
  const l10bars = (v, h = 30, w = 7) => { const over = v.side === "over", max = Math.max(...v.games, v.line) * 1.15;
    return `<span class="l10" style="height:${h}px" role="img" aria-label="Last 10 against ${v.line}">${v.games.map(x =>
      `<i style="width:${w}px;height:${Math.max(3, Math.round(x / max * h))}px;background:${(over ? x > v.line : x < v.line) ? "var(--good)" : "var(--danger)"}"></i>`).join("")}</span>`; };

  function row(v, i, basic = false) {
    const over = v.side === "over";
    const player = `<span class="pc">${avatar(v.team, basic ? 46 : 38, v.photo)}<span class="n"><b${basic ? ' style="font-size:16px"' : ""}>${v.player}</b>
        <small><span class="pick ${over ? "ov" : "un"}">${over ? "Over" : "Under"} <span class="num">${v.line}</span></span> ${v.stat} · ${v.home ? "vs" : "@"} ${v.opp}</small></span></span>`;
    const curve = w => `<span class="cv"><span class="c" style="flex:none;width:${w}px">${miniCurve(v.proj, v.sd, v.line, v.side)}</span><span class="num">${v.proj}</span></span>`;
    const odds = `<span class="od"><span class="num">${bk(v.book)}${fo(v.odds)}</span><small>${v.book}</small></span>`;
    const grade = `<span class="mx"><span class="gr g${v.grade}">${v.grade}</span>${basic ? `<small class="num">#${v.dvp} vs ${v.pos}</small>` : ""}</span>`;
    const edge = `<b class="eg num r ${v.edge >= 0 ? "up" : "dn"}">${v.edge.toFixed(1)}%</b>`;
    const cells = basic ? [player, l10bars(v), curve(120), odds, rate(v.l10), grade, edge]
                        : [player, curve(72), odds, rate(v.l5), rate(v.l10), rate(v.h2h), grade, edge];
    return `<div class="row ${basic ? "basic" : "full"} anim-in" data-id="${v.id}" style="animation-delay:${Math.min(i, 12) * 22}ms">${cells.join("")}<span class="r">${starBtn()}</span></div>`;
  }
  const colsFor = basic => `<div class="cols ${basic ? "basic" : "full"}">${(basic
      ? ["Player · pick", "Last 10", "Projection", "Odds", "L10", "Matchup", '<span class="r">Edge</span>', ""]
      : ["Player · pick", "Projection", "Odds", "L5", "L10", "H2H", "Matchup", '<span class="r">Edge</span>', ""]).map(x => x.startsWith("<") ? x : `<span>${x}</span>`).join("")}</div>`;
  const cols = colsFor(false);

  function selectable(list) {
    list.addEventListener("click", e => {
      const r = e.target.closest(".row"); if (!r) return;
      const was = r.classList.contains("sel");
      $$(".row", list).forEach(x => x.classList.remove("sel"));
      if (!was) r.classList.add("sel");
    });
  }

  /* ================= 1. Board: Analytical and Basic views ================= */
  function boardDemo(root, viewBar) {
    const D = { side:"", market:"", venue:"", grade:"" };
    let view = "full", pick = null;
    const MARKETS = ["Points", "Rebounds", "Assists", "3PM"];
    const BOOKLIST = ["FanDuel", "DraftKings", "BetMGM", "Caesars", "ESPN BET", "Bovada"];
    const SEARCH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>`;
    const chip = (k, v, label) => `<button type="button" class="chip" data-k="${k}" data-v="${v}" aria-pressed="${D[k] === v}">${label}</button>`;
    const still = (label, on) => `<span class="chip" aria-pressed="${!!on}">${label}</span>`;
    const appbar = `<div class="appbar"><span class="ab-brand">${LOGO(22)}<b>Propr</b></span><span class="lg">NBA<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 10 5 5 5-5"/></svg></span>
      <nav><span>Edges</span><span class="on">Trends</span><span>Saved</span><span>Recap</span></nav>
      <span class="search">${SEARCH}Search players, teams, props</span>
      <span class="at"><i></i>Odds 7:00 PM</span><span class="refresh">${REPLAY}Refresh odds</span></div>`;
    const boardShell = `<div class="board"><div class="board-head"><span class="t"><b>Top trends tonight</b><small class="num" aria-live="polite"></small></span>
      <div class="seg" role="group" aria-label="Over or under"><button type="button" class="seg-btn" data-v="">All</button><button type="button" class="seg-btn" data-v="over">Overs</button><button type="button" class="seg-btn" data-v="under">Unders</button></div>
      <span class="sort">Sort: Filters hit<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14m-5-5 5 5 5-5"/></svg></span></div><div class="tbl"></div></div>`;
    const slider = (label, val, pct, note) => `<div class="fg"><span>${label}<b class="num">${val}</b></span><span class="slider"><i style="width:${pct}%"></i><em style="left:${pct}%"></em></span>${note ? `<small>${note}</small>` : ""}</div>`;

    const analytical = () => `${appbar}<div class="dash">
      <aside class="pane fl" aria-label="Filters"><div class="fl-h"><h4>Filters</h4><button type="button" class="fl-reset" data-reset>Reset</button></div>
        <div class="fg"><span>Market</span><div class="chips">${chip("market", "", "All")}${MARKETS.map(m => chip("market", m, m)).join("")}</div></div>
        ${slider("Min edge", "3.0%", 28, "Edges only. Trends picks by hit rate.")}
        ${slider("Min hit rate L10", "6/10", 60)}
        <div class="fg"><span>Side</span><div class="chips">${chip("side", "", "Both")}${chip("side", "over", "Over")}${chip("side", "under", "Under")}</div></div>
        <div class="fg"><span>Venue</span><div class="radios">${[["", "All"], ["home", "Home only"], ["away", "Away only"]].map(([v, l]) =>
          `<button type="button" class="radio" data-k="venue" data-v="${v}" aria-pressed="${D.venue === v}"><i></i>${l}</button>`).join("")}</div></div>
        <div class="fg"><span>Book</span><div class="chips">${still("All books", true)}${BOOKLIST.slice(0, 4).map(b => still(bk(b) + b)).join("")}</div></div>
        <div class="fg"><span>Lines</span><div class="chips">${still("All", true)}${still("Main")}${still("Alt")}</div></div>
        <div class="fg"><span>Matchup grade</span><div class="chips">${chip("grade", "", "All")}${chip("grade", "A", "A")}${chip("grade", "B", "B+")}${chip("grade", "C", "C+")}</div></div>
        <div class="fg"><span>Confidence</span><div class="chips">${still("All", true)}${still("Medium+")}${still("High")}</div></div>
      </aside>
      <div class="mid">
        <div class="pane ins"><div class="ins-h"><span>Before you act</span><span class="num">Odds from 7:00 PM</span></div>
          <div class="ins-g">
            <div><span><i></i>News since the odds</span><b>Tatum upgraded</b><p>Probable, was questionable. His rebounds line hasn't moved yet.</p></div>
            <div><span><i></i>Market moves</span><b>Brunson points up</b><p>25.5 to 26.5 at FanDuel since the open.</p></div>
            <div><span><i></i>Game script</span><b>Picks fit their games</b><p>No picks need a game to play out against its total or spread.</p></div>
            <div><span><i></i>Biggest role change</span><b>Duren gains minutes</b><p>Stewart is out. Duren's rebounds pick leans on the extra run.</p></div>
          </div></div>
        ${boardShell}
      </div>
      <div class="side">
        <aside class="pane dp" aria-label="Selected prop" aria-live="polite"></aside>
        <aside class="pane news"><span>Lineup news</span><p><b>Jayson Tatum</b> upgraded to probable. Propr checks every 5 minutes before tip-off, every 2 in the last 30.</p></aside>
      </div></div>`;

    const basicView = () => `${appbar}<div class="fbar" aria-label="Filters">
        <span class="pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Filters</span>
        ${chip("market", "", "All markets")}${MARKETS.map(m => chip("market", m, m)).join("")}
        <span class="pill"><span class="stack">${BOOKLIST.slice(0, 4).map(bk).join("")}</span>All books</span>
        <span class="pill">Edge <b class="num">3%+</b></span><span class="pill">L10 <b class="num">6/10</b></span><span class="pill">Matchup</span><span class="pill">Lines</span>
        <button type="button" class="fl-reset" data-reset>Reset</button>
      </div>${boardShell}`;

    function detail() {
      const dp = $(".dp", root); if (!dp) return;
      const v = PROPS.find(p => p.id === pick);
      if (!v) { dp.classList.add("blank"); dp.innerHTML = `<p>Select a prop to see its breakdown.</p>`; return; }
      dp.classList.remove("blank");
      const over = v.side === "over";
      const others = BOOKLIST.filter(b => b !== v.book).slice(0, 3);
      const prices = [[v.book, v.odds], ...others.map((b, k) => [b, toAm(toDec(v.odds) - (k + 1) * .035)])];
      const chance = L => Math.round((over ? 1 - cdf(L, v.proj, v.sd) : cdf(L, v.proj, v.sd)) * 100);
      dp.innerHTML = `<div class="dp-top">${avatar(v.team, 44, v.photo)}<span class="n"><b>${v.player}</b><small>${v.team} ${v.pos} · ${v.home ? "vs" : "@"} ${v.opp} · ${v.t}</small></span></div>
        <p class="dp-pick"><span class="pick ${over ? "ov" : "un"}">${over ? "Over" : "Under"} <span class="num">${v.line}</span></span> ${v.stat}</p>
        <div class="dp-curve">${miniCurve(v.proj, v.sd, v.line, v.side, 72)}</div>
        <dl class="dp-kv"><div><dt>Projection</dt><dd class="num">${v.proj}</dd></div><div><dt>Edge</dt><dd class="num up">${v.edge.toFixed(1)}%</dd></div>
          <div><dt>Odds</dt><dd class="num">${fo(v.odds)}</dd></div><div><dt>Matchup</dt><dd><span class="gr g${v.grade}">${v.grade}</span> <small class="num">#${v.dvp} vs ${v.pos}</small></dd></div></dl>
        <div><h4>Best price</h4><ul class="dp-list">${prices.map(([b, o], k) => `<li${k ? "" : ' class="best"'}><span>${bk(b)}${b}</span><b class="num">${fo(o)}</b></li>`).join("")}</ul></div>
        <div><h4>Alt lines</h4><ul class="dp-list">${[-1, 0, 1].map(d => { const L = v.line + d;
          return `<li${d ? "" : ' class="best"'}><span class="num">${over ? "O" : "U"} ${L}</span><b class="num">${chance(L)}%</b></li>`; }).join("")}</ul></div>`;
    }

    let sideSeg;
    function draw() {
      const basic = view === "basic";
      const gradeOk = g => !D.grade || g <= D.grade;            // "B+" keeps A and B
      const shown = PROPS.filter(p => (!D.side || p.side === D.side) && (!D.market || p.stat === D.market)
        && (!D.venue || (D.venue === "home") === p.home) && gradeOk(p.grade));
      $(".tbl", root).innerHTML = shown.length ? colsFor(basic) + `<div class="list">${shown.map((v, i) => row(v, i, basic)).join("")}</div>`
        : `<div class="empty"><b>No props hit 4 or more filters</b><p>Loosen the sliders, turn on more books or games, or clear the search.</p><button type="button" class="btn-primary" data-reset>Reset filters</button></div>`;
      $(".board-head small", root).textContent = `${shown.length} of 128 props hit 4+ filters at their line`;
      root.querySelectorAll("[data-k]").forEach(x => x.setAttribute("aria-pressed", D[x.dataset.k] === x.dataset.v));
      sideSeg.set(D.side);
      if (!basic) {
        if (pick && !shown.some(p => p.id === pick)) pick = null;
        const r = pick && $(`.row[data-id="${pick}"]`, root); if (r) r.classList.add("sel");
        detail();
      }
    }
    function build() {
      root.innerHTML = view === "basic" ? basicView() : analytical();
      root.dataset.view = view;
      sideSeg = seg($(".board-head .seg", root), D.side, v => { D.side = v; draw(); });
      root.onclick = e => {
        const f = e.target.closest("button[data-k]");
        if (f) { D[f.dataset.k] = f.dataset.v; draw(); return; }
        if (e.target.closest("[data-reset]")) { Object.keys(D).forEach(k => D[k] = ""); draw(); return; }
        const r = e.target.closest(".row");
        if (r && !e.target.closest(".star") && view === "full") {
          const was = r.classList.contains("sel");
          $$(".row", root).forEach(x => x.classList.remove("sel"));
          pick = was ? null : +r.dataset.id; if (!was) r.classList.add("sel");
          detail();
        }
      };
      wireStars($(".tbl", root)); draw();
    }
    if (viewBar) seg(viewBar, "full", v => { view = v; build(); });
    build();
    return () => { pick = null; build(); };
  }

  /* ================= 2. Skeleton loading ================= */
  function skeletonDemo(root) {
    const sk = d => `<div class="sk-card" aria-hidden="true" style="opacity:${1 - d * .18}">
      <span class="sk" style="width:40px;height:40px;border-radius:50%;flex:none"></span>
      <span style="display:flex;flex-direction:column;gap:6px;flex:1"><span class="sk" style="height:12px;width:40%;border-radius:4px"></span><span class="sk" style="height:10px;width:60%;border-radius:4px"></span></span>
      <span class="sk" style="height:32px;width:96px;border-radius:6px"></span><span class="sk" style="height:20px;width:56px;border-radius:4px"></span></div>`;
    let timer;
    const run = () => {
      clearTimeout(timer);
      root.innerHTML = `<div class="board"><div class="board-head"><span class="t"><b>Top trends tonight</b><small>&nbsp;</small></span></div>
        <div class="load" role="status" aria-live="polite" style="padding:14px;display:flex;flex-direction:column;gap:10px">
          <div class="loader anim-in"><span class="logo-rise">${LOGO(48)}</span><b>Loading the NBA board…</b></div>${[0, 1, 2].map(sk).join("")}</div></div>`;
      timer = setTimeout(() => {
        const load = $(".load", root); load.classList.add("fadeout");
        setTimeout(() => {
          const shown = PROPS.slice(0, 4);
          $("small", root).textContent = `4 of 128 props pass the bar`;
          load.outerHTML = `${cols}<div class="list">${shown.map((v, i) => row(v, i)).join("")}</div>`;
          wireStars(root); selectable($(".list", root));
        }, reduce ? 0 : 300);
      }, reduce ? 600 : 2600);
    };
    run(); return run;
  }

  /* ================= 3. Dynamic game bar ================= */
  function gameBarDemo(root, staticBtn) {
    let focus = null, mode = "moving";
    const tag = t => `<span class="tm"><i style="background:${TEAMC[t]}"></i>${t}</span>`;
    const item = (g, i, hidden) => `<button type="button" class="gm" data-g="${g.a}${g.h}" ${hidden ? 'tabindex="-1" aria-hidden="true"' : ""} aria-pressed="${focus === g.a + g.h}">
      ${tag(g.a)}<span class="t">@</span>${tag(g.h)}<span class="t num">${g.t}</span><span class="p num">${g.n} props</span>${i < GAMES.length - 1 || mode === "moving" ? '<i class="sep"></i>' : ""}</button>`;
    const draw = () => {
      const moving = mode === "moving";
      root.innerHTML = `<nav class="strip" aria-label="Tonight's games"><span class="cap">Tonight · ${GAMES.length}</span>
        <div class="belt ${moving ? "moving" : "static"}" style="--belt-dur:${Math.max(24, GAMES.length * 6)}s"><div class="belt-track">
          <div style="display:flex;align-items:center;gap:8px;padding-right:8px">${GAMES.map((g, i) => item(g, i, false)).join("")}</div>
          ${moving ? `<div style="display:flex;align-items:center;gap:8px;padding-right:8px">${GAMES.map((g, i) => item(g, i, true)).join("")}</div>` : ""}
        </div></div></nav>
        <div class="focus-note" aria-live="polite">${focus ? (() => { const g = GAMES.find(x => x.a + x.h === focus);
          return `<span>Board shows only <b>${g.a} @ ${g.h}</b> · ${g.n} props</span><button type="button" class="quiet" data-clear>Show every game</button>`; })()
          : `<span>Hover to pause the belt. Pick a game to filter the board to it.</span>`}</div>`;
    };
    root.addEventListener("click", e => {
      if (e.target.closest("[data-clear]")) { focus = null; draw(); return; }
      const b = e.target.closest(".gm"); if (!b) return;
      focus = focus === b.dataset.g ? null : b.dataset.g; draw();
    });
    staticBtn.addEventListener("click", () => {
      mode = mode === "moving" ? "static" : "moving";
      staticBtn.setAttribute("aria-pressed", mode === "static"); draw();
    });
    draw();
  }

  /* ================= 4. Lineup alerts ================= */
  let actx = null;
  function chime(kind) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime, notes = kind === "removed" ? [659.25, 493.88] : [880, 1318.5];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f;
        const s = t + i * .13; g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(.16, s + .015); g.gain.exponentialRampToValueAtTime(.0001, s + .55);
        o.connect(g).connect(actx.destination); o.start(s); o.stop(s + .6);
      });
    } catch (e) {}
  }
  function alertDemo(root, bar) {
    const LIFE = 9000;
    const DOT = { removed:"var(--danger)", status:"var(--warn)", lineup:"var(--warn)", confirmed:"var(--good)" };
    const TAG = { removed:"Ruled out", status:"Status change", lineup:"Lineup change", confirmed:"Lineup confirmed" };
    const RANK = { removed:0, status:1, lineup:2, confirmed:3 };
    const NEWS = {
      removed:   { kind:"removed",   text:"Jalen Duren (DET) ruled out, ankle", ids:[5] },
      status:    { kind:"status",    text:"Cade Cunningham (DET): Questionable → Probable", ids:[3] },
      confirmed: { kind:"confirmed", text:"Knicks starting five confirmed: Brunson starts", ids:[1] },
      lineup:    { kind:"lineup",    text:"Sengun moves to the bench for the second half of a back-to-back", ids:[4] },
    };
    let sound = false;
    root.innerHTML = `<div class="board" style="min-height:330px">${cols}<div class="list">${PROPS.slice(0, 5).map((v, i) => row(v, i)).join("")}</div></div><div class="news-stack" aria-live="polite"></div>`;
    const stack = $(".news-stack", root), list = $(".list", root);
    wireStars(root); selectable(list);

    function pop(c, more) {
      const el = document.createElement("div");
      el.className = "news news-in"; el.setAttribute("role", "status");
      const col = DOT[c.kind];
      el.innerHTML = `<div class="in"><span class="dot"><i style="background:${col}"></i><i class="ping" style="background:${col}"></i></span>
        <span class="tx"><span class="k" style="color:${col}">${TAG[c.kind]}${more ? ` · +${more} more` : ""}</span><b>${c.text}</b>
        <button type="button" class="vw">View ${c.ids.length} prop${c.ids.length === 1 ? "" : "s"} →</button></span></div>
        <button type="button" class="x" aria-label="Dismiss">×</button><i class="bar" aria-hidden="true" style="background:${col};animation-duration:${LIFE}ms"></i>`;
      let left = LIFE, started = Date.now(), t = setTimeout(close, left), gone = false;
      function close() { if (gone) return; gone = true; clearTimeout(t); el.classList.replace("news-in", "news-out"); setTimeout(() => el.remove(), 220); }
      el.addEventListener("mouseenter", () => { clearTimeout(t); left -= Date.now() - started; $(".bar", el).style.animationPlayState = "paused"; });
      el.addEventListener("mouseleave", () => { started = Date.now(); t = setTimeout(close, left); $(".bar", el).style.animationPlayState = "running"; });
      $(".x", el).addEventListener("click", close);
      $(".vw", el).addEventListener("click", () => {
        c.ids.forEach(id => { const r = $(`.row[data-id="${id}"]`, list); if (r) { r.classList.remove("flash"); void r.offsetWidth; r.classList.add("flash"); } });
        close();
      });
      stack.appendChild(el);
      while (stack.children.length > 3) stack.firstElementChild.remove();
    }
    function push(listIn) {
      const sorted = listIn.slice().sort((a, b) => RANK[a.kind] - RANK[b.kind]);
      const shown = sorted.slice(0, 3), more = sorted.length - shown.length;
      shown.forEach((c, i) => setTimeout(() => pop(c, i === shown.length - 1 ? more : 0), reduce ? 0 : i * 90));
      if (sound) chime(sorted[0].kind);
    }
    bar.addEventListener("click", e => {
      const b = e.target.closest("[data-news]"); if (!b) return;
      const k = b.dataset.news;
      if (k === "sound") { sound = !sound; b.setAttribute("aria-pressed", sound); b.lastChild.textContent = sound ? " Sound on" : " Sound off"; if (sound) chime("news"); return; }
      if (k === "burst") push([NEWS.confirmed, NEWS.status, NEWS.removed, NEWS.lineup, { ...NEWS.confirmed, text:"Pistons starting five confirmed" }]);
      else push([NEWS[k]]);
    });
    setTimeout(() => push([NEWS.status]), 900);
  }

  /* ================= 5. Line explorer ================= */
  function lineDemo(root) {
    const P = { player:"Jalen Brunson", team:"NYK", stat:"Points", proj:29.1, sd:6.1, games:[24, 31, 28, 19, 33, 27, 30, 22, 35, 29] };
    const LADDER = { over:{ 22.5:[-240,"DraftKings"], 24.5:[-170,"FanDuel"], 26.5:[-115,"FanDuel"], 27.5:[-102,"BetMGM"], 29.5:[+130,"Caesars"], 31.5:[+185,"DraftKings"] },
                     under:{ 22.5:[+190,"BetMGM"], 24.5:[+138,"Caesars"], 26.5:[-108,"DraftKings"], 27.5:[-118,"FanDuel"], 29.5:[-155,"FanDuel"], 31.5:[-230,"BetMGM"] } };
    let base = { line:26.5, side:"over" }, look = null;
    const lo = 18.5, hi = 38.5;
    root.innerHTML = `<div class="lx-card">
      <div class="lx-top">${avatar(P.team, 44, headshot(P.player))}<span class="n"><b>${P.player}</b><small>NYK PG · vs BOS · 7:30 · Proj <span class="num">${P.proj}</span></small></span>${starBtn(true)}</div>
      <div class="lx-graph">
        <div><p class="lx-h"><span>Propr's projection against the line</span><em>dashed = projection</em></p><div class="curve"></div></div>
        <div><p class="lx-h"><span>Last 10 games</span><em class="hits num"></em></p><div class="bars">${P.games.map(() => "<i></i>").join("")}<span class="ln"><span class="num"></span></span></div></div>
      </div>
      <div class="lx">
        <div class="lx-ctl">
          <div class="seg" role="group" aria-label="Side"><button type="button" class="seg-btn" data-v="over">Over</button><button type="button" class="seg-btn" data-v="under">Under</button></div>
          <div style="display:flex;align-items:center;gap:6px" role="group" aria-label="Line">
            <button type="button" class="icon-btn" data-d="-1" aria-label="Lower the line by 1">−</button><span class="lx-line num" aria-live="polite"></span>
            <button type="button" class="icon-btn" data-d="1" aria-label="Raise the line by 1">+</button></div>
          <input type="range" aria-label="Line" min="${lo}" max="${hi}" step="1">
          <button type="button" class="quiet reset" hidden></button>
        </div>
        <dl class="lx-dl">
          <div><dt class="k1"></dt><dd class="num v1"></dd><dd class="s1"></dd></div>
          <div><dt>Propr chance</dt><dd class="num v2"></dd><dd class="s2"></dd></div>
          <div><dt>Value</dt><dd class="num v3"></dd><dd class="s3"></dd></div>
          <div><dt>These games</dt><dd class="num v4"></dd><dd class="s4"></dd></div>
        </dl>
        <div class="lx-use" hidden><span class="u"></span><button type="button" class="btn-primary">Use this line</button></div>
      </div></div>`;
    const sideSeg = seg($(".seg", root), base.side, s => set(cur().line, s));
    const cur = () => look || base;
    const tw = new Map();
    function tween(el, to, fmt) {               // changed numbers count to their new value
      const from = tw.get(el) ?? to; tw.set(el, to);
      if (reduce || from === to || !isFinite(from)) { el.textContent = fmt(to); return; }
      const t0 = performance.now(), d = 220;
      const step = n => { const k = Math.min(1, (n - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
    function set(line, side) {
      const L = Math.min(hi, Math.max(lo, line));
      look = L === base.line && side === base.side ? null : { line:L, side };
      sideSeg.set(side); draw();
    }
    function draw() {
      const { line, side } = cur(), over = side === "over";
      const posted = LADDER[side][line];
      const chance = over ? 1 - cdf(line, P.proj, P.sd) : cdf(line, P.proj, P.sd);
      const edge = posted ? chance - imp(posted[0]) : null;
      const hits = P.games.filter(g => (over ? g > line : g < line)).length;
      $(".curve", root).innerHTML = miniCurve(P.proj, P.sd, line, side, 96);
      const mx = Math.max(...P.games, line) * 1.12;
      $$(".bars i", root).forEach((b, i) => { const g = P.games[i]; b.style.height = Math.round(g / mx * 96) + "px"; b.style.background = (over ? g > line : g < line) ? "var(--good)" : "var(--danger)"; });
      const ln = $(".bars .ln", root); ln.style.transform = `translateY(-${Math.round(line / mx * 96)}px)`; $("span", ln).textContent = line;
      $(".hits", root).textContent = `${hits}/10 ${over ? "over" : "under"} ${line}`;
      $(".lx-line", root).textContent = line;
      $("input", root).value = line;
      $('[data-d="-1"]', root).disabled = line <= lo; $('[data-d="1"]', root).disabled = line >= hi;
      const rs = $(".reset", root); rs.hidden = !look; rs.textContent = `Reset to ${base.side === "over" ? "O" : "U"} ${base.line}`;
      $(".k1", root).textContent = posted ? "Best price" : "Fair odds";
      const fair = fairOdds(chance);
      $(".v1", root).textContent = posted ? fo(posted[0]) : fair != null ? fo(fair) : "–";
      $(".s1", root).innerHTML = posted ? `${bk(posted[1])}${posted[1]}` : "no book posts this line";
      tween($(".v2", root), chance * 100, v => (v < 1 ? "under 1%" : v > 99 ? "over 99%" : Math.round(v) + "%"));
      $(".s2", root).textContent = posted ? (fair != null ? `fair ${fo(fair)}` : "long shot") : "from the projection";
      const v3 = $(".v3", root);
      v3.className = "num v3 " + (edge == null ? "mu" : edge >= 0 ? "up" : "dn");
      if (edge == null) { tw.delete(v3); v3.textContent = "–"; } else tween(v3, edge * 100, v => (v > 0 ? "+" : "") + v.toFixed(1) + "%");
      $(".s3", root).textContent = edge == null ? "needs a posted price" : "chance vs the price";
      tween($(".v4", root), hits, v => Math.round(v) + "/10");
      $(".s4", root).textContent = `${over ? "over" : "under"} ${line}`;
      const use = $(".lx-use", root); use.hidden = !(posted && look);
      if (posted && look) $(".u", use).innerHTML = `${bk(posted[1])}${posted[1]} has ${over ? "over" : "under"} ${line} at ${fo(posted[0])}`;
    }
    $$(".icon-btn", root).forEach(b => b.addEventListener("click", () => set(cur().line + +b.dataset.d, cur().side)));
    $("input", root).addEventListener("input", e => set(+e.target.value, cur().side));
    $(".reset", root).addEventListener("click", () => { look = null; sideSeg.set(base.side); draw(); });
    function useLine() {
      base = { ...look }; look = null; draw();
      const u = $(".lx-use", root); u.hidden = false;
      u.innerHTML = `<span class="lx-toast"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="check-path" d="M5 12.5l4.5 4.5L19 7.5"/></svg>Now your pick everywhere: saved picks and the bet link</span>`;
      setTimeout(() => { u.innerHTML = `<span class="u"></span><button type="button" class="btn-primary">Use this line</button>`;
        $(".btn-primary", u).addEventListener("click", useLine); draw(); }, 2400);
    }
    $(".lx-use .btn-primary", root).addEventListener("click", useLine);
    wireStars(root);
    draw();
  }

  /* ================= 6. Micro-interactions ================= */
  function microDemo(root) {
    // tabs with a gliding underline
    const tabs = $(".tabs", root);
    if (tabs) {
      const slide = document.createElement("i"); slide.className = "slide"; tabs.appendChild(slide);
      const place = b => { slide.style.width = b.offsetWidth + "px"; slide.style.transform = `translateX(${b.offsetLeft}px)`; };
      $$("button", tabs).forEach(b => b.addEventListener("click", () => { $$("button", tabs).forEach(x => x.setAttribute("aria-selected", x === b)); place(b); }));
      requestAnimationFrame(() => place($('[aria-selected="true"]', tabs)));
    }
    const seg2 = $(".seg", root); if (seg2) seg(seg2, "trends");
    wireStars(root);
    const share = $("[data-share]", root);
    if (share) share.addEventListener("click", () => {
      if (share.classList.contains("done")) { share.classList.remove("done"); share.innerHTML = "Share to Discord"; return; }
      share.innerHTML = "Sharing…";
      setTimeout(() => { share.classList.add("done");
        share.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="check-path" d="M5 12.5l4.5 4.5L19 7.5"/></svg>Shared to Discord`; }, 600);
    });
    const mc = $(".mini-card", root);
    if (mc) $("button", mc).addEventListener("click", () => {
      const open = !mc.querySelector(".body");
      $(".chev", mc).classList.toggle("open", open);
      if (open) mc.insertAdjacentHTML("beforeend", `<div class="body anim-in">Usually puts up 26.8 points. Pace up against Boston, projected 29.1, 2.6 above the line.</div>`);
      else mc.querySelector(".body").remove();
    });
  }


  /* ================= 7. Sign-in with an emailed two-step code ================= */
  // Same steps and copy as Propr's login.js: password (or Google) -> code emailed every time ->
  // access code on the first sign-in -> terms -> the welcome strip. Here the "inbox" is beside the card.
  function signupDemo(root, steps) {
    const card = $(".auth", root), inbox = $(".inbox", root);
    const esc = x => String(x).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
    let email = "", code = "", access = "PROPR-7Q4K-MX2D";
    const ORDER = ["signin", "code", "access", "terms", "done"];
    const mark = k => $$("li", steps).forEach(li => { const i = ORDER.indexOf(li.dataset.s), j = ORDER.indexOf(k);
      li.dataset.state = i < j ? "done" : i === j ? "on" : ""; });
    const view = (k, html) => { mark(k); card.innerHTML = `<div class="auth-step">${html}</div>`; const f = $("input", card);  };
    const fail = msg => { const e = $(".err", card); e.textContent = msg; e.classList.remove("err-in"); void e.offsetWidth; e.classList.add("err-in");
      const i = $("input.code, input", card); if (i){ i.classList.remove("shake"); void i.offsetWidth; i.classList.add("shake"); } };
    const wait = (btn, ms, fn) => { btn.disabled = true; const t = btn.textContent; btn.innerHTML = `<span class="spin" aria-hidden="true"></span>${t}`; setTimeout(() => { btn.disabled = false; btn.textContent = t; fn(); }, reduce ? 0 : ms); };

    function mail(subject, title, intro, big, note) {
      const time = new Date().toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
      inbox.querySelector(".mail-list").insertAdjacentHTML("afterbegin", `<article class="mail mail-in">
        <header><span class="from">${LOGO(22)}<b>Propr</b><small>noreply@propr.win</small></span><time>${time}</time></header>
        <p class="subj">${esc(subject)}</p>
        <div class="mail-card"><div class="mh"><span>${LOGO(20)}</span><b>Propr</b></div>
          <h5>${title}</h5><p>${intro}</p>${big ? `<div class="big num">${big}</div>` : ""}
          <div class="rem"><b>Reminder</b>${note}</div></div></article>`);
      inbox.querySelector(".empty")?.remove();
      const b = inbox.querySelector(".count"); b.textContent = inbox.querySelectorAll(".mail").length; b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    }

    function signin() {
      view("signin", `<h3>Sign in to Propr</h3><p class="sub">Invite-only beta. No invite yet? <a href="#" onclick="return false">Join the waitlist</a></p>
        <button type="button" class="abtn ghost" data-google><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#F5F5F6" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.1L6.4 14zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6z"/></svg>Continue with Google</button>
        <div class="or">or</div>
        <form novalidate><label class="f" for="su-email">Email</label><input class="f" id="su-email" type="email" value="${esc(email || "you@example.com")}" autocomplete="off">
        <label class="f" for="su-pw">Password</label><input class="f" id="su-pw" type="password" value="demo-password" autocomplete="off">
        <button class="abtn" type="submit">Continue</button><div class="err" role="alert"></div></form>
        <div class="row-links"><button class="pr-link" type="button">Forgot password?</button><button class="pr-link" type="button">Got an invite? Set up your account</button></div>`);
      const go = btn => { email = ($("#su-email", card)?.value || "you@example.com").trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Enter an email like name@example.com");
        wait(btn, 700, () => { sendCode(); twoStep(); }); };
      $("form", card).addEventListener("submit", e => { e.preventDefault(); go($("button[type=submit]", card)); });
      $("[data-google]", card).addEventListener("click", e => { email = "you@gmail.com"; wait(e.currentTarget, 700, () => { sendCode(); twoStep(); }); });
    }
    function sendCode() {
      code = String(Math.floor(100000 + Math.random() * 900000));
      mail(`${code} is your Propr sign-in code`, "Your sign-in code", "Enter this code to finish signing in to Propr:", code,
        "It works once and expires in 10 minutes. Propr will never ask you for this code.");
    }
    function twoStep() {
      view("code", `<h3>Enter your sign-in code</h3><p class="sub">We emailed a 6-digit code to <strong>${esc(email)}</strong>. It expires in 10 minutes.</p>
        <form novalidate><label class="f" for="su-code">6-digit code</label><input class="f code num" id="su-code" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="••••••">
        <button class="abtn" type="submit">Sign in</button><div class="err" role="alert"></div></form>
        <div class="row-links"><button class="pr-link" type="button" data-again>Send a new code</button><button class="pr-link" type="button" data-out>Not you? Start over</button></div>
        <p class="hint">Copy the code from the email on the right, or <button type="button" class="pr-link inline" data-fill>fill it in for me</button>.</p>`);
      const inp = $("#su-code", card);
      inp.addEventListener("input", () => { inp.value = inp.value.replace(/[^0-9 ]/g, ""); if (inp.value.replace(/\s/g, "").length === 6) $("form", card).dispatchEvent(new Event("submit", { cancelable:true, bubbles:true })); });
      $("[data-fill]", card).addEventListener("click", () => { let i = 0; inp.value = ""; const t = setInterval(() => { inp.value += code[i++]; if (i === 6){ clearInterval(t); $("form", card).dispatchEvent(new Event("submit", { cancelable:true, bubbles:true })); } }, reduce ? 0 : 70); });
      $("[data-again]", card).addEventListener("click", e => { sendCode(); e.target.disabled = true; $(".err", card).textContent = "A new code is on its way. The old one no longer works."; setTimeout(() => { e.target.disabled = false; }, 30000); });
      $("[data-out]", card).addEventListener("click", signin);
      $("form", card).addEventListener("submit", e => { e.preventDefault();
        const v = inp.value.replace(/\s/g, "");
        if (v !== code) return fail(v.length < 6 ? "Enter all 6 digits." : "That code doesn't match. Check the newest email.");
        wait($("button[type=submit]", card), 500, accessStep); });
    }
    function accessStep() {
      mail("Your Propr access code", "You're in", "Your spot on Propr is open. Here's your access code:", access,
        "The code works once, only for this email address, and expires in 30 days.");
      view("access", `<div class="step">First sign-in only</div><h3>Enter your access code</h3>
        <p class="sub">Signed in as <strong>${esc(email)}</strong>. Your code is in the invite email and looks like PROPR-XXXX-XXXX.</p>
        <form novalidate><label class="f" for="su-acc">Access code</label><input class="f num" id="su-acc" autocomplete="off" spellcheck="false" maxlength="20" style="text-transform:uppercase">
        <button class="abtn" type="submit">Continue</button><div class="err" role="alert"></div></form>
        <p class="hint">It's in the newest email. <button type="button" class="pr-link inline" data-fill>Fill it in for me</button></p>`);
      $("[data-fill]", card).addEventListener("click", () => { $("#su-acc", card).value = access; });
      $("form", card).addEventListener("submit", e => { e.preventDefault();
        if ($("#su-acc", card).value.trim().toUpperCase() !== access) return fail("That access code isn't right, or it's already been used.");
        wait($("button[type=submit]", card), 500, terms); });
    }
    function terms() {
      view("terms", `<h3>Before you start</h3><p class="sub">Signed in as <strong>${esc(email)}</strong>. Propr is a research tool for adults. It doesn't take bets, and nothing on it is a guarantee.</p>
        <form novalidate><label class="check"><input type="checkbox" id="su-agree"><span>I'm 19 or older, and I agree to the Terms and Privacy Policy.</span></label>
        <button class="abtn" type="submit">Agree and continue</button><div class="err" role="alert"></div></form>`);
      $("form", card).addEventListener("submit", e => { e.preventDefault();
        if (!$("#su-agree", card).checked) return fail("Tick the box to continue.");
        wait($("button[type=submit]", card), 400, welcome); });
    }
    function welcome() {
      const h = [14, 22, 10, 26, 18, 8, 24, 20, 12, 34];
      view("done", `<div class="win" role="status"><span class="win-bars" aria-hidden="true">${h.map((v, i) =>
          `<i class="${v > 16 ? "hit" : ""}" style="height:${v}px;animation-delay:${i * 40}ms"></i>`).join("")}<b></b></span>
        <span class="win-t"><strong><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>You're in</strong>
        <span>Opening tonight's board</span></span></div>
        <button type="button" class="abtn" data-restart>Start over</button>`);
      $("[data-restart]", card).addEventListener("click", reset);
    }
    function reset() { email = ""; inbox.querySelector(".mail-list").innerHTML = `<p class="empty">Codes Propr sends you land here</p>`; inbox.querySelector(".count").textContent = "0"; signin(); }
    reset(); return reset;
  }

  /* ---------------- wire up ---------------- */
  const on = (sel, fn) => { const el = document.querySelector(sel); return el ? fn(el) : null; };
  const replay = (btnSel, fn) => { const b = document.querySelector(btnSel); if (b && fn) b.addEventListener("click", fn); };
  replay("#board-replay", on("#demo-board", el => boardDemo(el, $("#board-view"))));
  replay("#skel-replay", on("#demo-skel", skeletonDemo));
  on("#demo-games", el => gameBarDemo(el, $("#games-static")));
  on("#demo-alerts", el => alertDemo(el, $("#alerts-bar")));
  on("#demo-line", lineDemo);
  on("#demo-micro", microDemo);
  replay("#signup-replay", on("#demo-signup", el => signupDemo(el, $("#signup-steps"))));
  on("#demo-hero", el => { el.innerHTML = `<div class="board"><div class="board-head"><span class="t"><b>Top trends tonight</b><small class="num">6 of 128 props pass the bar · 2 unders · 4 overs</small></span></div>${cols}<div class="list">${PROPS.map((v, i) => row(v, i)).join("")}</div></div>`; wireStars(el); selectable($(".list", el)); });
  const ease = document.querySelector("[data-ease]");
  if (ease) ease.addEventListener("click", () => $$(".ease-track", document).forEach(t => { const i = $("i", t); const w = t.clientWidth - 12; i.style.transform = i.style.transform ? "" : `translateX(${w}px)`; }));
})();
