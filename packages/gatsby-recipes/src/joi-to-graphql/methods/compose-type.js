"use strict"

const Hoek = require(`@hapi/hoek`)
const Joi = require(`@hapi/joi`)
const { joiToGraphql } = require(`../helpers`)

const internals = {}

internals.configSchema = Joi.object().keys({
  name: Joi.string().default(`Anon`),
  args: Joi.object(),
  resolve: Joi.func(),
  description: Joi.string(),
})

module.exports = (schema, config = {}) => {
  config = Joi.attempt(config, internals.configSchema)

  Hoek.assert(typeof schema !== `undefined`, `schema argument must be defined`)

  const typeConstructor = schema.meta(config)

  Hoek.assert(
    typeConstructor._type === `object`,
    `schema must be a Joi Object type.`
  )

  return joiToGraphql(typeConstructor)
}
