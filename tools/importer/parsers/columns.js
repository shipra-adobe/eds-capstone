/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the `columns` block. Base: columns.
 * Sources:
 *   - https://wknd.site/us/en/magazine.html   (selector: div.teaser.cmp-teaser--featured)
 *   - https://wknd.site/us/en.html            (selector: div.teaser.cmp-teaser--featured)
 *   - https://wknd.site/us/en/magazine/arctic-surfing.html (selector: .cmp-byline)
 * Generated: 2026-09-02
 *
 * This parser handles TWO distinct `columns` instances that share the block name:
 *
 * 1. Author byline card (magazine-article) — selector `.cmp-byline`:
 *      div.cmp-byline
 *        ├ div.cmp-byline__image > div.cmp-image > img   (small author portrait)
 *        ├ h2.cmp-byline__name                            (author name)
 *        └ p.cmp-byline__occupations                      (occupation)
 *    A sibling social-share building block
 *    (div.buildingblock.cmp-buildingblock--btn-list with Facebook/Twitter/
 *    Instagram links) belongs with this byline and is folded into the text cell.
 *    Target (EDS columns): a single 2-cell row → [portrait image, text cell].
 *
 * 2. Featured Article teaser (homepage / magazine index) — selector
 *    `div.teaser.cmp-teaser--featured`, rendered as:
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
  // =========================================================================
  // Instance 1: Author byline card (`.cmp-byline`)
  // =========================================================================
  if (element.matches('.cmp-byline') || element.querySelector('.cmp-byline__name')) {
    const byline = element.matches('.cmp-byline')
      ? element
      : element.querySelector('.cmp-byline');

    // Column 1: small author portrait.
    const portrait = byline.querySelector('.cmp-byline__image img, .cmp-image img, img');

    // Column 2: name (heading), occupation, and social-share links.
    const textCell = [];

    const name = byline.querySelector('.cmp-byline__name, h1, h2, h3');
    if (name && name.textContent.trim()) {
      textCell.push(name);
    }

    const occupation = byline.querySelector('.cmp-byline__occupations, p');
    if (occupation && occupation.textContent.trim()) {
      textCell.push(occupation);
    }

    // Social-share building block. It lives OUTSIDE `.cmp-byline` as a sibling
    // (div.buildingblock.cmp-buildingblock--btn-list). Look inside the byline
    // first, then fall back to the nearest sibling share block within scope.
    let shareScope = byline.querySelector('.cmp-buildingblock--btn-list, [class*="btn-list"], [class*="sharing"]');
    if (!shareScope) {
      // Search siblings of the byline and of the passed-in element.
      const searchRoots = [byline.parentElement, element.parentElement].filter(Boolean);
      for (const root of searchRoots) {
        shareScope = root.querySelector('.cmp-buildingblock--btn-list, [class*="btn-list"]');
        if (shareScope) break;
      }
    }
    if (shareScope) {
      const shareLinks = Array.from(shareScope.querySelectorAll('a[href]'));
      shareLinks.forEach((a) => {
        const label = a.textContent.trim();
        const href = a.getAttribute('href');
        if (!label || !href) return;
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = label;
        const p = document.createElement('p');
        p.appendChild(link);
        textCell.push(p);
      });
    }

    // Empty-block guard.
    if (!portrait && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const bylineCells = [[portrait || '', textCell.length ? textCell : '']];
    const bylineBlock = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: bylineCells });
    element.replaceWith(bylineBlock);
    return;
  }

  // =========================================================================
  // Instance 2: Featured Article teaser (`div.teaser.cmp-teaser--featured`)
  // =========================================================================
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
