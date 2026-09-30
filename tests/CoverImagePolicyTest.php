<?php

namespace FlatRate\DiscussionCards\Tests;

use FlatRate\DiscussionCards\CoverImagePolicy;
use PHPUnit\Framework\TestCase;

class CoverImagePolicyTest extends TestCase
{
    public function testEligibleMimeTypesAreNarrowAndRasterOnly(): void
    {
        $this->assertTrue(CoverImagePolicy::isEligibleMime('image/jpeg'));
        $this->assertTrue(CoverImagePolicy::isEligibleMime(' IMAGE/PNG '));
        $this->assertTrue(CoverImagePolicy::isEligibleMime('image/webp'));

        $this->assertFalse(CoverImagePolicy::isEligibleMime('image/gif'));
        $this->assertFalse(CoverImagePolicy::isEligibleMime('image/svg+xml'));
        $this->assertFalse(CoverImagePolicy::isEligibleMime('text/html'));
        $this->assertFalse(CoverImagePolicy::isEligibleMime(null));
    }

    public function testCoverUrlIsRestrictedToQualifiedMediaOrigin(): void
    {
        $this->assertSame(
            'https://media.flatrate.wiki/forum/example.webp',
            CoverImagePolicy::normalizeUrl('https://media.flatrate.wiki/forum/example.webp')
        );

        $this->assertNull(CoverImagePolicy::normalizeUrl('http://media.flatrate.wiki/example.webp'));
        $this->assertNull(CoverImagePolicy::normalizeUrl('https://example.com/example.webp'));
        $this->assertNull(CoverImagePolicy::normalizeUrl('javascript:alert(1)'));
        $this->assertNull(CoverImagePolicy::normalizeUrl(''));
        $this->assertNull(CoverImagePolicy::normalizeUrl(null));
    }
}
