export function getRelevantPluginOptions(pluginOptions) {
  const { gtagConfig = {}, pluginConfig = {}, trackingIds = [] } = pluginOptions
  const {
    origin = `https://www.googletagmanager.com`,
    head = false,
    exclude = [],
    respectDNT,
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
