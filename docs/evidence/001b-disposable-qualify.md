# FORUM-DISCUSSION-CARDS-001B — disposable qualification

```text
WORK_ORDER=FORUM-DISCUSSION-CARDS-001B-001D-R1
DISPOSABLE_RUNTIME=forum-composer-001c-r1-web
FLARUM=1.8.19
PACKAGE_PIN=v0.1.3 / c63d1df55ec8c4a02cc61015dd94ac5a1bc4aa9c
STICKY=1.8.3
TAGS=1.8.8
GAMIFICATION=dev-main (local path mirror of 1.6.x tree; packagist 1.6.12 download timed out)
WIKI_CONTEXT=NOT_EXECUTED
```

## Actor / attribute

| Check | Result |
| --- | --- |
| Defaults all off | PASS (settings 0/0/0) |
| Admin preview on → admin attr true | PASS |
| Admin preview on → guest attr false | PASS |
| Admin preview on → member gate false | PASS |
| Guest firstPost present via Sticky | PASS (not used as denial criterion) |

## DOM (Admin preview ON)

| Check | Result |
| --- | --- |
| `.DiscussionListItem--flatRateCard` | PASS (6/6) |
| byline | PASS |
| excerpt | PASS |
| native `.DiscussionListItem-main` | PASS |
| Guest cards absent | PASS |
| PageState.matches(IndexPage) | PASS (fixed in v0.1.1) |
| Inline byline/excerpt vnodes | PASS (fixed in v0.1.3) |

## Matrix gaps (honest)

```text
MOBILE_360=NOT_EXECUTED (window maximize blocked Browser.setContentsSize)
MOBILE_390=NOT_EXECUTED
MOBILE_412=NOT_EXECUTED
FOLLOWING=NOT_EXECUTED
TAG_BOARD=NOT_EXECUTED
SEARCH_NATIVE=NOT_EXECUTED
VOTE_ALTERNATE_LAYOUT=NOT_EXECUTED (votes node count 0 in fixture)
WIKI_CONTEXT=NOT_EXECUTED
```

## Fixes proven on disposable before production

1. `app.current.matches(IndexPage)` not `instanceof`
2. Inline ItemList vnodes (Sticky pattern) instead of Mithril function components
