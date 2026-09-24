/**
 * Plain-text first-post excerpt helpers for discussion cards.
 */

export const CHAR_CAP = 280;

/**
 * Collapse runs of whitespace to a single space and trim.
 * Preserves Unicode and punctuation. Does not interpret HTML/Markdown.
 *
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizePlainExcerpt(raw) {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw.replace(/\s+/g, ' ').trim();
}

/**
 * Truncate to CHAR_CAP characters. Adds a single ellipsis when truncated.
 *
 * @param {string} text
 * @param {number} [cap]
 * @returns {string}
 */
export function truncateExcerpt(text, cap = CHAR_CAP) {
  if (typeof text !== 'string' || text.length === 0) {
    return '';
  }
  if (text.length <= cap) {
    return text;
  }
  // Avoid double ellipsis if the source already ends near the cut.
  const sliced = text.slice(0, cap).trimEnd();
  if (sliced.endsWith('…') || sliced.endsWith('...')) {
    return sliced;
  }
  return `${sliced}…`;
}

/**
 * Resolve a card excerpt from a discussion model-like object.
 *
 * @param {{ firstPost?: () => any }} discussion
 * @returns {string|null} null means do not render an excerpt node
 */
export function resolveCardExcerpt(discussion) {
  if (!discussion || typeof discussion.firstPost !== 'function') {
    return null;
  }

  const post = discussion.firstPost();
  if (!post) {
    return null;
  }

  if (typeof post.contentType === 'function') {
    if (post.contentType() !== 'comment') {
      return null;
    }
  }

  if (typeof post.contentPlain !== 'function') {
    return null;
  }

  const plain = post.contentPlain();
  if (plain == null) {
    return null;
  }

  const normalized = normalizePlainExcerpt(plain);
  if (!normalized) {
    return null;
  }

  return truncateExcerpt(normalized);
}
