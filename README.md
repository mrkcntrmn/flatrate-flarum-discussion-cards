# flatrate/flarum-discussion-cards

High-context social-style discussion card presentation for FlatRate.wiki Flarum 1.8.

## Package identity

| Key | Value |
| --- | --- |
| Composer | `flatrate/flarum-discussion-cards` |
| Extension ID | `flatrate-discussion-cards` |
| Namespace | `FlatRate\DiscussionCards` |

## Rollout gates

Three independent fail-closed settings (all default off):

- `flatrate-discussion-cards.admin_preview_enabled`
- `flatrate-discussion-cards.member_enabled`
- `flatrate-discussion-cards.guest_enabled`

Clients receive only the actor-effective boolean:

```text
flatRateDiscussionCardsEnabledForActor
```

## Constraints

- Does **not** override `DiscussionListItem.view()`
- Preserves native discussion list, search, unread jump, moderation controls, and FoF Gamification votes
- Schema-free (no migrations)

## Development

```bash
composer validate --strict
php tests/run-rollout.php
npm --prefix js ci
npm --prefix js run build
node --test js/tests/*.test.mjs
```

Built `js/dist` artifacts are committed for managed-host installs.
