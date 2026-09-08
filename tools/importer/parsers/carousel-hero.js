/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the `carousel-hero` block. Base: carousel.
 * Source: https://wknd.site/us/en.html
 * Selector: div.carousel.cmp-carousel--hero
 * Generated: 2026-09-02
 *
 * The WKND homepage hero is a Core Components carousel rendered as:
 *   div.carousel.cmp-carousel--hero
 *     └ div.cmp-carousel
 *         └ div.cmp-carousel__content
 *             ├ div.cmp-carousel__item (cmp-carousel__item--active on first)   ← one per slide
 *             │    └ div.teaser.cmp-teaser--hero
 *             │        └ div.cmp-teaser
 *             │            ├ div.cmp-teaser__content
 *             │            │    ├ h2.cmp-teaser__title              (slide heading, e.g. "WKND Adventures")
 *             │            │    ├ div.cmp-teaser__description        (intro paragraph)
 *             │            │    └ div.cmp-teaser__action-container
 *             │            │        └ a.cmp-teaser__action-link      (CTA, e.g. "View Trips")
 *             │            └ div.cmp-teaser__image > div.cmp-image > img (slide background)
 *             ├ div.cmp-carousel__item ...
 *             ├ div.cmp-carousel__actions   (prev/next buttons — navigation chrome, dropped)
 *             └ ol.cmp-carousel__indicators  (dots — navigation chrome, dropped)
 *
 * Target block table — matches the "Carousel" library convention AND the DOM shape
 * that blocks/carousel-hero/carousel-hero.js decorate() consumes:
 *   decorate() reads `block.querySelectorAll(':scope > div')` as rows (= slides),
 *   then for each row reads `row.querySelectorAll(':scope > div')` as columns,
 *   tagging column 0 `.carousel-hero-slide-image` and column 1 `.carousel-hero-slide-content`.
 * So each slide MUST be a 2-column row:
 *   Row 1: block name  ("carousel-hero")
 *   Row N (2 columns, one per slide):
 *     column 1 = slide background image (image ONLY → becomes the -image column)
 *     column 2 = content panel (heading + intro paragraph + CTA link → -content column)
 *
 * Selectors are scoped per `.cmp-carousel__item` so, even though the cached source
 * snippet has malformed nesting that swallows later page teasers, each slide only
 * pulls its own teaser's heading/description/CTA/image and navigation chrome
 * (actions/indicators, which are NOT carousel items) is naturally excluded.
 */
export default function parse(element, { document }) {
  // Each carousel item is one slide. Fall back to teaser hero panels if the
  // item wrapper class is ever absent on a variant page.
  let items = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.teaser.cmp-teaser--hero, .cmp-teaser--hero'));
  }

  const cells = [];

  items.forEach((item) => {
    // --- Column 1: slide background image (kept alone in the cell) ----------
    const image = item.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // --- Column 2: content panel (heading + intro + CTA) --------------------
    const contentCell = [];

    // Slide heading — preserve as a heading element for semantics.
    const title = item.querySelector('.cmp-teaser__title, .cmp-teaser__content h1, .cmp-teaser__content h2, .cmp-teaser__content h3');
    if (title && title.textContent.trim()) {
      contentCell.push(title);
    }

    // Intro paragraph / description (optional).
    const description = item.querySelector('.cmp-teaser__description, [class*="teaser__description"]');
    if (description && description.textContent.trim()) {
      contentCell.push(description);
    }

    // CTA link(s) — preserve href + label (optional).
    const ctaLinks = Array.from(item.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));
    ctaLinks.forEach((cta) => {
      if (cta && cta.getAttribute('href')) {
        contentCell.push(cta);
      }
    });

    // Skip slides with no usable content at all.
    if (!image && !contentCell.length) return;

    // 2-column row: [image-only cell, content-panel cell]. Pad missing cells
    // with '' so every row keeps the same column count.
    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard: no slides found → unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
