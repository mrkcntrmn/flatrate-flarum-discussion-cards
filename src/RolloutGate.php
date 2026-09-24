<?php

namespace FlatRate\DiscussionCards;

/**
 * Presentation-only discussion-card rollout gate.
 *
 * Three independent settings. Administrators do not inherit the member gate.
 * Does not grant discussion visibility, posting, voting, or moderation.
 */
final class RolloutGate
{
    public const ADMIN_PREVIEW = 'flatrate-discussion-cards.admin_preview_enabled';
    public const MEMBER_ENABLED = 'flatrate-discussion-cards.member_enabled';
    public const GUEST_ENABLED = 'flatrate-discussion-cards.guest_enabled';

    /**
     * Parse a persisted Flarum setting. Fail closed on missing, empty, "0",
     * and malformed values. Only true / 1 / "1" enable presentation.
     */
    public static function parse(mixed $raw): bool
    {
        if ($raw === true || $raw === 1) {
            return true;
        }

        if ($raw === null || $raw === false || $raw === 0 || $raw === '') {
            return false;
        }

        if (!is_string($raw)) {
            return false;
        }

        return $raw === '1';
    }

    /**
     * Resolve actor-effective presentation enablement.
     *
     * Admin  -> ADMIN_PREVIEW only
     * Guest  -> GUEST_ENABLED only
     * Member -> MEMBER_ENABLED only
     */
    public static function enabledForActor(
        bool $isAdmin,
        bool $isGuest,
        mixed $adminPreview,
        mixed $memberEnabled,
        mixed $guestEnabled
    ): bool {
        if ($isAdmin) {
            return self::parse($adminPreview);
        }

        if ($isGuest) {
            return self::parse($guestEnabled);
        }

        return self::parse($memberEnabled);
    }
}
