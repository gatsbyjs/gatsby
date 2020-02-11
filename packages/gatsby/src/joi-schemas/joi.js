const Joi = require(`@hapi/joi`)

const stripTrailingSlash = chain => chain.replace(/(\w)\/+$/, `$1`)
// only add leading slash on relative urls
const addLeadingSlash = chain =>
  chain.when(Joi.string().uri({ relativeOnly: true }), {
    then: chain.replace(/^([^/])/, `/$1`),
  })

export const gatsbyConfigSchema = Joi.object()
  .keys({
    __experimentalThemes: Joi.array(),
    polyfill: Joi.boolean().default(true),
    assetPrefix: stripTrailingSlash(
      Joi.string().uri({
        allowRelative: true,
      })
    ),
    pathPrefix: addLeadingSlash(
      stripTrailingSlash(
        Joi.string()
          .uri({
            allowRelative: true,
            relativeOnly: true,
          })
          .default(``)
          // removes single / value
          .allow(``)
          .replace(/^\/$/, ``)
      )
    ),
    siteMetadata: Joi.object({
      siteUrl: stripTrailingSlash(Joi.string()).uri(),
    }).unknown(),
    mapping: Joi.object(),
    plugins: Joi.array(),
    proxy: Joi.array()
      .items(
        Joi.object().keys({
          prefix: Joi.string().required(),
          url: Joi.string().required(),
        })
      )
      .single(),
    developMiddleware: Joi.func(),
  })
  // throws when both assetPrefix and pathPrefix are defined
  .when(
    Joi.object({
      assetPrefix: Joi.string().uri({
        allowRelative: true,
        relativeOnly: true,
      }),
      pathPrefix: Joi.string()
        .uri({
          allowRelative: true,
          relativeOnly: true,
        })
        .default(``),
    }),
    {
      then: Joi.object({
        assetPrefix: Joi.string()
          .uri({
            allowRelative: false,
          })
          .error(
            new Error(
              `assetPrefix must be an absolute URI when used with pathPrefix`
            )
          ),
      }),
    }
  )

export const pageSchema = Joi.object()
  .keys({
    path: Joi.string().required(),
    matchPath: Joi.string(),
    component: Joi.string().required(),
    componentChunkName: Joi.string().required(),
    context: Joi.object(),
    pluginCreator___NODE: Joi.string(),
    pluginCreatorId: Joi.string(),
  })
  .unknown()

export const nodeSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    children: Joi.array().items(Joi.string(), Joi.object().forbidden()),
    parent: Joi.string().allow(null),
    fields: Joi.object(),
    internal: Joi.object()
      .keys({
        contentDigest: Joi.string().required(),
        mediaType: Joi.string(),
        type: Joi.string().required(),
        owner: Joi.string().required(),
        fieldOwners: Joi.object(),
        content: Joi.string().allow(``),
        description: Joi.string(),
        ignoreType: Joi.boolean(),
        counter: Joi.number(),
      })
      .unknown(false), // Don't allow non-standard fields
  })
  .unknown()
