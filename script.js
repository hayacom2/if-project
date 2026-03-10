setTimeout(() => document.getElementById('splash').classList.add('out'), 2400);
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('sc', scrollY > 60), { passive: true });
const ro = new IntersectionObserver(e => e.forEach(x => {
  if (x.isIntersecting) {
    x.target.classList.add('on');
  } else {
    x.target.classList.remove('on');
  }
}), { threshold: .1 });
document.querySelectorAll('.rv').forEach(el => ro.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const targetId = a.getAttribute('href');
  if (targetId === '#') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const t = document.querySelector(targetId);
  if (t) {
    e.preventDefault();
    const overlay = document.getElementById('page-transition-overlay');
    if (overlay) {
      overlay.classList.add('active');
      setTimeout(() => {
        t.scrollIntoView({ behavior: 'instant' });
        setTimeout(() => {
          overlay.classList.remove('active');
        }, 100); // small buffer for render
      }, 800); // matches CSS transition duration
    } else {
      t.scrollIntoView({ behavior: 'smooth' });
    }
  }
}));
/* ── TIMELINE ANIMATION ── */
(function () {
  const fore = document.getElementById('tl-fore');
  const back = document.getElementById('tl-back');
  const glow = document.getElementById('tl-glow');
  const d2025 = document.getElementById('dot-2025');
  const d2035 = document.getElementById('dot-2035');
  const d2045 = document.getElementById('dot-2045');
  const yr2025 = document.getElementById('yr-2025');
  const yr2035 = document.getElementById('yr-2035');
  const yr2045 = document.getElementById('yr-2045');
  const root = document.getElementById('tl-root');
  let triggered = false;

  function runAnim() {
    if (triggered) return;
    triggered = true;

    const DUR = 1400; // ms for each line to grow to 50%
    const DELAY_MEET = 200; // extra pause before meeting flash
    let start = null;

    // Phase 1 & 2: grow fore (left→center) and back (right→center) simultaneously
    function phase12(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / DUR, 1);
      // easeInOut cubic
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const pct = (e * 50).toFixed(2) + '%';

      fore.style.width = pct;
      back.style.width = pct;

      // light up 2025 dot early
      if (p > 0.05) d2025.classList.add('lit-fore');
      if (p > 0.05) d2045.classList.add('lit-back');

      if (p < 1) {
        requestAnimationFrame(phase12);
      } else {
        // Phase 3: meeting point
        setTimeout(phaseMeet, DELAY_MEET);
      }
    }

    // Phase 3: lines meet → flash green at 2035
    function phaseMeet() {
      // convert both lines to green gradient simultaneously
      const MEET_DUR = 600;
      let mStart = null;
      function meetAnim(ts) {
        if (!mStart) mStart = ts;
        const p = Math.min((ts - mStart) / MEET_DUR, 1);
        const e = 1 - Math.pow(1 - p, 3);

        // blend fore from amber→green
        const fg = `linear-gradient(to right, hsl(${160 + p * 0 | 0},${50 + p * 10 | 0}%,${35 + p * 5 | 0}%), #4a8a5c)`;
        const bg = `linear-gradient(to left,  hsl(${160 + p * 0 | 0},${50 + p * 10 | 0}%,${35 + p * 5 | 0}%), #4a8a5c)`;
        fore.style.background = fg;
        back.style.background = bg;

        // glow
        const g = e * 120;
        glow.style.width = g + 'px';
        glow.style.height = g + 'px';
        glow.style.opacity = (e * 0.9).toFixed(2);

        // center dot
        d2035.classList.remove('lit-fore', 'lit-back');
        d2035.classList.add('lit-meet');

        if (p < 1) {
          requestAnimationFrame(meetAnim);
        }
      }
      requestAnimationFrame(meetAnim);
    }

    requestAnimationFrame(phase12);
  }

  // Trigger when timeline scrolls into view
  const tlObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(runAnim, 300);
      tlObs.disconnect();
    }
  }, { threshold: 0.4 });
  tlObs.observe(root);
})();

/* ── SCROLL-LINKED BACKGROUND GRADIENT ── */
(function () {
  // Color palette for each zone (rgb arrays for smooth interpolation)
  const COLORS = {
    neutral: [255, 255, 255],   // white – hero / concept / map
    home: [253, 248, 238],   // --c-home warm cream
    eco: [191, 206, 203],   // #bfcecb
    com: [253, 240, 240],   // --c-com soft rose
  };

  // Create fixed full-page gradient overlay behind everything
  const overlay = document.createElement('div');
  overlay.id = 'bg-gradient-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    transition: none;
    background: rgb(255,255,255);
  `;
  document.body.appendChild(overlay);

  // Section zones: each defines start element, target color, and blend radius
  const zones = [
    { el: document.getElementById('home-ch'), color: 'home', offset: 0.25 },
    { el: document.getElementById('eco-ch'), color: 'eco', offset: 0.25 },
    { el: document.getElementById('com-ch'), color: 'com', offset: 0.25 },
    { el: document.getElementById('c-ho'), color: 'home', offset: 0.25 },
    { el: document.getElementById('c-ec'), color: 'eco', offset: 0.25 },
    { el: document.getElementById('c-co'), color: 'com', offset: 0.25 },
  ];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function mixColors(c1, c2, t) {
    const e = easeInOut(Math.max(0, Math.min(1, t)));
    return [
      Math.round(lerp(c1[0], c2[0], e)),
      Math.round(lerp(c1[1], c2[1], e)),
      Math.round(lerp(c1[2], c2[2], e)),
    ];
  }

  function updateBg() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const mid = scrollY + vh * 0.5; // use viewport midpoint

    // Default: neutral white
    let resultColor = [...COLORS.neutral];

    // Find which zones influence the current scroll position
    // Each zone fades in over [top - blendHeight, top + blendHeight]
    const blendHeight = vh * 0.5;

    // Build weighted blend across all zones
    let totalWeight = 0;
    let blendedR = 0, blendedG = 0, blendedB = 0;
    let neutralWeight = 1;

    zones.forEach(zone => {
      if (!zone.el) return;
      const rect = zone.el.getBoundingClientRect();
      const elTop = rect.top + scrollY;
      const elBottom = rect.bottom + scrollY;
      const elCenter = (elTop + elBottom) / 2;

      // Distance from viewport center to section center
      const dist = mid - elCenter;
      const halfHeight = (elBottom - elTop) / 2 + blendHeight;

      // t=1 when fully inside, 0 when far away
      let t = 1 - Math.abs(dist) / halfHeight;
      t = Math.max(0, Math.min(1, t));

      if (t > 0) {
        const c = COLORS[zone.color];
        blendedR += c[0] * t;
        blendedG += c[1] * t;
        blendedB += c[2] * t;
        totalWeight += t;
        neutralWeight = Math.max(0, neutralWeight - t);
      }
    });

    if (totalWeight > 0) {
      const n = COLORS.neutral;
      // Mix neutral with weighted zone colors
      const zoneR = blendedR / totalWeight;
      const zoneG = blendedG / totalWeight;
      const zoneB = blendedB / totalWeight;
      const blend = Math.min(1, totalWeight);
      const e = easeInOut(blend);
      resultColor = [
        Math.round(lerp(n[0], zoneR, e)),
        Math.round(lerp(n[1], zoneG, e)),
        Math.round(lerp(n[2], zoneB, e)),
      ];
    }

    overlay.style.background = `rgb(${resultColor[0]},${resultColor[1]},${resultColor[2]})`;
  }

  // Throttle to rAF
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateBg();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateBg();
})();

/* ── AUTO HOVER ANIMATION FOR 3 STORIES ── */
(function () {
  const stack = document.querySelector('.kw-stack');
  if (!stack) return;
  const items = stack.querySelectorAll('.kw-item');
  if (items.length === 0) return;

  let idx = 0;
  let interval;

  function nextHover() {
    items.forEach(el => el.classList.remove('auto-hover'));
    items[idx].classList.add('auto-hover');
    idx = (idx + 1) % items.length;
  }

  function start() {
    if (interval) return;
    nextHover(); // Trigger first immediately
    interval = setInterval(nextHover, 2000);
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    items.forEach(el => el.classList.remove('auto-hover'));
  }

  // Observers / Events
  stack.addEventListener('mouseenter', stop);
  stack.addEventListener('mouseleave', () => {
    // Only restart if it is still intersecting (visible on screen)
    const rect = stack.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      start();
    }
  });

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      // Don't start if user is currently hovering
      if (!stack.matches(':hover')) {
        start();
      }
    } else {
      stop();
    }
  }, { threshold: 0.1 });

  obs.observe(stack);
})();