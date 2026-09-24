/**
 * Decide whether the current discussion list surface should use card presentation.
 *
 * V1 cards: MAIN, brand/tag boards, Technician Topics, Following, future Wiki Browse.
 * Not cards: search, profile mini-lists, side panes, compact widgets, admin.
 */

/**
 * @param {unknown} page
 * @param {unknown} IndexPage
 * @returns {boolean}
 */
export function pageIsFullFeedSurface(page, IndexPage) {
  if (!page || !IndexPage) {
    return false;
  }
  // FollowingPage extends IndexPage — instanceof / prototype chain must pass.
  return page instanceof IndexPage;
}

/**
 * @param {{ params?: { q?: unknown } } | null | undefined} state
 * @returns {boolean}
 */
export function stateHasSearchQuery(state) {
  const q = state && state.params && state.params.q;
  return q != null && String(q).length > 0;
}

/**
 * @param {object} options
 * @param {boolean} options.gateEnabled
 * @param {{ params?: { q?: unknown } } | null | undefined} [options.state]
 * @param {unknown} [options.page]
 * @param {unknown} [options.IndexPage]
 * @param {boolean} [options.wikiBrowseApproved]
 * @returns {boolean}
 */
export function isCardSurface({
  gateEnabled,
  state = null,
  page = null,
  IndexPage = null,
  wikiBrowseApproved = false,
}) {
  if (!gateEnabled) {
    return false;
  }

  if (stateHasSearchQuery(state)) {
    return false;
  }

  if (pageIsFullFeedSurface(page, IndexPage)) {
    return true;
  }

  // Wiki Browse may be listed as approved, but must not activate an otherwise
  // gated surface on its own without IndexPage / explicit approval path.
  if (wikiBrowseApproved && pageIsFullFeedSurface(page, IndexPage)) {
    return true;
  }

  return false;
}
