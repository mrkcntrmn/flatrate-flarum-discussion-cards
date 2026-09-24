<?php

/**
 * Minimal backend test runner for environments where PHPUnit is unavailable.
 * Exit 0 on success.
 */

declare(strict_types=1);

$root = dirname(__DIR__);
require $root . '/src/RolloutGate.php';
require $root . '/src/ExtensionId.php';

use FlatRate\DiscussionCards\ExtensionId;
use FlatRate\DiscussionCards\RolloutGate;

$failures = 0;

function expect_same(mixed $expected, mixed $actual, string $label): void
{
    global $failures;
    if ($expected !== $actual) {
        fwrite(STDERR, "FAIL {$label}: expected " . var_export($expected, true) . ' got ' . var_export($actual, true) . "\n");
        $failures++;
        return;
    }
    echo "ok {$label}\n";
}

function expect_true(bool $cond, string $label): void
{
    expect_same(true, $cond, $label);
}

function expect_false(bool $cond, string $label): void
{
    expect_same(false, $cond, $label);
}

$matrix = [
    // isAdmin, isGuest, admin, member, guest, expected, label
    [true, false, '0', '0', '0', false, 'admin all off'],
    [true, false, '1', '0', '0', true, 'admin preview on'],
    [true, false, '0', '1', '0', false, 'admin member on preview off'],
    [true, false, true, '0', '0', true, 'admin bool true'],
    [true, false, 1, '0', '0', true, 'admin int 1'],
    [false, false, '1', '0', '0', false, 'member admin preview only'],
    [false, false, '0', '1', '0', true, 'member enabled'],
    [false, false, '0', '0', '0', false, 'member all off'],
    [false, false, '0', '0', '1', false, 'member guest on'],
    // Non-admin moderators share the authenticated non-admin (member) path.
    [false, false, '1', '0', '0', false, 'moderator non-admin admin preview only'],
    [false, false, '0', '1', '0', true, 'moderator non-admin member enabled'],
    [false, true, '0', '0', '1', true, 'guest enabled'],
    [false, true, '0', '1', '0', false, 'guest member on'],
    [false, true, '1', '0', '0', false, 'guest admin preview only'],
    [false, true, '0', '0', '0', false, 'guest all off'],
];

foreach ($matrix as [$isAdmin, $isGuest, $admin, $member, $guest, $expected, $label]) {
    expect_same(
        $expected,
        RolloutGate::enabledForActor($isAdmin, $isGuest, $admin, $member, $guest),
        $label
    );
}

expect_false(RolloutGate::parse(null), 'parse null');
expect_false(RolloutGate::parse(''), 'parse empty');
expect_false(RolloutGate::parse('0'), 'parse 0');
expect_false(RolloutGate::parse('true'), 'parse true-string');
expect_false(RolloutGate::parse('yes'), 'parse yes');
expect_false(RolloutGate::parse('on'), 'parse on');
expect_false(RolloutGate::parse('TRUE'), 'parse TRUE');
expect_false(RolloutGate::parse([]), 'parse array');
expect_true(RolloutGate::parse('1'), 'parse 1');
expect_true(RolloutGate::parse(true), 'parse bool true');
expect_true(RolloutGate::parse(1), 'parse int 1');

expect_same(RolloutGate::ADMIN_PREVIEW, 'flatrate-discussion-cards.admin_preview_enabled', 'admin key');
expect_same(RolloutGate::MEMBER_ENABLED, 'flatrate-discussion-cards.member_enabled', 'member key');
expect_same(RolloutGate::GUEST_ENABLED, 'flatrate-discussion-cards.guest_enabled', 'guest key');

$derivedId = ExtensionId::fromComposerJsonFile($root . '/composer.json');
expect_same(ExtensionId::EXPECTED_ID, $derivedId, 'derived extension id');

$extend = (string) file_get_contents($root . '/extend.php');
$attribute = (string) file_get_contents($root . '/src/Api/DiscussionCardsEnabledAttribute.php');
$adminJs = (string) file_get_contents($root . '/js/src/admin/index.js');
$forumIndex = (string) file_get_contents($root . '/js/src/forum/index.js');
$addCards = (string) file_get_contents($root . '/js/src/forum/addDiscussionCards.js');

expect_true(str_contains($extend, 'DiscussionCardsEnabledAttribute::class'), 'extend registers attribute');
expect_true(str_contains($extend, "->default(RolloutGate::ADMIN_PREVIEW, '0')"), 'admin default off');
expect_true(str_contains($extend, "->default(RolloutGate::MEMBER_ENABLED, '0')"), 'member default off');
expect_true(str_contains($extend, "->default(RolloutGate::GUEST_ENABLED, '0')"), 'guest default off');
expect_true(str_contains($attribute, "'flatRateDiscussionCardsEnabledForActor' => \$enabled"), 'attribute key');
expect_false(str_contains($attribute, "'admin_preview_enabled'"), 'no raw admin setting serialize');
expect_false(str_contains($attribute, "'member_enabled'"), 'no raw member setting serialize');
expect_false(str_contains($attribute, "'guest_enabled'"), 'no raw guest setting serialize');
expect_true(str_contains($adminJs, "for('flatrate-discussion-cards')"), 'admin extension id');
expect_true(str_contains($forumIndex, 'addDiscussionCards()'), 'forum always registers');
expect_false(str_contains($forumIndex, 'discussionCardsEnabled(app.forum)'), 'no init-time gate');
expect_true(str_contains($addCards, 'discussionCardsEnabled(app.forum)'), 'runtime gate');
expect_false(str_contains($addCards, "extend(DiscussionListItem.prototype, 'view'"), 'no view extend');
expect_false(str_contains($addCards, "override(DiscussionListItem.prototype, 'view'"), 'no view override');
expect_true(str_contains($addCards, "extend(DiscussionListItem.prototype, 'elementAttrs'"), 'elementAttrs extend');
expect_true(str_contains($addCards, "extend(DiscussionListItem.prototype, 'mainItems'"), 'mainItems extend');
expect_true(str_contains($addCards, "extend(DiscussionListState.prototype, 'requestParams'"), 'requestParams extend');
expect_true(str_contains($addCards, 'DiscussionListItem--flatRateCard'), 'card class');
expect_true(str_contains($addCards, 'flatRateCardByline'), 'byline item');
expect_true(str_contains($addCards, 'flatRateCardExcerpt'), 'excerpt item');

$srcPhp = (string) file_get_contents($root . '/src/RolloutGate.php');
expect_false(str_contains($srcPhp, '->can('), 'gate avoids can()');
expect_true(str_contains($srcPhp, 'Does not grant'), 'presentation-only note');

if ($failures > 0) {
    fwrite(STDERR, "\n{$failures} failure(s)\n");
    exit(1);
}

echo "\nAll backend rollout assertions passed.\n";
exit(0);
