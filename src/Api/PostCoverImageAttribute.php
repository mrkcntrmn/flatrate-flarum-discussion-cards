<?php

namespace FlatRate\DiscussionCards\Api;

use FlatRate\DiscussionCards\CoverImagePolicy;
use Flarum\Api\Serializer\BasicPostSerializer;
use Flarum\Post\Post;

/**
 * Serialize one optional first-post cover from FoF Upload's canonical
 * file<->post mapping. Fail closed when FoF Upload is absent or the mapping
 * cannot be resolved.
 *
 * Flarum 1.8 serializes Discussion::firstPost with BasicPostSerializer.
 * PostSerializer extends that serializer, so this callback remains compatible
 * with both list includes and full post serialization.
 */
final class PostCoverImageAttribute
{
    public function __invoke(BasicPostSerializer $serializer, Post $post, array $attributes): array
    {
        if ((int) $post->number !== 1) {
            return [];
        }

        $fileClass = 'FoF\\Upload\\File';
        if (!class_exists($fileClass)) {
            return [];
        }

        try {
            $file = $fileClass::query()
                ->whereIn('type', CoverImagePolicy::MIME_TYPES)
                ->whereHas('posts', function ($query) use ($post): void {
                    $query->where('posts.id', $post->id);
                })
                ->orderBy('id')
                ->first();
        } catch (\Throwable) {
            return [];
        }

        if (!$file || !CoverImagePolicy::isEligibleMime($file->type ?? null)) {
            return [];
        }

        $url = CoverImagePolicy::normalizeUrl($file->url ?? null);
        if ($url === null) {
            return [];
        }

        return [
            CoverImagePolicy::ATTRIBUTE => $url,
        ];
    }
}
