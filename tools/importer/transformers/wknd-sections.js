/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd section breaks / section metadata.
 * Driven by payload.template.sections from page-templates.json
 * (about-us: 5 sections → 4 breaks; magazine: 7 sections → 6 breaks).
 * Template-agnostic: reads payload.template.sections at runtime, so it adapts to
 * whichever template's section count is passed in. All magazine section selectors
 * verified against migration-work/cleaned.html (rc1 title, rc2 teaser, rc3/rc5
 * title--underline, rc4 image-list, rc6 text, rc7 separator).
 * All sections have style: null, so no Section Metadata blocks are emitted;
 * this inserts an <hr> before every non-first section.
 *
 * Breaks are inserted in beforeTransform (while every section element still
 * exists, before block parsers replace matched elements). Section Metadata,
 * when a section has a style, is anchored in afterTransform to a marker <hr>.
 * Sections are processed in reverse so live-element inserts never shift
 * not-yet-processed sections. See references/generate-import-transformer.md.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue; // no styled sections in about-us → this loop is a no-op

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
