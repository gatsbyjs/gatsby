import * as React from "react"

interface OutboundLinkProps {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  eventAction?: string
  eventCategory?: string
  eventLabel?: string
}

/**
 * @see https://www.gatsbyjs.com/plugins/gatsby-plugin-google-analytics/#outboundlink-component
 */
export class OutboundLink extends React.Component<
  OutboundLinkProps & React.HTMLProps<HTMLAnchorElement>,
  any
> {}

export interface CustomEventArgs {
  category: string
  action: string
  label?: string
  value?: number
  nonInteraction?: boolean
  transport?: "beacon" | "xhr" | "image"
  hitCallback?: Function
  callbackTimeout?: Number
}

/**
 * @see https://www.gatsbyjs.com/plugins/gatsby-plugin-google-analytics/#trackcustomevent-function
 */
export function trackCustomEvent(args: CustomEventArgs): void

export interface GoogleAnalyticsConfig {
  resolve: "gatsby-plugin-google-analytics"
  options: GoogleAnalyticsOptions
}

/**
 * @see https://www.gatsbyjs.org/packages/gatsby-plugin-google-analytics/#options
 */
interface GoogleAnalyticsOptions {
  /** The property ID; the tracking code won't be generated without it */
  trackingId: string
  /** Defines where to place the tracking script - `true` in the head and `false` in the body */
  head?: boolean
  anonymize?: boolean
  respectDNT?: boolean
  /** Avoids sending pageview hits from custom paths */
  exclude?: string[]
  /** Delays sending pageview hits on route update (in milliseconds) */
  pageTransitionDelay?: number
  /** Enables Google Optimize using your container Id */
  optimizeId?: string
  /** Enables Google Optimize Experiment ID */
  experimentId?: string
  /** Set Variation ID. 0 for original 1,2,3.... */
  variationId?: string
  /** Defers execution of google analytics script after page load */
  defer?: boolean

  // Create Only fields
  /** tracker name */
  name?: string
  clientId?: string
  sampleRate?: number
  siteSpeedSampleRate?: number
  alwaysSendReferrer?: boolean
  allowAnchor?: boolean
  cookieName?: string
  cookieFlags?: string
  /** defaults to 'auto' if not given */
  cookieDomain?: string
  cookieExpires?: number
  storeGac?: boolean
  legacyCookieDomain?: string
  legacyHistoryImport?: boolean
  allowLinker?: boolean
  storage?: string

  // General Fields
  allowAdFeatures?: boolean
  dataSource?: string
  queueTime?: number
  forceSSL?: boolean
  transport?: string
}
