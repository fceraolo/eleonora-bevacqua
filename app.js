(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  // ingresso hero: il logo si disegna e il testo compare
  var logo = $('#logo');
  function ready(){ document.documentElement.classList.add('ready'); if(logo) logo.classList.add('draw'); }
  window.addEventListener('load', function(){ requestAnimationFrame(ready); });
  setTimeout(ready, 1500);

  // logo: tocco o clic = si ridisegna
  if(logo && !reduce){
    logo.addEventListener('click', function(){
      logo.classList.remove('draw'); void logo.offsetWidth;
      requestAnimationFrame(function(){ logo.classList.add('draw'); });
    });
  }


  // il filo prende vita: luce che lo percorre, sedie che si avvicinano scorrendo, leggera profondità col mouse
  var svg = $('#logo .logo-svg'), wave = $('#logo .wave'), cL = $('#logo .chair.l'), cR = $('#logo .chair.r');
  if(svg && wave && cL && cR && !reduce){
    var NS = 'http://www.w3.org/2000/svg';
    var halo = document.createElementNS(NS,'circle'); halo.setAttribute('class','halo'); halo.setAttribute('r','20');
    var dot  = document.createElementNS(NS,'circle'); dot.setAttribute('class','dot');  dot.setAttribute('r','11');
    svg.appendChild(halo); svg.appendChild(dot);
    var P = [[441,664],[475,648],[520,640],[555,648],[600,658],[640,700],[680,702],[712,702],[740,686],[759,664]];
    var live = false, running = false, px = 0, tx = 0, hero = $('#hero');
    setTimeout(function(){ live = true; logo.classList.add('live'); }, 4200);
    window.addEventListener('mousemove', function(e){ tx = (e.clientX / innerWidth - .5) * 2; }, {passive:true});
    function draw(ts){
      if(!running) return;
      var t = ts/1000, y = window.scrollY;
      var sd = Math.min(1, y / (innerHeight*0.7)) * 80;          // avvicinamento con lo scroll
      var idle = live ? (Math.sin(t*0.9)+1)*6 : 0;               // respiro
      px += (tx - px) * 0.06;
      var oL = sd + idle + px*9, oR = sd + idle - px*9;
      cL.style.transform = 'translateX(' + oL.toFixed(2) + 'px)';
      cR.style.transform = 'translateX(' + (-oR).toFixed(2) + 'px)';
      var x1 = 441 + oL, x2 = 759 - oR, k = (x2 - x1) / 318, sway = live ? 1 : 0;
      var pts = P.map(function(p,i){
        var x = x1 + (p[0]-441)*k, yy = p[1];
        if(i>0 && i<P.length-1) yy += Math.sin(t*1.5 + p[0]*0.018) * 5 * sway;
        return [x.toFixed(1), yy.toFixed(1)];
      });
      var d = 'M'+pts[0][0]+' '+pts[0][1];
      for(var i=1;i<pts.length;i+=3){ d += ' C'+pts[i][0]+' '+pts[i][1]+' '+pts[i+1][0]+' '+pts[i+1][1]+' '+pts[i+2][0]+' '+pts[i+2][1]; }
      wave.setAttribute('d', d);
      if(live){
        var u = (Math.sin(t*0.8 - Math.PI/2)+1)/2, pt = wave.getPointAtLength(u * wave.getTotalLength());
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
        halo.setAttribute('r', 20 + Math.sin(t*3)*4);
      }
      requestAnimationFrame(draw);
    }
    function start(){ if(!running){ running = true; requestAnimationFrame(draw); } }
    new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) start(); else running = false; });
    }, {threshold:0}).observe(hero);
  }

  // menu mobile
  var burger = $('#burger'), nav = $('#nav');
  function closeNav(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  burger.addEventListener('click', function(){
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true':'false');
    document.body.style.overflow = open ? 'hidden':'';
  });
  $$('a', nav).forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeNav(); });

  // reveal allo scroll
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.15, rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach(function(el){ io.observe(el); });

  // contatori
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, to = +el.dataset.count, plain = el.dataset.plain;
      if(reduce){ el.textContent = to; return; }
      var from = plain ? 2000 : 0, t0 = performance.now(), dur = 1400;
      (function step(t){
        var p = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-p,3);
        el.textContent = Math.round(from + (to-from)*e);
        if(p<1) requestAnimationFrame(step); else el.textContent = to;
      })(t0);
    });
  }, {threshold:.6});
  $$('[data-count]').forEach(function(el){ cio.observe(el); });

  // testo "Chi sono": le parole si accendono con lo scroll
  var words = $('#words');
  if(words){
    var txt = words.textContent.trim().split(/\s+/);
    words.innerHTML = txt.map(function(w){ return '<span class="w">'+w+'</span>'; }).join(' ');
  }
  var wEls = $$('.w');

  // timeline
  var tl = $('#tl'), tlLine = tl ? $('.tl-line i', tl) : null, tlItems = tl ? $$('.tl-item', tl) : [];

  var bar = $('.progress i'), top = $('#top'), parEls = $$('[data-par]');
  var links = $$('.nav a[href^="#"]:not(.cta-mini)');
  var secs = links.map(function(a){ return $(a.getAttribute('href')); });
  var lastY = 0, ticking = false;

  function frame(){
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight, vh = innerHeight;
    bar.style.transform = 'scaleX(' + (h>0 ? y/h : 0) + ')';
    top.classList.toggle('solid', y > 30);
    top.classList.toggle('hide', y > 300 && y > lastY + 4 && !nav.classList.contains('open'));
    if(y < lastY - 4 || y < 300) top.classList.remove('hide');
    lastY = y;

    if(!reduce){
      parEls.forEach(function(el){ el.style.transform = 'translate3d(0,' + (y*parseFloat(el.dataset.par)).toFixed(1) + 'px,0)'; });
      if(words){
        var r = words.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh*0.85 - r.top) / (r.height + vh*0.35)));
        var n = Math.round(p * wEls.length);
        wEls.forEach(function(w,i){ w.classList.toggle('on', i < n); });
      }
      if(tl){
        var rt = tl.getBoundingClientRect();
        var tp = Math.min(1, Math.max(0, (vh*0.6 - rt.top) / rt.height));
        tlLine.style.transform = 'scaleY(' + tp + ')';
        tlItems.forEach(function(it){ it.classList.toggle('in', it.getBoundingClientRect().top < vh*0.6); });
      }
    } else {
      wEls.forEach(function(w){ w.classList.add('on'); });
    }

    // voce di menu attiva
    var cur = -1;
    secs.forEach(function(s,i){ if(s && s.getBoundingClientRect().top < vh*0.4) cur = i; });
    links.forEach(function(a,i){ a.classList.toggle('on', i===cur); });
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  frame();
})();
