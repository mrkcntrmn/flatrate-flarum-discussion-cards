/**
 * Client fail-closed gate for discussion-card presentation.
 *
 * Only the JSON boolean true activates cards. Missing values, string "true",
 * and any other truthy-looking value keep native discussion rows.
 * This is a presentation rollout control, not a security boundary.
 */

/**
 * @param {{ attribute?: (name: string) => unknown } | null | undefined} forum
 * @returns {boolean}
 */
export function discussionCardsEnabled(forum) {
  if (!forum || typeof forum.attribute !== 'function') {
    return false;
  }
  return forum.attribute('flatRateDiscussionCardsEnabledForActor') === true;
}

/**
 * @param {unknown} rawAttribute
 * @returns {boolean}
 */
export function isDiscussionCardsAttributeEnabled(rawAttribute) {
  return rawAttribute === true;
}
