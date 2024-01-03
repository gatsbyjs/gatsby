const got = require(`got`)
const url = require(`url`)
const { browse } = require(`./search`)

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type NPMPackage implements Node {
      name: String!
      slug: String!
      title: String!
      created: Date! @dateformat
      modified: Date! @dateformat
      deprecated: String
      downloadsLast30Days: Int!
      downloadsRatio: Float!
      humanDownloadsLast30Days: String!
      popular: Boolean!
      version: String!
      description: String
      gitHead: String
      homepage: String
      license: String
      keywords: [String]
      computedKeywords: [String]
      moduleTypes: [String]
      lastCrawl: Date @dateformat
      dependents: Int!
      humanDependents: String
      changelogFilename: String
      jsDelivrHits: Int!
      objectID: String
      readme: NPMPackageReadme @link
      repository: NPMPackageRepository
      githubRepo: NPMPackageGithubRepo
      owner: NPMPackageOwner
      owners: [NPMPackageOwner]
      lastPublisher: NPMPackageOwner
      _searchInternal: NPMPackage_searchInternal
    }
    type NPMPackageReadme implements Node @dontInfer @mimeTypes(types: ["text/markdown"]) {
      slug: String!
    }
    type NPMPackageRepository {
      url: String
      project: String
      user: String
      host: String
      path: String
      head: String
      branch: String
      type: String
      directory: String
    }
    type NPMPackageGithubRepo {
      user: String
      project: String
      path: String
      head: String
    }
    type NPMPackageOwner {
      name: String
      avatar: String
      link: String
      email: String
    }
    type NPMPackage_searchInternal {
      alternativeNames: [String]
      downloadsMagnitude: Int
      jsDelivrPopularity: Int
      concatenatedName: String
    }
  `)
}

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  { keywords }
) => {
  const { createNode } = actions

  const buildFilter = keywords.map(keyword => `keywords:${keyword}`)

  const hits = await browse({
    filters: `(${buildFilter.join(` OR `)})`,
    hitsPerPage: 1000,
  })

  await Promise.all(
    hits.map(async hit => {
      const parentId = createNodeId(`plugin ${hit.objectID}`)

      if (
        !hit.readme ||
        hit.objectID === `gatsby-plugin-gatsby-cloud` ||
        hit.objectID === `gatsby-source-contentful`
      ) {
        try {
          hit.readme = (
            await got.get(
              url.resolve(`https://unpkg.com/`, `/${hit.objectID}/README.md`)
            )
          ).body
        } catch (err) {
          // carry-on
        }
      }

      const readmeNode = {
        id: createNodeId(`readme ${hit.objectID}`),
        parent: parentId,
        slug: `/packages/en/${hit.objectID}`,
        children: [],
        internal: {
          type: `NPMPackageReadme`,
          mediaType: `text/markdown`,
          content: hit.readme !== undefined ? hit.readme : ``,
        },
      }
      readmeNode.internal.contentDigest = createContentDigest(readmeNode)
      // Remove unneeded data
      delete hit.readme
      delete hit.versions

      const node = {
        ...hit,
        deprecated: `${hit.deprecated}`,
        created: new Date(hit.created),
        modified: new Date(hit.modified),
        id: parentId,
        parent: null,
        children: [],
        slug: `/packages/${hit.objectID}/`,
        readme: readmeNode.id,
        title: `${hit.objectID}`,
        internal: {
          type: `NPMPackage`,
          content: hit.readme !== undefined ? hit.readme : ``,
        },
      }
      node.internal.contentDigest = createContentDigest(node)
      createNode(readmeNode)
      createNode(node)
    })
  )

  return
}
