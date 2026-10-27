/* bat transition between the standard site and the Batcave */
(function(){
  var KEY = 'batwipe';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function build(){
    var w = document.createElement('div');
    w.className = 'bat-wipe'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<span class="bw-back"></span><i class="bw-bat"></i><i class="bw-sig"></i>';
    document.body.appendChild(w);
    return w;
  }
  function anim(el, frames, opts){ return el.animate ? el.animate(frames, Object.assign({ fill:'forwards' }, opts)) : null; }

  /* ---- leaving: the bat spins in and swallows the page ---- */
  function leave(href){
    if (reduce){ location.href = href; return; }
    try { sessionStorage.setItem(KEY, '1'); } catch(e){}
    var w = build(), bat = w.querySelector('.bw-bat'), back = w.querySelector('.bw-back'), sig = w.querySelector('.bw-sig');
    w.style.pointerEvents = 'auto';
    anim(bat,  [{ transform:'scale(0) rotate(-540deg)' }, { transform:'scale(64) rotate(0deg)' }],
               { duration:760, easing:'cubic-bezier(.62,0,.88,.42)' });
    anim(back, [{ opacity:0, offset:0 }, { opacity:0, offset:.72 }, { opacity:1 }], { duration:760 });
    anim(sig,  [{ opacity:0, transform:'scale(.4) rotate(-90deg)', offset:0 }, { opacity:0, transform:'scale(.4) rotate(-90deg)', offset:.55 },
                { opacity:1, transform:'scale(1) rotate(0deg)' }],
               { duration:900, easing:'cubic-bezier(.2,.9,.3,1.15)' });
    setTimeout(function(){ location.href = href; }, 940);
  }

  /* ---- arriving: start on black, the bat spins back out ---- */
  function arrive(){
    var w = build(), bat = w.querySelector('.bw-bat'), back = w.querySelector('.bw-back'), sig = w.querySelector('.bw-sig');
    bat.style.transform = 'scale(64)'; back.style.opacity = '1'; sig.style.opacity = '1';
    root.classList.remove('bat-in');
    anim(sig,  [{ opacity:1, transform:'scale(1)' }, { opacity:0, transform:'scale(1.7)' }],
               { duration:340, delay:120, easing:'ease-in' });
    anim(back, [{ opacity:1 }, { opacity:0 }], { duration:220, delay:300 });
    var a = anim(bat, [{ transform:'scale(64) rotate(0deg)' }, { transform:'scale(0) rotate(540deg)' }],
                 { duration:820, delay:300, easing:'cubic-bezier(.16,.7,.3,1)' });
    var done = function(){ if (w.parentNode) w.remove(); };
    if (a) a.onfinish = done; setTimeout(done, 1500);
  }

  var pending = false;
  try { pending = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch(e){}
  if (pending && !reduce){
    if (document.body) arrive(); else document.addEventListener('DOMContentLoaded', arrive);
  } else root.classList.remove('bat-in');

  /* coming back via the browser's back button restores the covered page from cache — clear it */
  addEventListener('pageshow', function(e){
    if (!e.persisted) return;
    root.classList.remove('bat-in');
    [].forEach.call(document.querySelectorAll('.bat-wipe'), function(n){ n.remove(); });
  });

  document.addEventListener('click', function(e){
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[data-bat]');
    if (!a || a.target === '_blank') return;
    e.preventDefault();
    leave(a.getAttribute('href'));
  });
})();

/* the Batcave's cursor: bat logo, turning into the cowl over anything clickable */
(function(){
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var bc = document.createElement('div');
  bc.id = 'batCursor'; bc.setAttribute('aria-hidden', 'true');
  bc.innerHTML = '<span class="ring"></span><img class="sprite logo" src="assets/ui/cursor-logo.png" alt="">' +
                 '<img class="sprite cowl" src="assets/ui/cursor-cowl.png" alt="">';
  document.body.appendChild(bc);
  document.documentElement.classList.add('bat-cursor');
  var HOT = 'a, button, [role="button"], .card, [data-zoom], .sp-sc-media .sp-shot, label, summary, select, .swarm[data-near], .swarm.dragging';
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function put(){ bc.style.transform = 'translate(' + (cx - 16) + 'px,' + (cy - 16) + 'px)'; }
  function loop(){
    cx += (tx - cx) * 0.35; cy += (ty - cy) * 0.35; put();
    raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
  }
  document.addEventListener('mousemove', function(e){
    tx = e.clientX; ty = e.clientY;
    if (!bc.dataset.init){ cx = tx; cy = ty; bc.dataset.init = '1'; put(); }
    if (!raf) raf = requestAnimationFrame(loop);
    bc.classList.add('show');
    bc.classList.toggle('hot', !!(e.target.closest && e.target.closest(HOT)));
  }, { passive:true });
  document.addEventListener('mouseleave', function(){ bc.classList.remove('show'); });
  document.documentElement.addEventListener('mouseleave', function(){ bc.classList.remove('show'); });
  document.addEventListener('mousedown', function(){ bc.classList.add('click'); });
  document.addEventListener('mouseup',   function(){ bc.classList.remove('click'); });
})();

/* project covers: a still at rest, the prototype flow on hover */
(function(){
  if (!matchMedia('(hover: hover)').matches) return;
  [].forEach.call(document.querySelectorAll('.card'), function(card){
    var v = card.querySelector('.cover-swap video');
    if (!v) return;
    v.muted = true;
    function on(){ card.classList.add('playing'); try { v.currentTime = 0; } catch(e){} var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    function off(){ card.classList.remove('playing'); v.pause(); }
    card.addEventListener('mouseenter', on); card.addEventListener('mouseleave', off);
    card.addEventListener('focus', on);      card.addEventListener('blur', off);
  });
})();

/* footer bats: they scatter from the cursor, and you can grab one and drop it somewhere else */
(function(){
  var sw = document.querySelector('.swarm');
  if (!sw) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bats = [].map.call(sw.querySelectorAll('i'), function(el){
    return { el:el, hx:0, hy:0, x:0, y:0, vx:0, vy:0, cx:0, cy:0, w:0 };
  });
  if (!bats.length) return;
  sw.classList.add('live');

  var mx = -1e4, my = -1e4, inside = false, drag = null, raf = null, box = null;
  function measure(){
    box = sw.getBoundingClientRect();
    bats.forEach(function(b){
      // centre of the bat's resting spot, in swarm coordinates
      b.cx = b.el.offsetLeft + b.el.offsetWidth / 2;
      b.cy = b.el.offsetTop  + b.el.offsetHeight / 2;
      b.w  = b.el.offsetWidth;
    });
  }
  measure();
  addEventListener('resize', measure, { passive:true });

  function local(e){ box = sw.getBoundingClientRect(); return [e.clientX - box.left, e.clientY - box.top]; }
  function nearest(px, py, reach){
    var best = null, bd = reach;
    bats.forEach(function(b){
      var d = Math.hypot(b.cx + b.x - px, b.cy + b.y - py) - b.w * 0.5;
      if (d < bd){ bd = d; best = b; }
    });
    return best;
  }
  function kick(){ if (!raf) raf = requestAnimationFrame(step); }

  function step(){
    raf = null;
    var moving = false, R = 140;
    bats.forEach(function(b){
      if (b === drag) return;
      if (inside && !reduce){
        var dx = b.cx + b.x - mx, dy = b.cy + b.y - my, d = Math.hypot(dx, dy);
        if (d < R && d > 0.01){
          var f = (1 - d / R) * 3.6;               // closer = stronger shove
          b.vx += dx / d * f; b.vy += dy / d * f;
        }
      }
      b.vx += (b.hx - b.x) * 0.035;                // spring home
      b.vy += (b.hy - b.y) * 0.035;
      b.vx *= 0.86; b.vy *= 0.86;
      b.x += b.vx;  b.y += b.vy;
      b.el.style.translate = b.x.toFixed(1) + 'px ' + b.y.toFixed(1) + 'px';
      b.el.style.rotate = Math.max(-35, Math.min(35, b.vx * 4)).toFixed(1) + 'deg';
      if (Math.abs(b.vx) + Math.abs(b.vy) > 0.03 || Math.abs(b.hx - b.x) + Math.abs(b.hy - b.y) > 0.3) moving = true;
    });
    if (moving || inside || drag) kick();
  }

  sw.addEventListener('pointermove', function(e){
    var p = local(e); mx = p[0]; my = p[1]; inside = true;
    if (drag){
      drag.x = drag.hx = mx - drag.cx - drag.ox;
      drag.y = drag.hy = my - drag.cy - drag.oy;
      drag.el.style.translate = drag.x.toFixed(1) + 'px ' + drag.y.toFixed(1) + 'px';
    } else {
      sw.toggleAttribute('data-near', !!nearest(mx, my, 18));
    }
    kick();
  });
  sw.addEventListener('pointerleave', function(){ if (!drag){ inside = false; mx = my = -1e4; sw.removeAttribute('data-near'); kick(); } });

  sw.addEventListener('pointerdown', function(e){
    var p = local(e), b = nearest(p[0], p[1], 22);
    if (!b){                                        // clicked empty air: everything scatters
      if (!reduce) bats.forEach(function(o){
        var dx = o.cx + o.x - p[0], dy = o.cy + o.y - p[1], d = Math.max(30, Math.hypot(dx, dy));
        o.vx += dx / d * 2200 / d; o.vy += dy / d * 2200 / d;
      });
      kick(); return;
    }
    e.preventDefault();
    drag = b; drag.ox = p[0] - (b.cx + b.x); drag.oy = p[1] - (b.cy + b.y);
    drag.vx = drag.vy = 0;
    b.el.classList.add('held'); sw.classList.add('dragging');
    try { sw.setPointerCapture(e.pointerId); } catch(err){}
    kick();
  });
  function drop(){
    if (!drag) return;
    drag.el.classList.remove('held'); sw.classList.remove('dragging');
    drag.el.style.rotate = '0deg';
    drag = null; kick();
  }
  sw.addEventListener('pointerup', drop);
  sw.addEventListener('pointercancel', drop);

  // double-click sends every bat back to where it started
  sw.addEventListener('dblclick', function(){ bats.forEach(function(b){ b.hx = b.hy = 0; }); kick(); });
})();
