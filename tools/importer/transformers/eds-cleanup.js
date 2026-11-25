/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for https://npanditvaltech.github.io/eds/
 * Removes non-authorable site chrome. Header and footer are migrated
 * separately into nav/footer fragments.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Non-content elements that could interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'noscript',
      'style',
      'link',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Site chrome (selectors from cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      'a.skip',
      'header.site',
      'footer',
      'main > #top',
      'script',
      'noscript',
      'style',
      'link',
      'iframe',
    ]);
  }
}
