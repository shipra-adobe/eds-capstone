/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: div.carousel.panelcontainer.cmp-carousel--mini
 * Generated: 2026-09-02
 *
 * Extracts the primary hero image from the adventure hero carousel.
 * The carousel may have multiple slides; we take the active/first slide image.
 * Output: hero block, single-column, one content cell holding the image.
 */
export default function parse(element, { document }) {
  // Prefer the active carousel slide, then first slide, scoped to the carousel
  // to avoid pulling images that live in adjacent tab/content DOM.
  const image = element.querySelector('.cmp-carousel__item--active .cmp-image__image')
    || element.querySelector('.cmp-carousel__item--active img')
    || element.querySelector('.cmp-carousel__item .cmp-image__image')
    || element.querySelector('.cmp-carousel__item img')
    || element.querySelector('.cmp-image__image')
    || element.querySelector('img');

  // Empty-block guard: no hero image means nothing to build.
  if (!image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // 1-column hero: single row whose one cell holds the hero image.
  cells.push([image]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
