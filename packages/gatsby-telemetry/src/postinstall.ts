import { isCI } from 'gatsby-core-utils'

import { showAnalyticsNotification } from './showAnalyticsNotification'
import { EventStorage } from './event-storage'

try {
  const eventStorage = new EventStorage()

  const disabled = eventStorage.disabled

  const enabledInConfig = eventStorage.getConfig(`telemetry.enabled`)

  if (enabledInConfig === undefined && !disabled && !isCI()) {
    showAnalyticsNotification()
  }
} catch (e) {
  // ignore
}
