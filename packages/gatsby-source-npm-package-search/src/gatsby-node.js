const algoliasearch = require(`algoliasearch`)
const got = require(`got`)
const url = require(`url`)

const client = algoliasearch(`OFCNCOG2CU`, `6fbcaeafced8913bf0e4d39f0b541957`)
var index = client.initIndex(`npm-search`)

function browse({ index, ...params }) {
  let hits = []
  const browser = index.browseAll(params)

  return new Promise((resolve, reject) => {
    browser.on(`result`, content => (hits = hits.concat(content.hits)))
    browser.on(`end`, () => resolve(hits))
    browser.on(`error`, err => reject(err))
  })
}

exports.sourceNodes = async (
  { boundActionCreators, createNodeId, createContentDigest },
  { keywords }
) => {
  const { createNode } = boundActionCreators

  const buildFilter = keywords.map(keyword => `keywords:${keyword}`)

  const hits = await browse({
    index,
    filters: `(${buildFilter.join(` OR `)})`,
    hitsPerPage: 1000,
  })

  await Promise.all(
    hits.map(async hit => {
      const parentId = createNodeId(`plugin ${hit.objectID}`)

      if (!hit.readme) {
        try {
          hit.readme = (await got.get(
            url.resolve(`https://unpkg.com/`, `/${hit.objectID}/README.md`)
          )).body
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
        readme___NODE: readmeNode.id,
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
