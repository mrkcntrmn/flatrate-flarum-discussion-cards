/**
 * Decide whether the current discussion list surface should use card presentation.
 *
 * V1 cards: MAIN, brand/tag boards, Technician Topics, Following, future Wiki Browse.
 * Not cards: search, profile mini-lists, side panes, compact widgets, admin.
 *
 * Flarum 1.8 exposes `app.current` as a PageState. Use `page.matches(IndexPage)`,
 * never `page instanceof IndexPage` (PageState is not a component instance).
 */

/**
 * @param {{ matches?: (pageClass: unknown) => boolean } | null | undefined} page
 * @param {unknown} IndexPage
 * @returns {boolean}
 */
export function pageIsFullFeedSurface(page, IndexPage) {
  if (!page || !IndexPage || typeof page.matches !== 'function') {
    return false;
  }
  // FollowingPage extends IndexPage — PageState.matches walks the prototype chain.
  return page.matches(IndexPage) === true;
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
 * @param {{ matches?: (pageClass: unknown) => boolean } | null | undefined} [options.page]
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
