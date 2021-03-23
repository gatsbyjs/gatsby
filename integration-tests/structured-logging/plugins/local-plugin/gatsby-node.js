exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    required: Joi.boolean().required(),
    optionalString: Joi.string(),
  })
}

exports.onPreInit = ({ reporter }) => reporter.info("Initialized local-plugin")
