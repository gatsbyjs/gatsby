/* global __GATSBY_PLUGIN_OFFLINE_SETTINGS */
import { initialize } from "workbox-google-analytics"

export function googleAnalytics() {
  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.offlineAnalyticsConfigString) {
    initialize(__GATSBY_PLUGIN_OFFLINE_SETTINGS.offlineAnalyticsConfigString)
  }
}
