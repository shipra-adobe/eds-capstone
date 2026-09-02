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
  }
}
