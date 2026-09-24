import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionListState from 'flarum/forum/states/DiscussionListState';
import IndexPage from 'flarum/forum/components/IndexPage';
import classList from 'flarum/common/utils/classList';
import username from 'flarum/common/helpers/username';
import humanTime from 'flarum/common/utils/humanTime';

import { discussionCardsEnabled } from './rolloutGate';
import { isCardSurface } from './utils/cardSurface';
import { ensureFirstPostInclude } from './utils/ensureFirstPostInclude';
import { resolveCardExcerpt } from './utils/excerpt';

/**
 * Runtime card activation. Gate + full-feed surface + not search.
 * Evaluated after app.forum exists (never at initializer time).
 *
 * @param {{ params?: { q?: unknown } } | null | undefined} stateOrParamsHost
 * @returns {boolean}
 */
function cardsActive(stateOrParamsHost) {
  if (!discussionCardsEnabled(app.forum)) {
    return false;
  }

  // app.current is a PageState; cardSurface uses page.matches(IndexPage).
  return isCardSurface({
    gateEnabled: true,
    state: stateOrParamsHost,
    page: app.current || null,
    IndexPage,
  });
}

/**
 * Inline byline vnode (Mithril ItemList expects real vnodes; Sticky uses the same pattern).
 *
 * @param {any} discussion
 */
function bylineVnode(discussion) {
  const user = typeof discussion.user === 'function' ? discussion.user() : null;
  const createdAt = typeof discussion.createdAt === 'function' ? discussion.createdAt() : null;

  return (
    <div className="DiscussionListItem-flatRateByline">
      <span className="DiscussionListItem-flatRateByline-author">{username(user)}</span>
      {createdAt ? (
        <span>
          <span className="DiscussionListItem-flatRateByline-sep" aria-hidden="true">
            {' '}
            ·{' '}
          </span>
          <span className="DiscussionListItem-flatRateByline-time">{humanTime(createdAt)}</span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * Register discussion-card decorators. Always call from the initializer;
 * gate inside each runtime hook.
 */
export default function addDiscussionCards() {
  extend(DiscussionListState.prototype, 'requestParams', function (params) {
    if (!cardsActive(this)) {
      return;
    }

    if (!params || typeof params !== 'object') {
      return;
    }

    // Mutate include only; never alter filter/sort/page/q. Dedupe firstPost.
    params.include = ensureFirstPostInclude(params.include);
  });

  extend(DiscussionListItem.prototype, 'elementAttrs', function (attrs) {
    const itemParams = (this.attrs && this.attrs.params) || {};
    if (!cardsActive({ params: itemParams })) {
      return;
    }

    if (!attrs || typeof attrs !== 'object') {
      return;
    }

    attrs.className = classList(attrs.className, 'DiscussionListItem--flatRateCard');
  });

  extend(DiscussionListItem.prototype, 'mainItems', function (items) {
    const itemParams = (this.attrs && this.attrs.params) || {};
    if (!cardsActive({ params: itemParams })) {
      return;
    }

    const discussion = this.attrs && this.attrs.discussion;
    if (!discussion) {
      return;
    }

    // Real vnodes only (Sticky documents this for DiscussionListItem ItemLists).
    items.add('flatRateCardByline', bylineVnode(discussion), 110);

    const excerpt = resolveCardExcerpt(discussion);
    if (excerpt) {
      items.add(
        'flatRateCardExcerpt',
        <div className="DiscussionListItem-flatRateExcerpt">{excerpt}</div>,
        95
      );
    }
  });
}
