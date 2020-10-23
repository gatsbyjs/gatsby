const {
  onCreateNode,
  unstable_shouldOnCreateNode,
} = require(`./on-node-create`)
exports.onCreateNode = onCreateNode
exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.createSchemaCustomization = require(`./create-schema-customization`)
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)

if (process.env.GATSBY_EXPERIMENTAL_PLUGIN_OPTION_VALIDATION) {
  exports.pluginOptionsSchema = function ({ Joi }) {
    return Joi.object({
      commonmark: Joi.boolean().description(
        `Activates CommonMark mode (default: true)`
      ),
      footnotes: Joi.boolean().description(
        `Activates Footnotes mode (default: true)`
      ),
      pedantic: Joi.boolean().description(
        `Activates pedantic mode (default: true)`
      ),
      gfm: Joi.boolean().description(
        `Activates GitHub Flavored Markdown mode (default: true)`
      ),
      plugins: Joi.array()
        .items(
          Joi.string(),
          Joi.object({
            resolve: Joi.string(),
            options: Joi.object({}).unknown(true),
          })
        )
        .description(
          `A list of remark plugins. See also: https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark for examples`
        ),
    })
  }
}
