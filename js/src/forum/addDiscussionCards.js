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
import {
  resolveCoverImageUrl,
  resolveLatestActivity,
  resolvePrimaryBoardName,
} from './utils/socialCard';

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

  return isCardSurface({
    gateEnabled: true,
    state: stateOrParamsHost,
    page: app.current || null,
    IndexPage,
  });
}

function boardVnode(discussion) {
  const board = resolvePrimaryBoardName(discussion);
  if (!board) return null;

  return <div className="DiscussionListItem-flatRateBoard">{board}</div>;
}

function bylineVnode(discussion) {
  const user = typeof discussion.user === 'function' ? discussion.user() : null;
  const createdAt = typeof discussion.createdAt === 'function' ? discussion.createdAt() : null;

  return (
    <div className="DiscussionListItem-flatRateByline DiscussionListItem-flatRateByline--creator">
      <span className="DiscussionListItem-flatRateActivityDot" aria-hidden="true" />
      <span className="DiscussionListItem-flatRateByline-author">{username(user)}</span>
      {createdAt ? (
        <span>
          <span className="DiscussionListItem-flatRateByline-sep" aria-hidden="true">
            {' '}·{' '}
          </span>
          <span className="DiscussionListItem-flatRateByline-time">{humanTime(createdAt)}</span>
        </span>
      ) : null}
    </div>
  );
}

function latestActivityVnode(discussion) {
  const activity = resolveLatestActivity(discussion);
  if (!activity) return null;

  return (
    <div className="DiscussionListItem-flatRateByline DiscussionListItem-flatRateByline--latest">
      <span className="DiscussionListItem-flatRateActivityDot" aria-hidden="true" />
      <span className="DiscussionListItem-flatRateByline-author">{username(activity.user)}</span>
      {activity.at ? (
        <span>
          <span className="DiscussionListItem-flatRateByline-sep" aria-hidden="true">
            {' '}·{' '}
          </span>
          <span className="DiscussionListItem-flatRateByline-time">{humanTime(activity.at)}</span>
        </span>
      ) : null}
    </div>
  );
}

function coverVnode(discussion) {
  const url = resolveCoverImageUrl(discussion);
  if (!url) return null;

  return (
    <div className="DiscussionListItem-flatRateCover" aria-hidden="true">
      <img src={url} alt="" loading="lazy" decoding="async" />
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

  extend(DiscussionListItem.prototype, 'infoItems', function (items) {
    const itemParams = (this.attrs && this.attrs.params) || {};
    if (!cardsActive({ params: itemParams })) {
      return;
    }

    // Creator/latest activity now have stable dedicated rows. Keep tag/wiki/
    // quality extensions in infoItems, but remove core TerminalPost duplication.
    items.remove('terminalPost');
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

    // Move the existing native info row to the social footer without
    // evaluating infoItems a second time.
    if (items.has('info')) {
      items.setPriority('info', 10);
    }

    const board = boardVnode(discussion);
    if (board) {
      items.add('flatRateCardBoard', board, 130);
    }

    const excerpt = resolveCardExcerpt(discussion);
    if (excerpt) {
      items.add(
        'flatRateCardExcerpt',
        <div className="DiscussionListItem-flatRateExcerpt">{excerpt}</div>,
        80
      );
    }

    const cover = coverVnode(discussion);
    if (cover) {
      items.add('flatRateCardCover', cover, 70);
    }

    items.add('flatRateCardByline', bylineVnode(discussion), 60);

    const latest = latestActivityVnode(discussion);
    if (latest) {
      items.add('flatRateCardLatestActivity', latest, 50);
    }
  });
}
