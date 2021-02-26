const fs = require('fs')
const path = require('path')

let validatedOptionsSchema = false;

exports.pluginOptionsSchema = ({ Joi }) => {
  validatedOptionsSchema = true;
  return Joi.object({
    required: Joi.boolean().required(),
    optionalString: Joi.string(),
  })
}

exports.onPostBuild = () => {
  fs.writeFileSync(path.join('./public', 'local-plugin-loaded'), validatedOptionsSchema.toString());
}