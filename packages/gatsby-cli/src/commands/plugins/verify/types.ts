export class GatsbyNodeNotFound extends Error {
  constructor() {
    super(
      `\n⚠️  This project doesn't own a "gatsby-node.js" file. To run the gatsby plugin verify command, you must have a gatsby-node.js file with a "pluginOptionsSchema" function exported.`
    )
  }
}
export class PluginOptionsSchemaNotFound extends Error {
  constructor() {
    super(`\n⚠️  The gatsby-node.js file in this project doesn't export the "pluginOptionsSchema". Here's an example:

    exports.pluginOptionsSchema = ({ Joi }) =>
      Joi.object({
          trackingId: Joi.string()
            .required()
            .description(
              "The property ID; the tracking code won't be generated without it"
            ),
        })`)
  }
}
export class InvalidPluginOptionType extends Error {
  constructor(actualType: string) {
    super(`\n⚠️  The "pluginOptionsSchema" is actually of type "${actualType}" while it should be of type "function". Here is the signature of the "pluginOptionsSchema" function:

    exports.pluginOptionsSchema = ({ Joi }) => /* schema goes here */
    `)
  }
}
export class JoiSchemaError extends Error {
  constructor(details: string) {
    super(`\n⚠️  An error occurred when trying to validate the schema. It might be incorrect:

    ${details}
    `)
  }
}
