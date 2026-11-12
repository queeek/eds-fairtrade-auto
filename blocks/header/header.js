import { getChromePath } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Fairtrade header (Topbar) — template-slotted from the replica prototype chrome.
 *
 * Reads the authored nav document (default `/nav`, `/<locale>/nav` under a locale folder,
 * or the page's `nav` metadata). Sections, in order:
 *   1. brand   — logo image (picture/img or :icon:) + one link (href = home, text = a11y label)
 *   2. nav     — nested list: top label > group link > item links (desktop flyouts + drawer)
 *   3. meta    — list of meta links (meta menu + drawer meta nav)
 *   4. locale  — title <p>, lead <p>, "rest of the world" link <p>, regions list
 *                (region name > locale links)
 *   5. labels  — list of `key: value` UI strings (search, locale, meta menu, drawer)
 * Behaviour per stardust/chrome/header-contract.json (canon.js): click flyouts, search
 * overlay, locale dialog with filter, meta menu, mobile drill-down drawer, scroll lock,
 * hide on scroll down / show on scroll up, Escape closes and returns focus.
 *
 * @ew-exempt labels — text-as-metadata (`key: value` UI strings, section 5)
 * @ew-exempt nav top labels — rendered as <button> (EW7); edit them in the nav document
 * @ew-exempt drawer — presentational clones of the nav/meta links (EW4, stripped)
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;
const mqDesktop = window.matchMedia('(width >= 1024px)');

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined) return;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
}

function icon(name, cls = '', hidden = true) {
  const span = h('span', { class: `ft-icon ${cls}`.trim(), 'aria-hidden': hidden ? 'true' : null });
  span.innerHTML = `<svg aria-hidden="true"><use href="${SPRITE}#${name}"></use></svg>`;
  return span;
}

function srOnly(text) {
  return h('span', { class: 'visuallyhidden' }, text || '');
}

/* EW4: presentational clones carry no workspace instrumentation */
function stripInstrumentation(el) {
  [el, ...el.querySelectorAll('*')].forEach((n) => {
    ['data-prose-index', 'data-image-index', 'data-block-index'].forEach((a) => n.removeAttribute(a));
  });
  return el;
}

/* wrap an anchor's existing child nodes (moved, not copied) in a span */
function wrapLinkText(a, cls) {
  const span = h('span', { class: cls });
  span.append(...a.childNodes);
  a.append(span);
  return span;
}

function readLabels(section) {
  const labels = {};
  section?.querySelectorAll('li, p').forEach((el) => {
    if (el.querySelector('li')) return;
    const m = el.textContent.match(/^\s*([a-z0-9-]+)\s*:\s*([\s\S]*?)\s*$/);
    if (!m) return;
    const [, key, value] = m;
    labels[key] = value;
  });
  return labels;
}

/* list item -> { label node, link, sublist } — tolerates <li><p><a></p><ul> (#98) */
function readItem(li) {
  const link = li.querySelector(':scope > a, :scope > p > a, :scope > strong > a');
  const sub = li.querySelector(':scope > ul');
  let label = '';
  if (!link) {
    label = [...li.childNodes]
      .filter((n) => n.nodeType === 3 || (n.nodeType === 1 && n.tagName !== 'UL'))
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return { link, sub, label };
}

let lockCount = 0;
function lockScroll(on) {
  lockCount = Math.max(0, lockCount + (on ? 1 : -1));
  document.documentElement.style.overflow = lockCount ? 'hidden' : '';
  /* hook for page modules that react to an open header panel (hero carousel controls fade) */
  document.body.classList.toggle('header-open', lockCount > 0);
}

function buildLogo(brand) {
  const a = brand?.querySelector('a');
  if (!a) return null;
  const media = brand.querySelector('picture, img');
  const p = a.closest('p') || h('p');
  p.className = 'topbar-logo-wrap';
  a.className = 'topbar-logo';
  wrapLinkText(a, 'visuallyhidden');
  if (media) {
    const img = media.tagName === 'IMG' ? media : media.querySelector('img');
    if (img) {
      img.alt = '';
      img.loading = 'eager';
      img.width = 80;
      img.height = 80;
    }
    a.prepend(h('span', { class: 'ft-icon topbar-logo-icon' }, media));
  }
  return p;
}

function buildFlyouts(navSection, state) {
  const list = h('ul', { class: 'main-nav-list' });
  const tops = navSection?.querySelector('ul');
  const items = tops ? [...tops.children] : [];
  items.forEach((li, i) => {
    const { link, sub, label } = readItem(li);
    const text = label || link?.textContent.trim() || '';
    const id = `flyout-${i}`;
    const btn = h('button', {
      class: 'main-nav-button', type: 'button', 'aria-expanded': 'false', 'aria-controls': id,
    }, text);
    const groups = h('div', { class: 'topbar-desktop-flyout-groups' });
    const model = { label: text, groups: [] };
    [...(sub?.children || [])].forEach((gli) => {
      const g = readItem(gli);
      const group = h('div', { class: 'topbar-desktop-flyout-group' });
      const title = h('div', { class: 'topbar-desktop-flyout-group-title' });
      const gm = { title: null, label: g.label, items: [] };
      if (g.link) {
        gm.title = g.link;
        g.link.className = 'topbar-desktop-flyout-group-title-link';
        wrapLinkText(g.link, 'topbar-desktop-flyout-group-title-link-title');
        g.link.prepend(icon('chevron-right', 'is-inline topbar-desktop-flyout-group-title-link-icon'));
        title.append(g.link);
      } else {
        title.append(h('span', { class: 'topbar-desktop-flyout-group-title-link' }, g.label));
      }
      group.append(title);
      if (g.sub) {
        g.sub.className = 'topbar-desktop-flyout-group-list';
        [...g.sub.children].forEach((ili) => {
          ili.className = 'topbar-desktop-flyout-group-item';
          const a = ili.querySelector('a');
          if (!a) return;
          if (a.parentElement !== ili) ili.append(a);
          [...ili.children].forEach((c) => { if (c !== a && !c.textContent.trim()) c.remove(); });
          a.className = 'topbar-desktop-flyout-group-item-link';
          wrapLinkText(a, 'topbar-desktop-flyout-group-item-link-title');
          a.prepend(icon('chevron-right', 'is-inline topbar-desktop-flyout-group-item-link-icon'));
          gm.items.push(a);
        });
        group.append(g.sub);
      }
      groups.append(group);
      model.groups.push(gm);
    });
    const single = model.groups.length === 1 ? ' has-single-group' : '';
    const panel = h(
      'div',
      { class: `topbar-desktop-flyout${single}`, id },
      h('div', { class: 'topbar-desktop-flyout-grid page-grid' }, groups),
    );
    list.append(h('li', { class: 'main-nav-list-item' }, btn, panel));
    state.nav.push(model);
  });
  return list;
}

function scrollButton(side) {
  const btn = h('button', {
    class: `btn topbar-main-navigation-scroll-${side}-button variant-icon-primary color-skyblue size-small`,
    type: 'button',
    tabindex: '-1',
    'aria-hidden': 'true',
  }, h('span', { class: 'btn-icon' }, icon(`chevron-${side}`)));
  return h('div', { class: `topbar-main-navigation-scroll-${side}` }, btn);
}

function localeTrigger(L, cls) {
  return h(
    'button',
    {
      class: `locale-selector-trigger ${cls}`,
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
      'aria-controls': 'locale-selector',
    },
    icon('globe'),
    h('span', { class: 'locale-selector-trigger-label' }, L['locale-label'] || ''),
    srOnly(L['locale-hint']),
  );
}

function buildMeta(metaSection, L) {
  const ul = metaSection?.querySelector('ul') || h('ul');
  ul.className = 'topbar-meta-menu-menu-content';
  [...ul.children].forEach((li) => {
    li.className = 'topbar-meta-menu-menu-item';
    const a = li.querySelector('a');
    if (!a) return;
    if (a.parentElement !== li) li.append(a);
    [...li.children].forEach((c) => { if (c !== a && !c.textContent.trim()) c.remove(); });
    a.className = 'topbar-meta-menu-menu-link';
    wrapLinkText(a, 'topbar-meta-menu-menu-link-title');
    a.prepend(icon('chevron-right', 'is-inline topbar-meta-menu-menu-link-icon'));
  });
  const openBtn = h(
    'button',
    {
      class: 'topbar-meta-menu-open-button',
      type: 'button',
      'aria-controls': 'topbar-meta-menu',
      'aria-expanded': 'false',
    },
    icon('menu', 'is-inline topbar-meta-menu-icon-open'),
    h('span', { class: 'topbar-meta-menu-label-open' }, L['meta-open'] || ''),
    srOnly(L['meta-open-hint']),
  );
  const closeBtn = h(
    'button',
    { class: 'topbar-meta-menu-close-button', type: 'button' },
    icon('close', 'is-inline topbar-meta-menu-icon-close'),
    h('span', { class: 'topbar-meta-menu-label-close' }, L['meta-close'] || ''),
    srOnly(L['meta-close-hint']),
  );
  const menu = h(
    'div',
    { class: 'topbar-meta-menu-menu', id: 'topbar-meta-menu' },
    h('div', { class: 'topbar-meta-menu-menu-header' }, closeBtn),
    ul,
  );
  return h('div', { class: 'topbar-meta-menu' }, openBtn, menu);
}

function buildSearch(L) {
  const input = h('input', {
    class: 'input-field',
    id: 'topbar-search-input',
    name: 'q',
    type: 'search',
    placeholder: L['search-placeholder'] || '',
    'aria-label': L['search-placeholder'] || L['search-label'] || 'Search',
  });
  const clear = h(
    'button',
    { class: 'input-clear', type: 'button' },
    icon('trash'),
    srOnly(L['search-clear']),
  );
  const submit = h(
    'button',
    {
      class: 'btn input-submit variant-icon-primary color-skyblue', type: 'submit', disabled: true,
    },
    h('span', { class: 'btn-icon' }, icon('search')),
    srOnly(L['search-submit']),
  );
  const form = h(
    'form',
    { action: L['search-action'] || 'https://www.fairtrade.net/en/search-results.html', role: 'search' },
    h(
      'div',
      { class: 'input search-panel-input' },
      h(
        'div',
        { class: 'input-field-wrapper' },
        input,
        clear,
        h('div', { class: 'input-submit-wrapper' }, submit),
      ),
    ),
  );
  const close = h(
    'button',
    { class: 'search-panel-close', type: 'button' },
    icon('close', 'search-panel-close-icon'),
    h('span', { class: 'search-panel-close-label' }, L['search-close'] || ''),
    srOnly(L['search-close-hint']),
  );
  return h(
    'div',
    { class: 'topbar-search' },
    h('div', { class: 'search-panel', id: 'topbar-search' }, form, close),
  );
}

function buildLocaleDialog(section, L) {
  const ps = [...(section?.querySelectorAll(':scope .default-content-wrapper > p') || [])];
  const linkP = ps.find((p) => p.querySelector('a'));
  const textPs = ps.filter((p) => p !== linkP);
  const [titleP, leadP] = textPs;
  if (titleP) {
    titleP.className = 'locale-selector-lead-title';
    titleP.id = 'locale-selector-title';
  }
  if (leadP) leadP.className = 'locale-selector-lead-text';
  const rest = linkP?.querySelector('a');
  if (rest) {
    rest.className = 'btn locale-selector-rest-of-the-world variant-secondary color-skyblue';
    wrapLinkText(rest, 'btn-inner');
    linkP.className = 'locale-selector-rest-of-the-world-wrap';
  }
  const regions = section?.querySelector('ul') || h('ul');
  regions.className = 'locale-selector-regions';
  [...regions.children].forEach((li) => {
    li.className = 'locale-selector-region';
    const sub = li.querySelector(':scope > ul') || h('ul');
    const name = h('span', { class: 'locale-selector-region-name' });
    [...li.childNodes].filter((n) => n !== sub).forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'P') name.append(...n.childNodes);
      else name.append(n);
    });
    sub.className = 'locale-selector-locales';
    [...sub.children].forEach((sli) => {
      sli.className = 'locale-selector-locale';
      const a = sli.querySelector('a');
      if (a) {
        if (a.parentElement !== sli) sli.append(a);
        a.className = 'locale-selector-locale-link';
      }
    });
    li.replaceChildren(name, sub);
  });
  const filter = h('input', {
    class: 'input-field',
    id: 'locale-selector-filter',
    type: 'search',
    placeholder: L['locale-filter'] || '',
    autocomplete: 'off',
  });
  const dialog = h(
    'div',
    {
      class: 'locale-selector',
      id: 'locale-selector',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'locale-selector-title',
    },
    h(
      'button',
      { class: 'btn locale-selector-close variant-icon-secondary color-skyblue size-small', type: 'button' },
      h('span', { class: 'btn-icon' }, icon('close')),
      srOnly(L['locale-close']),
    ),
    h(
      'div',
      { class: 'locale-selector-content' },
      h('div', { class: 'locale-selector-lead' }, titleP, leadP),
      linkP,
      h(
        'div',
        { class: 'locale-selector-filter' },
        h(
          'div',
          { class: 'input' },
          h('label', { class: 'input-label visuallyhidden', for: 'locale-selector-filter' }, L['locale-filter'] || ''),
          h(
            'div',
            { class: 'input-field-wrapper' },
            filter,
            h('button', { class: 'input-clear', type: 'button' }, icon('trash'), srOnly(L['search-clear'])),
          ),
        ),
      ),
      h('p', { class: 'locale-selector-no-match-found' }, L['locale-none'] || ''),
      regions,
    ),
  );
  return dialog;
}

function mobileLink(a, level) {
  const c = stripInstrumentation(a.cloneNode(true));
  c.className = 'mobile-menu-link';
  if (level) c.dataset.level = level;
  const text = c.textContent.trim();
  c.replaceChildren(icon('chevron-right'), h('span', {}, text));
  return c;
}

function mobileButton(text, level, controls) {
  return h(
    'button',
    {
      class: 'mobile-menu-button',
      type: 'button',
      'data-level': String(level),
      'aria-controls': controls,
      'aria-expanded': 'false',
    },
    h('span', {}, text),
    icon('arrow-right', 'is-inline'),
  );
}

function backButton(L) {
  return h(
    'div',
    { class: 'mobile-sub-menu-back' },
    h(
      'button',
      { class: 'mobile-sub-menu-back-button', type: 'button' },
      icon('arrow-left'),
      h('span', {}, L['mobile-back'] || ''),
    ),
  );
}

function buildMobileMenu(state, metaUl, L) {
  const inner = h('div', { class: 'mobile-menu-inner' });
  const mainList = h('ul');
  const panels = [];
  state.nav.forEach((top, i) => {
    const id2 = `mobile-submenu-1-${i}`;
    mainList.append(h('li', { class: 'mobile-navigation-main-list-item' }, mobileButton(top.label, 1, id2)));
    const list2 = h('ul', { class: 'mobile-sub-menu-list' });
    const lvl3 = [];
    top.groups.forEach((g, j) => {
      const id3 = `mobile-submenu-2-${i}-${j}`;
      const gtext = g.title ? g.title.textContent.trim() : g.label;
      list2.append(h('li', { class: 'mobile-sub-menu-list-item' }, mobileButton(gtext, 2, id3)));
      const top3 = h('div', { class: 'mobile-sub-menu-top' });
      top3.append(g.title ? mobileLink(g.title) : h('span', { class: 'mobile-menu-link' }, h('span', {}, gtext)));
      if (g.items.length) {
        top3.append(h('ul', {}, g.items.map((a) => h('li', { class: 'mobile-sub-menu-list-item' }, mobileLink(a, 'last')))));
      }
      lvl3.push(h('div', { class: 'mobile-sub-menu', id: id3, 'data-mobile-menu-level': '3' }, backButton(L), top3));
    });
    panels.push(h(
      'div',
      { class: 'mobile-sub-menu', id: id2, 'data-mobile-menu-level': '2' },
      backButton(L),
      h(
        'div',
        { class: 'mobile-sub-menu-top' },
        h('span', { class: 'mobile-menu-link' }, h('span', {}, top.label)),
        list2,
      ),
    ), ...lvl3);
  });
  const metaList = h('ul', { class: 'mobile-navigation-meta-list' });
  metaUl?.querySelectorAll('a').forEach((a) => {
    metaList.append(h('li', { class: 'mobile-navigation-meta-list-item' }, mobileLink(a, 'meta')));
  });
  inner.append(
    h(
      'div',
      { class: 'mobile-navigation' },
      h('nav', { class: 'mobile-navigation-main', 'aria-label': L['nav-label'] || 'Main Navigation' }, mainList),
      localeTrigger(L, 'variant-mobile-menu'),
      h('nav', { class: 'mobile-navigation-meta', 'aria-label': L['meta-nav-label'] || 'Meta navigation' }, metaList),
    ),
    ...panels,
  );
  return h('div', { class: 'mobile-menu', id: 'mobile-menu' }, inner);
}

function wire(root) {
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const topbar = $('.topbar');
  const closers = [];
  const closeAll = (except) => closers.forEach((c) => c !== except && c(false));

  /* hide on scroll down, show on scroll up */
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!topbar.querySelector('.is-open')) {
      topbar.classList.toggle('is-hidden', y > lastY && y > topbar.offsetHeight);
    }
    lastY = y;
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closers.forEach((c) => c(false, true));
  });

  /* desktop flyouts: click toggles; Escape closes and returns focus */
  $$('.main-nav-button').forEach((btn) => {
    const panel = root.querySelector(`#${btn.getAttribute('aria-controls')}`);
    if (!panel) return;
    const set = (open, viaKey) => {
      const was = btn.getAttribute('aria-expanded') === 'true';
      if (was === open) return;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('is-active', open);
      panel.classList.toggle('is-open', open);
      lockScroll(open);
      topbar.classList.toggle('is-darkened', $$('.topbar-desktop-flyout.is-open').length > 0);
      if (open) topbar.classList.remove('is-hidden');
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
    if (!e.target.closest('.main-nav')) {
      $$('.main-nav-button[aria-expanded="true"]').forEach((b) => b.click());
    }
  });

  /* search overlay */
  const searchBtn = $('.topbar-search-trigger');
  const search = $('.search-panel');
  if (searchBtn && search) {
    const input = $('.input-field', search);
    const submit = $('.input-submit', search);
    const set = (open, viaKey) => {
      if (search.classList.contains('is-open') === open) return;
      search.classList.toggle('is-open', open);
      searchBtn.setAttribute('aria-expanded', String(open));
      lockScroll(open);
      if (open) setTimeout(() => input?.focus(), 50);
      else if (viaKey !== undefined) searchBtn.focus();
    };
    closers.push(set);
    searchBtn.addEventListener('click', () => {
      closeAll(set);
      set(true);
    });
    $('.search-panel-close', search)?.addEventListener('click', () => set(false, true));
    input?.addEventListener('input', () => {
      if (submit) submit.disabled = !input.value.trim();
    });
    $('.input-clear', search)?.addEventListener('click', () => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
      input.focus();
    });
  }

  /* meta menu */
  const meta = $('.topbar-meta-menu');
  if (meta) {
    const openBtn = $('.topbar-meta-menu-open-button', meta);
    const closeBtn = $('.topbar-meta-menu-close-button', meta);
    const set = (open, viaKey) => {
      if (meta.classList.contains('is-open') === open) return;
      meta.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', String(open));
      lockScroll(open);
      if (open) setTimeout(() => closeBtn?.focus(), 50);
      else if (viaKey !== undefined) openBtn.focus();
    };
    closers.push(set);
    openBtn.addEventListener('click', () => {
      const o = !meta.classList.contains('is-open');
      closeAll(set);
      set(o);
    });
    closeBtn?.addEventListener('click', () => set(false, true));
  }

  /* locale selector dialog (+ filter); triggers anywhere on the page (footer too) */
  const locale = $('.locale-selector');
  if (locale) {
    let opener = null;
    const set = (open, viaKey) => {
      if (locale.classList.contains('is-open') === open) return;
      locale.classList.toggle('is-open', open);
      document.querySelectorAll('.locale-selector-trigger')
        .forEach((t) => t.setAttribute('aria-expanded', String(open)));
      lockScroll(open);
      if (open) setTimeout(() => $('.locale-selector-close', locale)?.focus(), 50);
      else if (viaKey !== undefined) opener?.focus();
    };
    closers.push(set);
    document.addEventListener('click', (e) => {
      const t = e.target.closest('.locale-selector-trigger');
      if (!t) return;
      opener = t;
      closeAll(set);
      set(true);
    });
    $('.locale-selector-close', locale)?.addEventListener('click', () => set(false, true));
    const filter = $('#locale-selector-filter', locale);
    const none = $('.locale-selector-no-match-found', locale);
    filter?.addEventListener('input', () => {
      const q = filter.value.trim().toLowerCase();
      let shown = 0;
      $$('.locale-selector-region', locale).forEach((r) => {
        const hit = !q || r.textContent.toLowerCase().includes(q);
        r.classList.toggle('is-hidden', !hit);
        shown += hit ? 1 : 0;
      });
      none?.classList.toggle('is-visible', !shown);
    });
    $('.locale-selector-filter .input-clear', locale)?.addEventListener('click', () => {
      filter.value = '';
      filter.dispatchEvent(new Event('input'));
      filter.focus();
    });
  }

  /* mobile drawer (< 1024px): levels slide in by 100vw */
  const mTrigger = $('.mobile-menu-trigger');
  const mMenu = $('.mobile-menu');
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
        $$('.mobile-menu-button[aria-expanded="true"]', mMenu)
          .forEach((b) => b.setAttribute('aria-expanded', 'false'));
        setLevel();
      }
    };
    closers.push((open, viaKey) => {
      if (!viaKey) set(open);
    });
    mTrigger.addEventListener('click', () => {
      const o = !mMenu.classList.contains('is-open');
      closeAll();
      set(o);
    });
    $$('.mobile-menu-button', mMenu).forEach((b) => b.addEventListener('click', () => {
      const sub = mMenu.querySelector(`#${b.getAttribute('aria-controls')}`);
      if (!sub) return;
      b.setAttribute('aria-expanded', 'true');
      sub.classList.add('is-open');
      stack.push(sub);
      setLevel();
    }));
    $$('.mobile-sub-menu-back-button', mMenu).forEach((b) => b.addEventListener('click', () => {
      const sub = stack.pop();
      setLevel();
      if (sub) {
        setTimeout(() => sub.classList.remove('is-open'), 300);
        $$(`.mobile-menu-button[aria-controls="${sub.id}"]`, mMenu)
          .forEach((x) => x.setAttribute('aria-expanded', 'false'));
      }
    }));
    mqDesktop.addEventListener('change', () => set(false));
  }

  /* main navigation horizontal scroll affordance (narrow desktops) */
  const wrap = $('.topbar-main-navigation');
  const nav = wrap?.querySelector('.main-nav');
  if (wrap && nav) {
    const sync = () => {
      wrap.classList.toggle('scrollend-left', nav.scrollLeft <= 1);
      wrap.classList.toggle('scrollend-right', nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1);
    };
    nav.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    $('.topbar-main-navigation-scroll-left-button', wrap)
      ?.addEventListener('click', () => nav.scrollBy({ left: -200, behavior: 'smooth' }));
    $('.topbar-main-navigation-scroll-right-button', wrap)
      ?.addEventListener('click', () => nav.scrollBy({ left: 200, behavior: 'smooth' }));
    requestAnimationFrame(sync);
  }
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await loadFragment(getChromePath('nav'));
  const sections = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
  const [brand, navSection, metaSection, localeSection, labelSection] = sections;
  const L = readLabels(labelSection);
  const state = { nav: [] };

  const logo = buildLogo(brand);
  const navList = buildFlyouts(navSection, state);
  const metaMenu = buildMeta(metaSection, L);
  const metaUl = metaMenu.querySelector('.topbar-meta-menu-menu-content');

  const searchTrigger = h(
    'button',
    {
      class: 'topbar-search-trigger',
      type: 'button',
      'aria-controls': 'topbar-search',
      'aria-expanded': 'false',
    },
    icon('search'),
    h('span', { class: 'topbar-search-label' }, L['search-label'] || ''),
    srOnly(L['search-open']),
  );

  const mobileTrigger = h(
    'button',
    {
      class: 'mobile-menu-trigger', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'mobile-menu',
    },
    h('span', { class: 'ft-icon mobile-menu-trigger-open-icon' }, srOnly(L['mobile-open'])),
    h('span', { class: 'ft-icon mobile-menu-trigger-close-icon' }, srOnly(L['mobile-close'])),
  );
  mobileTrigger.querySelector('.mobile-menu-trigger-open-icon')
    .insertAdjacentHTML('afterbegin', `<svg aria-hidden="true"><use href="${SPRITE}#menu"></use></svg>`);
  mobileTrigger.querySelector('.mobile-menu-trigger-close-icon')
    .insertAdjacentHTML('afterbegin', `<svg aria-hidden="true"><use href="${SPRITE}#close"></use></svg>`);

  const content = h(
    'div',
    { class: 'topbar-content' },
    logo,
    h(
      'div',
      { class: 'topbar-main-navigation scrollend-left scrollend-right' },
      scrollButton('left'),
      h('nav', { class: 'main-nav', 'aria-label': L['nav-label'] || 'Main Navigation', id: 'main-nav' }, navList),
      scrollButton('right'),
    ),
    h(
      'div',
      { class: 'topbar-meta' },
      searchTrigger,
      h('div', { class: 'topbar-locale-selector-trigger' }, localeTrigger(L, 'topbar-locale-selector-trigger-button')),
      metaMenu,
      h('div', { class: 'topbar-mobile-menu-trigger' }, mobileTrigger),
    ),
    buildSearch(L),
  );

  const topbar = h(
    'div',
    { class: 'topbar', id: 'topbar' },
    h('div', { class: 'topbar-bar-wrapper page-grid' }, content),
  );
  const mobileMenu = buildMobileMenu(state, metaUl, L);
  const dialog = buildLocaleDialog(localeSection, L);

  block.replaceChildren(topbar, mobileMenu, dialog);
  wire(block);
}
