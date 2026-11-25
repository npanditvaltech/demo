// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');
const THEME_KEY = 'eds-theme';

const ICONS = {
  theme: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
};

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} a container holding the fragment's sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  return container;
}

function isDark() {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme) return theme === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Builds the theme toggle. Labels come from the nav fragment's tools section.
 * @param {string[]} labels [label to switch to dark, label to switch to light]
 */
function buildThemeToggle(labels) {
  const [toDark = 'Switch to dark theme', toLight = 'Switch to light theme'] = labels;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-icon-button nav-theme';
  button.innerHTML = ICONS.theme;
  const sync = () => button.setAttribute('aria-label', isDark() ? toLight : toDark);
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) {
    // storage unavailable: follow the system theme
  }
  sync();
  button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      // storage unavailable: the choice lasts for this page view
    }
    sync();
  });
  return button;
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav the header bar element
 * @param {boolean} open whether the menu should be open
 */
function setMenu(nav, open) {
  const button = nav.querySelector('.nav-hamburger');
  const expanded = open && !isDesktop.matches;
  nav.classList.toggle('is-open', expanded);
  if (button) {
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  }
}

/**
 * Marks the nav link whose target section is in view (aria-current).
 * @param {Element[]} links in-page anchor links
 */
function highlightCurrent(links) {
  if (!('IntersectionObserver' in window)) return;
  const targets = links
    .map((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      const el = id && document.getElementById(id);
      return el ? { link, section: el.closest('.section') || el } : null;
    })
    .filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      targets.forEach(({ link, section }) => {
        link.setAttribute('aria-current', String(section === entry.target));
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  targets.forEach(({ section }) => observer.observe(section));
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const [brandSrc, sectionsSrc, toolsSrc] = [...fragment.children];

  // the bar holds brand, the main nav landmark (links only, as on the source) and tools
  const nav = document.createElement('div');
  nav.className = 'nav-bar';

  // brand
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandLink = brandSrc?.querySelector('a');
  if (brandLink) {
    brandLink.className = 'nav-logo';
    if (!brandLink.getAttribute('aria-label')) brandLink.setAttribute('aria-label', `${brandLink.textContent.trim()} home`);
    brand.append(brandLink);
  }

  // in-page links
  const sections = document.createElement('nav');
  sections.className = 'nav-sections';
  sections.id = 'nav';
  sections.setAttribute('aria-label', 'Main');
  const list = sectionsSrc?.querySelector('ul');
  if (list) sections.append(list);
  const links = [...sections.querySelectorAll('a')];
  links.forEach((link) => link.addEventListener('click', () => setMenu(nav, false)));

  // tools: theme toggle + mobile menu button
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const labels = [...(toolsSrc?.querySelectorAll('li, p') || [])].map((el) => el.textContent.trim());
  tools.append(buildThemeToggle(labels));
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-icon-button nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.innerHTML = ICONS.menu;
  hamburger.addEventListener('click', () => setMenu(nav, !nav.classList.contains('is-open')));
  tools.append(hamburger);

  nav.append(brand, sections, tools);
  setMenu(nav, false);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(nav, false);
      hamburger.focus();
    }
  });
  // close the mobile menu when the viewport crosses into desktop
  isDesktop.addEventListener('change', () => setMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  highlightCurrent(links);
}
