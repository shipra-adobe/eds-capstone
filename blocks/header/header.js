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
