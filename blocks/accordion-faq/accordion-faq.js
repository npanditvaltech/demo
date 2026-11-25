/*
 * Accordion FAQ Block
 * Collapsible question/answer rows. One row per item:
 * cell 1 = question, cell 2 = answer (or a single link to a /fragments/ page).
 */

// eslint-disable-next-line import/no-cycle
import { loadFragment } from '../fragment/fragment.js';

/**
 * If the answer cell holds only a link to a same-site fragment, load it.
 * @param {Element} body The answer cell
 */
async function maybeLoadFragment(body) {
  const links = body.querySelectorAll('a[href]');
  if (links.length !== 1) return;
  const link = links[0];
  if (body.textContent.trim() !== link.textContent.trim()) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.includes('/fragments/')) return;
  const fragment = await loadFragment(url.pathname);
  if (fragment) body.replaceChildren(...fragment.childNodes);
}

export default async function decorate(block) {
  const pending = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || !row.textContent.trim()) {
      row.remove();
      return;
    }

    const label = cells[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    // unwrap a lone heading/paragraph so the summary holds inline content
    const only = label.children.length === 1 ? label.firstElementChild : null;
    if (only && /^(P|H[1-6])$/.test(only.tagName)) {
      summary.append(...only.childNodes);
    } else {
      summary.append(...label.childNodes);
    }

    const body = cells[1] || document.createElement('div');
    body.className = 'accordion-faq-item-body';
    // fold any extra authored cells into the answer
    cells.slice(2).forEach((extra) => body.append(...extra.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);

    pending.push(maybeLoadFragment(body));
  });

  await Promise.all(pending);
}
