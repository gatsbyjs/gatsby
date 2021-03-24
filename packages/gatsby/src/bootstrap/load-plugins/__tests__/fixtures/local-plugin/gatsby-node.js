exports.pluginOptionsSchema = ({ Joi }) => Joi.object({
  required: Joi.boolean().required(),
  optionalString: Joi.string()
});