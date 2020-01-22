module.exports = ({ createResolvers, reporter }) => {
  const resolvers = {
    File: {
      childImageSharp: {
        resolve: (parent, args, context, info) => {
          if (parent.extension === `gif`) {
            reporter.warn(
              `You can't use childImageSharp together with .gif files. The childImageSharp portion of the query in this file will return null:\n${context.componentPath}\n\nIf you want to display ${parent.name}.gif on your site, use publicURL and a normal img tag instead.\nIf the files can be in multiple formats, you could check for a falsy value on childImageSharp and conditionally use e.g. gatsby-image.`
            )
          }
          return info.originalResolver(parent, args, context, info)
        },
      },
    },
  }

  createResolvers(resolvers)
}
