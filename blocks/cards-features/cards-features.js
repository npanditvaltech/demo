import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards Features Block
 * One row per card. Cells hold an optional image and the body
 * (optional eyebrow paragraph, title heading, description).
 * Option `numbered-steps-top-rule` renders the cards as a numbered step sequence.
 */
export default function decorate(block) {
  const numbered = block.classList.contains('numbered-steps-top-rule');
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    const li = document.createElement('li');
    li.className = 'cards-features-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-features-card-image';
      } else if (!div.textContent.trim() && !div.querySelector('picture, img')) {
        div.remove();
      } else {
        div.className = 'cards-features-card-body';
      }
    });

    const body = li.querySelector('.cards-features-card-body');
    if (body) {
      // a short paragraph authored above the title is an eyebrow ("Step 1")
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      const first = body.firstElementChild;
      if (heading && first && first !== heading && first.tagName === 'P') {
        first.classList.add('cards-features-card-eyebrow');
      }
      if (heading) heading.classList.add('cards-features-card-title');
    }

    ul.append(li);
  });

  if (numbered) ul.classList.add('cards-features-steps');

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
