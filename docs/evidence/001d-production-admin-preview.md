# 001D production Admin-preview

```text
PRODUCTION_MODE=ADMIN_LIVE_ONLY
EXTENSION_ENABLED=true
admin_preview_enabled=1
member_enabled=0
guest_enabled=0
ADMIN_PREVIEW=LIVE
MEMBER_PRESENTATION=HIDDEN
GUEST_PRESENTATION=HIDDEN
NEXT_BOUNDARY=WAIT_FOR_EXPLICIT_OWNER_AUTHORIZATION_BEFORE_ANY_NON_ADMIN_ROLLOUT
```

Live re-check (2026-09-24):

```text
admin UI: Enabled=ON, Admin preview=ON, Members=OFF, Guests=OFF
anonymous /api flatRateDiscussionCardsEnabledForActor=false
raw rollout settings not serialized to forum payload
```

Operator receipts live under control-repo `.local-private/forum-discussion-cards-001b-prod/` (not committed).
