const minimatch = require(`minimatch`)

const { getPrevAndNext } = require(`../get-prev-and-next.js`)
const { getMdxContentSlug } = require(`../get-mdx-content-slug`)
const { getTemplate } = require(`../get-template`)
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

exports.createSchemaCustomization = ({ schema, actions: { createTypes } }) => {
  createTypes(
    schema.buildObjectType({
      name: `DocPage`,
      interfaces: [`Node`],
      extensions: {
        infer: false,
        childOf: { types: `Mdx` },
      },
      fields: {
        // Fields from MDX
        body: { type: `String!`, resolver: mdxResolverPassthrough(`body`) },
        timeToRead: {
          type: `Int`,
          resolver: mdxResolverPassthrough(`timeToRead`),
        },
        tableOfContents: {
          type: `JSON`,
          resolver: mdxResolverPassthrough(`tableOfContents`),
        },
        excerpt: {
          type: `String!`,
          resolver: mdxResolverPassthrough(`excerpt`),
        },
        slug: { type: `String!` },
        anchor: { type: `String` },
        title: { type: `String!` },
        // FIXME resolve this with `excerpt`
        description: { type: `String` },
        disableTableOfContents: { type: `Boolean` },
        tableOfContentsDepth: { type: `Int` },
        overview: { type: `Boolean` },
        issue: { type: `String` },
        latestUpdate: { type: `Date`, extensions: { dateformat: {} } },
        // API file fields
        jsdoc: { type: `[String!]` },
        apiCalls: { type: `String` },
        contentsHeading: { type: `String` },
        showTopLevelSignatures: { type: `Boolean` },
      },
    })
  )

  createTypes(/* GraphQL */ `
    # type Mdx implements Node {
    #   frontmatter: MdxFrontmatter
    #   fields: MdxFields
    # }

    # type MdxFrontmatter @dontInfer {
    #   title: String!
    #   description: String
    #   contentsHeading: String
    #   showTopLevelSignatures: Boolean
    #   disableTableOfContents: Boolean
    #   tableOfContentsDepth: Int
    #   overview: Boolean
    #   issue: String
    #   jsdoc: [String!]
    #   apiCalls: String
    # }

    # type MdxFields @dontInfer {
    #   slug: String
    #   anchor: String
    #   section: String
    #   locale: String
    # }

    type File implements Node {
      childrenDocumentationJs: DocumentationJs
      # fields: FileFields
    }

    # Added by gatsby-transformer-gitinfo
    # TODO add these back upstream
    # type FileFields {
    #   gitLogLatestDate: Date @dateformat
    #   gitLogLatestAuthorName: String
    #   gitLogLatestAuthorEmail: String
    # }

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

    const prevAndNext = getPrevAndNext(node.slug)
    if (node.jsdoc) {
      // API template
      createPage({
        path: `${node.slug}`,
        component: apiTemplate,
        context: {
          slug: node.slug,
          jsdoc: node.jsdoc,
          apiCalls: node.apiCalls,
          ...prevAndNext,
        },
      })
    } else {
      // Docs template
      createPage({
        path: `${node.slug}`,
        component: docsTemplate,
        context: {
          slug: node.slug,
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
    anchor: slugToAnchor(slug),
    latestUpdate: getNode(node.parent).fields.gitLogLatestUpdate,
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

  // Add slugs and other fields for docs pages
  // if (slug) {
  //   createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
  //   createNodeField({ node, name: `slug`, value: slug })
  //   createNodeField({ node, name: `section`, value: section })
  // }
  // if (locale) {
  //   createNodeField({ node, name: `locale`, value: locale })
  // }
}
