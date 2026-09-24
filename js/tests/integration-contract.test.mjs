import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('source does not override DiscussionListItem.view', () => {
  const addCards = read('js/src/forum/addDiscussionCards.js');
  assert.equal(addCards.includes("extend(DiscussionListItem.prototype, 'view'"), false);
  assert.equal(addCards.includes("override(DiscussionListItem.prototype, 'view'"), false);
  assert.equal(addCards.includes('DiscussionListItem.prototype.view'), false);
});

test('source uses approved seams only', () => {
  const addCards = read('js/src/forum/addDiscussionCards.js');
  assert.ok(addCards.includes("extend(DiscussionListState.prototype, 'requestParams'"));
  assert.ok(addCards.includes("extend(DiscussionListItem.prototype, 'elementAttrs'"));
  assert.ok(addCards.includes("extend(DiscussionListItem.prototype, 'mainItems'"));
  assert.ok(addCards.includes('DiscussionListItem--flatRateCard'));
  assert.ok(addCards.includes('flatRateCardByline'));
  assert.ok(addCards.includes('flatRateCardExcerpt'));
});

test('setting names and actor attribute are exact', () => {
  const gate = read('src/RolloutGate.php');
  const attribute = read('src/Api/DiscussionCardsEnabledAttribute.php');
  const admin = read('js/src/admin/index.js');
  const locale = read('locale/en.yml');

  assert.ok(gate.includes("'flatrate-discussion-cards.admin_preview_enabled'"));
  assert.ok(gate.includes("'flatrate-discussion-cards.member_enabled'"));
  assert.ok(gate.includes("'flatrate-discussion-cards.guest_enabled'"));
  assert.ok(attribute.includes("'flatRateDiscussionCardsEnabledForActor'"));
  assert.equal(attribute.includes("'admin_preview_enabled' =>"), false);
  assert.equal(attribute.includes("'member_enabled' =>"), false);
  assert.equal(attribute.includes("'guest_enabled' =>"), false);
  assert.ok(admin.includes("setting: 'flatrate-discussion-cards.admin_preview_enabled'"));
  assert.ok(admin.includes("setting: 'flatrate-discussion-cards.member_enabled'"));
  assert.ok(admin.includes("setting: 'flatrate-discussion-cards.guest_enabled'"));
  assert.ok(locale.includes('Admin preview'));
  assert.ok(locale.includes('Requires separate owner authorization'));
});

test('initializer always registers; gate is runtime-only', () => {
  const index = read('js/src/forum/index.js');
  const addCards = read('js/src/forum/addDiscussionCards.js');
  assert.ok(index.includes('addDiscussionCards()'));
  assert.equal(index.includes('discussionCardsEnabled(app.forum)'), false);
  assert.ok(addCards.includes('discussionCardsEnabled(app.forum)'));
});

test('byline has no nested profile link markup', () => {
  const byline = read('js/src/forum/components/DiscussionCardByline.js');
  assert.ok(byline.includes("import username from 'flarum/common/helpers/username'"));
  assert.equal(byline.includes('<a '), false);
  assert.equal(byline.includes('app.route.user'), false);
  assert.equal(byline.includes('Member #'), false);
  assert.equal(byline.includes('email'), false);
});

test('LESS is scoped to card class only', () => {
  const less = read('resources/less/forum.less');
  assert.ok(less.includes('.DiscussionListItem--flatRateCard'));
  // Top-level native restyle of every DiscussionListItem is forbidden.
  const withoutScoped = less.replace(/\.DiscussionListItem--flatRateCard\s*\{[\s\S]*\}\s*$/m, '');
  assert.equal(/\n\.DiscussionListItem\s*\{/.test(withoutScoped), false);
});

test('native main link remains the discussion route container', () => {
  const addCards = read('js/src/forum/addDiscussionCards.js');
  assert.equal(addCards.includes('app.route.discussion'), false);
  assert.equal(addCards.includes('mainView'), false);
  assert.equal(addCards.includes('getJumpTo'), false);
});
