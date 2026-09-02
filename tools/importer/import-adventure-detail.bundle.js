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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-carousel__item--active .cmp-image__image") || element.querySelector(".cmp-carousel__item--active img") || element.querySelector(".cmp-carousel__item .cmp-image__image") || element.querySelector(".cmp-carousel__item img") || element.querySelector(".cmp-image__image") || element.querySelector("img");
    if (!image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([image]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-specs.js
  function parse2(element, { document: document2 }) {
    const specs = Array.from(element.querySelectorAll(".cmp-contentfragment__element"));
    const cells = [];
    specs.forEach((spec) => {
      const labelEl = spec.querySelector(".cmp-contentfragment__element-title, dt");
      const valueEl = spec.querySelector(".cmp-contentfragment__element-value, dd");
      const label = labelEl ? (labelEl.textContent || "").trim() : "";
      const value = valueEl ? (valueEl.textContent || "").trim() : "";
      if (!label && !value) return;
      cells.push([label, value]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-specs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-detail.js
  function parse3(element, { document: document2 }) {
    const tabLabels = Array.from(element.querySelectorAll(".cmp-tabs__tab"));
    const panels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    const cells = [];
    panels.forEach((panel, i) => {
      const label = tabLabels[i] ? (tabLabels[i].textContent || "").trim() : `Tab ${i + 1}`;
      const contentRoot = panel.querySelector(".cmp-contentfragment__elements") || panel.querySelector(".cmp-contentfragment") || panel;
      const contentNodes = [];
      contentRoot.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6, picture, img").forEach((node) => {
        if (node.matches("ol.cmp-tabs__tablist")) return;
        const text = (node.textContent || "").trim();
        const hasMedia = node.tagName === "IMG" || node.tagName === "PICTURE" || node.querySelector("img, picture");
        if (!text && !hasMedia) return;
        contentNodes.push(node);
      });
      const uniqueNodes = contentNodes.filter((node, idx) => !contentNodes.some((other, otherIdx) => otherIdx !== idx && other !== node && other.contains(node)));
      const contentCell = uniqueNodes.length ? uniqueNodes : [contentRoot];
      cells.push([label, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-detail", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    hero: parse,
    "columns-specs": parse2,
    "tabs-detail": parse3
  };
  var PAGE_TEMPLATE = {
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
  var import_adventure_detail_default = {
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
      const metaTable = [...main.querySelectorAll("table")].pop();
      if (metaTable) {
        const row = document2.createElement("tr");
        const k = document2.createElement("td");
        k.textContent = "template";
        const v = document2.createElement("td");
        v.textContent = "adventure-detail";
        row.append(k, v);
        metaTable.append(row);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_adventure_detail_exports);
})();
