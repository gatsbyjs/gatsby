const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MdxDoc implements Node {
      id: ID!
      body: String!
      slug: String!
      frontmatter: MdxFrontmatter
      fields: MdxFields
    }
    type MDXFrontmatterExample @dontInfer {
      label: String!
      href: String!
    }
    type MdxFrontmatter @dontInfer {
      title: String!
      examples: [MDXFrontmatterExample]
      subtitle: String
      description: String
      contentsHeading: String
      showTopLevelSignatures: Boolean
      disableTableOfContents: Boolean
      tableOfContentsDepth: Int
      overview: Boolean
      issue: String
      jsdoc: [String!]
      apiCalls: String
      redirects: [String]
      snippet: Boolean
    }
    type MdxFields @dontInfer {
      slug: String
      anchor: String
      section: String
      locale: String
      released: Boolean
      # ossDoc: Boolean
      # relPath: String
    }

    ## TODO make this work
    ## type File implements Node {
    ##   childrenDocumentationJs: DocumentationJs
    ##   fields: FileFields
    ## }

    # Added by gatsby-transformer-gitinfo
    # TODO add these back upstream
    # type FileFields {
    #   gitLogLatestDate: Date @dateformat
    #   gitLogLatestAuthorName: String
    #   gitLogLatestAuthorEmail: String
    # }

    ## type DocumentationJSComponentDescription implements Node {
    ##   childMdx: Mdx
    ## }

    # type GatsbyAPICall implements Node @derivedTypes @dontInfer {
    #   name: String
    #   file: String
    #   group: String
    #   codeLocation: GatsbyAPICallCodeLocation
    # }
    # type GatsbyAPICallCodeLocation @dontInfer {
    #   filename: Boolean
    #   end: GatsbyAPICallEndpoint
    #   start: GatsbyAPICallEndpoint
    # }
    # type GatsbyAPICallEndpoint @dontInfer {
    #   column: Int
    #   line: Int
    # }
  `)
}

exports.createResolvers = async ({ createResolvers, reporter }) => {
  createResolvers({
    MdxDoc: {
      body: {
        type: 'String!',
        resolve: async(source, args, context, info) => {
          const type = info.schema.getType('Mdx')
          const parent = context.nodeModel.getNodeById({
            id: source.parent,
          })
          const resolver = type.getFields().body.resolve
          const result = await resolver(parent, args, context, {
            fieldName: 'body',
          })
          return result
        },
      }
    },
  })
  /* TODO: JSDoc
  createResolvers({
    DocumentationJs: {
      availableIn: {
        type: `[String]`,
        resolve(source) {
          const { tags } = source
          if (!tags || !tags.length) {
            return []
          }

          const availableIn = tags.find(tag => tag.title === `availableIn`)
          if (availableIn) {
            return availableIn.description
              .split(`\n`)[0]
              .replace(/[[\]]/g, ``)
              .split(`,`)
              .map(api => api.trim())
          }

          return []
        },
      },
    },
  })
  */
}

const slugToAnchor = slug => slug
  .split(`/`) // split on dir separators
  .filter(item => item !== ``) // remove empty values
  .pop() // take last item

exports.onCreateNode = async ({
  node,
  getNode,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  const { createNodeField, createNode, createParentChildLink } = actions

  if (node.internal.type !== 'Mdx') return
  const parent = getNode(node.parent)
  if (parent.sourceInstanceName !== 'theme-official-docs') return

  const id = createNodeId(`${node.id} >>> MdxDoc`)
  const slug = createFilePath({ node, getNode })
  const anchor = slugToAnchor(slug)
  const section = slug.split(`/`)[1]

  const {
    frontmatter,
    fileAbsolutePath,
    excerpt,
    rawBody,
  } = node


  await actions.createNode({
    id,
    slug,
    parent: node.id,
    children: [],
    frontmatter,
    fileAbsolutePath,
    excerpt,
    rawBody,
    section,
    anchor,
    internal: {
      type: 'MdxDoc',
      contentDigest: createContentDigest(rawBody),
      content: rawBody,
      description: 'Docs-specific MDX implementation',
    },
  })
}
