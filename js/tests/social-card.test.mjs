import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeCoverImageUrl,
  resolveCoverImageUrl,
  resolveLatestActivity,
  resolvePrimaryBoardName,
} from '../src/forum/utils/socialCard.js';

test('primary board uses first available canonical tag name', () => {
  const discussion = {
    tags: () => [
      { name: () => 'Honda' },
      { name: () => 'Job Breakdown' },
    ],
  };
  assert.equal(resolvePrimaryBoardName(discussion), 'Honda');
  assert.equal(resolvePrimaryBoardName({ tags: () => [] }), null);
});

test('latest activity exists only when there is at least one reply', () => {
  const user = { id: () => '7' };
  const at = new Date('2026-09-30T06:00:00Z');

  assert.equal(
    resolveLatestActivity({
      replyCount: () => 0,
      lastPostedUser: () => user,
      lastPostedAt: () => at,
    }),
    null
  );

  assert.deepEqual(
    resolveLatestActivity({
      replyCount: () => 2,
      lastPostedUser: () => user,
      lastPostedAt: () => at,
    }),
    { user, at }
  );
});

test('cover URL fails closed to qualified media origin only', () => {
  assert.equal(
    normalizeCoverImageUrl('https://media.flatrate.wiki/forum/cover.webp'),
    'https://media.flatrate.wiki/forum/cover.webp'
  );
  assert.equal(normalizeCoverImageUrl('http://media.flatrate.wiki/cover.webp'), null);
  assert.equal(normalizeCoverImageUrl('https://example.com/cover.webp'), null);
  assert.equal(normalizeCoverImageUrl('javascript:alert(1)'), null);
  assert.equal(normalizeCoverImageUrl(null), null);
});

test('discussion cover comes only from serialized first-post attribute', () => {
  const discussion = {
    firstPost: () => ({
      attribute: (name) => {
        assert.equal(name, 'flatRateDiscussionCoverImageUrl');
        return 'https://media.flatrate.wiki/forum/cover.webp';
      },
    }),
  };

  assert.equal(
    resolveCoverImageUrl(discussion),
    'https://media.flatrate.wiki/forum/cover.webp'
  );

  assert.equal(
    resolveCoverImageUrl({
      firstPost: () => ({ attribute: () => 'https://other.example/image.jpg' }),
    }),
    null
  );
});
