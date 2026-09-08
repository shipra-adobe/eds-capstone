/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine',
  description: 'Magazine index: page title, featured article teaser, article listing grid',
  urls: [
    'https://wknd.site/us/en/magazine.html',
  ],
  blocks: [
    {
      name: 'columns',
      instances: ['div.teaser.cmp-teaser--featured', 'div.teaser.cmp-teaser--secure'],
    },
    {
      name: 'cards',
      instances: ['div.image-list.list'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Page Title',
      selector: 'div.title.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)',
      style: null,
      blocks: [],
      defaultContent: ['div.title.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)'],
    },
    {
      id: 'rc2',
      name: 'Featured Article',
      selector: 'div.teaser.cmp-teaser--featured.aem-GridColumn.aem-GridColumn--default--12',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'All Articles Heading',
      selector: 'div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)',
      style: null,
      blocks: [],
      defaultContent: ['div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)'],
    },
    {
      id: 'rc4',
      name: 'Article Grid',
      selector: 'div.image-list.list.aem-GridColumn.aem-GridColumn--default--12',
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'Members Only Heading',
      selector: 'div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)',
      style: null,
      blocks: [],
      defaultContent: ['div.title.cmp-title--underline.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)'],
    },
    {
      id: 'rc6',
      name: 'Members CTA',
      selector: 'div.text.aem-GridColumn.aem-GridColumn--default--12',
      style: null,
      blocks: [],
      defaultContent: ['div.text.aem-GridColumn.aem-GridColumn--default--12'],
    },
    {
      id: 'rc7',
      name: 'Separator',
      selector: 'div.separator.cmp-separator--space-medium.aem-GridColumn.aem-GridColumn--default--12',
      style: null,
      blocks: [],
      defaultContent: ['div.separator.cmp-separator--space-medium.aem-GridColumn.aem-GridColumn--default--12'],
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
