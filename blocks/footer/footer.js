/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} a container holding the fragment's sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  return container;
}

/**
 * Keeps a copyright line current: the first 4-digit year after "©" becomes this year.
 * @param {Element} root element whose text nodes are checked
 */
function updateCopyrightYear(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const year = String(new Date().getFullYear());
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/©\s*\d{4}/.test(node.textContent)) {
      node.textContent = node.textContent.replace(/(©\s*)\d{4}/, `$1${year}`);
      return;
    }
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const bar = document.createElement('div');
  bar.className = 'footer-bar';
  [...fragment.children].forEach((section, i) => {
    section.classList.add('footer-item', i === 0 ? 'footer-legal' : 'footer-links');
    bar.append(section);
  });
  updateCopyrightYear(bar);
  block.append(bar);
}
