const Joi = require(`joi`)

export const errorSchema = Joi.object().keys({
  id: Joi.string(),
  text: Joi.string(),
  stack: Joi.array().items(Joi.object({}).unknown()),
  level: Joi.string().valid([`ERROR`, `WARNING`, `INFO`, `DEBUG`]),
  type: Joi.string().valid([`GRAPHQL`]),
  filePath: Joi.string(),
  location: Joi.object(),
  docsUrl: Joi.string().uri({
    allowRelative: false,
    relativeOnly: false,
  }),
  error: Joi.object({}).unknown(),
  context: Joi.object({}).unknown(),
})
