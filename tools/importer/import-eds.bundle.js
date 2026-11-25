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

  // tools/importer/import-eds.js
  var import_eds_exports = {};
  __export(import_eds_exports, {
    default: () => import_eds_default
  });

  // tools/importer/parsers/accordion-faq.js
  function parse(element, { document: document2 }) {
    const cells = [];
    element.querySelectorAll(":scope > details").forEach((item) => {
      const summary = item.querySelector(":scope > summary");
      const questionText = summary ? summary.textContent.trim() : "";
      const answer = [];
      [...item.childNodes].forEach((node) => {
        if (node === summary) return;
        if (node.nodeType === 3) {
          const text = node.textContent.trim();
          if (text) {
            const p = document2.createElement("p");
            p.textContent = text;
            answer.push(p);
          }
          return;
        }
        if (node.nodeType === 1) answer.push(node);
      });
      if (!questionText && !answer.length) return;
      cells.push([questionText, answer]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-features.js
  function parse2(element, { document: document2 }) {
    const isSteps = element.matches("ol, ul") || element.classList.contains("steps");
    const items = isSteps ? [...element.querySelectorAll(":scope > li")] : [...element.querySelectorAll(":scope > .feature")];
    const cells = [];
    items.forEach((item, index) => {
      const content = [];
      if (isSteps) {
        const eyebrow = document2.createElement("p");
        eyebrow.textContent = `Step ${index + 1}`;
        content.push(eyebrow);
      }
      [...item.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector("img, picture")) content.push(child);
      });
      if (!content.length) return;
      cells.push([content]);
    });
    const name = isSteps ? "cards-features (numbered-steps-top-rule)" : "cards-features";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/contact-form.js
  function fieldType(control, labelText) {
    if (!control) return "text";
    const tag = control.tagName.toLowerCase();
    if (tag === "textarea") return "textarea";
    if (tag === "select") return "select";
    const declared = (control.getAttribute("type") || "").toLowerCase();
    if (["email", "tel", "url", "number", "checkbox"].includes(declared)) return declared;
    const hint = `${control.id || ""} ${control.getAttribute("name") || ""} ${labelText}`.toLowerCase();
    if (/e-?mail/.test(hint)) return "email";
    if (/phone|tel\b/.test(hint)) return "tel";
    return "text";
  }
  function parse3(element, { document: document2 }) {
    const cells = [];
    const intro = element.querySelector(".sec-head");
    if (intro) {
      const introContent = [...intro.children].filter((el) => el.textContent.trim());
      cells.push([introContent, "", ""]);
    }
    const form = element.querySelector("form");
    if (form) {
      form.querySelectorAll("label").forEach((label) => {
        const labelText = label.textContent.trim();
        if (!labelText) return;
        const wrapper = label.parentElement;
        const forId = label.getAttribute("for");
        const control = forId && form.querySelector(`#${CSS.escape(forId)}`) || wrapper && wrapper.querySelector("input, textarea, select");
        if (control && (control.getAttribute("type") || "").toLowerCase() === "hidden") return;
        const type = fieldType(control, labelText);
        const required = control && (control.hasAttribute("required") || wrapper && wrapper.querySelector(".err"));
        let extra = required ? "required" : "";
        if (type === "select" && control) {
          extra = [...control.querySelectorAll("option")].map((o) => o.textContent.trim()).filter(Boolean).join(", ");
        }
        cells.push([labelText, type, extra]);
      });
      const button = form.querySelector('button, input[type="submit"]');
      const buttonLabel = button ? (button.textContent.trim() || button.getAttribute("value") || "").trim() : "";
      cells.push([buttonLabel || "Submit", "submit", ""]);
      const status = form.querySelector(".status");
      const successText = status ? status.textContent.trim() : "";
      if (successText) cells.push(["success", successText, ""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "contact-form", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-health-check.js
  function parse4(element, { document: document2 }) {
    const cells = [];
    const meter = element.querySelector(".meter");
    const copySource = [...element.children].find((child) => child !== meter);
    const copy = [];
    if (copySource) {
      [...copySource.children].forEach((child) => {
        if (child.classList.contains("actions")) {
          child.querySelectorAll("a[href]").forEach((link) => {
            const p = document2.createElement("p");
            const a = document2.createElement("a");
            a.href = link.getAttribute("href");
            a.textContent = link.textContent.trim();
            const wrap = document2.createElement(link.classList.contains("ghost") ? "em" : "strong");
            wrap.append(a);
            p.append(wrap);
            copy.push(p);
          });
        } else if (child.textContent.trim()) {
          copy.push(child);
        }
      });
    }
    if (!meter) {
      cells.push([copy]);
    } else {
      const panel = [];
      const title = meter.querySelector(".meter-head h1, .meter-head h2, .meter-head h3, h2, h3");
      if (title) panel.push(title);
      const runButton = meter.querySelector(".meter-head button, button");
      if (runButton && runButton.textContent.trim()) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = runButton.textContent.trim();
        p.append(strong);
        panel.push(p);
      }
      meter.querySelectorAll(":scope > p").forEach((p) => {
        if (p.textContent.trim()) panel.push(p);
      });
      cells.push([copy, panel]);
      meter.querySelectorAll(".ring").forEach((ring) => {
        const lbl = ring.querySelector(".lbl");
        const label = lbl ? lbl.textContent.trim() : "";
        if (!label) return;
        let score = parseInt(ring.getAttribute("data-score") || "", 10);
        if (Number.isNaN(score)) {
          const num = ring.querySelector(".num");
          const shown = parseInt(num ? num.textContent.trim() : "", 10);
          score = !Number.isNaN(shown) && shown > 0 ? shown : 100;
        }
        score = Math.max(0, Math.min(100, score));
        cells.push([label, String(score)]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-health-check", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/eds-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "noscript",
        "style",
        "link"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "a.skip",
        "header.site",
        "footer",
        "main > #top",
        "script",
        "noscript",
        "style",
        "link",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/eds-sections.js
  var MARKER = "data-excat-section-id";
  function findSection(element, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = element.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, section);
        if (!el || !el.parentNode) continue;
        if (i > 0 || section.style) {
          const hr = doc.createElement("hr");
          if (section.style || i === 0) hr.setAttribute(MARKER, section.id);
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (section.style) {
          const meta = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          let anchor = null;
          if (marker) {
            let n = marker.nextElementSibling;
            while (n && n.tagName !== "HR") n = n.nextElementSibling;
            anchor = n;
            if (anchor) anchor.parentNode.insertBefore(meta, anchor);
            else marker.parentNode.appendChild(meta);
          } else {
            const el = findSection(element, section);
            if (el && el.parentNode) el.parentNode.insertBefore(meta, el.nextSibling);
          }
        }
        if (marker) {
          if (i === 0) marker.remove();
          else marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/import-eds.js
  var PAGE_TEMPLATE = {
    name: "eds",
    urls: [
      "https://npanditvaltech.github.io/eds/"
    ],
    representativeUrl: "https://npanditvaltech.github.io/eds/",
    description: "Single-page marketing home page: health-check hero, feature strip, how-it-works steps, FAQ and contact form",
    blocks: [
      {
        name: "hero-health-check",
        instances: [
          "section.hero .hero-grid"
        ]
      },
      {
        name: "cards-features",
        instances: [
          "#features .features",
          "#how ol.steps"
        ]
      },
      {
        name: "accordion-faq",
        instances: [
          "#faq .faq"
        ]
      },
      {
        name: "contact-form",
        instances: [
          "#contact .contact-grid"
        ]
      }
    ],
    urlPattern: "/*",
    sections: [
      {
        id: "rc2",
        name: "hero",
        selector: ["section.hero"],
        style: null,
        blocks: ["hero-health-check"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "features",
        selector: ["section#features"],
        style: null,
        blocks: ["cards-features"],
        defaultContent: ["#features .sec-head"]
      },
      {
        id: "rc4",
        name: "how-it-works",
        selector: ["section#how"],
        style: null,
        blocks: ["cards-features"],
        defaultContent: ["#how .sec-head"]
      },
      {
        id: "rc5",
        name: "faq",
        selector: ["section#faq"],
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: ["#faq .sec-head"]
      },
      {
        id: "rc6",
        name: "contact",
        selector: ["section#contact"],
        style: null,
        blocks: ["contact-form"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "accordion-faq": parse,
    "cards-features": parse2,
    "contact-form": parse3,
    "hero-health-check": parse4
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, ...lateTransformers, ...correctionTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document2.querySelectorAll(selector);
      } catch (e) {
        return;
      }
      matches.forEach((element) => {
        if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    };
    template.blocks.forEach((blockDef) => {
      const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
      (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
    });
    template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
    return pageBlocks;
  }
  function markPageTargets(payload) {
    const { document: document2, params } = payload;
    executeTransformers("beforeTransform", document2.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document2.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_eds_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document2.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document2);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/^\/eds(?=\/|$)/, "").replace(/\/$/, "/index").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_eds_exports);
})();
