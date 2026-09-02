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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
  });

  // tools/importer/parsers/columns.js
  function parse(element, { document: document2 }) {
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

  // tools/importer/import-magazine-article.js
  var parsers = {
    columns: parse
  };
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    description: "WKND magazine article-detail page: lead image, breadcrumb, long-form editorial body (headings, prose, pull-quote, inline images), author byline (columns), and related-articles sidebar.",
    urls: [
      "https://wknd.site/us/en/magazine/arctic-surfing.html"
    ],
    blocks: [
      {
        name: "columns",
        instances: [".cmp-byline"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Lead Image",
        selector: "div.image.aem-GridColumn--default--12",
        style: null,
        blocks: [],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Breadcrumb + Article",
        selector: "div.breadcrumb.aem-GridColumn",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Story Sidebar",
        selector: "aside.cmp-layoutcontainer--sidebar",
        style: null,
        blocks: [],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_magazine_article_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
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
      const table = [...main.querySelectorAll("table")].pop();
      if (table) {
        const row = document2.createElement("tr");
        const keyCell = document2.createElement("td");
        keyCell.textContent = "template";
        const valCell = document2.createElement("td");
        valCell.textContent = "magazine-article";
        row.append(keyCell, valCell);
        table.append(row);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_magazine_article_exports);
})();
