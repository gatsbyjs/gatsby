import type { PluginOptions } from "gatsby"

// This config structure and naming is confusing but we'll keep it to avoid breaking changes

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface GoogleGtagPluginOptions extends PluginOptions {
  trackingIds?: Array<string>
  // This object gets passed directly to the gtag config command
  // This config will be shared across all trackingIds
  gtagConfig?: {
    optimize_id?: string
    anonymize_ip?: boolean
    cookie_expires?: number
    send_page_view?: boolean
  }
  // This object is used for configuration specific to this plugin
  pluginConfig?: {
    head?: boolean // Puts tracking script in the head instead of the body
    respectDNT?: boolean
    exclude?: Array<string> // Avoids sending pageview hits from custom paths
    origin?: string // Defaults to https://www.googletagmanager.com
  }
}
