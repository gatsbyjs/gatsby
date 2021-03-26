exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    required: Joi.boolean().required(),
    optionalString: Joi.string(),
  })
}
