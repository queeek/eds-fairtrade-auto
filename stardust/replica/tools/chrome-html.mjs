// Shared chrome markup generator for the replica prototypes (header + footer).
// Input: a chrome JSON produced by stardust/.work/chrome-extract.mjs (nav/meta/footer)
// and a locale-list JSON ({lead,text,rest,filterLabel,regions[]}).
// Usage (from a page builder):  import { header, footer } from './chrome-html.mjs';
//   header(chrome, locales, { home, localeLabel, localeSr, searchUrl, icons })
//   footer(chrome, { localeLabel, localeSr, icons })
// Markup only — behaviour lives in stardust/prototypes/canon.js, styles in canon.css.

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const icon = (id, cls = '', icons = 'assets/icons.svg') =>
  `<span class="Icon${cls ? ' ' + cls : ''}" aria-hidden="true"><svg><use href="${icons}#${id}"></use></svg></span>`;

export function header(chrome, locales, o) {
  const I = (id, cls) => icon(id, cls, o.icons);
  const nav = chrome.nav.map((m, i) => `
            <li class="TopbarMainNavigation--list--item">
              <button class="TopbarMainNavigation--button" type="button" aria-expanded="false" aria-controls="flyout-${i}">${esc(m.title)}</button>
              <div class="TopbarDesktopFlyout" id="flyout-${i}">
                <div class="TopbarDesktopFlyout--grid">
                  <div class="TopbarDesktopFlyout--groups">${m.groups.map(g => `
                    <div class="TopbarDesktopFlyout--group">
                      <div class="TopbarDesktopFlyout--groupTitle"><a class="TopbarDesktopFlyout--groupTitle--link" href="${esc(g.href)}">${I('chevron-right', 'is-inline TopbarDesktopFlyout--groupTitle--linkIcon')}<span class="TopbarDesktopFlyout--groupTitle--linkTitle">${esc(g.title)}</span></a></div>${g.links.length ? `
                      <ul class="TopbarDesktopFlyout--groupList">${g.links.map(l => `
                        <li class="TopbarDesktopFlyout--groupItem"><a class="TopbarDesktopFlyout--groupItem--link" href="${esc(l.h)}">${I('chevron-right', 'is-inline TopbarDesktopFlyout--groupItem--linkIcon')}<span class="TopbarDesktopFlyout--groupItem--linkTitle">${esc(l.t)}</span></a></li>`).join('')}
                      </ul>` : ''}
                    </div>`).join('')}
                  </div>
                </div>
              </div>
            </li>`).join('');

  const meta = chrome.meta.map(l => `
              <li class="TopbarMetaMenu--menuItem"><a class="TopbarMetaMenu--menuLink" href="${esc(l.h)}">${I('chevron-right', 'is-inline TopbarMetaMenu--menuLink--icon')}<span class="TopbarMetaMenu--menuLink--title">${esc(l.t)}</span></a></li>`).join('');

  // Mobile drawer: column 1 = main list, column 2 = one submenu per main item, column 3 = one per group.
  const subs = [];
  chrome.nav.forEach((m, i) => {
    subs.push(`
      <div class="MobileSubMenu" id="mobile-submenu-1-${i}" data-mobile-menu-level="2">
        <div class="MobileSubMenu--back"><button class="MobileSubMenu--back--button" type="button">${I('arrow-left')}<span>Go back</span></button></div>
        <div class="MobileSubMenu--top">
          <span class="MobileMenuLink"><span>${esc(m.title)}</span></span>
          <ul class="MobileSubMenu--list">${m.groups.map((g, j) => `
            <li class="MobileSubMenu--list--item"><button class="MobileMenuButton" type="button" data-level="2" aria-controls="mobile-submenu-2-${i}-${j}" aria-expanded="false"><span>${esc(g.title)}</span>${I('arrow-right', 'is-inline')}</button></li>`).join('')}
          </ul>
        </div>
      </div>`);
    m.groups.forEach((g, j) => subs.push(`
      <div class="MobileSubMenu" id="mobile-submenu-2-${i}-${j}" data-mobile-menu-level="3">
        <div class="MobileSubMenu--back"><button class="MobileSubMenu--back--button" type="button">${I('arrow-left')}<span>Go back</span></button></div>
        <div class="MobileSubMenu--top">
          <a class="MobileMenuLink" href="${esc(g.href)}">${I('chevron-right')}<span>${esc(g.title)}</span></a>${g.links.length ? `
          <ul>${g.links.map(l => `
            <li class="MobileSubMenu--list--item"><a class="MobileMenuLink" data-level="last" href="${esc(l.h)}">${I('chevron-right')}<span>${esc(l.t)}</span></a></li>`).join('')}
          </ul>` : ''}
        </div>
      </div>`));
  });

  const localeBtn = (cls) => `<button class="LocaleSelectorTrigger${cls}" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="locale-selector">${I('globe')}<span class="LocaleSelectorTrigger--label">${esc(o.localeLabel)}</span><span class="visuallyhidden">${esc(o.localeSr)}</span></button>`;

  const regions = locales.regions.map(r => `
            <li class="LocaleSelector--region"><span class="LocaleSelector--regionName">${esc(r.name)}</span>
              <ul class="LocaleSelector--locales">${r.locales.map(l => `<li class="LocaleSelector--locale"><a class="LocaleSelector--locale--link" href="${esc(l.h)}">${esc(l.t)}</a></li>`).join('')}</ul>
            </li>`).join('');

  return `<header class="site-header">
  <div class="Topbar" id="topbar">
    <div class="Topbar--barWrapper">
      <div class="Topbar--content">
        <a class="Topbar--logo" href="${esc(o.home)}"><span class="Icon Topbar--logo--icon"><img src="${o.logo || 'assets/fairtrade-international.svg'}" alt="" width="80" height="80"></span><span class="visuallyhidden">Back to Homepage</span></a>
        <div class="Topbar--mainNavigation scrollend-left scrollend-right">
          <div class="Topbar--mainNavigationScrollLeft"><button class="Button Topbar--mainNavigationScrollLeft--button variant-icon-primary color-skyblue size-small" type="button" tabindex="-1" aria-hidden="true"><span class="Button--icon">${I('chevron-left')}</span></button></div>
          <nav class="TopbarMainNavigation" aria-label="Main Navigation" id="main-nav">
            <ul class="TopbarMainNavigation--list">${nav}
            </ul>
          </nav>
          <div class="Topbar--mainNavigationScrollRight"><button class="Button Topbar--mainNavigationScrollRight--button variant-icon-primary color-skyblue size-small" type="button" tabindex="-1" aria-hidden="true"><span class="Button--icon">${I('chevron-right')}</span></button></div>
        </div>
        <div class="Topbar--meta">
          <button class="Topbar--searchTrigger" type="button" aria-controls="topbar-search" aria-expanded="false">${I('search')}<span class="Topbar--search--label">Search</span><span class="visuallyhidden">Open the search box</span></button>
          <div class="Topbar--localeSelectorTrigger">${localeBtn(' Topbar--localeSelectorTrigger--button')}</div>
          <div class="TopbarMetaMenu">
            <button class="TopbarMetaMenu--openButton" type="button" aria-controls="topbar-meta-menu" aria-expanded="false">${I('menu', 'is-inline TopbarMetaMenu--iconOpen')}<span class="TopbarMetaMenu--labelOpen">Open</span><span class="visuallyhidden">Open the meta menu</span></button>
            <div class="TopbarMetaMenu--menu" id="topbar-meta-menu">
              <div class="TopbarMetaMenu--menuHeader"><button class="TopbarMetaMenu--closeButton" type="button">${I('close', 'is-inline TopbarMetaMenu--iconClose')}<span class="TopbarMetaMenu--labelClose">close</span><span class="visuallyhidden">Close the meta menu</span></button></div>
              <ul class="TopbarMetaMenu--menuContent">${meta}
              </ul>
            </div>
          </div>
          <div class="Topbar--mobileMenuTrigger"><button class="MobileMenuTrigger" type="button" aria-expanded="false" aria-controls="mobile-menu"><span class="Icon MobileMenuTrigger--openIcon"><svg aria-hidden="true"><use href="${o.icons || 'assets/icons.svg'}#menu"></use></svg><span class="visuallyhidden">Open Mobile Menu</span></span><span class="Icon MobileMenuTrigger--closeIcon"><svg aria-hidden="true"><use href="${o.icons || 'assets/icons.svg'}#close"></use></svg><span class="visuallyhidden">Close Mobile Menu</span></span></button></div>
        </div>
        <div class="Topbar--search">
          <div class="TopbarSearch" id="topbar-search">
            <form action="${esc(o.searchUrl)}" role="search">
              <div class="Input TopbarSearch--input">
                <div class="Input--fieldWrapper"><input class="Input--field" id="topbar-search-input" name="q" type="search" placeholder="Bananas, coffee, oranges ..."><button class="Input--clear" type="button">${I('trash')}<span class="visuallyhidden">Clear the search value of the input</span></button>
                  <div class="Input--submitWrapper"><button class="Button Input--submit variant-icon-primary color-skyblue" type="submit" disabled><span class="Button--icon">${I('search')}</span><span class="visuallyhidden">Submit the search form</span></button></div>
                </div>
              </div>
            </form>
            <button class="TopbarSearch--close" type="button">${I('close', 'TopbarSearch--closeIcon')}<span class="TopbarSearch--closeLabel">Close</span><span class="visuallyhidden">By clicking this element, the search box will disappear</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="MobileMenu" id="mobile-menu">
    <div class="MobileMenu--inner">
      <div class="MobileNavigation">
        <nav class="MobileNavigation--main" aria-label="Main Navigation">
          <ul>${chrome.nav.map((m, i) => `
            <li class="MobileNavigation--main--list--item"><button class="MobileMenuButton" type="button" data-level="1" aria-controls="mobile-submenu-1-${i}" aria-expanded="false"><span>${esc(m.title)}</span>${I('arrow-right', 'is-inline')}</button></li>`).join('')}
          </ul>
        </nav>
        ${localeBtn(' variant-mobile-menu')}
        <nav class="MobileNavigation--meta" aria-label="Meta navigation">
          <ul class="MobileNavigation--meta--list">${chrome.meta.map(l => `
            <li class="MobileNavigation--meta--list--item"><a class="MobileMenuLink" data-level="meta" href="${esc(l.h)}">${I('chevron-right')}<span>${esc(l.t)}</span></a></li>`).join('')}
          </ul>
        </nav>
      </div>${subs.join('')}
    </div>
  </div>
  <div class="LocaleSelector" id="locale-selector" role="dialog" aria-modal="true" aria-labelledby="locale-selector-title">
    <button class="Button LocaleSelector--close variant-icon-secondary color-skyblue size-small" type="button"><span class="Button--icon">${I('close')}</span><span class="visuallyhidden">Close the locale selector.</span></button>
    <div class="LocaleSelector--content">
      <div class="LocaleSelector--lead">
        <p class="LocaleSelector--leadTitle" id="locale-selector-title">${esc(locales.lead)}</p>
        <p class="LocaleSelector--leadText">${esc(locales.text)}</p>
      </div>
      <a class="Button LocaleSelector--restOfTheWorld variant-secondary color-skyblue" href="${esc(locales.rest.h)}"><span class="Button--inner">${esc(locales.rest.t)}</span></a>
      <div class="LocaleSelector--filter">
        <div class="Input">
          <label class="Input--label visuallyhidden" for="locale-selector-filter">${esc(locales.filterLabel)}</label>
          <div class="Input--fieldWrapper"><input class="Input--field" id="locale-selector-filter" type="search" placeholder="${esc(locales.filterLabel)}" autocomplete="off"><button class="Input--clear" type="button">${I('trash')}<span class="visuallyhidden">Clear the value of the input</span></button></div>
        </div>
      </div>
      <p class="LocaleSelector--noMatchFound">Sorry, no match found!</p>
      <ul class="LocaleSelector--regions">${regions}
      </ul>
    </div>
  </div>
</header>`;
}

const SOCIAL_ICON = { facebook: 'facebook', instagram: 'instagram', linkedin: 'linkedin', youtube: 'youtube', tiktok: 'tiktok', 'x.com': 'x', twitter: 'x' };

export function footer(chrome, o) {
  const I = (id, cls) => icon(id, cls, o.icons);
  const f = chrome.footer;
  const lists = f.lists.map(l => `
          <li class="Footer--linkList">
            <div class="FooterLinkList">
              <div class="FooterLinkList--title"><span>${esc(l.title)}</span></div>
              <ul class="FooterLinkList--list">${l.links.map(k => `
                <li class="FooterLinkList--item">${I('chevron-right', 'FooterLinkList--item--icon')}<a class="FooterLinkList--link" href="${esc(k.h)}"${k.target ? ` target="${esc(k.target)}"` : ''}>${esc(k.t)}</a></li>`).join('')}
              </ul>
            </div>
          </li>`).join('');
  const social = f.social.map(s => {
    const key = Object.keys(SOCIAL_ICON).find(k => s.h.includes(k)) || 'facebook';
    return `
                <li class="FooterSocialMediaLinks--item"><a class="Button variant-icon-primary color-leafgreen" href="${esc(s.h)}" target="_blank" rel="noopener"><span class="Button--icon">${I(SOCIAL_ICON[key])}</span><span class="visuallyhidden">${esc(s.t)}</span></a></li>`;
  }).join('');
  return `<footer class="site-footer">
  <div class="footer-fragment"><div class="footer"><div class="Footer">
    <div class="Footer--grid">
      <div class="Footer--meta">
        <div class="Footer--logo"></div>
        <div class="Footer--localeSelectorTrigger"><button class="LocaleSelectorTrigger color-white" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="locale-selector">${I('globe')}<span class="LocaleSelectorTrigger--label">${esc(o.localeLabel)}</span><span class="visuallyhidden">${esc(o.localeSr)}</span></button></div>
      </div>
      <ul class="Footer--linkLists">${lists}
      </ul>
      <div class="Footer--leads">
        <div class="Footer--social">
          <div class="FooterSocialMediaLinks">
            <div class="FooterSocialMediaLinks--title">${esc(o.socialTitle || 'Social Links')}</div>
            <ul class="FooterSocialMediaLinks--list">${social}
            </ul>
          </div>
        </div>
        <div class="Footer--newsletter">
          <div class="Footer--newsletter--title">${esc(o.newsletterTitle || 'Newsletter')}</div>
          <a class="Button Footer--newsletter--button variant-secondary color-leafgreen theme-dark" href="${esc(o.newsletterHref)}"><span class="Button--inner">${esc(o.newsletterLabel || 'Click here')}</span></a>
        </div>
      </div>
    </div>
  </div></div></div>
</footer>`;
}
