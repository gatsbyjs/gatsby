// Copied from https://gist.github.com/faisalman/924970#file-analytics-regexp-js
// NOTE: This is just an example, in many cases we'd want to async check some API
async function isTrackingId(str) {
  return /^ua-\d{4,9}-\d{1,4}$/i.test(str)
}

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    trackingId: Joi.string()
      .required()
      .description(
        `The property ID; the tracking code won't be generated without it`
      )
      .external(async value => isTrackingId(value)),
    head: Joi.boolean().description(
      `Defines where to place the tracking script - \`true\` in the head and \`false\` in the body`
    ),
    anonymize: Joi.boolean(),
    respectDNT: Joi.boolean(),
    exclude: Joi.array()
      .items(Joi.string())
      .description(`Avoids sending pageview hits from custom paths`),
    pageTransitionDelay: Joi.number().description(
      `Delays sending pageview hits on route update (in milliseconds)`
    ),
    optimizeId: Joi.string().description(
      `Enables Google Optimize using your container Id`
    ),
    experimentId: Joi.string().description(
      `Enables Google Optimize Experiment ID`
    ),
    variationId: Joi.string().description(
      `Set Variation ID. 0 for original 1,2,3....`
    ),
    defer: Joi.boolean().description(
      `Defers execution of google analytics script after page load`
    ),
    sampleRate: Joi.number(),
    siteSpeedSampleRate: Joi.number(),
    cookieDomain: Joi.string(0),
  })

exports.onPreInit = ({ reporter }, options) => {
  if (!options.trackingId) {
    reporter.warn(
      `The Google Analytics plugin requires a tracking ID. Did you mean to add it?`
    )
  }
}
