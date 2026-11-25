/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-features.
 * Two source shapes handled by one parser:
 *  - #features .features > .feature (h3 + p)      -> 'cards-features'
 *  - #how ol.steps > li (h3 + p, CSS-counter number) -> 'cards-features (numbered-steps-top-rule)'
 *    The step number is drawn by a CSS counter in the source, so a
 *    'Step N' eyebrow paragraph is added before the heading.
 * Block: one row per card, one cell (optional eyebrow, heading, description).
 */
export default function parse(element, { document }) {
  const isSteps = element.matches('ol, ul') || element.classList.contains('steps');
  const items = isSteps
    ? [...element.querySelectorAll(':scope > li')]
    : [...element.querySelectorAll(':scope > .feature')];

  const cells = [];
  items.forEach((item, index) => {
    const content = [];
    if (isSteps) {
      const eyebrow = document.createElement('p');
      eyebrow.textContent = `Step ${index + 1}`;
      content.push(eyebrow);
    }
    [...item.children].forEach((child) => {
      if (child.textContent.trim() || child.querySelector('img, picture')) content.push(child);
    });
    if (!content.length) return;
    cells.push([content]);
  });

  const name = isSteps ? 'cards-features (numbered-steps-top-rule)' : 'cards-features';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
