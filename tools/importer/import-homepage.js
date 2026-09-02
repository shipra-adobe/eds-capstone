/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from "./parsers/carousel-hero.js";
import columnsParser from "./parsers/columns.js";
import columnsIntroParser from "./parsers/columns-intro.js";
import cardsParser from "./parsers/cards.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

// PARSER REGISTRY
const parsers = {
  "carousel-hero": carouselHeroParser,
  columns: columnsParser,
  "columns-intro": columnsIntroParser,
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
    "name": "homepage",
    "description": "Homepage: hero carousel, featured article, recent articles grid, next adventures teaser, adventures grid",
    "urls": [
      "https://wknd.site/us/en.html"
    ],
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          "div.carousel.cmp-carousel--hero"
        ]
      },
      {
        "name": "columns",
        "instances": [
          "div.teaser.cmp-teaser--featured"
        ]
      },
      {
        "name": "columns-intro",
        "instances": [
          "div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom"
        ]
      },
      {
        "name": "cards",
        "instances": [
          "div.image-list.list"
        ],
        "section": "articles"
      }
    ],
    "sections": [
      {
        "id": "sec1",
        "name": "Hero Carousel",
        "selector": "div.carousel.panelcontainer.cmp-carousel--hero.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "sec2",
        "name": "Featured Article",
        "selector": "div.teaser.cmp-teaser--featured.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "columns"
        ],
        "defaultContent": []
      },
      {
        "id": "sec3",
        "name": "Recent Articles",
        "selector": "main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)",
        "style": null,
        "blocks": [
          "cards"
        ],
        "defaultContent": []
      },
      {
        "id": "sec4",
        "name": "Next Adventures",
        "selector": "div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom.aem-GridColumn.aem-GridColumn--default--12",
        "style": null,
        "blocks": [
          "columns-intro"
        ],
        "defaultContent": []
      },
      {
        "id": "sec5",
        "name": "Where To Go",
        "selector": "main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2)",
        "style": null,
        "blocks": [
          "cards"
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

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
