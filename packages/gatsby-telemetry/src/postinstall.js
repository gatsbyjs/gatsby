const showAnalyticsNotification = require(`./showAnalyticsNotification`)

try {
  const ci = require(`ci-info`)
  const Configstore = require(`configstore`)
  const config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
  const enabledInConfig = config.get(`telemetry.enabled`)

  if (enabledInConfig === undefined && !ci.isCI) {
    showAnalyticsNotification()
  }
} catch (e) {
  // ignore
}
