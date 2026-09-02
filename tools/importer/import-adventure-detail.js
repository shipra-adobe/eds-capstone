/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from "./parsers/hero.js";
import columnsSpecsParser from "./parsers/columns-specs.js";
import tabsDetailParser from "./parsers/tabs-detail.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  "columns-specs": columnsSpecsParser,
  "tabs-detail": tabsDetailParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
    "name": "adventure-detail",
    "description": "Adventure detail: breadcrumb, hero image, spec sidebar, tabbed content",
    "urls": [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html",
      "https://wknd.site/us/en/adventures/beervana-portland.html",
      "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
      "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
      "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
      "https://wknd.site/us/en/adventures/cycling-tuscany.html",
      "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
      "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
      "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
      "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
      "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
      "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
      "https://wknd.site/us/en/adventures/tahoe-skiing.html",
      "https://wknd.site/us/en/adventures/west-coast-cycling.html",
      "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
      "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
    ],
    "blocks": [
      {
        "name": "hero",
        "instances": [
          "div.carousel.panelcontainer.cmp-carousel--mini"
        ]
      },
      {
        "name": "columns-specs",
        "instances": [
          "div.contentfragment.cmp-contentfragment--elements"
        ]
      },
      {
        "name": "tabs-detail",
        "instances": [
          "div.tabs.panelcontainer"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "Breadcrumb",
        "selector": "div.breadcrumb.cmp-breadcrumb--fixed.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [],
        "defaultContent": [
          "div.breadcrumb.cmp-breadcrumb--fixed.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        "id": "rc2",
        "name": "Hero",
        "selector": "div.carousel.panelcontainer.cmp-carousel--mini.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "hero"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Adventure Detail",
        "selector": "main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "columns-specs",
          "tabs-detail"
        ],
        "defaultContent": []
      }
    ]
  };

// TRANSFORMER REGISTRY - cleanup first, sections after (only if 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try { transformerFn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers("beforeTransform", main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers("afterTransform", main, payload);

    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
