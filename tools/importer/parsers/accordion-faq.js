/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion.
 * Source: https://wknd.site/us/en/faqs.html (selector: .cmp-accordion)
 * Generated: 2026-09-02
 *
 * Structure (from library-description.txt): 2-column Accordion block.
 * First row = block name. Each subsequent row = one accordion item:
 *   cell 1 = Title (the question, from .cmp-accordion__title)
 *   cell 2 = Content (the answer, from .cmp-accordion__panel body)
 *
 * Source is an AEM accordion (.cmp-accordion) with N items
 * (.cmp-accordion__item), each a header button (.cmp-accordion__button >
 * .cmp-accordion__title) plus a panel (.cmp-accordion__panel) whose body is
 * one or more .cmp-text blocks (paragraphs / lists / headings).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  const cells = [];

  items.forEach((item) => {
    // --- Title cell (the question) ---
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__button, .cmp-accordion__header');
    const titleText = titleEl ? titleEl.textContent.trim() : '';

    // --- Content cell (the answer) ---
    const panel = item.querySelector('.cmp-accordion__panel');
    const contentNodes = [];
    if (panel) {
      // Prefer meaningful block-level content nodes from the panel body.
      const candidates = Array.from(panel.querySelectorAll(
        'p, ul, ol, h1, h2, h3, h4, h5, h6, img, figure, table, blockquote',
      ));
      candidates.forEach((node) => {
        // Skip nodes nested inside another already-collected candidate to avoid duplication.
        if (contentNodes.some((collected) => collected.contains(node))) return;
        // Skip empty text nodes (e.g. stray <h3>&nbsp;</h3> spacers).
        const hasMedia = node.querySelector && node.querySelector('img, picture, video, iframe');
        if (!hasMedia && !node.textContent.replace(/ /g, ' ').trim()) return;
        contentNodes.push(node);
      });
      // Fallback: if nothing matched, take the panel's inner container text/nodes.
      if (contentNodes.length === 0) {
        const fallback = panel.querySelector('.cmp-text, .cmp-container') || panel;
        if (fallback.textContent.replace(/ /g, ' ').trim()) {
          contentNodes.push(fallback);
        }
      }
    }

    // Only add a row if there is a question; pad content with '' if empty.
    if (!titleText && contentNodes.length === 0) return;
    cells.push([titleText || '', contentNodes.length ? contentNodes : '']);
  });

  // Empty-block guard: no items parsed.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
