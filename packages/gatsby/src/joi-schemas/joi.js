const Joi = require(`joi`)

export const gatsbyConfigSchema = Joi.object().keys({
  polyfill: Joi.boolean(),
  siteMetadata: Joi.object(),
  pathPrefix: Joi.string(),
  mapping: Joi.object(),
  plugins: Joi.array(),
  proxy: Joi.object().keys({
    prefix: Joi.string().required(),
    url: Joi.string().required(),
  }),
})

export const layoutSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    machineId: Joi.string().required(),
    component: Joi.string().required(),
    componentWrapperPath: Joi.string().required(),
    componentChunkName: Joi.string().required(),
    isLayout: Joi.boolean().required(),
    context: Joi.object(),
  })
  .unknown()

export const pageSchema = Joi.object()
  .keys({
    path: Joi.string().required(),
    matchPath: Joi.string(),
    component: Joi.string().required(),
    componentChunkName: Joi.string().required(),
    context: Joi.object(),
    pluginCreator___NODE: Joi.string(),
    pluginCreatorName: Joi.string(),
  })
  .unknown()

export const nodeSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    children: Joi.array()
      .items(Joi.string(), Joi.object().forbidden())
      .required(),
    parent: Joi.string()
      .allow(null)
      .required()
      .error(
        () =>
          `"parent" must be the "id" of another node or if there is no parent (common), "null"`
      ),
    fields: Joi.object(),
    internal: Joi.object().keys({
      contentDigest: Joi.string().required(),
      mediaType: Joi.string(),
      type: Joi.string().required(),
      owner: Joi.string().required(),
      fieldOwners: Joi.array(),
      content: Joi.string().allow(``),
    }),
  })
  .unknown()
