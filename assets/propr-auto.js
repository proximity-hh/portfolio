/* Propr demos play themselves: the page shows each feature without asking the visitor to drive it.
   Each loop runs only while its demo is on screen. */
(function(){
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function(ms){ return new Promise(function(r){ setTimeout(r, reduce ? Math.min(ms, 400) : ms); }); };
  function click(el){ if (el) el.click(); }
  function flash(el){ if (!el) return; el.classList.add('auto-on'); setTimeout(function(){ el.classList.remove('auto-on'); }, 900); }
  function whenVisible(el, run){
    if (!el) return;
    var on = false, busy = false;
    new IntersectionObserver(function(es){
      on = es[0].isIntersecting;
      if (on && !busy){ busy = true; (async function(){ while (on){ await run(); } busy = false; })(); }
    }, { threshold: .35 }).observe(el);
  }
  // demos never shrink once they've grown, so the page below them never moves
  if (window.ResizeObserver){
    var ro = new ResizeObserver(function(es){ es.forEach(function(e){ var el = e.target, h = Math.ceil(el.getBoundingClientRect().height), m = +(el.dataset.maxh || 0);
      if (h > m){ el.dataset.maxh = h; el.style.minHeight = h + 'px'; } }); });
    $$('.pr .stage-body').forEach(function(el){ ro.observe(el); });
  }
  var narrow = matchMedia('(max-width: 760px)').matches;
  // 01 board: switch views, pick a prop
  whenVisible($('#demo-board'), async function(){
    var b = $('#board-view'); click($('[data-v="full"]', b)); await sleep(1600);
    var rows = $$('#demo-board .row'); click(rows[1]); await sleep(2600); click(rows[3]); await sleep(2600);
    if (!narrow){ click($('[data-v="basic"]', b)); await sleep(4200); }
  });
  // 02 skeleton: replay the load
  whenVisible($('#demo-skel'), async function(){ await sleep(5200); click($('#skel-replay')); });
  // 03 game bar: focus a game, then clear
  whenVisible($('#demo-games'), async function(){
    await sleep(3200); var g = $$('#demo-games .gm:not([aria-hidden])'); click(g[2]); await sleep(3200);
    click($('#demo-games [data-clear]')); await sleep(1800);
  });
  // 04 alerts: news arrives on its own
  whenVisible($('#demo-alerts'), async function(){
    var keys = ['status','confirmed','removed','burst'];
    for (var i = 0; i < keys.length; i++){ var btn = $('#alerts-bar [data-news="' + keys[i] + '"]'); flash(btn); click(btn); await sleep(keys[i] === 'burst' ? 9000 : 4200); }
  });
  // 05 line adjustment: step the line up and down, then reset
  whenVisible($('#demo-line'), async function(){
    var up = $('#demo-line [data-d="1"]'), dn = $('#demo-line [data-d="-1"]');
    for (var i = 0; i < 3; i++){ await sleep(1300); click(up); }
    await sleep(1800); click($('#demo-line .seg [data-v="under"]')); await sleep(1800);
    for (var j = 0; j < 4; j++){ await sleep(1100); click(dn); }
    await sleep(1800); var r = $('#demo-line .reset'); if (r && !r.hidden) click(r); await sleep(1600);
  });
  // 06 sign-in: Google, emailed code, access code, terms, welcome
  whenVisible($('#demo-signup'), async function(){
    var card = $('#demo-signup .auth');
    await sleep(1500); click($('[data-google]', card)); await sleep(2600);
    click($('[data-fill]', card)); await sleep(2800);
    var acc = $('[data-fill]', card); if (acc){ click(acc); await sleep(900); var f = $('form', card); if (f) f.dispatchEvent(new Event("submit", { cancelable:true, bubbles:true })); }
    await sleep(2200);
    var box = $('input[type="checkbox"]', card); if (box){ box.checked = true; box.dispatchEvent(new Event('change', { bubbles:true })); await sleep(900); var f2 = $('form', card); if (f2) f2.dispatchEvent(new Event("submit", { cancelable:true, bubbles:true })); }
    await sleep(5200); click($('[data-restart]', card)); await sleep(1200);
  });
  // 07 micro-interactions: one after another
  whenVisible($('#demo-micro'), async function(){
    var m = $('#demo-micro');
    var steps = [ $('.btn', m), $('.star', m), $('[data-share]', m), $$('.seg-btn', m)[1], $$('[role="tab"]', m)[1], $('.mini-card button', m),
                  $$('.seg-btn', m)[0], $$('[role="tab"]', m)[0], $('.mini-card button', m), $('.star', m) ];
    for (var i = 0; i < steps.length; i++){ var el = steps[i]; if (!el) continue; el.classList.add('auto-press'); click(el); setTimeout(function(e){ e.classList.remove('auto-press'); }.bind(null, el), 220); await sleep(1500); }
    await sleep(1200);
  });
})();
