const Joi = require(`joi`)

export const gatsbyConfigSchema = Joi.object().keys({
  siteMetadata: Joi.object(),
  linkPrefix: Joi.string(),
  mapping: Joi.object(),
  plugins: Joi.array(),
  proxy: Joi.object().keys({
    prefix: Joi.string().required(),
    url: Joi.string().required(),
  }),
})

export const pageSchema = Joi.object()
  .keys({
    path: Joi.string().required(),
    matchPath: Joi.string(),
    component: Joi.string().required(),
    componentChunkName: Joi.string().required(),
    context: Joi.object(),
  })
  .unknown()

export const nodeSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    children: Joi.array(Joi.string()).required(),
    parent: Joi.string().required(),
    pluginFields: Joi.object(),
    internal: Joi.object().keys({
      contentDigest: Joi.string().required(),
      mediaType: Joi.string().required(),
      type: Joi.string().required(),
      pluginOwner: Joi.string().required(),
      fieldPluginOwners: Joi.array(),
      content: Joi.string(),
    }),
  })
  .unknown()
