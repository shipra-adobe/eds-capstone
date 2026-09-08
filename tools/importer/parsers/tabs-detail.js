/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs-detail
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: div.tabs.panelcontainer
 * Generated: 2026-09-02
 *
 * Extracts the tabbed adventure content. The source has an <ol.cmp-tabs__tablist>
 * of tab labels and matching .cmp-tabs__tabpanel elements (by index) each wrapping
 * a content fragment of rich text (paragraphs, headings, lists, inline image).
 * Each tab becomes one 2-column row: cell 1 = tab label, cell 2 = panel rich content.
 *
 * Block name is 'tabs-detail' (single hyphenated class) so the migrated block
 * carries class "tabs-detail", matching blocks/tabs-detail/*.js/css which target
 * `.tabs-detail` and treat each row's first cell as the tab label and the rest as
 * the tabpanel. Using 'tabs (detail)' would emit two classes "tabs detail" and
 * wrongly load the vanilla tabs block.
 */
export default function parse(element, { document }) {
  const tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  panels.forEach((panel, i) => {
    // Tab label text, paired by index with the tablist entry.
    const label = tabLabels[i] ? (tabLabels[i].textContent || '').trim() : `Tab ${i + 1}`;

    // Panel content lives inside the content fragment's elements wrapper.
    const contentRoot = panel.querySelector('.cmp-contentfragment__elements')
      || panel.querySelector('.cmp-contentfragment')
      || panel;

    // Collect meaningful content nodes: paragraphs, headings, lists, and images.
    // Skip empty AEM layout grid wrappers (aem-Grid) which carry no content.
    const contentNodes = [];
    contentRoot.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6, picture, img').forEach((node) => {
      // Skip the tablist <ol> if it ever nests here, and skip empty text nodes.
      if (node.matches('ol.cmp-tabs__tablist')) return;
      // For images inside a cmp-image wrapper, keep the img itself.
      const text = (node.textContent || '').trim();
      const hasMedia = node.tagName === 'IMG' || node.tagName === 'PICTURE' || node.querySelector('img, picture');
      if (!text && !hasMedia) return;
      contentNodes.push(node);
    });

    // De-duplicate: if an img is captured both directly and via its wrapper,
    // avoid nesting duplicates by preferring outermost unique nodes.
    const uniqueNodes = contentNodes.filter((node, idx) =>
      !contentNodes.some((other, otherIdx) => otherIdx !== idx && other !== node && other.contains(node)));

    // Fallback: if nothing meaningful was found, keep the whole content root.
    const contentCell = uniqueNodes.length ? uniqueNodes : [contentRoot];

    // 2-column row: label cell, content cell (array of rich nodes).
    cells.push([label, contentCell]);
  });

  // Empty-block guard: no tabs extracted.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-detail', cells });
  element.replaceWith(block);
}
