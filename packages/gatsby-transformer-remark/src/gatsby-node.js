const {
  onCreateNode,
  unstable_shouldOnCreateNode,
} = require(`./on-node-create`)
exports.onCreateNode = onCreateNode
exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.createSchemaCustomization = require(`./create-schema-customization`)
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)

exports.pluginOptionsSchema = function ({ Joi }) {
  return Joi.object({
    footnotes: Joi.boolean().description(
      `Activates Footnotes mode (default: true)`
    ),
    gfm: Joi.boolean().description(
      `Activates GitHub Flavored Markdown mode (default: true)`
    ),
    excerpt_separator: Joi.string().description(
      `If your Markdown file contains HTML, excerpt will not return a value. In that case, you can set an excerpt_separator to an HTML tag. Edit your Markdown files to include that HTML tag after the text you’d like to appear in the excerpt.`
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
