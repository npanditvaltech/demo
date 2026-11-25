/* eslint-disable */
/* global WebImporter */

/**
 * Parser for contact-form.
 * Source: #contact .contact-grid (.sec-head intro + form#form).
 * Block rows:
 *   Intro (heading, text, email link)
 *   Label | type | required   (one per field)
 *   Button label | submit
 *   success | message        (from the source .status confirmation)
 * The source form posts nowhere, so no 'action' row is emitted.
 */
function fieldType(control, labelText) {
  if (!control) return 'text';
  const tag = control.tagName.toLowerCase();
  if (tag === 'textarea') return 'textarea';
  if (tag === 'select') return 'select';
  const declared = (control.getAttribute('type') || '').toLowerCase();
  if (['email', 'tel', 'url', 'number', 'checkbox'].includes(declared)) return declared;
  const hint = `${control.id || ''} ${control.getAttribute('name') || ''} ${labelText}`.toLowerCase();
  if (/e-?mail/.test(hint)) return 'email';
  if (/phone|tel\b/.test(hint)) return 'tel';
  return 'text';
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: intro
  const intro = element.querySelector('.sec-head');
  if (intro) {
    const introContent = [...intro.children].filter((el) => el.textContent.trim());
    cells.push([introContent, '', '']);
  }

  const form = element.querySelector('form');
  if (form) {
    // Field rows: each label paired with the control in the same wrapper
    form.querySelectorAll('label').forEach((label) => {
      const labelText = label.textContent.trim();
      if (!labelText) return;
      const wrapper = label.parentElement;
      const forId = label.getAttribute('for');
      const control = (forId && form.querySelector(`#${CSS.escape(forId)}`))
        || (wrapper && wrapper.querySelector('input, textarea, select'));
      if (control && (control.getAttribute('type') || '').toLowerCase() === 'hidden') return;
      const type = fieldType(control, labelText);
      // Source validates every field client-side (per-field .err message slots)
      const required = control && (control.hasAttribute('required')
        || (wrapper && wrapper.querySelector('.err')));
      let extra = required ? 'required' : '';
      if (type === 'select' && control) {
        extra = [...control.querySelectorAll('option')]
          .map((o) => o.textContent.trim()).filter(Boolean).join(', ');
      }
      cells.push([labelText, type, extra]);
    });

    // Submit row
    const button = form.querySelector('button, input[type="submit"]');
    const buttonLabel = button
      ? (button.textContent.trim() || button.getAttribute('value') || '').trim()
      : '';
    cells.push([buttonLabel || 'Submit', 'submit', '']);

    // Success message shown after submit (source: .status confirmation)
    const status = form.querySelector('.status');
    const successText = status ? status.textContent.trim() : '';
    if (successText) cells.push(['success', successText, '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'contact-form', cells });
  element.replaceWith(block);
}
