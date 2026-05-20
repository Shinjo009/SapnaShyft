/**
 * Renders API list fields (causes, effects, etc.) without adding punctuation
 * or otherwise transforming the text content.
 */
export function formatApiContentDisplay(items) {
  if (!items || items.length === 0) {
    return '';
  }

  return items.join('\n');
}
