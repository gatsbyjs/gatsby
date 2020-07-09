const _ = require(`lodash`)
const minimatch = require(`minimatch`)
const { getMdxContentSlug } = require(`../get-mdx-content-slug`)
const { getTemplate } = require(`../get-template`)
const findApiCalls = require(`../find-api-calls`)

const { loadYaml } = require(`../load-yaml`)
const navLinks = {
  docs: loadYaml(`src/data/sidebars/doc-links.yaml`),
  tutorial: loadYaml(`src/data/sidebars/tutorial-links.yaml`),
  contributing: loadYaml(`src/data/sidebars/contributing-links.yaml`),
}

// flatten sidebar links trees for easier next/prev link calculation
function flattenList(itemList) {
  return itemList.reduce((reducer, { items, ...rest }) => {
    reducer.push(rest)
    if (items) reducer.push(...flattenList(items))
    return reducer
  }, [])
}

function normalize(slug) {
  return slug.endsWith(`/`) ? slug : `${slug}/`
}

const flattenedNavs = _.mapValues(navLinks, navList => {
  const flattened = flattenList(navList[0].items)
  return flattened.filter(item => item.link && !item.link.includes(`#`))
})

const navIndicesBySlug = _.mapValues(flattenedNavs, navList =>
  Object.fromEntries(
    navList.map((item, index) => [normalize(item.link), index])
  )
)

function getPrevAndNext(section, slug) {
  const sectionNav = flattenedNavs[section]
  if (!sectionNav) return null
  const index = navIndicesBySlug[section][normalize(slug)]
  if (_.isNil(index)) return null
  return {
    prev: sectionNav[index - 1].link || null,
    next: sectionNav[index + 1].link || null,
  }
}

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
    node.sourceInstanceName === `gatsby-core` &&
    [`js`].includes(node.extension) &&
    !ignorePatterns.some(ignorePattern =>
      minimatch(node.relativePath, ignorePattern)
    )
  )
}

function mdxResolverPassthrough(fieldName) {
  return async (source, args, context, info) => {
    const type = info.schema.getType(`Mdx`)
    const mdxNode = context.nodeModel.getNodeById({
      id: source.parent,
    })
    const resolver = type.getFields()[fieldName].resolve
    const result = await resolver(mdxNode, args, context, {
      fieldName,
    })
    return result
  }
}

// convert a string like `/some/long/path/name-of-docs/` to `name-of-docs`
const slugToAnchor = slug =>
  slug
    .split(`/`) // split on dir separators
    .filter(item => item !== ``) // remove empty values
    .pop() // take last item

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  createTypes(/* GraphQL */ `
    type NavItem implements Node @dontInfer {
      slug: String
      title: String!
      section: String!
      docPage: DocPage @link(by: "slug")
      prev: NavItem @link(by: "slug")
      next: NavItem @link(by: "slug")
      items: [NavItem] @link(by: "slug")
    }

    type DocPage implements Node @dontInfer @childOf(types: ["Mdx"]) {
      slug: String!
      nav: NavItem @link(from: "slug", by: "slug")
      anchor: String!
      relativePath: String!
      # Frontmatter-derived fields
      title: String!
      description: String # TODO this should default to excerpt
      disableTableOfContents: Boolean
      tableOfContentsDepth: Int
      issue: String
      # Frontmatter fields for API docs
      jsdoc: [String!]
      apiCalls: String
      contentsHeading: String
      showTopLevelSignatures: Boolean
      # Fields derived from Mdx
      body: String!
      timeToRead: Int
      tableOfContents: JSON
      excerpt: String!
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

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    DocPage: {
      body: {
        resolve: mdxResolverPassthrough(`body`),
      },
      timeToRead: {
        resolve: mdxResolverPassthrough(`timeToRead`),
      },
      tableOfContents: {
        resolve: mdxResolverPassthrough(`tableOfContents`),
      },
      excerpt: {
        resolve: mdxResolverPassthrough(`excerpt`),
      },
    },
  })
}

// FIXME the way this renders makes console print "createPage" on loop
async function traverseHierarchy(hierarchy, fn) {
  for (let item of hierarchy) {
    await fn(item)
    if (item.items) {
      await traverseHierarchy(item.items, fn)
    }
  }
}

async function createNavItemNodes(
  section,
  navItems,
  { actions, createNodeId, createContentDigest }
) {
  const { createNode } = actions
  await traverseHierarchy(navItems[0].items, async navItem => {
    // FIXME add a `section` to the ID to disambiguate between cross-links
    const navItemId = createNodeId(
      `navItem-${section}-${navItem.link || navItem.title}`
    )
    // FIXME figure out how not to duplicate this logic
    const { prev, next } = getPrevAndNext(section, navItem.link || ``) || {}
    await createNode({
      id: navItemId,
      section,
      slug: navItem.link,
      docPage: navItem.link,
      prev,
      next,
      items: navItem.items && navItem.items.map(x => x.link),
      title: navItem.title,
      children: [],
      internal: {
        type: `NavItem`,
        contentDigest: createContentDigest(navItem),
        content: JSON.stringify(navItem),
        description: `A navigation item`,
      },
    })
  })
}

exports.sourceNodes = async helpers => {
  Promise.all(
    _.map(navLinks, (navList, section) => {
      createNavItemNodes(section, navList, helpers)
    })
  )
}

exports.onCreateNode = async ({
  node,
  actions,
  getNode,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode, createParentChildLink } = actions

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

  // const locale = `en`
  const section = slug.split(`/`)[1]
  // fields for blog pages are handled in `utils/node/blog.js`
  if (section === `blog`) return

  const fieldData = {
    ...node.frontmatter,
    slug,
    nav: slug,
    anchor: slugToAnchor(slug),
    relativePath: getNode(node.parent).relativePath,
  }

  const docPageId = createNodeId(`${node.id} >>> DocPage`)
  await createNode({
    ...fieldData,
    // Required fields.
    id: docPageId,
    parent: node.id,
    children: [],
    internal: {
      type: `DocPage`,
      contentDigest: createContentDigest(fieldData),
      content: JSON.stringify(fieldData),
      description: `A documentation page`,
    },
  })
  createParentChildLink({ parent: node, child: getNode(docPageId) })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const docsTemplate = getTemplate(`template-docs-markdown`)
  const apiTemplate = getTemplate(`template-api-markdown`)

  const { data, errors } = await graphql(/* GraphQL */ `
    query {
      allDocPage(limit: 10000) {
        nodes {
          slug
          title
          jsdoc
          apiCalls
        }
      }
    }
  `)
  if (errors) throw errors

  // Create docs pages.
  data.allDocPage.nodes.forEach(node => {
    if (!node.slug) return

    if (node.jsdoc) {
      // API template
      createPage({
        path: `${node.slug}`,
        component: apiTemplate,
        context: {
          slug: node.slug,
          jsdoc: node.jsdoc,
          apiCalls: node.apiCalls,
        },
      })
    } else {
      // Docs template
      createPage({
        path: `${node.slug}`,
        component: docsTemplate,
        context: {
          slug: node.slug,
        },
      })
    }
  })
}
