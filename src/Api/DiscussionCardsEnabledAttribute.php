<?php

namespace FlatRate\DiscussionCards\Api;

use FlatRate\DiscussionCards\RolloutGate;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Settings\SettingsRepositoryInterface;

/**
 * Actor-resolved presentation flag for high-context discussion cards.
 *
 * Returns a real JSON boolean. Does not expose raw rollout settings and must
 * not be treated as an authorization check.
 */
class DiscussionCardsEnabledAttribute
{
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * @return array{flatRateDiscussionCardsEnabledForActor: bool}
     */
    public function __invoke(ForumSerializer $serializer): array
    {
        $actor = $serializer->getActor();

        $enabled = RolloutGate::enabledForActor(
            $actor->isAdmin(),
            $actor->isGuest(),
            $this->settings->get(RolloutGate::ADMIN_PREVIEW),
            $this->settings->get(RolloutGate::MEMBER_ENABLED),
            $this->settings->get(RolloutGate::GUEST_ENABLED)
        );

        return [
            'flatRateDiscussionCardsEnabledForActor' => $enabled,
        ];
    }
}
