const { supportedExtensions } = require(`./supported-extensions`)

module.exports = ({ createResolvers, reporter }) => {
  const resolvers = {
    File: {
      childImageSharp: {
        resolve: (parent, args, context, info) => {
          if (!supportedExtensions[parent.extension]) {
            reporter.warn(
              `You can't use childImageSharp together with ${parent.name}.${parent.extension} — use publicURL instead. The childImageSharp portion of the query in this file will return null:\n${context.componentPath}`
            )
          }
          return info.originalResolver(parent, args, context, info)
        },
      },
    },
  }

  createResolvers(resolvers)
}
