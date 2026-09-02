import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. Metadata-independent dual-path: prefer the migrated
  // WKND footer under /content, fall back to the root /footer (DA/EDS production).
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  let fragment = await loadFragment(footerPath);
  if (!fragment) {
    footerPath = '/footer';
    fragment = await loadFragment(footerPath);
  }
  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Classify the WKND footer sections in document order:
  // brand logo, nav links, follow-us social, legal/attribution.
  const classes = ['footer-brand', 'footer-nav', 'footer-social', 'footer-legal'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(c);
  });

  // Resolve relative image src (e.g. "images/wknd-logo.svg") against the fragment's
  // base dir so it doesn't resolve against the current page path.
  const base = footerPath.replace(/\/[^/]*$/, '/');
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', base + src);
    }
  });

  block.append(footer);
}
