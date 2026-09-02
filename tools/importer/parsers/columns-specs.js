/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns-specs
 * Base block: columns
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: div.contentfragment.cmp-contentfragment--elements
 * Generated: 2026-09-02
 *
 * Extracts the adventure spec/metadata list (Activity, Adventure Type, Trip
 * Length, Group Size, Difficulty, Price) from the content fragment.
 * Each spec becomes one 2-column row: cell 1 = label, cell 2 = value.
 *
 * Block name is 'columns-specs' (single hyphenated class) so the migrated
 * block carries class "columns-specs", matching blocks/columns-specs/*.js/css
 * which target `.columns-specs` and read block.firstElementChild.children
 * (label first cell, value last cell). Using 'columns (specs)' would emit two
 * classes "columns specs" and wrongly load the vanilla columns block.
 */
export default function parse(element, { document }) {
  // Each spec is a .cmp-contentfragment__element with a dt (label) and dd (value).
  const specs = Array.from(element.querySelectorAll('.cmp-contentfragment__element'));

  const cells = [];
  specs.forEach((spec) => {
    const labelEl = spec.querySelector('.cmp-contentfragment__element-title, dt');
    const valueEl = spec.querySelector('.cmp-contentfragment__element-value, dd');

    const label = labelEl ? (labelEl.textContent || '').trim() : '';
    const value = valueEl ? (valueEl.textContent || '').trim() : '';

    // Skip rows that have neither a label nor a value.
    if (!label && !value) return;

    // 2-column row: label cell, value cell (pad empty side to keep row width even).
    cells.push([label, value]);
  });

  // Empty-block guard: no specs extracted.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-specs', cells });
  element.replaceWith(block);
}
