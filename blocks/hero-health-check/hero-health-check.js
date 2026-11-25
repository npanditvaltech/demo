/*
 * Hero Health Check Block
 *
 * Authoring:
 *   Row 1: Copy (heading, text, CTA links) | Panel (title heading, run-button label
 *          as a bold paragraph, note paragraph)
 *   Rows 2+: Metric label | target score (0-100)
 * The panel renders one circular gauge per metric; pressing the run button
 * animates every gauge from 0 to its target score.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

function createGauge(label, target) {
  const item = document.createElement('li');
  item.className = 'hero-health-check-metric';

  const gauge = document.createElement('div');
  gauge.className = 'hero-health-check-gauge';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 88 88');
  svg.setAttribute('aria-hidden', 'true');
  ['track', 'progress'].forEach((part) => {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('class', `hero-health-check-gauge-${part}`);
    circle.setAttribute('cx', '44');
    circle.setAttribute('cy', '44');
    circle.setAttribute('r', '38');
    circle.setAttribute('pathLength', '100');
    svg.append(circle);
  });

  const value = document.createElement('span');
  value.className = 'hero-health-check-gauge-value';
  value.textContent = '0';
  gauge.append(svg, value);

  const name = document.createElement('span');
  name.className = 'hero-health-check-metric-label';
  name.textContent = label;

  item.append(gauge, name);
  item.dataset.target = String(target);
  item.style.setProperty('--score', '0');
  return item;
}

function setScore(item, score) {
  item.style.setProperty('--score', String(score));
  item.querySelector('.hero-health-check-gauge-value').textContent = String(score);
}

function runCheck(metrics, button) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  button.disabled = true;
  metrics.forEach((item) => setScore(item, 0));
  const duration = reduce ? 0 : 1200;
  const start = performance.now();
  const step = (now) => {
    const t = duration ? Math.min(1, (now - start) / duration) : 1;
    const eased = 1 - (1 - t) ** 3;
    metrics.forEach((item) => setScore(item, Math.round(Number(item.dataset.target) * eased)));
    if (t < 1) window.requestAnimationFrame(step);
    else button.disabled = false;
  };
  window.requestAnimationFrame(step);
}

function buildPanel(panelCell, metricRows) {
  const panel = document.createElement('div');
  panel.className = 'hero-health-check-panel';

  const header = document.createElement('div');
  header.className = 'hero-health-check-panel-header';

  let buttonLabel = 'Run check';
  const notes = [];
  if (panelCell) {
    [...panelCell.children].forEach((el) => {
      const text = el.textContent.trim();
      if (!text) return;
      if (/^H[1-6]$/.test(el.tagName) && !header.querySelector('.hero-health-check-panel-title')) {
        el.classList.add('hero-health-check-panel-title');
        header.append(el);
      } else if (el.tagName === 'P' && el.children.length === 1
        && /^(STRONG|B|A)$/.test(el.firstElementChild.tagName)
        && el.firstElementChild.textContent.trim() === text) {
        buttonLabel = text;
      } else {
        notes.push(el);
      }
    });
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary hero-health-check-run';
  button.textContent = buttonLabel;
  header.append(button);

  const list = document.createElement('ul');
  list.className = 'hero-health-check-metrics';
  metricRows.forEach(({ label, target }) => list.append(createGauge(label, target)));

  panel.append(header, list);
  if (notes.length) {
    const note = document.createElement('div');
    note.className = 'hero-health-check-note';
    note.append(...notes);
    panel.append(note);
  }

  const metrics = [...list.children];
  button.addEventListener('click', () => runCheck(metrics, button));
  return panel;
}

export default function decorate(block) {
  const rows = [...block.children];
  const [firstRow, ...rest] = rows;
  if (!firstRow) return;

  const cells = [...firstRow.children];
  const copy = document.createElement('div');
  copy.className = 'hero-health-check-content';
  if (cells[0]) copy.append(...cells[0].childNodes);

  // group each run of CTA paragraphs into one actions row
  let actions = null;
  [...copy.children].forEach((el) => {
    if (el.matches('p.button-wrapper')) {
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'hero-health-check-actions';
        el.before(actions);
      }
      actions.append(el);
    } else {
      actions = null;
    }
  });

  const metricRows = rest.map((row) => {
    const [labelCell, scoreCell] = row.children;
    const label = labelCell ? labelCell.textContent.trim() : '';
    const raw = parseInt(scoreCell ? scoreCell.textContent.trim() : '', 10);
    const target = Number.isNaN(raw) ? 100 : Math.max(0, Math.min(100, raw));
    return { label, target };
  }).filter((m) => m.label);

  const children = [copy];
  if (cells[1] || metricRows.length) {
    children.push(buildPanel(cells[1], metricRows));
  } else {
    block.classList.add('no-panel');
  }

  block.replaceChildren(...children);
}
