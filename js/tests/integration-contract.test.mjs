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
  assert.ok(addCards.includes('flatRateCardBoard'));
  assert.ok(addCards.includes('flatRateCardExcerpt'));
  assert.ok(addCards.includes('flatRateCardCover'));
  assert.ok(addCards.includes('flatRateCardByline'));
  assert.ok(addCards.includes('flatRateCardLatestActivity'));
  assert.ok(addCards.includes("extend(DiscussionListItem.prototype, 'infoItems'"));
  assert.ok(addCards.includes("items.remove('terminalPost')"));
  assert.ok(addCards.includes("items.setPriority('info', 10)"));
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
  const addCards = read('js/src/forum/addDiscussionCards.js');
  assert.ok(addCards.includes("import username from 'flarum/common/helpers/username'"));
  assert.equal(addCards.includes('<a '), false);
  assert.equal(addCards.includes('app.route.user'), false);
  assert.equal(addCards.includes('Member #'), false);
  assert.equal(addCards.includes('email'), false);
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


test('social feed cover contract is canonical and never scrapes rendered post HTML', () => {
  const addCards = read('js/src/forum/addDiscussionCards.js');
  const social = read('js/src/forum/utils/socialCard.js');
  const extendPhp = read('extend.php');
  const attr = read('src/Api/PostCoverImageAttribute.php');

  assert.ok(addCards.includes('resolveCoverImageUrl'));
  assert.ok(social.includes("post.attribute('flatRateDiscussionCoverImageUrl')"));
  assert.ok(social.includes("url.hostname.toLowerCase() !== 'media.flatrate.wiki'"));
  assert.ok(extendPhp.includes('PostCoverImageAttribute::class'));
  assert.ok(attr.includes("'FoF\\\\Upload\\\\File'"));
  assert.ok(attr.includes("whereHas('posts'"));
  assert.equal(addCards.includes('contentHtml'), false);
  assert.equal(addCards.includes('innerHTML'), false);
  assert.equal(addCards.includes('querySelector'), false);
});

test('social hierarchy keeps original author distinct from latest activity', () => {
  const addCards = read('js/src/forum/addDiscussionCards.js');
  const social = read('js/src/forum/utils/socialCard.js');

  assert.ok(addCards.includes('discussion.user'));
  assert.ok(social.includes('discussion.lastPostedUser'));
  assert.ok(social.includes('discussion.lastPostedAt'));
  assert.ok(social.includes('discussion.replyCount'));
});

test('card visual contract remains scoped and supports optional 16:9 cover', () => {
  const less = read('resources/less/forum.less');
  assert.ok(less.includes('border: 0;'));
  assert.ok(less.includes('.DiscussionListItem-flatRateBoard'));
  assert.ok(less.includes('.DiscussionListItem-flatRateCover'));
  assert.ok(less.includes('aspect-ratio: 16 / 9'));
  assert.ok(less.includes('object-fit: cover'));
  assert.ok(less.includes('min-width: 44px'));
  assert.ok(less.includes('min-height: 44px'));
});
