/** @type {import('gatsby').GatsbyNode["onPreInit"]} */
exports.onPreInit = (args, options) => {
  if (options.defaultDataLayer) {
    options.defaultDataLayer = {
      type: typeof options.defaultDataLayer,
      value: options.defaultDataLayer,
    }

    if (options.defaultDataLayer.type === `function`) {
      options.defaultDataLayer.value = options.defaultDataLayer.value.toString()
    }
  }
}

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    id: Joi.string().description(
      `Google Tag Manager ID that can be found in your Tag Manager dashboard.`
    ),
    includeInDevelopment: Joi.boolean()
      .default(false)
      .description(
        `Include Google Tag Manager when running in development mode.`
      ),
    defaultDataLayer: Joi.alternatives()
      .try(Joi.object(), Joi.function())
      .default(null)
      .description(
        `Data layer to be set before Google Tag Manager is loaded. Should be an object or a function.`
      ),
    gtmAuth: Joi.string().description(
      `Google Tag Manager environment auth string.`
    ),
    gtmPreview: Joi.string().description(
      `Google Tag Manager environment preview name.`
    ),
    dataLayerName: Joi.string().description(`Data layer name.`),
    routeChangeEventName: Joi.string()
      .default(`gatsby-route-change`)
      .description(
        `Name of the event that is triggered on every Gatsby route change.`
      ),
    enableWebVitalsTracking: Joi.boolean().default(false),
    selfHostedOrigin: Joi.string()
      .default(`https://www.googletagmanager.com`)
      .description(`The origin where GTM is hosted.`),
    selfHostedPath: Joi.string()
      .default(`gtm.js`)
      .description(`The path where GTM is hosted.`),
  })
