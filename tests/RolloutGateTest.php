<?php

namespace FlatRate\DiscussionCards\Tests;

use FlatRate\DiscussionCards\ExtensionId;
use FlatRate\DiscussionCards\RolloutGate;
use PHPUnit\Framework\TestCase;

class RolloutGateTest extends TestCase
{
    /**
     * @dataProvider actorMatrixProvider
     */
    public function testActorMatrix(
        bool $isAdmin,
        bool $isGuest,
        mixed $adminPreview,
        mixed $memberEnabled,
        mixed $guestEnabled,
        bool $expected
    ): void {
        $this->assertSame(
            $expected,
            RolloutGate::enabledForActor($isAdmin, $isGuest, $adminPreview, $memberEnabled, $guestEnabled)
        );
    }

    public function actorMatrixProvider(): array
    {
        return [
            'admin all off' => [true, false, '0', '0', '0', false],
            'admin preview on' => [true, false, '1', '0', '0', true],
            'admin member on preview off' => [true, false, '0', '1', '0', false],
            'admin bool true' => [true, false, true, '0', '0', true],
            'admin int 1' => [true, false, 1, '0', '0', true],

            'member admin preview only' => [false, false, '1', '0', '0', false],
            'member enabled' => [false, false, '0', '1', '0', true],
            'member all off' => [false, false, '0', '0', '0', false],
            'member guest on' => [false, false, '0', '0', '1', false],

            // Non-admin moderators use the member path (isAdmin=false, isGuest=false).
            'moderator non-admin admin preview only' => [false, false, '1', '0', '0', false],
            'moderator non-admin member enabled' => [false, false, '0', '1', '0', true],

            'guest admin preview only' => [true, true, '1', '0', '0', true], // isAdmin wins before guest
            'guest enabled' => [false, true, '0', '0', '1', true],
            'guest member on' => [false, true, '0', '1', '0', false],
            'guest admin preview only non-admin' => [false, true, '1', '0', '0', false],
            'guest all off' => [false, true, '0', '0', '0', false],
        ];
    }

    public function testModeratorNonAdminDoesNotInheritAdminPreview(): void
    {
        // Explicit contract: moderation capability alone never grants Admin preview.
        $this->assertFalse(
            RolloutGate::enabledForActor(false, false, '1', '0', '0'),
            'moderator non-admin with admin_preview=1 must remain false'
        );
        $this->assertTrue(
            RolloutGate::enabledForActor(false, false, '0', '1', '0'),
            'moderator non-admin follows member gate when member_enabled=1'
        );
    }

    public function testParseFailClosed(): void
    {
        $this->assertFalse(RolloutGate::parse(null));
        $this->assertFalse(RolloutGate::parse(''));
        $this->assertFalse(RolloutGate::parse('0'));
        $this->assertFalse(RolloutGate::parse(0));
        $this->assertFalse(RolloutGate::parse(false));
        $this->assertFalse(RolloutGate::parse('true'));
        $this->assertFalse(RolloutGate::parse('yes'));
        $this->assertFalse(RolloutGate::parse('on'));
        $this->assertFalse(RolloutGate::parse('TRUE'));
        $this->assertFalse(RolloutGate::parse([]));
        $this->assertFalse(RolloutGate::parse(new \stdClass()));
        $this->assertTrue(RolloutGate::parse('1'));
        $this->assertTrue(RolloutGate::parse(true));
        $this->assertTrue(RolloutGate::parse(1));
    }

    public function testSettingKeysAndContracts(): void
    {
        $this->assertSame('flatrate-discussion-cards.admin_preview_enabled', RolloutGate::ADMIN_PREVIEW);
        $this->assertSame('flatrate-discussion-cards.member_enabled', RolloutGate::MEMBER_ENABLED);
        $this->assertSame('flatrate-discussion-cards.guest_enabled', RolloutGate::GUEST_ENABLED);

        $root = dirname(__DIR__);
        $derivedId = ExtensionId::fromComposerJsonFile($root . '/composer.json');
        $this->assertSame(ExtensionId::EXPECTED_ID, $derivedId);

        $extend = (string) file_get_contents($root . '/extend.php');
        $attribute = (string) file_get_contents($root . '/src/Api/DiscussionCardsEnabledAttribute.php');
        $adminJs = (string) file_get_contents($root . '/js/src/admin/index.js');
        $forumIndex = (string) file_get_contents($root . '/js/src/forum/index.js');
        $addCards = (string) file_get_contents($root . '/js/src/forum/addDiscussionCards.js');

        $this->assertStringContainsString('DiscussionCardsEnabledAttribute::class', $extend);
        $this->assertStringContainsString("->default(RolloutGate::ADMIN_PREVIEW, '0')", $extend);
        $this->assertStringContainsString("->default(RolloutGate::MEMBER_ENABLED, '0')", $extend);
        $this->assertStringContainsString("->default(RolloutGate::GUEST_ENABLED, '0')", $extend);
        $this->assertStringContainsString("'flatRateDiscussionCardsEnabledForActor' => \$enabled", $attribute);
        $this->assertStringNotContainsString('admin_preview_enabled', $attribute);
        $this->assertStringNotContainsString('member_enabled', $attribute);
        $this->assertStringNotContainsString('guest_enabled', $attribute);
        $this->assertStringContainsString("for('flatrate-discussion-cards')", $adminJs);
        $this->assertStringContainsString('addDiscussionCards()', $forumIndex);
        $this->assertStringNotContainsString('discussionCardsEnabled(app.forum)', $forumIndex);
        $this->assertStringContainsString('discussionCardsEnabled(app.forum)', $addCards);
        $this->assertStringNotContainsString("extend(DiscussionListItem.prototype, 'view'", $addCards);
        $this->assertStringNotContainsString("override(DiscussionListItem.prototype, 'view'", $addCards);
    }
}
