/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-faq.
 * Source: #faq .faq > details (summary = question, remaining nodes = answer).
 * Block: one row per question; cell 1 = question, cell 2 = answer.
 */
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll(':scope > details').forEach((item) => {
    const summary = item.querySelector(':scope > summary');
    const questionText = summary ? summary.textContent.trim() : '';

    const answer = [];
    [...item.childNodes].forEach((node) => {
      if (node === summary) return;
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (text) {
          const p = document.createElement('p');
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
