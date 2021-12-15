const { defineSourceEvent } = require("gatsby/plugin")

exports.CreateContentfulNodes = defineSourceEvent({
  type: `CreateContentfulNodes`,
  description: `Creates gatsby-source-contentful nodes from a Contentful client response`,

  handler: ({ response }, { createNode, createContentDigest }) => {
    ;(response.entries || response.items || []).forEach(entry =>
      createNode({
        id: `contentful-${entry.sys.space.sys.id}-${entry.sys.id}`,
        contentfulFields: entry.fields,
        sys: entry.sys,
        internal: {
          type: `Contentful${entry.sys.type}`,
          contentDigest: entry.sys.updatedAt || createContentDigest(entry),
        },
      })
    )
  },
})
