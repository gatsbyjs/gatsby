const Joi = require(`joi`)

const defaultOptions = {
  host: `cdn.contentful.com`,

  // default is always master
  environment: `master`,
}

const optionsSchema = Joi.object().keys({
  accessToken: Joi.string()
    .required()
    .empty(),
  spaceId: Joi.string()
    .required()
    .empty(),
  host: Joi.string().empty(),
  environment: Joi.string().empty(),
  // default plugins passed by gatsby
  plugins: Joi.array(),
})

console.log(optionsSchema)

const validateOptions = options => {
  const result = optionsSchema.validate(options, { abortEarly: false })
  if (result.error) {
    const errors = {}
    result.error.details.forEach(detail => {
      errors[detail.path[0]] = detail.message
    })
    return errors
  }

  return null
}

export { defaultOptions, validateOptions }
