const Joi = require(`joi`)

export const errorSchema = Joi.object().keys({
  id: Joi.string(),
  text: Joi.string(),
  stack: Joi.array().items(Joi.object({}).unknown()),
  category: Joi.string(),
  docsUrl: Joi.string().uri({
    allowRelative: false,
    relativeOnly: false,
  }),
  error: Joi.object({}).unknown(),
  context: Joi.object({}).unknown(),
})
