const supportedExtensions = require(`./supported-extensions`)

module.exports = ({ createResolvers, reporter }) => {
  const resolvers = {
    File: {
      childImageSharp: {
        resolve: (parent, args, context, info) => {
          if (!supportedExtensions[parent.extension]) {
            reporter.warn(
              `You can't use childImageSharp together with .${parent.extension} files. The childImageSharp portion of the query in this file will return null:\n${context.componentPath}\n\nIf you want to display ${parent.name}.${parent.extension} on your site, use publicURL and a normal img tag instead.\nIf the files can be in multiple formats, you could check for a falsy value on childImageSharp and conditionally use e.g. gatsby-image.`
            )
          }
          return info.originalResolver(parent, args, context, info)
        },
      },
    },
  }

  createResolvers(resolvers)
}
