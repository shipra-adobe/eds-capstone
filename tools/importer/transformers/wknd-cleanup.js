/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html (about-us, magazine,
 * and adventure-detail pages).
 * Removes non-authorable site chrome (header, footer, mobile nav, ID-sync iframe)
 * so the import contains only page-level authorable content from <main>.
 * Site chrome is identical across templates (shared experiencefragment header/footer,
 * same #toggleNav/#mobileNav/ID-sync iframe); magazine's authorable teaser, image-list,
 * text and separator (bare <hr>) all live inside <main> and are untouched. No new
 * chrome on magazine → no selector changes needed.
 * adventure-detail (bali-surf-camp) re-verified: the ONLY iframe on the page is the
 * demdex ID-sync iframe (non-authorable), so the bare 'iframe' selector is safe here.
 * The new adventure-detail authorable content — breadcrumb (div.breadcrumb.cmp-breadcrumb--fixed,
 * KEPT as section-1 default content), hero carousel (div.carousel.cmp-carousel--mini),
 * spec sidebar (div.contentfragment.cmp-contentfragment--elements) and tabs
 * (div.tabs.panelcontainer) — is not matched by any cleanup selector and is preserved.
 * The nested layout main (main.cmp-layout-container--fixed) is likewise untouched.
 * No selector changes needed for adventure-detail.
 *
 * adventure-index (adventures.html) adds a filterable adventure grid built as an
 * AEM tabs component (div.tabs.panelcontainer, cleaned.html line 200). Only the
 * ACTIVE "All" tabpanel's grid is a mapped block (cards ← ".cmp-tabs__tabpanel--active
 * .image-list.list"); the parser replaces just that inner image-list. Left untouched,
 * the tab-filter bar (ol.cmp-tabs__tablist "All/Climbing/Cycling/Skiing/Surfing/Travel",
 * line 202) and the five INACTIVE tabpanels (lines 456/492/543/594/630, each a duplicate
 * filtered .image-list.list) would serialize to markdown as stray leaked content.
 * We remove them in afterTransform (AFTER parsers run) so:
 *   - adventure-index: the active tabpanel (kept via :not(--active)) still wraps the
 *     emitted cards block; only the filter bar + inactive duplicate panels are stripped.
 *   - adventure-detail: SAFE — its tabs-detail parser replaces the entire
 *     div.tabs.panelcontainer via element.replaceWith(block) between the hooks, so NO
 *     .cmp-tabs__tabpanel / ol.cmp-tabs__tablist survive to afterTransform → no-op there.
 *   - magazine / about-us: no tabs component → no-op.
 * The active grid, hero teaser, "Current Adventures" title and separator are preserved.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Elements that could interfere with block parsing / are overlays.
    // Verified in cleaned.html:
    //   <iframe id="destination_publishing_iframe_wkndsite_0"> (line 670) - Adobe ID syncing iframe
    //   <div id="toggleNav"> (line 672) - mobile nav toggle button
    //   <div id="mobileNav" class="cmp-navigation--mobile"> (line 678) - mobile nav overlay
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Verified in cleaned.html:
    //   <header class="experiencefragment cmp-experiencefragment--header"> (line 5)
    //     contains language navigation, sign-in buttons, logo, main nav, search
    //   <footer class="experiencefragment cmp-experiencefragment--footer"> (line 575)
    //     contains logo, footer nav, "Follow Us" social buttons, copyright text
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
    ]);

    // adventure-index only: strip the tabs filter bar and the inactive category
    // tabpanels so their duplicate filtered card grids don't leak as stray content.
    // Verified in cleaned.html: ol.cmp-tabs__tablist (line 202) holds the
    // All/Climbing/Cycling/Skiing/Surfing/Travel labels; the five inactive
    // .cmp-tabs__tabpanel elements (lines 456/492/543/594/630) each hold a duplicate
    // .image-list.list. The ACTIVE panel (.cmp-tabs__tabpanel--active) is preserved —
    // by now it wraps the cards block the parser emitted.
    // Safe for adventure-detail: its tabs-detail parser has already replaced the whole
    // div.tabs.panelcontainer, so no tablist/tabpanel remains here (no-op). magazine /
    // about-us have no tabs component (no-op).
    WebImporter.DOMUtils.remove(element, [
      'ol.cmp-tabs__tablist',
      '.cmp-tabs__tabpanel:not(.cmp-tabs__tabpanel--active)',
    ]);
  }
}
