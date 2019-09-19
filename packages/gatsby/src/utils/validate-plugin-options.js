const Joi = require(`@hapi/joi`)

const baseSchema = Joi.object().keys({
  plugins: Joi.array().items(
    Joi.alternatives(
      Joi.string(),
      Joi.object().keys({
        resolve: Joi.string().required(),
        options: Joi.object()
          .keys()
          .unknown(),
      })
    )
  ),
})

exports.validatePluginOptions = (res, options = {}) => {
  let chain = Promise.resolve(res)
  if (res && res.validate) {
    chain = baseSchema.concat(res).validate(options, {
      abortEarly: false,
    })
  }
  return chain
}

exports.formatOptionsError = (err, plugin = {}) => {
  return {
    id: `11329`,
    context: Object.assign({}, plugin, {
      errors: [].concat(
        err.details
          ? err.details.map(detail => detail.message)
          : err.message || err
      ),
    }),
  }
}
