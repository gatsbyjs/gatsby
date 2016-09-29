const Joi = require(`joi`)

export const gatsbyConfigSchema = Joi.object().keys({
  sources: Joi.string().required(),
  siteMetadata: Joi.object(),
  linkPrefix: Joi.string(),
})

export const pageSchema = Joi.object().keys({
  path: Joi.string().required(),
  component: Joi.string().required(),
  chunkName: Joi.string().required(),
  data: Joi.object(),
}).unknown()
