const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { createPath } = require('gatsby-page-utils')

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type Mdx implements Node {
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

  if (node.internal.type !== 'Mdx' && node.sourceInstanceName !== 'new-docs') return
  const slug = createFilePath({ node, getNode })

  if (!slug) return
  const section = slug.split(`/`)[1]

  // const parent = getNode(node.parent)
  // if (!parent) return // TODO: figure out why this is needed
  // if (parent.internal.type !== 'File') return
  // const relPath = parent.relativePath
  // if (!relPath) {
  //   console.log('no relpath', getNode(node.parent).internal.type)
  //   return
  // }

  // createNodeField({
  //   node,
  //   name: `relPath`,
  //   value: relPath,
  // })

  // let ossSlug = createPath(relPath)

  // createNodeField({
  //   node,
  //   name: `slug`,
  //   value: ossSlug,
  // })


  createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
  createNodeField({ node, name: `section`, value: section })
}

