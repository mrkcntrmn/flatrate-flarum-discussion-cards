import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CHAR_CAP,
  normalizePlainExcerpt,
  truncateExcerpt,
  resolveCardExcerpt,
} from '../src/forum/utils/excerpt.js';
import { ensureFirstPostInclude } from '../src/forum/utils/ensureFirstPostInclude.js';

test('normalizePlainExcerpt collapses whitespace and preserves Unicode', () => {
  assert.equal(normalizePlainExcerpt('  hello   world  '), 'hello world');
  assert.equal(normalizePlainExcerpt('a\n\tb\r\nc'), 'a b c');
  assert.equal(normalizePlainExcerpt('Warranty — “teardown” 🔧'), 'Warranty — “teardown” 🔧');
  assert.equal(normalizePlainExcerpt(null), '');
  assert.equal(normalizePlainExcerpt(12), '');
});

test('truncateExcerpt caps at 280 with single ellipsis', () => {
  assert.equal(CHAR_CAP, 280);
  assert.equal(truncateExcerpt('short'), 'short');
  const long = 'x'.repeat(300);
  const truncated = truncateExcerpt(long);
  assert.equal(truncated.length, 281); // 280 chars + …
  assert.ok(truncated.endsWith('…'));
  assert.equal(truncated.slice(0, 280), 'x'.repeat(280));
});

test('resolveCardExcerpt guards missing/non-comment posts', () => {
  assert.equal(resolveCardExcerpt(null), null);
  assert.equal(resolveCardExcerpt({}), null);
  assert.equal(
    resolveCardExcerpt({
      firstPost: () => null,
    }),
    null
  );
  assert.equal(
    resolveCardExcerpt({
      firstPost: () => ({
        contentType: () => 'discussionStickied',
        contentPlain: () => 'sticky event',
      }),
    }),
    null
  );
  assert.equal(
    resolveCardExcerpt({
      firstPost: () => ({
        contentType: () => 'comment',
        contentPlain: () => null,
      }),
    }),
    null
  );
  assert.equal(
    resolveCardExcerpt({
      firstPost: () => ({
        contentType: () => 'comment',
        contentPlain: () => '   \n\t  ',
      }),
    }),
    null
  );
  assert.equal(
    resolveCardExcerpt({
      firstPost: () => ({
        contentType: () => 'comment',
        contentPlain: () => '  Opening post here.  ',
      }),
    }),
    'Opening post here.'
  );
});

test('ensureFirstPostInclude normalizes and dedupes', () => {
  assert.deepEqual(ensureFirstPostInclude(undefined), ['firstPost']);
  assert.deepEqual(ensureFirstPostInclude(null), ['firstPost']);
  assert.deepEqual(ensureFirstPostInclude(['user', 'lastPostedUser']), [
    'user',
    'lastPostedUser',
    'firstPost',
  ]);
  assert.deepEqual(ensureFirstPostInclude(['user', 'firstPost']), ['user', 'firstPost']);
  assert.deepEqual(ensureFirstPostInclude('firstPost'), ['firstPost']);
  assert.deepEqual(ensureFirstPostInclude('user,lastPostedUser'), [
    'user',
    'lastPostedUser',
    'firstPost',
  ]);
});
