/*
 * Contact Form Block (custom)
 *
 * Authoring:
 *   Row 1:   intro content (heading, text, email link)
 *   Field rows:  Label | type | required (optional)
 *     type: text, email, tel, url, number, textarea, select, checkbox (default: text)
 *     for select, put the choices in the third cell as a list or comma-separated text
 *   Submit row:  Label | submit
 *   Config rows: action | <endpoint URL>
 *                success | <message shown after submit>
 *                error | <message shown on failure>
 */

const FIELD_TYPES = ['text', 'email', 'tel', 'url', 'number', 'textarea', 'select', 'checkbox', 'submit'];
const CONFIG_KEYS = ['action', 'success', 'error'];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'field';
}

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function parseRows(block) {
  const rows = [...block.children];
  const config = {};
  const fields = [];
  let intro = null;
  let submitLabel = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const key = cellText(cells[0]).toLowerCase();
    const type = cellText(cells[1]).toLowerCase();

    if (cells.length >= 2 && CONFIG_KEYS.includes(key)) {
      const link = cells[1].querySelector('a[href]');
      config[key] = key === 'action' && link ? link.href : cellText(cells[1]);
      return;
    }
    if (cells.length >= 2 && type === 'submit') {
      submitLabel = cellText(cells[0]);
      return;
    }
    const isField = cells.length >= 2 && FIELD_TYPES.includes(type)
      && !cells[0].querySelector('h1, h2, h3, h4, h5, h6, a');
    if (isField) {
      fields.push({
        label: cellText(cells[0]),
        type,
        extra: cells[2] || null,
      });
      return;
    }
    // anything else (normally row 1) is intro content
    intro = intro || document.createElement('div');
    cells.forEach((cell) => intro.append(...cell.childNodes));
  });

  return {
    intro, fields, submitLabel, config,
  };
}

function buildField({ label, type, extra }, used) {
  let name = slugify(label);
  while (used.has(name)) name = `${name}-x`;
  used.add(name);
  const id = `contact-form-${name}`;
  const required = /required|\*/i.test(cellText(extra)) && type !== 'select';

  const wrap = document.createElement('div');
  wrap.className = `contact-form-field contact-form-field-${type}`;

  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 5;
  } else if (type === 'select') {
    input = document.createElement('select');
    const items = extra && extra.querySelectorAll('li').length
      ? [...extra.querySelectorAll('li')].map((li) => li.textContent.trim())
      : cellText(extra).split(',').map((s) => s.trim());
    items.filter(Boolean).forEach((item) => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      input.append(option);
    });
  } else {
    input = document.createElement('input');
    input.type = type;
  }
  input.id = id;
  input.name = name;
  if (required) input.required = true;
  if (type === 'email') input.autocomplete = 'email';
  if (name === 'name') input.autocomplete = 'name';

  const error = document.createElement('div');
  error.className = 'contact-form-error';
  error.id = `${id}-error`;
  input.setAttribute('aria-describedby', error.id);

  if (type === 'checkbox') wrap.append(input, labelEl, error);
  else wrap.append(labelEl, input, error);
  return wrap;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE_LENGTH = 10;

function fieldMessage(input) {
  const value = input.type === 'checkbox' ? '' : input.value.trim();
  const label = input.closest('.contact-form-field').querySelector('label').textContent.trim();
  if (input.type === 'email') {
    if (!value) return input.required ? 'Enter your email address.' : '';
    return EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email, like name@company.com.';
  }
  if (input.tagName === 'TEXTAREA') {
    if (!value && !input.required) return '';
    return value.length >= MIN_MESSAGE_LENGTH ? '' : `Write at least ${MIN_MESSAGE_LENGTH} characters about your project.`;
  }
  if (input.type === 'text' && input.required && !value) return `Enter your ${label.toLowerCase()}.`;
  return input.checkValidity() ? '' : input.validationMessage;
}

function validateField(input) {
  const message = fieldMessage(input);
  const error = input.closest('.contact-form-field').querySelector('.contact-form-error');
  if (error) error.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function showStatus(form, message, state) {
  const status = form.querySelector('.contact-form-status');
  status.dataset.state = state;
  status.textContent = message;
  status.hidden = false;
}

export default function decorate(block) {
  const {
    intro, fields, submitLabel, config,
  } = parseRows(block);

  const content = document.createElement('div');
  content.className = 'contact-form-content';
  if (intro) content.append(...intro.childNodes);

  const form = document.createElement('form');
  form.className = 'contact-form-form';
  form.noValidate = true;
  const used = new Set();
  (fields.length ? fields : [
    { label: 'Name', type: 'text' },
    { label: 'Email', type: 'email' },
    { label: 'Message', type: 'textarea' },
  ]).forEach((field) => form.append(buildField(field, used)));

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button primary contact-form-submit';
  button.textContent = submitLabel || 'Submit';

  const status = document.createElement('div');
  status.className = 'contact-form-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  form.append(button, status);

  const controls = () => [...form.querySelectorAll('input, textarea, select')];
  // validate on blur; once a field is invalid, re-validate as the user types
  form.addEventListener('focusout', (e) => {
    if (e.target.matches('input, textarea, select')) validateField(e.target);
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') validateField(e.target);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.hidden = true;
    const invalid = controls().filter((input) => !validateField(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    button.disabled = true;
    try {
      if (config.action) {
        const resp = await fetch(config.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        if (!resp.ok) throw new Error(`submit failed: ${resp.status}`);
      }
      form.reset();
      controls().forEach((input) => input.removeAttribute('aria-invalid'));
      showStatus(form, config.success || 'Thank you. Your message has been sent.', 'success');
    } catch {
      showStatus(form, config.error || 'Sorry, something went wrong. Please try again.', 'error');
    } finally {
      button.disabled = false;
    }
  });

  block.replaceChildren(content, form);
}
