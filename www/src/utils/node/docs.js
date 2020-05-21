const _ = require(`lodash`)
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const minimatch = require(`minimatch`)

const { getPrevAndNext } = require(`../get-prev-and-next.js`)
const { getMdxContentSlug } = require(`../get-mdx-content-slug`)
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
    node.sourceInstanceName === `packages` &&
    [`js`].includes(node.extension) &&
    minimatch(node.relativePath, `gatsby/**`) &&
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

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
  const apiTemplate = path.resolve(`src/templates/template-api-markdown.js`)

  const { data, errors } = await graphql(`
    query {
      allMdx(
        limit: 10000
        filter: {
          fileAbsolutePath: { ne: null }
          fields: { locale: { eq: "en" }, section: { ne: "blog" } }
        }
      ) {
        nodes {
          fields {
            slug
            locale
          }
          frontmatter {
            title
            jsdoc
            apiCalls
          }
        }
      }
    }
  `)
  if (errors) throw errors

  // Create docs pages.
  data.allMdx.nodes.forEach(node => {
    const slug = _.get(node, `fields.slug`)
    const locale = _.get(node, `fields.locale`)
    if (!slug) return

    const prevAndNext = getPrevAndNext(node.fields.slug)
    if (node.frontmatter.jsdoc) {
      // API template
      createPage({
        path: `${node.fields.slug}`,
        component: slash(apiTemplate),
        context: {
          slug: node.fields.slug,
          jsdoc: node.frontmatter.jsdoc,
          apiCalls: node.frontmatter.apiCalls,
          ...prevAndNext,
        },
      })
    } else {
      // Docs template
      createPage({
        path: `${node.fields.slug}`,
        component: slash(docsTemplate),
        context: {
          slug: node.fields.slug,
          locale,
          ...prevAndNext,
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

  const slug = getMdxContentSlug(node, getNode(node.parent))
  if (!slug) return

  const locale = `en`
  const section = slug.split(`/`)[1]
  // fields for blog pages are handled in `utils/node/blog.js`
  if (section === `blog`) return

  // Add slugs and other fields for docs pages
  if (slug) {
    createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
    createNodeField({ node, name: `slug`, value: slug })
    createNodeField({ node, name: `section`, value: section })
  }
  if (locale) {
    createNodeField({ node, name: `locale`, value: locale })
  }
}
