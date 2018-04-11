const algoliasearch = require(`algoliasearch`)
const crypto = require(`crypto`)

const client = algoliasearch(`OFCNCOG2CU`, `6fbcaeafced8913bf0e4d39f0b541957`)
var index = client.initIndex(`npm-search`)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

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
  { boundActionCreators, createNodeId },
  { keywords }
) => {
  const { createNode } = boundActionCreators

  console.log(`Grabbing local NPM packages...`)

  const buildFilter = keywords.map(keyword => `keywords:${keyword}`)

  const hits = await browse({
    index,
    filters: `(${buildFilter.join(` OR `)})`,
    hitsPerPage: 1000,
  })

  hits.forEach(hit => {
    // commented changed remove all badges and images from readme content to keep the creation of the node from failing below
    // if (hit.readme.includes(`![`)) {
    //   hit.readme = hit.readme.replace(/[[]?!\[.*\b/gi, ``)
    //   console.log(hit.name)
    // }

    const parentId = createNodeId(`plugin ${hit.objectID}`)
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

  return
}
