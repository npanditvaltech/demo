/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-health-check.
 * Source: section.hero .hero-grid
 *   first child div: h1, p.lead, .actions a.btn (primary) / a.btn.ghost (secondary)
 *   .meter: .meter-head h2 + button#run, .rings .ring (.num, .lbl), p.meter-foot
 * Block rows:
 *   Copy (h1, intro, CTA links) | Panel (title heading, bold run-button label, note)
 *   Metric label | target score   (one row per .ring)
 * Target score: data-score on .ring (live page), else a positive .num value, else 100.
 */
export default function parse(element, { document }) {
  const cells = [];

  const meter = element.querySelector('.meter');
  const copySource = [...element.children].find((child) => child !== meter);

  // Copy cell
  const copy = [];
  if (copySource) {
    [...copySource.children].forEach((child) => {
      if (child.classList.contains('actions')) {
        child.querySelectorAll('a[href]').forEach((link) => {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = link.getAttribute('href');
          a.textContent = link.textContent.trim();
          // bold link = primary button, italic link = secondary button
          const wrap = document.createElement(link.classList.contains('ghost') ? 'em' : 'strong');
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
    // Panel cell
    const panel = [];
    const title = meter.querySelector('.meter-head h1, .meter-head h2, .meter-head h3, h2, h3');
    if (title) panel.push(title);
    const runButton = meter.querySelector('.meter-head button, button');
    if (runButton && runButton.textContent.trim()) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = runButton.textContent.trim();
      p.append(strong);
      panel.push(p);
    }
    meter.querySelectorAll(':scope > p').forEach((p) => {
      if (p.textContent.trim()) panel.push(p);
    });
    cells.push([copy, panel]);

    // Metric rows
    meter.querySelectorAll('.ring').forEach((ring) => {
      const lbl = ring.querySelector('.lbl');
      const label = lbl ? lbl.textContent.trim() : '';
      if (!label) return;
      let score = parseInt(ring.getAttribute('data-score') || '', 10);
      if (Number.isNaN(score)) {
        const num = ring.querySelector('.num');
        const shown = parseInt(num ? num.textContent.trim() : '', 10);
        // .num is the animated display and starts at 0 before the check runs
        score = !Number.isNaN(shown) && shown > 0 ? shown : 100;
      }
      score = Math.max(0, Math.min(100, score));
      cells.push([label, String(score)]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-health-check', cells });
  element.replaceWith(block);
}
