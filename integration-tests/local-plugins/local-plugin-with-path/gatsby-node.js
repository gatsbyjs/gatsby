const fs = require("fs")
const path = require("path")

let validatedOptionsSchema = "DID NOT RUN VALIDATION"

exports.pluginOptionsSchema = ({ Joi }) => {
  validatedOptionsSchema = "VALIDATION RAN"
  return Joi.object({
    required: Joi.boolean().required(),
    optionalString: Joi.string(),
  })
}

exports.onPreInit = ({ reporter }) => reporter.info("Initialized local-plugin-with-path")

exports.onPostBuild = () => {
  fs.writeFileSync(
    path.join("./public", "local-plugin-with-path-loaded"),
    validatedOptionsSchema
  )
}
