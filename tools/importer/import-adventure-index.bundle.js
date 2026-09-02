/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventure-index.js
  var import_adventure_index_exports = {};
  __export(import_adventure_index_exports, {
    default: () => import_adventure_index_default
  });

  // tools/importer/parsers/columns-intro.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img");
    const bodyContent = [];
    const title = element.querySelector(".cmp-teaser__title, .cmp-teaser__content h1, .cmp-teaser__content h2, .cmp-teaser__content h3");
    if (title && title.textContent.trim()) {
      bodyContent.push(title);
    }
    const description = element.querySelector('.cmp-teaser__description, [class*="teaser__description"]');
    if (description && description.textContent.trim()) {
      bodyContent.push(description);
    }
    if (!image && !bodyContent.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", bodyContent.length ? bodyContent : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  var CONTRIBUTOR_SELECTOR = ".experiencefragment.cmp-experience-fragment--contributor";
  var IMAGE_LIST_ITEM_SELECTOR = ".cmp-image-list__item";
  function parse2(element, { document: document2 }) {
    const isImageList = !element.matches(CONTRIBUTOR_SELECTOR) && (element.matches(".image-list, .cmp-image-list") || !!element.querySelector(".cmp-image-list, .cmp-image-list__item"));
    if (isImageList) {
      handleImageList(element, document2);
      return;
    }
    handleContributors(element, document2);
  }
  function handleImageList(element, document2) {
    const items = Array.from(element.querySelectorAll(IMAGE_LIST_ITEM_SELECTOR));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const bodyContent = [];
      const titleLink = item.querySelector('.cmp-image-list__item-title-link, a[class*="title-link"]');
      const titleText = item.querySelector('.cmp-image-list__item-title, [class*="item-title"]');
      const titleLabel = titleText || titleLink;
      if (titleLabel && titleLabel.textContent.trim()) {
        const heading = document2.createElement("h3");
        const href = titleLink && titleLink.getAttribute("href");
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleLabel.textContent.trim();
          heading.appendChild(a);
        } else {
          heading.textContent = titleLabel.textContent.trim();
        }
        bodyContent.push(heading);
      }
      const description = item.querySelector('.cmp-image-list__item-description, [class*="item-description"]');
      if (description && description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        bodyContent.push(p);
      }
      if (!image && !bodyContent.length) return;
      cells.push([image || "", bodyContent.length ? bodyContent : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards (articles)", cells });
    element.replaceWith(block);
  }
  function handleContributors(element, document2) {
    const CARD_SELECTOR = CONTRIBUTOR_SELECTOR;
    if (!element.parentElement) return;
    const prevSibling = element.previousElementSibling;
    if (prevSibling && prevSibling.matches(CARD_SELECTOR)) return;
    const groupCards = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(CARD_SELECTOR)) {
      groupCards.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    groupCards.forEach((card) => {
      const image = card.querySelector(".cmp-image img, img");
      const bodyContent = [];
      const name = card.querySelector(".title .cmp-title__text, .cmp-title__text, h1, h2, h3, h4, h5, h6");
      if (name) {
        bodyContent.push(name);
      }
      const titleTexts = Array.from(card.querySelectorAll(".title .cmp-title__text"));
      const role = titleTexts.find((el) => el !== name);
      if (role) {
        const roleP = document2.createElement("p");
        roleP.textContent = role.textContent.trim();
        bodyContent.push(roleP);
      }
      const socialLinks = Array.from(card.querySelectorAll("a.cmp-button, .cmp-buildingblock--btn-list a, .button a"));
      socialLinks.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        const label = anchor.textContent.trim();
        if (!href || !label) return;
        const link = document2.createElement("a");
        link.setAttribute("href", href);
        link.textContent = label;
        const p = document2.createElement("p");
        p.appendChild(link);
        bodyContent.push(p);
      });
      const imageCell = image || "";
      const bodyCell = bodyContent.length ? bodyContent : "";
      cells.push([imageCell, bodyCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
    groupCards.slice(1).forEach((card) => card.remove());
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "#toggleNav",
        "#mobileNav"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "ol.cmp-tabs__tablist",
        ".cmp-tabs__tabpanel:not(.cmp-tabs__tabpanel--active)"
      ]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-adventure-index.js
  var parsers = {
    "columns-intro": parse,
    cards: parse2
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_adventure_index_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{ element: main, path, report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_adventure_index_exports);
})();
