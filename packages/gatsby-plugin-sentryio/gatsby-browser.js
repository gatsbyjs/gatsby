exports.onClientEntry = function(_, pluginParams) {
  require.ensure(['@sentry/browser'], function(require) {
    const Sentry = require('@sentry/browser');
    Sentry.init(pluginParams);
    window.Sentry = Sentry;
  });
};
