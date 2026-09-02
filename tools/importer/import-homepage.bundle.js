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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!items.length) {
      items = Array.from(element.querySelectorAll(".teaser.cmp-teaser--hero, .cmp-teaser--hero"));
    }
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const contentCell = [];
      const title = item.querySelector(".cmp-teaser__title, .cmp-teaser__content h1, .cmp-teaser__content h2, .cmp-teaser__content h3");
      if (title && title.textContent.trim()) {
        contentCell.push(title);
      }
      const description = item.querySelector('.cmp-teaser__description, [class*="teaser__description"]');
      if (description && description.textContent.trim()) {
        contentCell.push(description);
      }
      const ctaLinks = Array.from(item.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a"));
      ctaLinks.forEach((cta) => {
        if (cta && cta.getAttribute("href")) {
          contentCell.push(cta);
        }
      });
      if (!image && !contentCell.length) return;
      cells.push([image || "", contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document: document2 }) {
    if (element.matches(".cmp-byline") || element.querySelector(".cmp-byline__name")) {
      const byline = element.matches(".cmp-byline") ? element : element.querySelector(".cmp-byline");
      const portrait = byline.querySelector(".cmp-byline__image img, .cmp-image img, img");
      const textCell = [];
      const name = byline.querySelector(".cmp-byline__name, h1, h2, h3");
      if (name && name.textContent.trim()) {
        textCell.push(name);
      }
      const occupation = byline.querySelector(".cmp-byline__occupations, p");
      if (occupation && occupation.textContent.trim()) {
        textCell.push(occupation);
      }
      let shareScope = byline.querySelector('.cmp-buildingblock--btn-list, [class*="btn-list"], [class*="sharing"]');
      if (!shareScope) {
        const searchRoots = [byline.parentElement, element.parentElement].filter(Boolean);
        for (const root of searchRoots) {
          shareScope = root.querySelector('.cmp-buildingblock--btn-list, [class*="btn-list"]');
          if (shareScope) break;
        }
      }
      if (shareScope) {
        const shareLinks = Array.from(shareScope.querySelectorAll("a[href]"));
        shareLinks.forEach((a) => {
          const label = a.textContent.trim();
          const href = a.getAttribute("href");
          if (!label || !href) return;
          const link = document2.createElement("a");
          link.setAttribute("href", href);
          link.textContent = label;
          const p = document2.createElement("p");
          p.appendChild(link);
          textCell.push(p);
        });
      }
      if (!portrait && !textCell.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const bylineCells = [[portrait || "", textCell.length ? textCell : ""]];
      const bylineBlock = WebImporter.Blocks.createBlock(document2, { name: "columns", cells: bylineCells });
      element.replaceWith(bylineBlock);
      return;
    }
    if (element.matches(".cmp-teaser--secure") || element.classList.contains("cmp-teaser--secure")) {
      const parent = element.parentElement || element;
      const teasers = Array.from(parent.querySelectorAll(".cmp-teaser--secure"));
      const scope = teasers.length ? teasers : [element];
      const cellForTeaser = (teaser) => {
        const parts = [];
        const img = teaser.querySelector(".cmp-teaser__image img, .cmp-image img, img");
        if (img) parts.push(img);
        const title2 = teaser.querySelector(".cmp-teaser__title, h2, h3");
        if (title2 && title2.textContent.trim()) parts.push(title2);
        const desc = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
        if (desc && desc.textContent.trim()) parts.push(desc);
        const action = teaser.querySelector('.cmp-teaser__action-link, [class*="action"] a, [class*="action"]');
        if (action && action.textContent.trim()) {
          const p = document2.createElement("p");
          const href = action.getAttribute && action.getAttribute("href");
          if (href) {
            const a = document2.createElement("a");
            a.setAttribute("href", href);
            a.textContent = action.textContent.trim();
            p.appendChild(a);
          } else {
            p.textContent = action.textContent.trim();
          }
          parts.push(p);
        }
        return parts.length ? parts : "";
      };
      const secureCells = [scope.map(cellForTeaser)];
      const secureBlock = WebImporter.Blocks.createBlock(document2, { name: "columns", cells: secureCells });
      const first = scope[0];
      first.replaceWith(secureBlock);
      scope.slice(1).forEach((t) => t.remove());
      return;
    }
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const bodyContent = [];
    const pretitle = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
    if (pretitle && pretitle.textContent.trim()) {
      const eyebrow = document2.createElement("p");
      eyebrow.textContent = pretitle.textContent.trim();
      bodyContent.push(eyebrow);
    }
    const title = element.querySelector('.cmp-teaser__title, [class*="title"] h1, [class*="title"] h2, h1, h2, h3');
    if (title && title.textContent.trim()) {
      bodyContent.push(title);
    }
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    if (description && description.textContent.trim()) {
      bodyContent.push(description);
    }
    const cta = element.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]');
    if (cta && cta.getAttribute("href") && cta.textContent.trim()) {
      const link = document2.createElement("a");
      link.setAttribute("href", cta.getAttribute("href"));
      link.textContent = cta.textContent.trim();
      const p = document2.createElement("p");
      p.appendChild(link);
      bodyContent.push(p);
    }
    if (!image && !bodyContent.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", bodyContent.length ? bodyContent : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-intro.js
  function parse3(element, { document: document2 }) {
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
  function parse4(element, { document: document2 }) {
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
      WebImporter.DOMUtils.remove(element, [
        "div.sharing"
      ]);
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (!href) return;
        if (/^\/[^?#]*\.html(?=$|[?#])/.test(href)) {
          a.setAttribute("href", href.replace(/\.html(?=$|[?#])/, ""));
        }
      });
      const h1 = element.querySelector("h1");
      if (h1) {
        const h1Text = h1.textContent.trim().toLowerCase();
        element.querySelectorAll("h2, h3, h4").forEach((h) => {
          if (h.textContent.trim().toLowerCase() === h1Text) h.remove();
        });
      }
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

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    columns: parse2,
    "columns-intro": parse3,
    cards: parse4
  };
  var PAGE_TEMPLATE = {
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
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
