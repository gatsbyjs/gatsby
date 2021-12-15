const { defineSourceEvent } = require("gatsby/sourceror")

exports.CreateContentfulNodes = defineSourceEvent({
  type: `CreateContentfulNodes`,
  description: `Creates gatsby-source-contentful nodes from a Contentful client response`,

  handler: (
    { response },
    { createNode, createContentDigest, createNodeId }
  ) => {
    ;(response.entries || response.items || []).forEach(entry =>
      createNode({
        id: createNodeId(`${entry.sys.space.sys.id}-${entry.sys.id}`),
        type: `Contentful${entry.sys.type}`,
        contentDigest: entry.sys.updatedAt || createContentDigest(entry),
        fields: {
          contentfulFields: entry.fields,
          sys: entry.sys,
        },
      })
    )
  },
})
