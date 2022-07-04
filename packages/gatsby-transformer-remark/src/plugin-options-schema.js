module.exports = function pluginOptionsSchema({ Joi }) {
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
    contentTypes: Joi.object({
      resolveType: Joi.alternatives(Joi.string(), Joi.function())
        .required()
        .description(
          `A string representing the key that defines the content type of a markdown file or a function that resolves to a content type.`
        ),
      types: Joi.array()
        .items(Joi.string())
        .unique()
        .required()
        .description(
          `A list of potential types that 'resolveType' can return.`
        ),
    }).description(
      `An object defining optional custom content types to sort markdown files into when creating the data layer.`
    ),
    plugins:
      _CFLAGS_.GATSBY_MAJOR === `4`
        ? Joi.subPlugins().description(
            `A list of remark plugins. See also: https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark for examples`
          )
        : Joi.array()
            .items(
              Joi.string(),
              Joi.object({
                resolve: Joi.string(),
                options: Joi.object({}).unknown(true),
              })
            )
            .default([])
            .description(
              `A list of remark plugins. See also: https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark for examples`
            ),
  }).default({})
}
