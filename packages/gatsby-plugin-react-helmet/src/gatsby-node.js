exports.pluginOptionsSchema = ({ Joi }) => Joi.object({})

exports.onPreInit = ({ reporter }) => {
  reporter.warn(
    `gatsby-plugin-react-helmet: Gatsby now has built-in support for modifying the document head. Learn more at https://gatsby.dev/gatsby-head`
  )
}
