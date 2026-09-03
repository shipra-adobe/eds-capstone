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

  // Follow-us icons: the source renders the social links as brand-glyph chips
  // (icon font, unavailable here), so swap the "Facebook/Twitter/Instagram" text
  // for inline SVGs. Match by label; leave the link + aria-label intact for a11y.
  const SOCIAL_ICONS = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.1H7.6V13h2.7v8h3.2z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 5.9c-.7.32-1.5.53-2.3.63.83-.5 1.46-1.28 1.76-2.22-.78.46-1.64.8-2.55.98A4.02 4.02 0 0 0 12 8.98c0 .32.03.63.1.92-3.34-.17-6.3-1.77-8.28-4.2a4.02 4.02 0 0 0 1.24 5.37c-.65-.02-1.27-.2-1.8-.5v.05c0 1.95 1.38 3.57 3.22 3.94-.34.1-.69.14-1.06.14-.26 0-.5-.02-.75-.07a4.03 4.03 0 0 0 3.76 2.8A8.08 8.08 0 0 1 2 19.54a11.4 11.4 0 0 0 6.17 1.8c7.4 0 11.45-6.13 11.45-11.45v-.52c.79-.57 1.47-1.28 2.01-2.09z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.9c2.94 0 3.29.01 4.45.06 1.07.05 1.65.23 2.04.38.51.2.88.44 1.26.82.38.38.62.75.82 1.26.15.39.33.97.38 2.04.05 1.16.06 1.51.06 4.45s-.01 3.29-.06 4.45c-.05 1.07-.23 1.65-.38 2.04-.2.51-.44.88-.82 1.26-.38.38-.75.62-1.26.82-.39.15-.97.33-2.04.38-1.16.05-1.51.06-4.45.06s-3.29-.01-4.45-.06c-1.07-.05-1.65-.23-2.04-.38a3.4 3.4 0 0 1-1.26-.82 3.4 3.4 0 0 1-.82-1.26c-.15-.39-.33-.97-.38-2.04C2.91 15.29 2.9 14.94 2.9 12s.01-3.29.06-4.45c.05-1.07.23-1.65.38-2.04.2-.51.44-.88.82-1.26.38-.38.75-.62 1.26-.82.39-.15.97-.33 2.04-.38C8.71 2.91 9.06 2.9 12 2.9zm0 1.94c-2.89 0-3.23.01-4.37.06-.99.05-1.53.21-1.88.35-.47.18-.81.4-1.17.76-.36.36-.58.7-.76 1.17-.14.35-.3.89-.35 1.88-.05 1.14-.06 1.48-.06 4.37s.01 3.23.06 4.37c.05.99.21 1.53.35 1.88.18.47.4.81.76 1.17.36.36.7.58 1.17.76.35.14.89.3 1.88.35 1.14.05 1.48.06 4.37.06s3.23-.01 4.37-.06c.99-.05 1.53-.21 1.88-.35.47-.18.81-.4 1.17-.76.36-.36.58-.7.76-1.17.14-.35.3-.89.35-1.88.05-1.14.06-1.48.06-4.37s-.01-3.23-.06-4.37c-.05-.99-.21-1.53-.35-1.88a3.15 3.15 0 0 0-.76-1.17 3.15 3.15 0 0 0-1.17-.76c-.35-.14-.89-.3-1.88-.35-1.14-.05-1.48-.06-4.37-.06zm0 3.3a3.86 3.86 0 1 1 0 7.72 3.86 3.86 0 0 1 0-7.72zm0 6.37a2.51 2.51 0 1 0 0-5.02 2.51 2.51 0 0 0 0 5.02zm4.92-6.6a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0z"/></svg>',
  };
  footer.querySelectorAll('.footer-social a[href]').forEach((a) => {
    const label = (a.getAttribute('aria-label') || a.textContent).toLowerCase();
    const key = Object.keys(SOCIAL_ICONS).find((k) => label.includes(k));
    if (!key) return;
    if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', a.textContent.trim());
    a.classList.add('footer-social-icon');
    a.innerHTML = SOCIAL_ICONS[key];
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
