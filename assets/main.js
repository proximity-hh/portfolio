/* Project covers: a still at rest, the motion piece on hover or focus */
(function(){
  if (!matchMedia('(hover: hover)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].forEach.call(document.querySelectorAll('.proj, .case'), function(card){
    var v = card.querySelector('.cover video');
    if (!v) return;
    v.muted = true;
    function on(){ card.classList.add('playing'); try { v.currentTime = 0; } catch(e){} var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    function off(){ card.classList.remove('playing'); v.pause(); }
    card.addEventListener('mouseenter', on); card.addEventListener('mouseleave', off);
    card.addEventListener('focus', on); card.addEventListener('blur', off);
  });
})();

/* Case-study dock: a sections menu (hover or tap) and a back-to-top button */
(function(){
  var secs = [].slice.call(document.querySelectorAll('.cs-sec[id]')).filter(function(s){ return s.querySelector('header h2'); });
  if (secs.length < 2){
    // pages without case sections (the homepage) still get a way back to the top
    var t = document.createElement('nav'); t.className = 'dock'; t.setAttribute('aria-label','Page');
    t.innerHTML = '<button type="button" class="pill top" aria-label="Back to top">&uarr;</button>';
    document.body.appendChild(t);
    var tb = t.querySelector('.top');
    tb.addEventListener('click', function(){ window.scrollTo({ top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    var f = function(){ var y = scrollY, h = document.documentElement.scrollHeight - innerHeight; t.classList.toggle('on', y > innerHeight * .8); tb.classList.toggle('end', y > h - 400); };
    addEventListener('scroll', f, { passive:true }); f();
    return;
  }
  var dock = document.createElement('nav'); dock.className = 'dock'; dock.setAttribute('aria-label','Case study sections');
  var items = secs.map(function(s){
    var n = s.querySelector('header i'); var h = s.querySelector('header h2');
    return '<li><a href="#'+s.id+'"><i>'+(n ? n.textContent : '')+'</i>'+h.textContent+'</a></li>';
  }).join('');
  dock.innerHTML = '<div class="dock-sec"><ul>'+items+'</ul><button type="button" class="pill" aria-haspopup="true"><b>Sections</b><span class="cur-name"></span></button></div>'
    + '<button type="button" class="pill top" aria-label="Back to top">&uarr;</button>';
  document.body.appendChild(dock);
  var menu = dock.querySelector('.dock-sec'), cur = dock.querySelector('.cur-name'), top = dock.querySelector('.top');
  var links = [].slice.call(dock.querySelectorAll('.dock-sec a'));
  dock.querySelector('.dock-sec .pill').addEventListener('click', function(){ menu.classList.toggle('open'); });
  links.forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); }); });
  top.addEventListener('click', function(){ window.scrollTo({ top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    dock.classList.toggle('on', y > window.innerHeight * 0.6);
    top.classList.toggle('end', y > h - 400);
    var idx = -1; secs.forEach(function(s, i){ if (s.getBoundingClientRect().top < window.innerHeight * 0.35) idx = i; });
    links.forEach(function(a, i){ a.classList.toggle('cur', i === idx); });
    cur.textContent = idx >= 0 ? ' · ' + secs[idx].querySelector('header h2').textContent : '';
  }
  window.addEventListener('scroll', onScroll, { passive:true }); onScroll();
})();

/* Greeting types between Mandarin and English: "你好，我是黃翔晧" <-> "Hi, I'm Howard".
   Used on the homepage and About; on load the Mandarin line types itself in. */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  [].forEach.call(document.querySelectorAll('h1'), function(h){
    var segs = [].slice.call(h.querySelectorAll('.tw-t')); var caret = h.querySelector('.caret');
    if (segs.length < 3 || !caret) return;
    if (reduce){ caret.remove(); return; }
    var stop = h.querySelector('.tw.nm .tw-t').textContent.slice(-1) === '。';
    var L = { zh:{ text:['你好','，我是', stop ? '黃翔晧。' : '黃翔晧'], lang:'zh-Hant' },
              en:{ text:['Hi',', I\u2019m\u00a0', stop ? 'Howard.' : 'Howard'], lang:'en' } };
    function put(i){ segs[i].parentNode.appendChild(caret); }
    async function erase(i){ put(i); var t = segs[i].textContent; for (var k = t.length; k > 0; k--){ segs[i].textContent = t.slice(0, k - 1); await sleep(80); } }
    async function type(i, w, lang){ put(i); segs[i].setAttribute('lang', lang); for (var k = 1; k <= w.length; k++){ segs[i].textContent = w.slice(0, k); await sleep(lang === 'en' ? 100 : 160); } }
    async function typeAll(l){ await type(0, l.text[0], l.lang); await type(1, l.text[1], l.lang); await sleep(100); await type(2, l.text[2], l.lang); }
    (async function(){
      // load: start empty, type the Mandarin line in
      segs.forEach(function(s){ s.textContent = ''; });
      h.classList.add('typing-in');
      await sleep(450); await typeAll(L.zh); h.classList.remove('typing-in');
      var cur = 'zh';
      while (true){
        await sleep(cur === 'zh' ? 3000 : 6000);
        var next = cur === 'zh' ? 'en' : 'zh';
        await erase(2); await erase(1); await erase(0);
        h.classList.toggle('en', next === 'en');
        await sleep(200); await typeAll(L[next]); cur = next;
      }
    })();
  });
})();

/* Lantern cursor: a small paper lantern centred on the click point.
   It tilts a little as you move (never far enough to miss a click) and lights over anything clickable. */
(function(){
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = document.createElement('div'); el.className = 'lc'; el.setAttribute('aria-hidden','true');
  el.innerHTML = '<div class="lc-in"><div class="lc-glow"></div>'
   + '<svg viewBox="0 0 30 58"><defs>'
   + '<radialGradient id="lcOff" cx="50%" cy="45%" r="62%"><stop offset="0" stop-color="#EFA77A"/><stop offset="1" stop-color="#B8432A"/></radialGradient>'
   + '<radialGradient id="lcOn" cx="50%" cy="45%" r="62%"><stop offset="0" stop-color="#FFF6E0"/><stop offset=".45" stop-color="#FBC274"/><stop offset="1" stop-color="#E0592C"/></radialGradient></defs>'
   + '<line x1="15" y1="0" x2="15" y2="14" stroke="#1C1411" stroke-width="1.4" stroke-linecap="round"/>'
   + '<rect x="9" y="14" width="12" height="4" rx="1" fill="#B3261E"/>'
   + '<rect x="3" y="17.5" width="24" height="27" rx="11" ry="9.5" fill="url(#lcOff)" stroke="#1C1411" stroke-opacity=".55" stroke-width="1"/>'
   + '<rect class="lit-body" x="3" y="17.5" width="24" height="27" rx="11" ry="9.5" fill="url(#lcOn)" stroke="#FBF4E6" stroke-width="1"/>'
   + '<line x1="5.5" y1="25" x2="24.5" y2="25" stroke="#9E2418" stroke-opacity=".3" stroke-width=".8"/>'
   + '<line x1="4" y1="31" x2="26" y2="31" stroke="#9E2418" stroke-opacity=".3" stroke-width=".8"/>'
   + '<line x1="5.5" y1="37" x2="24.5" y2="37" stroke="#9E2418" stroke-opacity=".3" stroke-width=".8"/>'
   + '<rect x="9" y="43.5" width="12" height="4" rx="1" fill="#B3261E"/>'
   + '<line x1="15" y1="47.5" x2="15" y2="56" stroke="#E9A23B" stroke-width="2" stroke-linecap="round"/>'
   + '<circle cx="15" cy="31" r="1.6" fill="#1C1411" fill-opacity=".75"/>'
   + '</svg></div>';
  document.body.appendChild(el);
  document.documentElement.classList.add('lc-on');
  var inner = el.querySelector('.lc-in');
  var x = -100, y = -100, px = x, ang = 0, vel = 0, seen = false;
  var HOT = 'a, button, summary, label, select, [role="button"], [role="tab"], .proj, .case, .pill';
  addEventListener('mousemove', function(e){
    x = e.clientX; y = e.clientY;
    if (!seen){ px = x; seen = true; }
    el.classList.add('show');
    var t = e.target.closest ? e.target.closest(HOT) : null;
    el.classList.toggle('lit', !!t);
  }, { passive:true });
  document.addEventListener('mouseleave', function(){ el.classList.remove('show'); });
  addEventListener('mousedown', function(){ el.classList.add('press'); });
  addEventListener('mouseup', function(e){
    el.classList.remove('press');
    if (reduce) return;
    var p = document.createElement('span'); p.className = 'lc-ping'; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
    document.body.appendChild(p); setTimeout(function(){ p.remove(); }, 600);
  });
  function frame(){
    var dx = x - px; px = x;
    if (!reduce){
      var target = Math.max(-9, Math.min(9, -dx * 0.9));
      vel += (target - ang) * 0.14; vel *= 0.8; ang += vel;
    }
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    inner.style.setProperty('--tilt', ang.toFixed(2) + 'deg');
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* Day / night in Jiufen: the new scene opens as a circle from the toggle */
(function(){
  var btn = document.querySelector('.theme-t');
  if (!btn) return;
  var root = document.documentElement;
  function label(){ var n = root.getAttribute('data-theme') === 'night'; btn.setAttribute('aria-label', n ? 'Switch to day mode' : 'Switch to night mode'); btn.title = n ? 'Day in Jiufen' : 'Night in Jiufen';
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = n ? '#13111B' : '#F7F2E8'; }
  function lanternFx(night, x, y){
    var f = document.createElement('span'); f.className = 'dusk-flare'; f.style.left = x + 'px'; f.style.top = y + 'px';
    document.body.appendChild(f); setTimeout(function(){ f.remove(); }, 950);
    root.classList.remove('igniting','dimming'); void root.offsetWidth;
    root.classList.add(night ? 'igniting' : 'dimming');
    setTimeout(function(){ root.classList.remove('igniting','dimming'); }, 2200);
    if (!night) return;
    // a few sky lanterns drift up from the street, like Pingxi
    for (var i = 0; i < 5; i++){
      (function(i){ setTimeout(function(){
        var s = document.createElement('span'); s.className = 'sky-l';
        var w = 10 + Math.random() * 10;
        s.style.cssText = 'left:' + (8 + Math.random() * 84) + 'vw;top:' + (70 + Math.random() * 25) + 'vh;--w:' + w + 'px;--t:' + (3.6 + Math.random() * 2.2) + 's;--dx:' + (Math.random() * 80 - 40) + 'px;--dy:' + (innerHeight * (.7 + Math.random() * .4)) + 'px;--r:' + (Math.random() * 16 - 8) + 'deg';
        document.body.appendChild(s); setTimeout(function(){ s.remove(); }, 6200);
      }, 300 + i * 260); })(i);
    }
  }
  function apply(night){ if (night) root.setAttribute('data-theme','night'); else root.removeAttribute('data-theme'); try { localStorage.setItem('theme', night ? 'night' : 'day'); } catch(e){} label(); }
  label();
  btn.addEventListener('click', function(){
    var night = root.getAttribute('data-theme') !== 'night';
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce){
      if (!reduce){ var rr = btn.getBoundingClientRect(); lanternFx(night, rr.left + rr.width/2, rr.top + rr.height/2); }
      root.classList.add('theme-fade'); apply(night); setTimeout(function(){ root.classList.remove('theme-fade'); }, 520); return;
    }
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    lanternFx(night, x, y);
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var t = document.startViewTransition(function(){ apply(night); });
    t.ready.then(function(){
      root.animate({ clipPath:['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration:800, easing:'cubic-bezier(.2,.7,.2,1)', pseudoElement:'::view-transition-new(root)' });
    });
  });
})();
