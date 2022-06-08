const typeDefs = [
  `
    interface MarkdownRemark implements Node @infer @childOf(mimeTypes: ["text/markdown", "text/x-markdown"]) {
      id: ID!
      children: [Node!]!
      excerpt(pruneLength: Int, truncate: Boolean, format: MarkdownRemarkExcerptFormats): String
      excerptAst(pruneLength: Int, truncate: Boolean): JSON
      fileAbsolutePath: String
      headings(depth: MarkdownRemarkHeadingLevels): [MarkdownRemarkHeading]
      html: String
      htmlAst: JSON
      internal: Internal!
      parent: Node
      rawMarkdownBody: String
      slug: String
      tableOfContents(absolute: Boolean, pathToSlugField: String, maxDepth: Int, heading: String): String
      timeToRead: Int
      wordCount: MarkdownRemarkWordCount
    }

    enum MarkdownRemarkExcerptFormats {
      PLAIN
      HTML
      MARKDOWN
    }

    enum MarkdownRemarkHeadingLevels {
      h1
      h2
      h3
      h4
      h5
      h6
    }

    type MarkdownRemarkHeading {
      id: String
      value: String
      depth: Int
    }

    type MarkdownRemarkWordCount {
      paragraphs: Int
      sentences: Int
      words: Int
    }
  `,
]

module.exports = (helpers, pluginOptions) => {
  const { actions } = helpers
  const { plugins, contentTypes } = pluginOptions

  if (contentTypes) {
    for (const type of contentTypes.types) {
      const graphQLType = `MarkdownRemark${type}`

      typeDefs.push(`
        type ${graphQLType} implements Node & MarkdownRemark @infer @childOf(mimeTypes: ["text/markdown", "text/x-markdown"]) {
          id: ID!
          children: [Node!]!
          excerpt(pruneLength: Int, truncate: Boolean, format: MarkdownRemarkExcerptFormats): String
          excerptAst(pruneLength: Int, truncate: Boolean): JSON
          fileAbsolutePath: String
          headings(depth: MarkdownRemarkHeadingLevels): [MarkdownRemarkHeading]
          html: String
          htmlAst: JSON
          internal: Internal!
          parent: Node
          rawMarkdownBody: String
          slug: String
          tableOfContents(absolute: Boolean, pathToSlugField: String, maxDepth: Int, heading: String): String
          timeToRead: Int
          wordCount: MarkdownRemarkWordCount
        }
      `)
    }
  }

  actions.createTypes(typeDefs)

  // This allows subplugins to use Node APIs bound to `gatsby-transformer-remark`
  // to customize the GraphQL schema. This makes it possible for subplugins to
  // modify types owned by `gatsby-transformer-remark`.
  plugins.forEach(plugin => {
    const resolvedPlugin =
      _CFLAGS_.GATSBY_MAJOR === `4` ? plugin.module : require(plugin.resolve)

    if (typeof resolvedPlugin.createSchemaCustomization === `function`) {
      resolvedPlugin.createSchemaCustomization(helpers, plugin.pluginOptions)
    }
  })
}

module.exports.typeDefs = typeDefs
