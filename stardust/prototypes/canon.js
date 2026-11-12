/* Fairtrade replica — shared behaviour (header chrome + shared modules).
   No frameworks. Every behaviour here was observed on the live site
   (stardust/chrome/header-contract.json, stardust/replica/motion/*.json). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqDesktop = window.matchMedia('(width >= 1024px)');
  const topbar = $('.Topbar');
  let lockCount = 0;
  const lockScroll = (on) => {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.documentElement.style.overflow = lockCount ? 'hidden' : '';
  };

  /* ---- Topbar: hide on scroll down, show on scroll up ---- */
  if (topbar) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const anyOpen = topbar.querySelector('.is-open');
      if (!anyOpen) topbar.classList.toggle('is-hidden', y > lastY && y > topbar.offsetHeight);
      lastY = y;
    }, { passive: true });
  }

  /* ---- generic disclosure helper ---- */
  const closers = [];
  const closeAll = (except) => closers.forEach((c) => c !== except && c(false));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closers.forEach((c) => c(false, true));
  });

  /* ---- Desktop flyouts (click toggles; Escape closes and returns focus) ---- */
  $$('.TopbarMainNavigation--button').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    const set = (open, viaKey) => {
      const was = btn.getAttribute('aria-expanded') === 'true';
      if (was === open) return;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('is-active', open);
      panel.classList.toggle('is-open', open);
      const anyOpen = $$('.TopbarDesktopFlyout.is-open').length > 0;
      topbar?.classList.toggle('is-darkened', anyOpen);
      if (open) topbar?.classList.remove('is-hidden');
      if (!open && viaKey) btn.focus();
    };
    closers.push(set);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      closeAll(set);
      set(open);
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.TopbarMainNavigation')) {
      $$('.TopbarMainNavigation--button[aria-expanded="true"]').forEach((b) => b.click());
    }
  });

  /* ---- Search overlay ---- */
  const searchBtn = $('.Topbar--searchTrigger');
  const search = $('.TopbarSearch');
  if (searchBtn && search) {
    const input = $('.Input--field', search);
    const submit = $('.Input--submit', search);
    const set = (open, viaKey) => {
      if (search.classList.contains('is-open') === open) return;
      search.classList.toggle('is-open', open);
      searchBtn.setAttribute('aria-expanded', String(open));
      lockScroll(open);
      if (open) setTimeout(() => input?.focus(), 50);
      else if (viaKey !== undefined) searchBtn.focus();
    };
    closers.push(set);
    searchBtn.addEventListener('click', () => { closeAll(set); set(true); });
    $('.TopbarSearch--close', search)?.addEventListener('click', () => set(false, true));
    input?.addEventListener('input', () => { if (submit) submit.disabled = !input.value.trim(); });
    $('.Input--clear', search)?.addEventListener('click', () => { input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); });
  }

  /* ---- Meta menu ---- */
  const meta = $('.TopbarMetaMenu');
  if (meta) {
    const openBtn = $('.TopbarMetaMenu--openButton', meta);
    const set = (open, viaKey) => {
      if (meta.classList.contains('is-open') === open) return;
      meta.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', String(open));
      if (open) setTimeout(() => $('.TopbarMetaMenu--closeButton', meta)?.focus(), 50);
      else if (viaKey !== undefined) openBtn.focus();
    };
    closers.push(set);
    openBtn.addEventListener('click', () => { const o = !meta.classList.contains('is-open'); closeAll(set); set(o); });
    $('.TopbarMetaMenu--closeButton', meta)?.addEventListener('click', () => set(false, true));
  }

  /* ---- Locale selector dialog (+ filter) ---- */
  const locale = $('.LocaleSelector');
  if (locale) {
    let opener = null;
    const triggers = $$('.LocaleSelectorTrigger');
    const set = (open, viaKey) => {
      if (locale.classList.contains('is-open') === open) return;
      locale.classList.toggle('is-open', open);
      triggers.forEach((t) => t.setAttribute('aria-expanded', String(open)));
      lockScroll(open);
      if (open) setTimeout(() => $('.LocaleSelector--close', locale)?.focus(), 50);
      else if (viaKey !== undefined) opener?.focus();
    };
    closers.push(set);
    triggers.forEach((t) => t.addEventListener('click', () => { opener = t; closeAll(set); set(true); }));
    $('.LocaleSelector--close', locale)?.addEventListener('click', () => set(false, true));
    const filter = $('#locale-selector-filter');
    const none = $('.LocaleSelector--noMatchFound', locale);
    filter?.addEventListener('input', () => {
      const q = filter.value.trim().toLowerCase();
      let shown = 0;
      $$('.LocaleSelector--region', locale).forEach((r) => {
        const hit = !q || r.textContent.toLowerCase().includes(q);
        r.classList.toggle('is-hidden', !hit);
        shown += hit;
      });
      none?.classList.toggle('is-visible', !shown);
    });
    $('.LocaleSelector--filter .Input--clear', locale)?.addEventListener('click', () => { filter.value = ''; filter.dispatchEvent(new Event('input')); filter.focus(); });
  }

  /* ---- Mobile drawer (<1024px): levels slide in by 100vw ---- */
  const mTrigger = $('.MobileMenuTrigger');
  const mMenu = $('.MobileMenu');
  if (mTrigger && mMenu) {
    const stack = [];
    const setLevel = () => mMenu.style.setProperty('--level', String(stack.length + 1));
    const set = (open) => {
      if (mMenu.classList.contains('is-open') === open) return;
      mMenu.classList.toggle('is-open', open);
      mTrigger.setAttribute('aria-expanded', String(open));
      lockScroll(open);
      if (!open) {
        stack.splice(0).forEach((s) => s.classList.remove('is-open'));
        $$('.MobileMenuButton[aria-expanded="true"]', mMenu).forEach((b) => b.setAttribute('aria-expanded', 'false'));
        setLevel();
      }
    };
    closers.push((open, viaKey) => { if (viaKey) return; set(open); });
    mTrigger.addEventListener('click', () => { const o = !mMenu.classList.contains('is-open'); closeAll(); set(o); });
    $$('.MobileMenuButton', mMenu).forEach((b) => b.addEventListener('click', () => {
      const sub = document.getElementById(b.getAttribute('aria-controls'));
      if (!sub) return;
      b.setAttribute('aria-expanded', 'true');
      sub.classList.add('is-open');
      stack.push(sub);
      setLevel();
    }));
    $$('.MobileSubMenu--back--button', mMenu).forEach((b) => b.addEventListener('click', () => {
      const sub = stack.pop();
      setLevel();
      if (sub) setTimeout(() => sub.classList.remove('is-open'), 300);
      $$(`.MobileMenuButton[aria-controls="${sub?.id}"]`, mMenu).forEach((x) => x.setAttribute('aria-expanded', 'false'));
    }));
    mqDesktop.addEventListener('change', () => set(false));
  }

  /* ---- PageHeroCarousel ---- */
  $$('.PageHeroCarousel').forEach((hero) => {
    const slides = $$('.PageHeroSlide', hero);
    const bullets = $$('.PageHeroCarousel--bullet', hero);
    const prev = $('.PageHeroCarousel--control-previous', hero);
    const next = $('.PageHeroCarousel--control-next', hero);
    let i = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    const go = (n) => {
      i = Math.max(0, Math.min(slides.length - 1, n));
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-next', k === i + 1);
        s.classList.toggle('is-after', k > i + 1);
        s.classList.toggle('is-before', k < i);
        s.toggleAttribute('aria-hidden', k !== i);
        $$('a', s).forEach((a) => (k === i ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
      });
      bullets.forEach((b, k) => { b.classList.toggle('is-active', k === i); b.toggleAttribute('aria-current', k === i); });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    };
    prev?.addEventListener('click', () => go(i - 1));
    next?.addEventListener('click', () => go(i + 1));
    bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
    slides.forEach((s, k) => s.addEventListener('click', (e) => { if (k !== i) { e.preventDefault(); go(k); } }));
    let x0 = null;
    hero.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    hero.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    });
  });

  /* ---- NumberFactTeaser slider (<768px) ---- */
  $$('.NumberFactTeaser--slider').forEach((sl) => {
    const list = $('.NumberFactTeaser--items', sl);
    const prev = $('.NumberFactTeaser--slider--prev', sl);
    const next = $('.NumberFactTeaser--slider--next', sl);
    if (!list) return;
    const step = () => list.clientWidth + parseFloat(getComputedStyle(list).columnGap || 0);
    const sync = () => {
      if (prev) prev.disabled = list.scrollLeft <= 2;
      if (next) next.disabled = list.scrollLeft >= list.scrollWidth - list.clientWidth - 2;
    };
    prev?.addEventListener('click', () => list.scrollBy({ left: -step() }));
    next?.addEventListener('click', () => list.scrollBy({ left: step() }));
    list.addEventListener('scroll', sync, { passive: true });
  });

  /* ---- Accordion ---- */
  $$('.Accordion--toggle').forEach((t) => {
    const acc = t.closest('.Accordion');
    t.addEventListener('click', () => {
      const open = !acc.classList.contains('is-open');
      acc.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', String(open));
    });
  });
})();

/* ---- Main navigation horizontal scroll affordance (narrow desktops) ---- */
(() => {
  const wrap = document.querySelector('.Topbar--mainNavigation');
  const nav = wrap?.querySelector('.TopbarMainNavigation');
  if (!wrap || !nav) return;
  const sync = () => {
    wrap.classList.toggle('scrollend-left', nav.scrollLeft <= 1);
    wrap.classList.toggle('scrollend-right', nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1);
  };
  nav.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  wrap.querySelector('.Topbar--mainNavigationScrollLeft--button')?.addEventListener('click', () => nav.scrollBy({ left: -200, behavior: 'smooth' }));
  wrap.querySelector('.Topbar--mainNavigationScrollRight--button')?.addEventListener('click', () => nav.scrollBy({ left: 200, behavior: 'smooth' }));
  sync();
})();

/* ---- Content fader (observed: main sections get .is-visible on entering the viewport, 0.5s fade) ---- */
(() => {
  const main = document.querySelector('[data-content-fader]');
  if (!main || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...main.children].filter((el) => !el.matches('.PageHeroCarousel, .PageLead, .Breadcrumbs'));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.remove('reveal-pending');
    e.target.classList.add('is-visible');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-visible'); return; }
    el.classList.add('reveal-pending');
    io.observe(el);
  });
})();
