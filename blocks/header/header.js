// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then root (DA/EDS production).
 * Returns the parsed fragment plus the base directory the fragment was
 * served from, so relative asset paths (images/…) can be resolved to
 * absolute URLs (the fragment renders on pages at arbitrary paths).
 * @returns {{ doc: Element, base: string }|null}
 */
async function fetchNav() {
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = document.createElement('div');
  doc.innerHTML = html;
  // Resolve relative image src (e.g. "images/wknd-logo.svg") against the
  // fragment's base dir so it doesn't resolve against the current page path.
  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', base + src);
    }
  });
  return doc;
}

/**
 * Toggle the mobile nav open/closed.
 * @param {Element} nav
 * @param {*} forceExpanded optional boolean to force state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

// WKND language navigation model. Each country has a flag (SVG under
// /images/country-flags/) and one or more locales. Only en-US is a migrated
// page in this project; every other locale is shown for visual parity with the
// source but does NOT navigate (href '#') so no link 404s.
const LANGUAGE_NAV = [
  { country: 'United States', flag: 'US', locales: [{ label: 'EN-US', href: '/us/en' }, { label: 'ES-US' }] },
  { country: 'Canada', flag: 'CA', locales: [{ label: 'EN-CA' }, { label: 'FR-CA' }] },
  { country: 'Switzerland', flag: 'CH', locales: [{ label: 'DE-CH' }, { label: 'FR-CH' }, { label: 'IT-CH' }] },
  { country: 'Germany', flag: 'DE', locales: [{ label: 'DE-DE' }] },
  { country: 'France', flag: 'FR', locales: [{ label: 'FR-FR' }] },
  { country: 'Spain', flag: 'ES', locales: [{ label: 'ES-ES' }] },
  { country: 'Italy', flag: 'IT', locales: [{ label: 'IT-IT' }] },
];

const FLAG_BASE = '/images/country-flags';

/**
 * Replace the plain "EN-US" utility link with the WKND flag toggle + country
 * dropdown (source: .cmp-languagenavigation). The toggle shows the US flag and
 * "EN-US"; clicking it opens a panel listing every country/locale, each with a
 * flag. Only the US-English locale links to a real page.
 * @param {Element} nav
 */
function buildLanguageSelector(nav) {
  const utility = nav.querySelector('.nav-utility');
  if (!utility) return;
  // The lang link is the utility entry pointing at the language anchor.
  const langLink = [...utility.querySelectorAll('a')]
    .find((a) => /^#lang/i.test(a.getAttribute('href') || '') || /en-us/i.test(a.textContent.trim()));
  if (!langLink) return;
  const wrapper = langLink.closest('p') || langLink;

  const selector = document.createElement('div');
  selector.className = 'lang-selector';

  // Toggle button: flag + current locale label + caret.
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'lang-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Toggle Language en-US');
  toggle.innerHTML = `<img class="lang-flag" src="${FLAG_BASE}/US.svg" alt="" width="24" height="16">`
    + '<span class="lang-current">EN-US</span>'
    + '<span class="lang-caret" aria-hidden="true"></span>';

  // Panel: one row per country (flag + name + locale links).
  const panel = document.createElement('div');
  panel.className = 'lang-panel';
  panel.hidden = true;
  LANGUAGE_NAV.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'lang-country';
    const locales = entry.locales.map((loc) => {
      if (loc.href) return `<a href="${loc.href}">${loc.label}</a>`;
      // Non-migrated locale: render as a non-navigating span for visual parity.
      return `<span class="lang-locale-disabled">${loc.label}</span>`;
    }).join('<span class="lang-sep">|</span>');
    row.innerHTML = `<img class="lang-flag" src="${FLAG_BASE}/${entry.flag}.svg" alt="" width="24" height="16">`
      + `<div class="lang-country-body"><p class="lang-country-name">${entry.country}</p>`
      + `<p class="lang-locales">${locales}</p></div>`;
    panel.append(row);
  });

  selector.append(toggle, panel);
  wrapper.replaceWith(selector);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', (e) => {
    if (!selector.contains(e.target)) setOpen(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') setOpen(false);
  });
}

/**
 * loads and decorates the header nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Sections in nav.plain.html order: utility, brand, nav links, tools (search)
  const classes = ['utility', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Language selector: replace the plain "EN-US" utility link with the WKND
  // flag toggle + country dropdown (source: .cmp-languagenavigation). Only the
  // US English locale is a migrated page; the other locales are shown for visual
  // parity but do not navigate (this migration covers wknd.site/us/en only).
  buildLanguageSelector(nav);

  // Active nav link: mark the link whose target matches the current page so it can
  // render as a yellow chip (source: .cmp-navigation__item--active). Normalize both
  // sides to an extension-less, trailing-slash-free path before comparing.
  const normalizePath = (p) => {
    try {
      const path = p.startsWith('http') ? new URL(p).pathname : p;
      return path.replace(/\.html?$/, '').replace(/\/$/, '') || '/';
    } catch { return p; }
  };
  // Strip a leading /content prefix (present on the local `aem up` preview, absent
  // on published .aem.page/.aem.live) so the match works in both environments.
  const currentPath = normalizePath(window.location.pathname).replace(/^\/content(?=\/)/, '');
  nav.querySelectorAll('.nav-sections a[href]').forEach((a) => {
    const linkPath = normalizePath(a.getAttribute('href'));
    // Match exact page. Skip the site root ("Home"/"/us/en") so it isn't marked
    // active on every deeper page.
    if (linkPath !== '/' && (linkPath === currentPath || currentPath.endsWith(linkPath))) {
      a.setAttribute('aria-current', 'page');
      a.closest('li')?.classList.add('nav-active');
    }
  });

  // Brand logo: strip button wrapping so the logo renders as a plain image link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    navBrand.querySelectorAll('a.button').forEach((a) => { a.className = ''; });
    navBrand.querySelectorAll('.button-container').forEach((c) => { c.className = ''; });
  }

  // Tools: replace the "Search" placeholder text with a real search form (built here, per contract)
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const label = navTools.textContent.trim() || 'Search';
    navTools.textContent = '';
    const form = document.createElement('form');
    form.className = 'nav-search';
    form.setAttribute('role', 'search');
    form.action = '/us/en/search';
    const input = document.createElement('input');
    input.type = 'search';
    input.name = 'q';
    input.setAttribute('aria-label', label);
    input.placeholder = label;
    form.append(input);
    navTools.append(form);
  }

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // reset to correct state for current viewport, and on resize across the breakpoint
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  // close mobile nav on Escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
