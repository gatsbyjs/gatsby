const path = require(`path`)
const findApiCalls = require(`./find-api-calls`)

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const searchPath = path.join(process.cwd(), `../`)
  const globRegex = `${searchPath}**/*.js`

  const buckets = await findApiCalls(globRegex)

  /*
  ApiCalls {
    edges {
      group // SSR, Browser
      name
      hits {
        location // line
      }
    }
  }
  */

  buckets.forEach(bucket => {
    bucket.hits.forEach((hits, api) => {
      const apiHits = hits.map(
        hit =>
          `https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/${
            hit.file
          }#L${hit.location.start.line}-L${hit.location.end.line}`
      )

      const node = {
        id: createNodeId(`findApiCalls-${bucket.group}-${api}`),
        parent: null,
        children: [],
        group: bucket.group,
        name: api,
        hits: apiHits,
        //[api]: apiHits,
        internal: {
          type: `GatsbyAPICall`,
          //content: JSON.stringify(api),
          //contentDigest: createContentDigest(api),
        },
      }

      node.internal.contentDigest = createContentDigest(node)

      createNode(node)
    })
  })

  console.log(buckets)
}
