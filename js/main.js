/* Soil Doctor — interactions. Vanilla JS, no dependencies. */
(() => {
  'use strict';

  /* Set this to a form backend URL (e.g. Formspree, a CRM webhook, or your own API)
     to receive call-back requests directly. Left empty, the form opens the visitor's
     email app with the request pre-filled to hello@soildoctor.in. */
  const FORM_ENDPOINT = '';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const isDesktop = () => innerWidth > 860;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const inr = n => Math.round(n).toLocaleString('en-IN');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ---------------- Preloader ---------------- */
  const loader = $('.loader');
  const start = performance.now();
  const finishLoading = () => {
    const wait = Math.max(0, 900 - (performance.now() - start));
    setTimeout(() => {
      loader && loader.classList.add('is-done');
      root.classList.add('is-loaded');
    }, reduceMotion ? 0 : wait);
  };
  if (document.readyState === 'complete') finishLoading();
  else addEventListener('load', finishLoading, { once: true });
  setTimeout(finishLoading, 2500); // never block on slow networks

  /* ---------------- Hero: living soil porthole ---------------- */
  const crops = $('[data-crops]');
  const roots = $('[data-roots]');
  const particles = $('[data-particles]');
  if (crops && roots && particles) {
    for (let x = 18, i = 0; x < 600; x += rand(30, 42), i++) {
      const h = rand(42, 86);
      const g = svgEl('g', { class: 'crop' });
      g.style.setProperty('--dl', `${-rand(0, 3.6).toFixed(2)}s`);
      g.appendChild(svgEl('path', { d: `M${x} 214 q-3 ${-h / 2} 0 ${-h}`, stroke: '#4E7F1E', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
      g.appendChild(svgEl('ellipse', { cx: x - 8, cy: 214 - h * .38, rx: 10, ry: 3.4, fill: '#6FA82F', transform: `rotate(-30 ${x - 8} ${214 - h * .38})` }));
      g.appendChild(svgEl('ellipse', { cx: x + 8, cy: 214 - h * .58, rx: 10, ry: 3.4, fill: '#7DB43A', transform: `rotate(30 ${x + 8} ${214 - h * .58})` }));
      if (i % 2 === 0) g.appendChild(svgEl('ellipse', { cx: x, cy: 214 - h - 8, rx: 4.5, ry: 11, fill: '#E2BF55' }));
      crops.appendChild(g);

      // roots for this plant
      const depth = rand(70, 160);
      let d = `M${x} 262`;
      let cx = x, cy = 262;
      const segs = 4;
      for (let s = 0; s < segs; s++) {
        const nx = cx + rand(-18, 18), ny = cy + depth / segs;
        d += ` Q${(cx + nx) / 2 + rand(-10, 10)} ${(cy + ny) / 2} ${nx} ${ny}`;
        cx = nx; cy = ny;
      }
      const r1 = svgEl('path', { d, 'stroke-width': rand(1.6, 3).toFixed(1), pathLength: 1, opacity: .85 });
      r1.style.transitionDelay = `${(.3 + i * .05).toFixed(2)}s`;
      roots.appendChild(r1);
      const side = svgEl('path', { d: `M${x} ${262 + depth * .35} q${rand(-30, 30)} ${rand(10, 30)} ${rand(-40, 40)} ${rand(30, 60)}`, 'stroke-width': 1.2, pathLength: 1, opacity: .6 });
      side.style.transitionDelay = `${(.9 + i * .05).toFixed(2)}s`;
      roots.appendChild(side);
    }
    const nutrientColours = ['#8DBE43', '#4AAEE0', '#D9733A', '#C2456F'];
    for (let i = 0; i < 54; i++) {
      const nutrient = i < 12;
      const c = svgEl('circle', {
        cx: rand(0, 600).toFixed(1), cy: rand(272, 424).toFixed(1),
        r: nutrient ? rand(4.5, 6.5).toFixed(1) : rand(1.2, 3.4).toFixed(1),
        fill: nutrient ? nutrientColours[i % 4] : (Math.random() > .5 ? 'rgba(251,246,236,.35)' : 'rgba(43,27,18,.35)'),
        class: 'particle'
      });
      if (nutrient) { c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', '1.5'); }
      c.style.setProperty('--dl', `${-rand(0, 6).toFixed(2)}s`);
      c.style.setProperty('--dx', `${rand(-8, 8).toFixed(1)}px`);
      c.style.setProperty('--dy', `${rand(-6, 6).toFixed(1)}px`);
      particles.appendChild(c);
    }
  }

  // Parallax layers follow the pointer
  const hero = $('.hero');
  const layers = $$('[data-depth]');
  if (hero && finePointer && !reduceMotion) {
    let raf = 0;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width * 2 - 1;
      const ny = (e.clientY - r.top) / r.height * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        layers.forEach(l => {
          const d = parseFloat(l.dataset.depth);
          l.style.transform = `translate(${(nx * d * 18).toFixed(2)}px, ${(ny * d * 12).toFixed(2)}px)`;
        });
      });
    });
    hero.addEventListener('pointerleave', () => layers.forEach(l => (l.style.transform = '')));
  }

  // Nutrient orbit
  const orbit = $('[data-orbit]');
  if (orbit) {
    const chips = $$('.chip', orbit);
    const sym = $('[data-readout-sym]');
    const nm = $('[data-readout-name]');
    const tx = $('[data-readout-text]');
    const readout = $('.readout');
    chips.forEach((c, i) => {
      c.style.setProperty('--a', `${(360 / chips.length) * i - 90}deg`);
      c.innerHTML = `<span>${c.textContent}</span>`;
      c.setAttribute('aria-label', `${c.dataset.name}: ${c.dataset.text}`);
    });
    const placeChips = () => orbit.style.setProperty('--r', `${orbit.offsetWidth / 2}px`);
    placeChips();
    addEventListener('resize', placeChips);

    let auto = null, idx = 0;
    const show = (c) => {
      chips.forEach(x => x.classList.toggle('is-on', x === c));
      sym.textContent = c.dataset.sym;
      nm.textContent = c.dataset.name;
      tx.textContent = c.dataset.text;
      readout.style.setProperty('--rc', getComputedStyle(c).getPropertyValue('--c'));
    };
    chips.forEach(c => {
      c.addEventListener('click', () => { clearInterval(auto); show(c); });
      c.addEventListener('mouseenter', () => { clearInterval(auto); show(c); });
      c.addEventListener('focus', () => { clearInterval(auto); show(c); });
    });
    if (!reduceMotion) {
      setTimeout(() => {
        auto = setInterval(() => { show(chips[idx % chips.length]); idx++; }, 2600);
      }, 3200);
    }
  }

  /* ---------------- Nav: hide on scroll, active links, progress ---------------- */
  const nav = $('.nav');
  const bar = $('.root-progress span');
  const thumb = $('.thumbbar');
  let lastY = scrollY;
  const onScrollUI = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar && bar.style.setProperty('--p', (y / max).toFixed(4));
    nav.classList.toggle('is-scrolled', y > 20);
    const menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
    if (!menuOpen) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
  };

  const links = $$('.nav__links a');
  const linkObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['how', 'parameters', 'services', 'paths', 'story', 'faq'].forEach(id => {
    const s = document.getElementById(id);
    s && linkObserver.observe(s);
  });

  // Thumb bar hides near the booking form & footer
  if (thumb) {
    const hideFor = new Set();
    const tObs = new IntersectionObserver(entries => {
      entries.forEach(en => en.isIntersecting ? hideFor.add(en.target) : hideFor.delete(en.target));
      thumb.classList.toggle('is-hidden', hideFor.size > 0);
    }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
    [$('#book'), $('.footer')].forEach(el => el && tObs.observe(el));
  }

  /* ---------------- Mobile menu ---------------- */
  const burger = $('.burger');
  const menu = $('#mobileMenu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      nav.classList.remove('is-hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      setTimeout(() => { const f = $('a', menu); f && f.focus(); }, 250);
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (burger.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, reduceMotion ? 0 : 550);
    }
  };
  if (burger && menu) {
    $$('nav a', menu).forEach((a, i) => a.style.setProperty('--i', i));
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach(el => {
    const sibs = $$(':scope > [data-reveal]', el.parentElement);
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--rd', `${Math.min(i, 5) * 0.09}s`);
    revealObs.observe(el);
  });

  /* ---------------- The Dig: pinned phase story ---------------- */
  const dig = $('[data-dig]');
  const phases = $$('.phase', dig || document);
  const dots = $$('.dig__dots button');
  let activePhase = -1;
  const setPhase = (i) => {
    if (i === activePhase) return;
    activePhase = i;
    phases.forEach((p, k) => {
      p.classList.toggle('is-active', k === i);
      p.classList.toggle('is-past', k < i);
    });
    dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.setAttribute('aria-pressed', String(k === i)); });
    const cs = getComputedStyle(phases[i]);
    dig.style.setProperty('--c', cs.getPropertyValue('--c'));
    dig.style.setProperty('--ci', cs.getPropertyValue('--ci'));
  };
  const onScrollDig = () => {
    if (!dig || !isDesktop()) return;
    const r = dig.getBoundingClientRect();
    const total = dig.offsetHeight - innerHeight;
    const p = clamp(-r.top / total, 0, 1);
    dig.style.setProperty('--dp', p.toFixed(4));
    dig.style.setProperty('--shift', `${(p * -400).toFixed(1)}px`);
    setPhase(Math.min(phases.length - 1, Math.floor(p * phases.length * 0.999)));
  };
  if (dig) {
    setPhase(0);
    dots.forEach(d => d.addEventListener('click', () => {
      const i = +d.dataset.goto;
      const total = dig.offsetHeight - innerHeight;
      const top = dig.getBoundingClientRect().top + scrollY + total * ((i + 0.5) / phases.length);
      scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
  }

  /* ---------------- Scroll loop ---------------- */
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollUI(); onScrollDig(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', onScrollDig);
  onScrollUI(); onScrollDig();

  /* ---------------- 18 parameters table ---------------- */
  const GROUPS = {
    primary:   { label: 'Primary nutrient',   c: 'var(--leaf)' },
    secondary: { label: 'Secondary nutrient', c: 'var(--sky)' },
    micro:     { label: 'Micronutrient',      c: 'var(--clay)' },
    property:  { label: 'Soil property',      c: 'var(--beet)' },
    ratio:     { label: 'Nutrient ratio',     c: 'var(--sand)' }
  };
  const PARAMS = [
    ['N', 'Nitrogen', 'primary', 'Drives leafy, green growth. Too little gives pale, stunted crops; too much wastes urea money and makes plants weak and prone to falling over.'],
    ['P', 'Phosphorus', 'primary', 'Powers roots, flowering and grain fill. Many fields already hold plenty — a test tells you before you spend on more DAP.'],
    ['K', 'Potassium', 'primary', 'Strengthens stems, improves water use and disease tolerance, and lifts grain and fruit quality.'],
    ['Ca', 'Calcium', 'secondary', 'Builds strong cell walls and healthy root tips, and helps keep soil crumbly and well-structured.'],
    ['Mg', 'Magnesium', 'secondary', 'Sits at the centre of chlorophyll. A shortage shows as yellowing between the veins of older leaves.'],
    ['S', 'Sulphur', 'secondary', 'Needed for proteins and oil formation — especially important for oilseeds and pulses.'],
    ['Fe', 'Iron', 'micro', 'Helps form chlorophyll. Deficiency shows as yellow young leaves, and is common in high-pH soils.'],
    ['Cu', 'Copper', 'micro', 'Supports enzymes, pollen and grain set. Needed only in tiny amounts — but missing it costs yield.'],
    ['Zn', 'Zinc', 'micro', 'One of the most common gaps in Indian soils. Causes stunting and the "khaira" disease in rice.'],
    ['B', 'Boron', 'micro', 'Essential for flowering, pollination and fruit set — low boron means hollow or poorly-filled produce.'],
    ['pH', 'Soil pH', 'property', 'How acidic or alkaline your soil is. It decides which nutrients your crop can actually absorb — the wrong pH can lock up fertiliser you already paid for.'],
    ['EC', 'Electrical conductivity', 'property', 'Measures salt build-up in the soil. High salts pull water away from roots and burn young plants.'],
    ['OC', 'Organic carbon', 'property', 'The living part of soil. It feeds soil microbes, holds moisture and keeps nutrients from washing away.'],
    ['SOC', 'Soil organic carbon stock', 'property', 'Tracks how much carbon your field stores over time — a key sign of regenerating soil.'],
    ['CEC', 'Cation exchange capacity', 'property', 'How well your soil holds on to nutrients instead of losing them. Low CEC means smaller, more frequent doses work better.'],
    ['C:N', 'Carbon to nitrogen ratio', 'ratio', 'Shows how quickly crop residue breaks down into food for the next crop.'],
    ['Ca:Mg', 'Calcium to magnesium ratio', 'ratio', 'A balance that affects soil structure, drainage and how well roots take up nutrients.'],
    ['K:Mg', 'Potassium to magnesium ratio', 'ratio', 'Too much of one blocks the other. The ratio guides a balanced fertiliser plan.']
  ];
  const ptable = $('[data-ptable]');
  const pd = {
    box: $('[data-pdetail]'), tile: $('.pdetail__tile'), sym: $('[data-pd-sym]'),
    group: $('[data-pd-group]'), name: $('[data-pd-name]'), text: $('[data-pd-text]')
  };
  if (ptable) {
    ptable.setAttribute('role', 'group');
    PARAMS.forEach(([s, n, g, t], i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ptile';
      b.dataset.group = g;
      b.style.setProperty('--c', GROUPS[g].c);
      b.style.setProperty('--i', i);
      b.setAttribute('aria-label', `${n} (${GROUPS[g].label})`);
      b.innerHTML = `<span class="ptile__n">${String(i + 1).padStart(2, '0')}</span><span class="ptile__sym">${s}</span><span class="ptile__name">${n}</span>`;
      const select = () => {
        $$('.ptile', ptable).forEach(x => x.classList.toggle('is-on', x === b));
        pd.box.style.setProperty('--c', GROUPS[g].c);
        pd.tile.classList.remove('is-swap'); void pd.tile.offsetWidth; pd.tile.classList.add('is-swap');
        pd.sym.textContent = s; pd.group.textContent = GROUPS[g].label; pd.name.textContent = n; pd.text.textContent = t;
      };
      b.addEventListener('click', select);
      if (finePointer) b.addEventListener('mouseenter', select);
      ptable.appendChild(b);
      if (s === 'pH') b.classList.add('is-on');
    });
    const tObs = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { ptable.classList.add('is-in'); tObs.disconnect(); }
    }, { threshold: .15 });
    tObs.observe(ptable);

    $$('[data-filter]').forEach(f => f.addEventListener('click', () => {
      $$('[data-filter]').forEach(x => { x.classList.toggle('is-on', x === f); x.setAttribute('aria-pressed', String(x === f)); });
      const g = f.dataset.filter;
      let first = null;
      $$('.ptile', ptable).forEach(t => {
        const hit = g === 'all' || t.dataset.group === g;
        t.classList.toggle('is-dim', !hit);
        if (hit && !first) first = t;
      });
      if (g !== 'all' && first) first.click();
    }));
  }

  /* ---------------- Savings calculator ---------------- */
  const calc = $('[data-calc]');
  if (calc) {
    const PER_ACRE = 1000; // ₹ average saving per acre (Soil Doctor reported figure)
    const acres = $('[data-acres]', calc);
    const acresOut = $('[data-acres-out]', calc);
    const crop = $('[data-crop]', calc);
    const out = $('[data-calc-out]', calc);
    const five = $('[data-calc-five]', calc);
    const label = $('[data-calc-label]', calc);
    const coins = $('[data-coins]', calc);
    let shown = 0, animId = 0;

    const animateTo = (target) => {
      cancelAnimationFrame(animId);
      if (reduceMotion) { shown = target; out.textContent = inr(target); return; }
      const from = shown, t0 = performance.now(), dur = 600;
      const step = (t) => {
        const k = clamp((t - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - k, 3);
        shown = from + (target - from) * e;
        out.textContent = inr(shown);
        if (k < 1) animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    };
    const update = () => {
      const a = +acres.value;
      const s = +($('input[name="seasons"]:checked', calc) || { value: 2 }).value;
      const total = a * PER_ACRE * s;
      acres.style.setProperty('--v', `${((a - 1) / 99) * 100}%`);
      acresOut.textContent = `${a} ${a === 1 ? 'acre' : 'acres'}`;
      label.textContent = `Estimated fertiliser savings on ${a} ${a === 1 ? 'acre' : 'acres'} of ${crop.value.toLowerCase()}, per year`;
      five.textContent = `₹${inr(total * 5)}`;
      animateTo(total);
      const want = clamp(Math.round(Math.sqrt(total / 1000) * 1.6), 1, 14);
      while (coins.children.length < want) { const c = document.createElement('span'); c.className = 'coin'; coins.appendChild(c); }
      while (coins.children.length > want) coins.lastElementChild.remove();
    };
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    update();
  }

  /* ---------------- Services accordion ---------------- */
  const svcPanels = $$('.svc__panel');
  svcPanels.forEach(p => {
    const head = $('.svc__head', p);
    head.addEventListener('click', () => {
      const wasOpen = p.classList.contains('is-open');
      if (wasOpen && isDesktop()) return; // desktop always keeps one panel open
      svcPanels.forEach(x => {
        const open = x === p ? !wasOpen : false;
        x.classList.toggle('is-open', open);
        $('.svc__head', x).setAttribute('aria-expanded', String(open));
      });
    });
  });

  /* ---------------- Paths tabs ---------------- */
  const tabs = $$('[role="tab"]');
  const ink = $('.tabs__ink');
  const moveInk = (t) => {
    if (!ink || !t) return;
    ink.style.width = `${t.offsetWidth}px`;
    ink.style.height = `${t.offsetHeight}px`;
    ink.style.transform = `translate(${t.offsetLeft}px, ${t.offsetTop}px)`;
  };
  const activate = (t, focus) => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      const pane = document.getElementById(x.getAttribute('aria-controls'));
      pane.hidden = !on;
      pane.classList.toggle('is-active', on);
    });
    if (focus) t.focus();
    moveInk(t);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t));
    t.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); activate(n, true); }
    });
  });
  $$('.steps').forEach(ol => $$('li', ol).forEach((li, i) => li.style.setProperty('--i', i)));
  const selTab = () => tabs.find(t => t.getAttribute('aria-selected') === 'true');
  addEventListener('resize', () => moveInk(selTab()));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveInk(selTab()));
  moveInk(selTab());
  $$('[data-path-link]').forEach(a => a.addEventListener('click', () => {
    const t = $(`[data-tab="${a.dataset.pathLink}"]`);
    t && activate(t);
  }));

  /* ---------------- Impact cores + counters ---------------- */
  const cores = $('[data-cores]');
  if (cores) {
    $$('.core', cores).forEach((c, i) => c.style.setProperty('--i', i));
    const cObs = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      cores.classList.add('is-in');
      $$('[data-count]', cores).forEach((el, i) => {
        const to = +el.dataset.count;
        if (reduceMotion) { el.textContent = inr(to); return; }
        const t0 = performance.now() + i * 120, dur = 1800;
        const step = (t) => {
          const k = clamp((t - t0) / dur, 0, 1);
          el.textContent = inr(to * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      cObs.disconnect();
    }, { threshold: .3 });
    cObs.observe(cores);
  }

  /* ---------------- Quote language toggle ---------------- */
  $$('[data-qlang]').forEach(b => b.addEventListener('click', () => {
    const en = b.dataset.qlang === 'en';
    $$('[data-qlang]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('[data-quotes] [data-orig]').forEach(p => (p.hidden = en));
    $$('[data-quotes] [data-en]').forEach(p => (p.hidden = !en));
  }));

  /* ---------------- Timeline drag-to-scroll ---------------- */
  const tl = $('[data-timeline]');
  if (tl) {
    let down = false, sx = 0, sl = 0, moved = false;
    tl.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return; // touch scrolls natively
      down = true; moved = false; sx = e.clientX; sl = tl.scrollLeft;
      tl.setPointerCapture(e.pointerId);
    });
    tl.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; tl.classList.add('is-drag'); }
      tl.scrollLeft = sl - dx;
    });
    const up = () => { down = false; tl.classList.remove('is-drag'); };
    tl.addEventListener('pointerup', up);
    tl.addEventListener('pointercancel', up);
    tl.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
    tl.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { tl.scrollBy({ left: 320, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { tl.scrollBy({ left: -320, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* ---------------- FAQ search ---------------- */
  const faqSearch = $('[data-faq-search]');
  if (faqSearch) {
    const items = $$('[data-faq] details');
    const empty = $('[data-faq-empty]');
    faqSearch.addEventListener('input', () => {
      const words = faqSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shownCount = 0;
      items.forEach(d => {
        const hay = d.textContent.toLowerCase();
        const hit = words.every(w => hay.includes(w));
        d.classList.toggle('is-hidden', !hit);
        if (hit) shownCount++;
        if (words.length && hit && shownCount === 1) d.open = true;
      });
      empty.hidden = shownCount > 0;
    });
  }

  /* ---------------- Booking form ---------------- */
  const form = $('[data-form]');
  if (form) {
    const done = $('[data-form-done]', form);
    const msg = $('#fMsg', form);
    // Pre-select intent from any "start a clinic" / "become a didi" link
    $$('[data-intent]').forEach(a => a.addEventListener('click', () => {
      const v = a.dataset.intent;
      const radios = $$('input[name="intent"]', form);
      let r = radios.find(x => x.value === v);
      if (!r && /csr|demo|device|partner/i.test(v)) r = radios.find(x => x.value === 'Partner / CSR');
      if (r) r.checked = true;
      if (!radios.some(x => x.value === v) && !msg.value) msg.value = `I'm interested in: ${v}`;
    }));

    const check = (input) => {
      const ff = input.closest('.ff');
      let ok = input.value.trim().length > 0;
      if (ok && input.type === 'tel') ok = /^(\+91[\s-]?)?[6-9]\d{9}$/.test(input.value.replace(/[\s-]/g, '').replace(/^\+91/, '+91'));
      ff.classList.toggle('is-bad', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    $$('input[required]', form).forEach(i => {
      i.addEventListener('blur', () => i.value && check(i));
      i.addEventListener('input', () => i.closest('.ff').classList.contains('is-bad') && check(i));
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const required = $$('input[required]', form);
      const results = required.map(check);
      const firstBad = required[results.indexOf(false)];
      if (firstBad) { firstBad.focus(); return; }

      const data = Object.fromEntries(new FormData(form));
      const name = data.name.trim().split(' ')[0];
      $('[data-done-name]', form).textContent = name;
      const text = $('[data-done-text]', form);

      if (FORM_ENDPOINT) {
        try {
          const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(res.status);
          text.textContent = `Our team will call you on ${data.phone} soon.`;
        } catch (err) {
          text.textContent = 'Something went wrong sending your request. Please call +91 81500 85009 or email hello@soildoctor.in.';
        }
      } else {
        const subject = `${data.intent} — ${data.name}`;
        const body = `Name: ${data.name}\nMobile: ${data.phone}\nLocation: ${data.place}\nRequest: ${data.intent}\n\n${data.message || ''}`;
        location.href = `mailto:hello@soildoctor.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        text.textContent = 'We opened your email app with your request — just press send. Prefer to talk? Call +91 81500 85009.';
      }
      done.hidden = false;
    });
    $('[data-form-reset]', form).addEventListener('click', () => { form.reset(); done.hidden = true; $('#fName', form).focus(); });
  }

  /* ---------------- Office open-now indicator (IST) ---------------- */
  const openNow = $('[data-open-now]');
  if (openNow) {
    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    const day = ist.getDay(), mins = ist.getHours() * 60 + ist.getMinutes();
    const open = (day >= 1 && day <= 5 && mins >= 540 && mins < 1080) || (day === 6 && mins >= 540 && mins < 780);
    openNow.textContent = open ? 'Open now' : 'Closed now';
    openNow.classList.add(open ? 'is-open' : 'is-closed');
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${x * .18}px, ${y * .3}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }

  /* ---------------- Language: English / Hindi ---------------- */
  const HI = {
    'nav.how': 'कैसे काम करता है', 'nav.test': 'जाँच', 'nav.services': 'सेवाएँ', 'nav.paths': 'आपके लिए', 'nav.story': 'हमारी कहानी',
    'cta.book': 'मिट्टी जाँच बुक करें', 'cta.clinic': 'Soil Doctor क्लिनिक शुरू करें',
    'hero.eyebrow': 'खेत पर मिट्टी जाँच · फ़सल सलाह · सॉइल दीदी',
    'hero.t1': 'अपनी मिट्टी को जानें।', 'hero.t2': 'कम लागत, ज़्यादा उपज।',
    'hero.lede': 'Soil Doctor आपके खेत पर ही 45–60 मिनट में मिट्टी के 18 मानकों की जाँच करता है, और नतीजों को आपकी भाषा में फ़सल सलाह में बदलता है — ताकि खाद पर खर्च घटे और हर एकड़ से ज़्यादा मिले।',
    'how.eyebrow': 'यह कैसे काम करता है', 'how.title': 'थोड़ा और गहराई में चलें।',
    'params.eyebrow': 'जाँच', 'params.title': 'अठारह मानक। एक ही दौरा।',
    'calc.eyebrow': 'बचत अनुमान', 'calc.title': 'अंदाज़ा छोड़ें। बचत शुरू करें।', 'calc.acres': 'आपकी ज़मीन', 'calc.crop': 'मुख्य फ़सल', 'calc.seasons': 'साल में सीज़न', 'calc.cta': 'मेरे खेत की जाँच कराएँ',
    'svc.eyebrow': 'हमारी सेवाएँ', 'svc.title': 'स्वस्थ मिट्टी के चार रास्ते।',
    'paths.eyebrow': 'अपना रास्ता चुनें', 'paths.title': 'खेती में आपकी भूमिका क्या है?',
    'impact.eyebrow': 'हमारा असर', 'impact.title': 'असली खेतों से निकले आँकड़े।',
    'voices.eyebrow': 'खेतों से आवाज़ें', 'voices.title': 'उन्हीं के शब्दों में।',
    'story.eyebrow': 'हमारी कहानी', 'story.title': 'खेतों से जन्मा। किसान के लिए बना।',
    'faq.title': 'आपके सवाल, हमारे जवाब।',
    'book.eyebrow': 'शुरुआत करें', 'book.title': 'आपकी मिट्टी कुछ कह रही है। चलिए सुनें।', 'book.submit': 'कॉल बैक का अनुरोध करें'
  };
  const i18nEls = $$('[data-i18n]');
  i18nEls.forEach(el => (el.dataset.en = el.textContent));
  const setLang = (lang) => {
    root.lang = lang;
    i18nEls.forEach(el => { el.textContent = lang === 'hi' ? (HI[el.dataset.i18n] || el.dataset.en) : el.dataset.en; });
    store.set('sd-lang', lang);
    moveInk(selTab());
  };
  const savedLang = store.get('sd-lang');
  if (savedLang === 'hi') setLang('hi');
  $$('[data-lang-toggle]').forEach(b => b.addEventListener('click', () => setLang(root.lang === 'hi' ? 'en' : 'hi')));

  /* ---------------- misc ---------------- */
  const mq = $('.marquee__track');
  if (mq && mq.children.length === 1) {
    const copy = mq.firstElementChild.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    mq.appendChild(copy);
  }
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
})();
