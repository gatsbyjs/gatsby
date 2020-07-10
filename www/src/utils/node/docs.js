const _ = require(`lodash`)
const { getMdxContentSlug } = require(`../get-mdx-content-slug`)
const { getTemplate } = require(`../get-template`)

const { loadYaml } = require(`../load-yaml`)
const navLinks = {
  docs: loadYaml(`src/data/sidebars/doc-links.yaml`),
  tutorial: loadYaml(`src/data/sidebars/tutorial-links.yaml`),
  contributing: loadYaml(`src/data/sidebars/contributing-links.yaml`),
}

function* flattenList(itemList, parents = []) {
  for (const item of itemList) {
    yield {
      ...item,
      items: item.items ? item.items.map(child => child.link) : null,
      parents,
    }
    if (item.items) {
      yield* flattenList(item.items, [item.link, ...parents])
    }
  }
}

function normalize(slug) {
  return slug.endsWith(`/`) ? slug : `${slug}/`
}

const flattenedNavs = _.mapValues(navLinks, navList => [
  ...flattenList(navList[0].items),
])

const prevNextBySlug = _.mapValues(flattenedNavs, navList => {
  // ignore items without links and hashes when counting indices
  const filteredNavSlugs = navList
    .filter(item => item.link && !item.link.includes(`#`))
    .map(item => normalize(item.link))
  return Object.fromEntries(
    filteredNavSlugs.map((slug, index) => [
      slug,
      {
        prev: filteredNavSlugs[index - 1],
        next: filteredNavSlugs[index + 1],
      },
    ])
  )
})

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
      link: String
      title: String!
      section: String!
      docPage: DocPage @link(by: "slug")
      prev: NavItem @link(by: "link")
      next: NavItem @link(by: "link")
      items: [NavItem!] @link(by: "link")
      parents: [NavItem] @link(by: "link")
    }

    type DocPage implements Node @dontInfer @childOf(types: ["Mdx"]) {
      slug: String!
      nav: NavItem @link(from: "slug", by: "link")
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

async function createNavItemNode(
  section,
  navItem,
  { actions, createNodeId, createContentDigest }
) {
  const { createNode } = actions
  const navItemId = createNodeId(
    `navItem-${section}-${navItem.link || navItem.title}`
  )
  await createNode({
    id: navItemId,
    section,
    ...navItem,
    ...prevNextBySlug[section][normalize(navItem.link || ``)],
    docPage: navItem.link,
    children: [],
    internal: {
      type: `NavItem`,
      contentDigest: createContentDigest(navItem),
      content: JSON.stringify(navItem),
      description: `A navigation item`,
    },
  })
}

async function createNavItemNodes(section, navItems, helpers) {
  await Promise.all(
    navItems.map(navItem => createNavItemNode(section, navItem, helpers))
  )
}

exports.sourceNodes = async helpers => {
  await Promise.all(
    _.map(flattenedNavs, (navList, section) =>
      createNavItemNodes(section, navList, helpers)
    )
  )
}

exports.onCreateNode = async ({
  node,
  actions,
  getNode,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode, createParentChildLink } = actions

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
