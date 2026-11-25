/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for https://npanditvaltech.github.io/eds/
 * Inserts section breaks (<hr>) between template sections in beforeTransform
 * (while parser targets still exist) and adds Section Metadata for styled
 * sections in afterTransform.
 */
const MARKER = 'data-excat-section-id';

function findSection(element, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = element.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (!el || !el.parentNode) continue;
      if (i > 0 || section.style) {
        const hr = doc.createElement('hr');
        if (section.style || i === 0) hr.setAttribute(MARKER, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (section.style) {
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        // Place metadata at the end of the section: before the next break.
        let anchor = null;
        if (marker) {
          let n = marker.nextElementSibling;
          while (n && n.tagName !== 'HR') n = n.nextElementSibling;
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
