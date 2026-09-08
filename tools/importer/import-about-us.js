/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: 'About Us page: page title, contributor card grid, guides card grid',
  urls: [
    'https://wknd.site/us/en/about-us.html',
  ],
  blocks: [
    {
      name: 'cards',
      instances: ['.experiencefragment.cmp-experience-fragment--contributor'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Page Title',
      selector: 'body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.cmp-layout-container--fixed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--tablet--12.aem-Grid--default--12.aem-Grid--phone--12 > div.title.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)',
      style: null,
      blocks: [],
      defaultContent: ['div.title.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)'],
    },
    {
      id: 'rc2',
      name: 'Our Contributors Heading',
      selector: 'div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2)',
      style: null,
      blocks: [],
      defaultContent: ['div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2)'],
    },
    {
      id: 'rc3',
      name: 'Contributors',
      selector: 'div.text.cmp-text--font-small.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['div.text.cmp-text--font-small.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)'],
    },
    {
      id: 'rc4',
      name: 'WKND Guides Heading',
      selector: 'div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)',
      style: null,
      blocks: [],
      defaultContent: ['div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)'],
    },
    {
      id: 'rc5',
      name: 'Guides',
      selector: 'div.text.cmp-text--font-small.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['div.text.cmp-text--font-small.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections after (only if 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized document path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
