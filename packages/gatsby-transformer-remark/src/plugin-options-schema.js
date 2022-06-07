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
    subtypes: Joi.object({
      resolveType: Joi.alternatives(Joi.string(), Joi.function()).required(),
      types: Joi.array().items(Joi.string()).unique().required(),
    }),
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
