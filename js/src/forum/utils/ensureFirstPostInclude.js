/**
 * Normalize DiscussionListState include params and ensure firstPost is present.
 * Never duplicates. Preserves other entries and relative order.
 *
 * @param {unknown} include
 * @returns {string[]}
 */
export function ensureFirstPostInclude(include) {
  /** @type {string[]} */
  let list;

  if (include == null) {
    list = [];
  } else if (typeof include === 'string') {
    list = include
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (Array.isArray(include)) {
    list = include.filter((item) => typeof item === 'string' && item.length > 0);
  } else {
    list = [];
  }

  if (!list.includes('firstPost')) {
    list = list.concat(['firstPost']);
  }

  return list;
}
