try {
  const { showAnalyticsNotification } = require(`./show-analytics-notification`)
  const { isCI } = require(`gatsby-core-utils`)
  const { EventStorage } = require(`./event-storage`)

  const eventStorage = new EventStorage()
  const disabled = eventStorage.disabled
  const enabledInConfig = eventStorage.getConfig(`telemetry.enabled`)
  if (enabledInConfig === undefined && !disabled && !isCI()) {
    showAnalyticsNotification()
  }
} catch (e) {
  // ignore
}
