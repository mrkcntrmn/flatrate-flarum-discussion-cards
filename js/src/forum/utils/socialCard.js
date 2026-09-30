/**
 * Pure data helpers for FORUM-SOCIAL-FEED-002.
 */

export function resolvePrimaryBoardName(discussion) {
  if (!discussion || typeof discussion.tags !== 'function') return null;
  const tags = discussion.tags();
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const tag = tags.find((item) => item && typeof item.name === 'function');
  if (!tag) return null;
  const name = String(tag.name() ?? '').trim();
  return name || null;
}

export function resolveLatestActivity(discussion) {
  if (!discussion || typeof discussion.replyCount !== 'function') return null;
  const replies = Number(discussion.replyCount() ?? 0);
  if (!Number.isFinite(replies) || replies <= 0) return null;

  const user = typeof discussion.lastPostedUser === 'function'
    ? discussion.lastPostedUser()
    : null;
  const at = typeof discussion.lastPostedAt === 'function'
    ? discussion.lastPostedAt()
    : null;

  if (!user && !at) return null;
  return { user, at };
}

export function normalizeCoverImageUrl(raw) {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'media.flatrate.wiki') {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function resolveCoverImageUrl(discussion) {
  if (!discussion || typeof discussion.firstPost !== 'function') return null;
  const post = discussion.firstPost();
  if (!post || typeof post.attribute !== 'function') return null;
  return normalizeCoverImageUrl(post.attribute('flatRateDiscussionCoverImageUrl'));
}
