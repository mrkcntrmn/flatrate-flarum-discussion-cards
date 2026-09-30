<?php

namespace FlatRate\DiscussionCards;

/**
 * Fail-closed policy for optional discussion-cover images.
 *
 * Covers are presentation metadata only. They never grant media visibility.
 */
final class CoverImagePolicy
{
    public const ATTRIBUTE = 'flatRateDiscussionCoverImageUrl';

    public const MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    public static function isEligibleMime(mixed $mime): bool
    {
        return is_string($mime) && in_array(strtolower(trim($mime)), self::MIME_TYPES, true);
    }

    public static function normalizeUrl(mixed $url): ?string
    {
        if (!is_string($url)) {
            return null;
        }

        $normalized = trim($url);
        if ($normalized === '') {
            return null;
        }

        $parts = parse_url($normalized);
        if (!is_array($parts)) {
            return null;
        }

        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));

        if ($scheme !== 'https' || $host !== 'media.flatrate.wiki') {
            return null;
        }

        return $normalized;
    }
}
