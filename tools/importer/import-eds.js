/* eslint-disable */
/* global WebImporter */

import accordionFaqParser from './parsers/accordion-faq.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import contactFormParser from './parsers/contact-form.js';
import heroHealthCheckParser from './parsers/hero-health-check.js';
import cleanupTransformer from './transformers/eds-cleanup.js';
import sectionsTransformer from './transformers/eds-sections.js';

const PAGE_TEMPLATE = {
  name: 'eds',
  urls: [
    'https://npanditvaltech.github.io/eds/',
  ],
  representativeUrl: 'https://npanditvaltech.github.io/eds/',
  description: 'Single-page marketing home page: health-check hero, feature strip, how-it-works steps, FAQ and contact form',
  blocks: [
    {
      name: 'hero-health-check',
      instances: [
        'section.hero .hero-grid',
      ],
    },
    {
      name: 'cards-features',
      instances: [
        '#features .features',
        '#how ol.steps',
      ],
    },
    {
      name: 'accordion-faq',
      instances: [
        '#faq .faq',
      ],
    },
    {
      name: 'contact-form',
      instances: [
        '#contact .contact-grid',
      ],
    },
  ],
  urlPattern: '/*',
  sections: [
    {
      id: 'rc2',
      name: 'hero',
      selector: ['section.hero'],
      style: null,
      blocks: ['hero-health-check'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'features',
      selector: ['section#features'],
      style: null,
      blocks: ['cards-features'],
      defaultContent: ['#features .sec-head'],
    },
    {
      id: 'rc4',
      name: 'how-it-works',
      selector: ['section#how'],
      style: null,
      blocks: ['cards-features'],
      defaultContent: ['#how .sec-head'],
    },
    {
      id: 'rc5',
      name: 'faq',
      selector: ['section#faq'],
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: ['#faq .sec-head'],
    },
    {
      id: 'rc6',
      name: 'contact',
      selector: ['section#contact'],
      style: null,
      blocks: ['contact-form'],
      defaultContent: [],
    },
  ],
};

const parsers = {
  'accordion-faq': accordionFaqParser,
  'cards-features': cardsFeaturesParser,
  'contact-form': contactFormParser,
  'hero-health-check': heroHealthCheckParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections ({sitename}-page-corrections.js, when it exists) run last.
const correctionTransformers = [];
const transformers = [cleanupTransformer, ...lateTransformers, ...correctionTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
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

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    // The source site lives under /eds/, which is this site's root: /eds/ becomes the home page
    // (/index). A path ending in a slash is that folder's index page.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/^\/eds(?=\/|$)/, '')
      .replace(/\/$/, '/index')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
