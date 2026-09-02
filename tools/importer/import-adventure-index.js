/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsIntroParser from "./parsers/columns-intro.js";
import cardsParser from "./parsers/cards.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

// PARSER REGISTRY
const parsers = {
  "columns-intro": columnsIntroParser,
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
    "name": "adventure-index",
    "description": "Adventures index: page title, hero teaser with intro panel, filterable adventure card grid",
    "urls": [
      "https://wknd.site/us/en/adventures.html"
    ],
    "blocks": [
      {
        "name": "columns-intro",
        "instances": [
          "div.teaser.cmp-teaser--hero"
        ]
      },
      {
        "name": "cards",
        "instances": [
          ".cmp-tabs__tabpanel--active .image-list.list"
        ],
        "section": "articles"
      }
    ],
    "sections": [
      {
        "id": "sec1",
        "name": "Page Title",
        "selector": "main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)",
        "style": null,
        "blocks": [],
        "defaultContent": [
          "main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)"
        ]
      },
      {
        "id": "sec2",
        "name": "Hero Teaser",
        "selector": "div.teaser.cmp-teaser--hero.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "columns-intro"
        ],
        "defaultContent": []
      },
      {
        "id": "sec3",
        "name": "Current Adventures Heading",
        "selector": "div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [],
        "defaultContent": [
          "div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        "id": "sec4",
        "name": "Adventure Grid",
        "selector": "div.tabs.panelcontainer.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "cards"
        ],
        "defaultContent": []
      },
      {
        "id": "sec5",
        "name": "Separator",
        "selector": "div.separator.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [],
        "defaultContent": [
          "div.separator.aem-GridColumn.aem-GridColumn--default--12"
        ]
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

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
