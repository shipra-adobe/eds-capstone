/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the `columns-intro` block. Base: columns.
 * Source: https://wknd.site/us/en/adventures.html
 * Selector: div.teaser.cmp-teaser--hero
 * Generated: 2026-09-02
 *
 * The WKND Adventures index "hero" teaser is a Core Components teaser rendered as:
 *   div.teaser.cmp-teaser--hero
 *     └ div.cmp-teaser
 *         ├ div.cmp-teaser__content
 *         │    ├ h2.cmp-teaser__title           (intro heading, e.g. "Experience the world with us")
 *         │    └ div.cmp-teaser__description     (intro paragraph)
 *         └ div.cmp-teaser__image
 *              └ div.cmp-image > img
 *
 * Unlike the magazine `columns` teaser, this hero variant has NO eyebrow/pretitle
 * and NO CTA button — just a heading + intro paragraph over the landscape image.
 *
 * Target block table (matches the "Columns" library convention — first row is the
 * block name, second row holds the columns):
 *   Row 1: block name  ("columns-intro")
 *   Row 2 (2 columns):
 *     column 1 = hero image (image ONLY, so decorate() tags it .columns-intro-img-col)
 *     column 2 = text panel (heading + intro paragraph)
 *
 * Selectors are scoped to `.cmp-teaser__*` so the image lookup cannot leak into
 * any content that follows the teaser in the DOM (the adventure grid image-list).
 */
export default function parse(element, { document }) {
  // --- Column 1: hero image (kept alone in the cell) -----------------------
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img');

  // --- Column 2: intro text panel -----------------------------------------
  const bodyContent = [];

  // Intro heading — preserve as a heading element for semantics.
  const title = element.querySelector('.cmp-teaser__title, .cmp-teaser__content h1, .cmp-teaser__content h2, .cmp-teaser__content h3');
  if (title && title.textContent.trim()) {
    bodyContent.push(title);
  }

  // Intro paragraph / description (optional).
  const description = element.querySelector('.cmp-teaser__description, [class*="teaser__description"]');
  if (description && description.textContent.trim()) {
    bodyContent.push(description);
  }

  // Empty-block guard: nothing worth emitting → unwrap instead of emitting an empty block.
  if (!image && !bodyContent.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single row with two columns: [image-only cell, text-panel cell].
  const cells = [[image || '', bodyContent.length ? bodyContent : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-intro', cells });
  element.replaceWith(block);
}
