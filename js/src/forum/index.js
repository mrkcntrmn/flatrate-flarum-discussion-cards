import app from 'flarum/forum/app';
import addDiscussionCards from './addDiscussionCards';

app.initializers.add('flatrate-discussion-cards', () => {
  // Always register decorators. Flarum runs initializers before app.forum exists,
  // so an init-time attribute gate can never observe the actor-effective flag.
  // Fail-closed rollout is enforced inside addDiscussionCards runtime hooks.
  addDiscussionCards();
});
