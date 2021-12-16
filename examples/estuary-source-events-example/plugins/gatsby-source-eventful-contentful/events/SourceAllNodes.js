const { createClient } = require("../utils/contentful-client")
const { defineSourceEvent } = require("gatsby/sourceror")

const { SourceContentType } = require("./SourceContentType")
const { CreateContentfulNodes } = require("./CreateContentfulNodes")

exports.SourceAllNodes = defineSourceEvent({
  type: `SourceAllNodes`,
  description: `Sources all Contentful nodes for Gatsby cold builds.`,

  handler: async ({}, { pluginOptions }) => {
    const response = await createClient({ pluginOptions }).getContentTypes()

    // CreateContentfulNodes({ response })

    response.items.forEach(({ sys: { id } }) => {
      SourceContentType({ contentTypeId: id })
    })
  },
})
