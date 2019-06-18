const showAnalyticsNotification = require(`./showAnalyticsNotification`)

let enabled = false
try {
  const ci = require(`ci-info`)
  const Configstore = require(`configstore`)
  const config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
  enabled = config.get(`telemetry.enabled`)
  if (enabled === undefined && !ci.isCI) {
    showAnalyticsNotification()
  }
} catch (e) {
  // ignore
}
