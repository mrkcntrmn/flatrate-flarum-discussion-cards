import test from 'node:test';
import assert from 'node:assert/strict';

import {
  discussionCardsEnabled,
  isDiscussionCardsAttributeEnabled,
} from '../src/forum/rolloutGate.js';

function forumWith(value) {
  return {
    attribute(name) {
      assert.equal(name, 'flatRateDiscussionCardsEnabledForActor');
      return value;
    },
  };
}

test('discussionCardsEnabled accepts only JSON boolean true', () => {
  assert.equal(discussionCardsEnabled(forumWith(true)), true);
  assert.equal(discussionCardsEnabled(forumWith(false)), false);
  assert.equal(discussionCardsEnabled(forumWith(undefined)), false);
  assert.equal(discussionCardsEnabled(forumWith(null)), false);
  assert.equal(discussionCardsEnabled(forumWith('true')), false);
  assert.equal(discussionCardsEnabled(forumWith('1')), false);
  assert.equal(discussionCardsEnabled(forumWith(1)), false);
  assert.equal(discussionCardsEnabled(forumWith({})), false);
});

test('discussionCardsEnabled fails closed without forum or attribute()', () => {
  assert.equal(discussionCardsEnabled(null), false);
  assert.equal(discussionCardsEnabled(undefined), false);
  assert.equal(discussionCardsEnabled({}), false);
  assert.equal(discussionCardsEnabled({ attribute: 'not-a-function' }), false);
});

test('isDiscussionCardsAttributeEnabled is strict', () => {
  assert.equal(isDiscussionCardsAttributeEnabled(true), true);
  assert.equal(isDiscussionCardsAttributeEnabled(false), false);
  assert.equal(isDiscussionCardsAttributeEnabled('true'), false);
  assert.equal(isDiscussionCardsAttributeEnabled(1), false);
});
