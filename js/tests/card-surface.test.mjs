import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isCardSurface,
  pageIsFullFeedSurface,
  stateHasSearchQuery,
} from '../src/forum/utils/cardSurface.js';

class IndexPage {}
class FollowingPage extends IndexPage {}
class UserPage {}
class TagPage extends IndexPage {}

/**
 * Flarum PageState.matches(Component) — not instanceof on the component.
 * @param {unknown} activeClass
 */
function pageState(activeClass) {
  return {
    matches(pageClass) {
      if (!activeClass || !pageClass) return false;
      let proto = activeClass;
      while (proto) {
        if (proto === pageClass) return true;
        proto = Object.getPrototypeOf(proto);
      }
      return false;
    },
  };
}

test('IndexPage + gate + no search -> cards', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: pageState(IndexPage),
      IndexPage,
    }),
    true
  );
});

test('FollowingPage subclass of IndexPage + gate -> cards', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: pageState(FollowingPage),
      IndexPage,
    }),
    true
  );
  assert.equal(pageIsFullFeedSurface(pageState(FollowingPage), IndexPage), true);
});

test('tag board IndexPage subclass + gate -> cards', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: pageState(TagPage),
      IndexPage,
    }),
    true
  );
});

test('search query excludes cards on IndexPage', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: { q: 'warranty' } },
      page: pageState(IndexPage),
      IndexPage,
    }),
    false
  );
  assert.equal(stateHasSearchQuery({ params: { q: 'warranty' } }), true);
  assert.equal(stateHasSearchQuery({ params: {} }), false);
});

test('profile / non-IndexPage surfaces are excluded', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: pageState(UserPage),
      IndexPage,
    }),
    false
  );
});

test('gate false excludes cards even on IndexPage', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: false,
      state: { params: {} },
      page: pageState(IndexPage),
      IndexPage,
    }),
    false
  );
});

test('missing page or matches() fails closed', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: null,
      IndexPage,
    }),
    false
  );
  assert.equal(pageIsFullFeedSurface({}, IndexPage), false);
  assert.equal(pageIsFullFeedSurface({ matches: () => true }, null), false);
});

test('raw component instance is not treated as a page surface', () => {
  // Guards the v0.1.0 regression: app.current is PageState, not IndexPage.
  assert.equal(pageIsFullFeedSurface(new IndexPage(), IndexPage), false);
});
