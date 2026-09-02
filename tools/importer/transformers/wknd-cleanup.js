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
 *
 * homepage (us/en.html) re-verified against migration-work/cleaned.html — NO selector
 * changes needed:
 *   - Site chrome is identical: header.cmp-experiencefragment--header (line 5),
 *     footer.cmp-experiencefragment--footer (line 471), demdex ID-sync iframe (line 566,
 *     the only iframe → bare 'iframe' safe), #toggleNav (568), #mobileNav (574).
 *   - The hero is a CAROUSEL (div.carousel.cmp-carousel--hero, line 165) built from
 *     cmp-carousel__item slides (lines 168/189/210), cmp-carousel__actions prev/next
 *     buttons (line 233) and ol.cmp-carousel__indicators (line 245). These are a DIFFERENT
 *     component from cmp-tabs: the inactive-tabpanel/tablist rule below targets
 *     ol.cmp-tabs__tablist + .cmp-tabs__tabpanel ONLY, and the homepage has ZERO cmp-tabs
 *     elements, so that rule is a no-op here and CANNOT touch carousel slides. The whole
 *     carousel is the carousel-hero block instance, replaced by its parser between hooks,
 *     so the carousel prev/next actions + indicator tablist never survive to afterTransform
 *     (no chrome leak) — no carousel-specific cleanup rule is added.
 *   - Featured teaser (div.teaser.cmp-teaser--featured, line 256), card grids
 *     (div.image-list.list, lines 281/391), section headings (div.title.cmp-title--underline,
 *     lines 276/356), ALL ARTICLES/ALL TRIPS buttons and separators are authorable and are
 *     matched by NO cleanup selector → all preserved.
 *
 * magazine-article (magazine/arctic-surfing.html) re-verified against
 * migration-work/cleaned.html — site chrome is IDENTICAL to the other templates
 * (header.cmp-experiencefragment--header line 5, footer.cmp-experiencefragment--footer
 * line 378, the sole demdex ID-sync iframe line 473 → bare 'iframe' safe, #toggleNav
 * line 475, #mobileNav line 481), so no chrome selector changes are needed. The
 * article-detail authorable content is all inside <main> and matched by NO cleanup
 * selector, so it is preserved:
 *   - Lead image (div.image, line 165) and BREADCRUMB (div.breadcrumb / nav.cmp-breadcrumb,
 *     line 170) are KEPT as default content — consistent with the WKND convention already
 *     used for adventure-detail (rc1 breadcrumb kept as default content), and with this
 *     page's page-structure.json (rc2) / authoring-analysis.json, which both classify the
 *     breadcrumb as default-content. The cleanup does NOT remove breadcrumb.
 *   - Long-form editorial body (h1 title, h4 author sub-heading, paragraphs, the pull-quote
 *     <blockquote> line 212, inline images, and the three underlined h2 subsections) is all
 *     default content → untouched.
 *   - Author byline card (div.cmp-byline, line 284) and its sibling social-share building
 *     block (div.buildingblock.cmp-buildingblock--btn-list, line 294, Facebook/Twitter/
 *     Instagram) become the 'columns' block (mapped at .cmp-byline) — the social links
 *     belong WITH that block and are consumed by the columns parser. The cleanup therefore
 *     must NOT use a broad '.buildingblock' / '.cmp-buildingblock--btn-list' selector
 *     (that would also strip the identical footer building block AND, worse, the byline's
 *     own social links); the footer building block is already removed with the whole footer.
 *   - Story sidebar (aside.cmp-layoutcontainer--sidebar, line 330) is KEPT as default
 *     content: the "SHARE THIS STORY" heading (div.title.cmp-title--black, line 333) and
 *     the "Up next" related-articles list (div.list.cmp-list--upnext, line 344) are
 *     authorable. The ONE new removal below strips the sidebar's empty social-share
 *     widget (div.sharing, line 338) — see afterTransform.
 *
 * faqs (faqs.html) re-verified against migration-work/cleaned.html — site chrome is
 * IDENTICAL to every other WKND template (header.cmp-experiencefragment--header line 5,
 * footer.cmp-experiencefragment--footer line 357, the sole demdex ID-sync iframe line 452
 * → bare 'iframe' safe, #toggleNav line 454, #mobileNav line 460), so NO chrome selector
 * changes are needed. All authorable FAQ content lives in <main> and is matched by NO
 * cleanup selector, so it is fully preserved:
 *   - H1 "FAQs" (div.title.cmp-title--underline > h1, line 170), banner image
 *     (#image-7642821cc3 img, line 175) and intro paragraph (#text-a8814241aa, line 180)
 *     are default content → untouched.
 *   - The 7-item Q&A accordion (div.accordion.panelcontainer > div.cmp-accordion, line 185)
 *     becomes the accordion-faq block (mapped at .cmp-accordion). CRITICALLY, no cleanup
 *     selector reaches inside it: the tabs rule targets ONLY ol.cmp-tabs__tablist /
 *     .cmp-tabs__tabpanel (this page has ZERO cmp-tabs elements → no-op, cannot touch the
 *     cmp-accordion__item / __panel / __button internals the accordion parser needs), and
 *     div.sharing does not exist here (no-op). So the accordion is delivered intact.
 *   - "Need more help?" sidebar (#container-ef2c6c2ddf, line 333) is KEPT as default
 *     content: its <hr> separator (div.separator.cmp-separator--hidden > hr, lines 334-337 —
 *     an authored thematic break per page-structure.json / authoring-analysis.json, NOT
 *     chrome; the cleanup never removes bare <hr> or separators), the H3 "Need more help?"
 *     (#title-4c1f7ce4c3, line 341) and the contact paragraph with phone/email/tagline
 *     (#text-c58c5ff307, line 344) are all authorable.
 * There is NO non-content chrome inside <main> on this page (unlike article-detail's empty
 * div.sharing widget), so NO FAQ-specific removal is added — a broad selector risked
 * stripping accordion internals and is deliberately avoided.
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

    // magazine-article only: strip the sidebar's empty social-share widget.
    // Verified in cleaned.html: div.sharing (line 338) holds an empty .fb-share-button
    // and an empty Pinterest anchor (<a href="pinterest...">, no text) — these are
    // share-intent site behaviors, not authored content, and would otherwise serialize
    // as a stray empty link. The sibling "SHARE THIS STORY" heading (div.title.cmp-title--black,
    // line 333) and the "Up next" list (div.list.cmp-list--upnext, line 344) are authorable
    // and are NOT matched here, so they survive. Narrow, article-specific class (div.sharing);
    // no other template has this element (no-op elsewhere).
    WebImporter.DOMUtils.remove(element, [
      'div.sharing',
    ]);

    // magazine only: the "Members Only" teasers are gated (.cmp-teaser--secure). The
    // source hides their images behind the paywall — only the title, description and a
    // "Read More" affordance show. Our import otherwise emits the teaser image full-width,
    // which doesn't match the source. Remove images inside secure teasers so the migrated
    // gated cards are text-only like the source. Narrow class (no-op on other templates).
    element.querySelectorAll('.cmp-teaser--secure img, .cmp-teaser--secure picture').forEach((el) => el.remove());

    // magazine-article only: the article body repeats the page title as a lower-level
    // heading (an in-article .cmp-title duplicating the H1). The source shows the title
    // only once (as the H1); the duplicate lower heading is chrome/anchor scaffolding.
    // Remove any h2–h4 whose trimmed text exactly matches the page H1 text. Guarded on
    // an exact H1 match so it never touches legitimately repeated section headings.
    const h1 = element.querySelector('h1');
    if (h1) {
      const h1Text = h1.textContent.trim().toLowerCase();
      element.querySelectorAll('h2, h3, h4').forEach((h) => {
        if (h.textContent.trim().toLowerCase() === h1Text) h.remove();
      });
    }
  }
}
