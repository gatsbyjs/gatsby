const Joi = require("joi")

export const gatsbyConfigSchema = Joi.object().keys({
  siteMetadata: Joi.object(),
  linkPrefix: Joi.string(),
  mapping: Joi.object(),
  plugins: Joi.array(),
})

export const pageSchema = Joi.object()
  .keys({
    path: Joi.string().required(),
    component: Joi.string().required(),
    componentChunkName: Joi.string().required(),
    context: Joi.object(),
  })
  .unknown()
