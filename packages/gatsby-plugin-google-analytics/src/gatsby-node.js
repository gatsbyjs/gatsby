exports.pluginOptionsSchema = ({ Joi }) =>
  // TODO: make sure that trackingId gets required() when releasing a major version
  Joi.object({
    trackingId: Joi.string().description(
      `The property ID; the tracking code won't be generated without it`
    ),
    head: Joi.boolean()
      .default(false)
      .description(
        `Defines where to place the tracking script - \`true\` in the head and \`false\` in the body`
      ),
    anonymize: Joi.boolean().default(false),
    respectDNT: Joi.boolean().default(false),
    exclude: Joi.array()
      .items(Joi.string())
      .default([])
      .description(`Avoids sending pageview hits from custom paths`),
    pageTransitionDelay: Joi.number()
      .default(0)
      .description(
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
    cookieDomain: Joi.string(),
  })
