import username from 'flarum/common/helpers/username';
import humanTime from 'flarum/common/utils/humanTime';

/**
 * Non-interactive creator · time byline inside the native discussion main link.
 * Must not contain nested <a> elements.
 *
 * Mithril function components receive a vnode; attrs live on vnode.attrs.
 */
export default function DiscussionCardByline(vnode) {
  const discussion = vnode && vnode.attrs && vnode.attrs.discussion;
  if (!discussion) {
    return null;
  }

  const user = typeof discussion.user === 'function' ? discussion.user() : null;
  const createdAt = typeof discussion.createdAt === 'function' ? discussion.createdAt() : null;

  return (
    <div className="DiscussionListItem-flatRateByline">
      <span className="DiscussionListItem-flatRateByline-author">{username(user)}</span>
      {createdAt ? (
        <>
          <span className="DiscussionListItem-flatRateByline-sep" aria-hidden="true">
            ·
          </span>
          <span className="DiscussionListItem-flatRateByline-time">{humanTime(createdAt)}</span>
        </>
      ) : null}
    </div>
  );
}
