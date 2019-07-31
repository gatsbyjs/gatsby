const showAnalyticsNotification = require(`./showAnalyticsNotification`)
const isTruthy = require("./is-truthy")

let enabled = false
try {
  const ci = require(`ci-info`)
  const Configstore = require(`configstore`)
  const config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
  enabled = config.get(`telemetry.enabled`)
  const disabled = isTruthy(process.env.GATSBY_TELEMETRY_DISABLED)
  if (enabled === undefined && !disabled && !ci.isCI) {
    showAnalyticsNotification()
  }
} catch (e) {
  // ignore
}
