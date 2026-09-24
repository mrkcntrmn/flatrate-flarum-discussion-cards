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

test('IndexPage + gate + no search -> cards', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: new IndexPage(),
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
      page: new FollowingPage(),
      IndexPage,
    }),
    true
  );
  assert.equal(pageIsFullFeedSurface(new FollowingPage(), IndexPage), true);
});

test('tag board IndexPage subclass + gate -> cards', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: new TagPage(),
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
      page: new IndexPage(),
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
      page: new UserPage(),
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
      page: new IndexPage(),
      IndexPage,
    }),
    false
  );
});

test('missing page fails closed', () => {
  assert.equal(
    isCardSurface({
      gateEnabled: true,
      state: { params: {} },
      page: null,
      IndexPage,
    }),
    false
  );
});
