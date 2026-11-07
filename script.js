// Footer year
document.getElementById('yr').textContent = new Date().getFullYear();

// Sticky navigation on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('on', scrollY > 40), { passive: true });

// Scroll reveal
const ro = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); ro.unobserve(e.target); } });
}, { threshold: .07 });
document.querySelectorAll('.sr').forEach(el => ro.observe(el));

// Contact form: opens the visitor's email app with the message filled in (there is no server)
document.getElementById('cform')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, name = f.name.value.trim(), from = f.email.value.trim(), msg = f.message.value.trim();
  const body = `${msg}\n\n— ${name} (${from})`;
  location.href = `mailto:sravyaadobe12@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from ' + name)}&body=${encodeURIComponent(body)}`;
  document.getElementById('cnote').textContent = 'Your email app should open now. If it doesn\'t, write to sravyaadobe12@gmail.com.';
});

// Background: pool balls roll slowly around the screen, bounce off the edges and nudge each other
(function () {
  const bwrap = document.getElementById('bwrap');
  if (!bwrap) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUMS = [1, 10, 3, 12, 6, 14, 8], SIZES = [70, 96, 84, 76, 80, 64, 66];
  let W = innerWidth, H = innerHeight;
  const balls = NUMS.map((n, i) => {
    const el = document.createElement('span');
    el.className = `ball b${n}`;
    el.innerHTML = `<i>${n}</i>`;
    const s = SIZES[i];
    el.style.setProperty('--s', s + 'px');
    bwrap.appendChild(el);
    const a = Math.random() * Math.PI * 2, sp = 10 + Math.random() * 12; // px per second: slow
    return { el, r: s / 2, x: Math.random() * (W - s) + s / 2, y: Math.random() * (H - s) + s / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: Math.random() * 360, sp };
  });
  const place = b => { b.el.style.transform = `translate(${b.x - b.r}px,${b.y - b.r}px) rotate(${b.rot}deg)`; };
  balls.forEach(place);
  if (reduce) return;
  addEventListener('resize', () => { W = innerWidth; H = innerHeight; });
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!document.hidden) {
      for (const b of balls) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < -b.r * .3) { b.x = -b.r * .3; b.vx = Math.abs(b.vx); }
        if (b.x > W + b.r * .3) { b.x = W + b.r * .3; b.vx = -Math.abs(b.vx); }
        if (b.y < -b.r * .3) { b.y = -b.r * .3; b.vy = Math.abs(b.vy); }
        if (b.y > H + b.r * .3) { b.y = H + b.r * .3; b.vy = -Math.abs(b.vy); }
        b.rot += (b.vx >= 0 ? 1 : -1) * Math.hypot(b.vx, b.vy) * dt / b.r * 57.3; // roll with travel
      }
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], c = balls[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = a.r + c.r;
        if (d > 0 && d < min) { // soft elastic bump, then keep each ball's own slow speed
          const nx = dx / d, ny = dy / d, ov = (min - d) / 2;
          a.x -= nx * ov; a.y -= ny * ov; c.x += nx * ov; c.y += ny * ov;
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rv < 0) { a.vx += rv * nx; a.vy += rv * ny; c.vx -= rv * nx; c.vy -= rv * ny; }
          for (const b of [a, c]) { const k = b.sp / (Math.hypot(b.vx, b.vy) || 1); b.vx *= k; b.vy *= k; }
        }
      }
      balls.forEach(place);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Buttons: a ripple spreads from where you click, like a cue ball strike
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('.fx');
  if (!t) return;
  const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
  const rip = document.createElement('span');
  rip.className = 'ripple';
  rip.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  t.appendChild(rip);
  rip.addEventListener('animationend', () => rip.remove());
});

// Project cards: the whole card opens the project; the buttons inside keep working on their own
document.querySelectorAll('.proj-card').forEach(card => {
  const link = card.querySelector('.proj-link');
  if (!link) return;
  card.classList.add('clickable');
  card.addEventListener('click', e => {
    if (e.target.closest('a,button')) return;
    if (e.metaKey || e.ctrlKey) open(link.href, '_blank'); else location.href = link.href;
  });
});

// Tools wave: pills ride a sine wave, each marked with a small pool ball instead of an emoji
(function () {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const C = ['#F2C230', '#2D5FD8', '#D83B2D', '#6B3FA0', '#E0784A', '#2E8B57', '#7A2A2A'];
  const tools = ['Figma', 'FigJam', 'Framer', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere Pro', 'Canva', 'Blender',
    'Maze', 'Miro', 'Notion AI', 'Google Analytics 4', 'Search Console', 'Mailchimp', 'Claude', 'ChatGPT', 'Lovable', 'p5.js', 'Three.js']
    .map((name, i) => ({ name, c: C[i % C.length], stripe: i % 3 === 2 }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = reduce ? 0 : .6, GAP = 168, AMP = 22, FREQ = .016;
  let W, H, dpr, items = [];

  function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function init() {
    resize(); items = [];
    const count = Math.ceil(W / GAP) + 4;
    for (let i = 0; i < count; i++) items.push({ x: 120 + i * GAP, idx: i, tool: tools[i % tools.length] });
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function ball(x, y, r, c, stripe) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ctx.fillStyle = stripe ? '#F4EFE6' : c; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (stripe) { ctx.fillStyle = c; ctx.fillRect(x - r, y - r * .5, r * 2, r); }
    const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r * 1.1);
    g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.3, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const cy = H / 2;
    ctx.beginPath(); ctx.strokeStyle = 'rgba(79,140,255,0.07)'; ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x += 2) { const y = cy + AMP * Math.sin(x * FREQ); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    items.forEach(item => {
      const y = cy + AMP * Math.sin(item.x * FREQ);
      const alpha = item.x < 90 ? item.x / 90 : item.x > W - 90 ? (W - item.x) / 90 : 1;
      ctx.font = '500 11px Inter,sans-serif';
      const tw = ctx.measureText(item.tool.name).width;
      const pw = tw + 46, ph = 34, px = item.x - pw / 2, py = y - ph / 2;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      rr(px, py, pw, ph, 17); ctx.fill(); ctx.stroke();
      ball(px + 17, y, 8, item.tool.c, item.tool.stripe);
      ctx.fillStyle = 'rgba(230,232,240,0.9)'; ctx.textBaseline = 'middle';
      ctx.fillText(item.tool.name, px + 32, y + .5);
      ctx.restore();
    });
  }
  function loop() {
    items.forEach(item => { item.x -= SPEED; });
    items.forEach(item => {
      if (item.x < -GAP) {
        const maxX = Math.max(...items.map(i => i.x));
        item.x = maxX + GAP; item.idx += items.length; item.tool = tools[item.idx % tools.length];
      }
    });
    draw();
    if (SPEED) requestAnimationFrame(loop);
  }
  addEventListener('resize', init);
  init(); loop();
})();

// Case pages: click an image to see it full size (Esc or click to close)
document.addEventListener('click', e => {
  const img = e.target.closest('.case-page .cs-img, .case-page .cs-cover img');
  if (!img || !img.currentSrc) return;
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<img src="${img.currentSrc}" alt="${img.alt}"><button type="button" aria-label="Close">×</button>`;
  const close = () => { lb.classList.remove('on'); setTimeout(() => lb.remove(), 250); removeEventListener('keydown', esc); };
  const esc = k => { if (k.key === 'Escape') close(); };
  lb.addEventListener('click', close); addEventListener('keydown', esc);
  document.body.appendChild(lb); requestAnimationFrame(() => lb.classList.add('on'));
});

// Final screens that mix greyscale wireframes and colour designs: sort them into two loops.
// Each image is sampled inside the device screen area; grey ones move to the Wireframes loop.
// If an image can't be read (blocked by the host), everything stays in the single colour loop.
document.querySelectorAll('.cs-marquee[data-split]').forEach(async fin => {
  const wfSec = document.getElementById(fin.dataset.split);
  const urls = JSON.parse(fin.dataset.urls), name = fin.dataset.name || '';
  const isGrey = u => new Promise(res => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      try {
        const W = 80, H = Math.max(1, Math.round(80 * im.naturalHeight / im.naturalWidth));
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
        const d = x.getImageData(Math.round(W * .2), Math.round(H * .15), Math.round(W * .6), Math.round(H * .6)).data;
        let hot = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { n++; if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 50) hot++; }
        res(hot / n < 0.03);
      } catch (e) { res(null); }
    };
    im.onerror = () => res(null);
    im.src = u;
  });
  const flags = await Promise.all(urls.map(isGrey));
  if (flags.some(f => f === null)) return;
  const grey = urls.filter((u, i) => flags[i]), colour = urls.filter((u, i) => !flags[i]);
  if (!grey.length || !colour.length) return;
  const fill = (mq, list, label) => {
    const one = list.map((u, k) => `<img class="cs-img" src="${u}" alt="${name} ${label} ${k + 1}" loading="lazy"/>`).join('');
    const two = list.map(u => `<img class="cs-img" src="${u}" alt="" aria-hidden="true" loading="lazy"/>`).join('');
    mq.querySelector('.cs-track').innerHTML = one + two;
    mq.style.setProperty('--count', list.length);
  };
  fill(fin, colour, 'visual design');
  fill(wfSec.querySelector('.cs-marquee'), grey, 'wireframe');
  wfSec.hidden = false;
  wfSec.querySelectorAll('.sr').forEach(el => el.classList.add('vis'));
});
