/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the `columns` block. Base: columns.
 * Source: https://wknd.site/us/en/magazine.html
 * Selector: div.teaser.cmp-teaser--featured
 * Generated: 2026-09-02
 *
 * The magazine "Featured Article" is a Core Components teaser rendered as:
 *   div.teaser.cmp-teaser--featured
 *     └ div.cmp-teaser
 *         ├ div.cmp-teaser__content
 *         │    ├ p.cmp-teaser__pretitle          (eyebrow, e.g. "Featured Article")
 *         │    ├ h2.cmp-teaser__title            (title)
 *         │    ├ div.cmp-teaser__description      (body copy)
 *         │    └ div.cmp-teaser__action-container
 *         │         └ a.cmp-teaser__action-link  ("Read More" CTA)
 *         └ div.cmp-teaser__image
 *              └ div.cmp-image > img
 *
 * Target (EDS columns): a single 2-cell row.
 *   cell 1 = image, cell 2 = body (eyebrow, title heading, description, CTA link).
 */
export default function parse(element, { document }) {
  // --- Column 1: featured image -------------------------------------------
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // --- Column 2: text body ------------------------------------------------
  const bodyContent = [];

  // Eyebrow / pretitle (optional).
  const pretitle = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
  if (pretitle && pretitle.textContent.trim()) {
    const eyebrow = document.createElement('p');
    eyebrow.textContent = pretitle.textContent.trim();
    bodyContent.push(eyebrow);
  }

  // Title heading (keep as a heading element to preserve semantics).
  const title = element.querySelector('.cmp-teaser__title, [class*="title"] h1, [class*="title"] h2, h1, h2, h3');
  if (title && title.textContent.trim()) {
    bodyContent.push(title);
  }

  // Description / body copy (optional).
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  if (description && description.textContent.trim()) {
    bodyContent.push(description);
  }

  // CTA link — "Read More". Preserve href + label. Only emit if it is a real link.
  const cta = element.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]');
  if (cta && cta.getAttribute('href') && cta.textContent.trim()) {
    const link = document.createElement('a');
    link.setAttribute('href', cta.getAttribute('href'));
    link.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(link);
    bodyContent.push(p);
  }

  // Empty-block guard: nothing worth emitting → unwrap.
  if (!image && !bodyContent.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single 2-column row: [image, body].
  const cells = [[image || '', bodyContent.length ? bodyContent : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
