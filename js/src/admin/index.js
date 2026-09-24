import app from 'flarum/admin/app';

app.initializers.add('flatrate-discussion-cards', () => {
  // Flarum ID for flatrate/flarum-discussion-cards is flatrate-discussion-cards
  // (package name with leading "flarum-" stripped).
  app.extensionData
    .for('flatrate-discussion-cards')
    .registerSetting({
      setting: 'flatrate-discussion-cards.admin_preview_enabled',
      type: 'boolean',
      label: app.translator.trans('flatrate-discussion-cards.admin.settings.admin_preview_label'),
      help: app.translator.trans('flatrate-discussion-cards.admin.settings.admin_preview_help'),
    })
    .registerSetting({
      setting: 'flatrate-discussion-cards.member_enabled',
      type: 'boolean',
      label: app.translator.trans('flatrate-discussion-cards.admin.settings.member_enabled_label'),
      help: app.translator.trans('flatrate-discussion-cards.admin.settings.member_enabled_help'),
    })
    .registerSetting({
      setting: 'flatrate-discussion-cards.guest_enabled',
      type: 'boolean',
      label: app.translator.trans('flatrate-discussion-cards.admin.settings.guest_enabled_label'),
      help: app.translator.trans('flatrate-discussion-cards.admin.settings.guest_enabled_help'),
    });
});
