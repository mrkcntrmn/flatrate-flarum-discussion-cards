<?php

/*
 * Schema-free presentation extension. No migrations.
 */

use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Extend;
use FlatRate\DiscussionCards\Api\DiscussionCardsEnabledAttribute;
use FlatRate\DiscussionCards\RolloutGate;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Settings())
        ->default(RolloutGate::ADMIN_PREVIEW, '0')
        ->default(RolloutGate::MEMBER_ENABLED, '0')
        ->default(RolloutGate::GUEST_ENABLED, '0'),

    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attributes(DiscussionCardsEnabledAttribute::class),
];
