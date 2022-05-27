import type { GoogleGtagPluginOptions } from "../types"

export interface IFlattenedGoogleGtagPluginOptions {
  gtagConfig: GoogleGtagPluginOptions[`gtagConfig`]
  origin: string
  head: boolean
  trackingIds: Array<string>
  gtagURL: string
  exclude: Array<string>
  respectDNT: boolean
}

export function getFlattenedPluginOptions(
  pluginOptions: GoogleGtagPluginOptions
): IFlattenedGoogleGtagPluginOptions {
  const { gtagConfig = {}, pluginConfig = {}, trackingIds = [] } = pluginOptions
  const {
    origin = `https://www.googletagmanager.com`,
    head = false,
    exclude = [],
    respectDNT = true,
  } = pluginConfig

  const gtagURL = `${origin}/gtag/js?id=${trackingIds?.[0] || ``}`

  return {
    gtagConfig,
    origin,
    head,
    trackingIds,
    gtagURL,
    exclude,
    respectDNT,
  }
}
