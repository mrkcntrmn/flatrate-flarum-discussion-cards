import { resolveCardExcerpt } from '../utils/excerpt';

/**
 * Opening-post plain-text excerpt. Renders nothing when firstPost is unavailable.
 */
export default function DiscussionCardExcerpt({ discussion }) {
  const text = resolveCardExcerpt(discussion);
  if (!text) {
    return null;
  }

  return <div className="DiscussionListItem-flatRateExcerpt">{text}</div>;
}
