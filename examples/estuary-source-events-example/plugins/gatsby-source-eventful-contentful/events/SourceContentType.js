const { defineSourceEvent } = require("gatsby/sourceror")
const { createClient } = require("../utils/contentful-client")
const { CreateContentfulNodes } = require("./CreateContentfulNodes")

const SourceContentType = defineSourceEvent({
  type: `SourceContentType`,
  description: `Fetches Contentful content types and then sources nodes in each type.`,

  handler: async ({ contentTypeId, syncToken = null }, { pluginOptions }) => {
    const client = createClient({ pluginOptions })

    // for each content type, start paging through and fetching data
    const response = await client.sync({
      initial: !syncToken,
      nextSyncToken: syncToken,
      content_type: contentTypeId,
    })

    // for each page response, create entry nodes
    CreateContentfulNodes({ response })

    const { nextSyncToken } = response

    // and fetch another page of data if needed
    if (nextSyncToken && nextSyncToken !== syncToken) {
      SourceContentType({
        contentTypeId,
        syncToken: response.nextSyncToken,
      })
    }
  },
})

exports.SourceContentType = SourceContentType
