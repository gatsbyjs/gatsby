const _ = require(`lodash`)
const minimatch = require(`minimatch`)

// const { getPrevAndNext } = require(`../get-prev-and-next.js`)
const { getMdxContentSlug } = require(`./get-mdx-content-slug`)
const findApiCalls = require(`../find-api-calls`)

const ignorePatterns = [
  `**/commonjs/**`,
  `**/node_modules/**`,
  `**/__tests__/**`,
  `**/dist/**`,
  `**/__mocks__/**`,
  `babel.config.js`,
  `graphql.js`,
  `**/flow-typed/**`,
]

function isCodeFile(node) {
  return (
    node.internal.type === `File` &&
    node.sourceInstanceName === `gatsbyjs` &&
    [`js`].includes(node.extension) &&
    !ignorePatterns.some(ignorePattern =>
      minimatch(node.relativePath, ignorePattern)
    )
  )
}

// convert a string like `/some/long/path/name-of-docs/` to `name-of-docs`
const slugToAnchor = slug =>
  slug
    .split(`/`) // split on dir separators
    .filter(item => item !== ``) // remove empty values
    .pop() // take last item

exports.sourceNodes = ({ actions: { createTypes } }) => {
  createTypes(/* GraphQL */ `
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
      ossDoc: Boolean
      relPath: String
    }
    type File implements Node {
      childrenDocumentationJs: DocumentationJs
      fields: FileFields
    }
    # Added by gatsby-transformer-gitinfo
    # TODO add these back upstream
    type FileFields {
      gitLogLatestDate: Date @dateformat
      gitLogLatestAuthorName: String
      gitLogLatestAuthorEmail: String
    }
    type DocumentationJSComponentDescription implements Node {
      childMdx: Mdx
    }
    type GatsbyAPICall implements Node @derivedTypes @dontInfer {
      name: String
      file: String
      group: String
      codeLocation: GatsbyAPICallCodeLocation
    }
    type GatsbyAPICallCodeLocation @dontInfer {
      filename: Boolean
      end: GatsbyAPICallEndpoint
      start: GatsbyAPICallEndpoint
    }
    type GatsbyAPICallEndpoint @dontInfer {
      column: Int
      line: Int
    }
  `)
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const docsTemplate = require.resolve(`../../templates/docs/index`)
  const apiTemplate = require.resolve(`../../templates/docs/api-reference`)

  // TODO: remove this limit so that all pages are built
  const { data, errors } = await graphql(
    /* GraphQL */ `
      query($limitMdx: Int) {
        allMdx(filter: { fields: { ossDoc: { eq: true } } }, limit: $limitMdx) {
          nodes {
            fields {
              slug
              ossDoc
            }
            frontmatter {
              title
              jsdoc
              apiCalls
            }
          }
        }
      }
    `,
    { limitMdx: +process.env.LIMIT_MDX || 9999 }
  )
  if (errors) throw errors

  // Create docs pages from OSS repo.
  data.allMdx.nodes.forEach(node => {
    const slug = _.get(node, `fields.slug`)
    if (!slug) return
    // const prevAndNext = getPrevAndNext(node.fields.slug)

    if (node.frontmatter.jsdoc) {
      // API template
      createPage({
        path: `${node.fields.slug}`,
        component: apiTemplate,
        context: {
          slug: node.fields.slug,
          jsdoc: node.frontmatter.jsdoc.map(
            jsdoc => `packages/gatsby/${jsdoc}`
          ),
          apiCalls: node.frontmatter.apiCalls,
          // ...prevAndNext,
        },
      })
    } else {
      // Docs template
      createPage({
        path: `${node.fields.slug}`,
        component: docsTemplate,
        context: {
          slug: node.fields.slug,
          // ...prevAndNext,
        },
      })
    }
  })
}

exports.onCreateNode = async ({
  node,
  actions,
  getNode,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode, createParentChildLink, createNodeField } = actions
  /*
  if (isCodeFile(node)) {
    const calls = await findApiCalls({ node, loadNodeContent })

    if (calls.length > 0) {
      calls.forEach(call => {
        const apiCallNode = {
          id: createNodeId(`findApiCalls-${JSON.stringify(call)}`),
          parent: node.id,
          children: [],
          ...call,
          internal: {
            type: `GatsbyAPICall`,
          },
        }
        apiCallNode.internal.contentDigest = createContentDigest(apiCallNode)

        createNode(apiCallNode)
        createParentChildLink({ parent: node, child: apiCallNode })
      })
    }
    return
  }
  */

  const slug = getMdxContentSlug(node, getNode(node.parent))
  if (!slug) return

  const section = slug.split(`/`)[1]
  // fields for blog pages are handled in `utils/node/blog.js`
  if (section === `blog`) return

  // Add other fields for docs pages
  if (slug) {
    createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
    createNodeField({ node, name: `section`, value: section })
  }
}

exports.createResolvers = ({ createResolvers }) => {
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
}
