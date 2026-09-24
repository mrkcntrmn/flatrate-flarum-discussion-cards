import { resolveCardExcerpt } from '../utils/excerpt';

/**
 * Opening-post plain-text excerpt. Renders nothing when firstPost is unavailable.
 *
 * Mithril function components receive a vnode; attrs live on vnode.attrs.
 */
export default function DiscussionCardExcerpt(vnode) {
  const discussion = vnode && vnode.attrs && vnode.attrs.discussion;
  const text = resolveCardExcerpt(discussion);
  if (!text) {
    return null;
  }

  return <div className="DiscussionListItem-flatRateExcerpt">{text}</div>;
}
