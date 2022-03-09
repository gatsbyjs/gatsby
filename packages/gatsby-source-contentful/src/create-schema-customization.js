// @ts-check
import _ from "lodash"
import { fetchContentTypes } from "./fetch"
import { generateSchema } from "./generate-schema"
import { createPluginConfig } from "./plugin-options"
import { CODES } from "./report"

async function getContentTypesFromContentful({
  cache,
  reporter,
  pluginConfig,
}) {
  // Get content type items from Contentful
  const allContentTypeItems = await fetchContentTypes({
    pluginConfig,
    reporter,
  })

  const contentTypeFilter = pluginConfig.get(`contentTypeFilter`)

  const contentTypeItems = allContentTypeItems.filter(contentTypeFilter)

  if (contentTypeItems.length === 0) {
    reporter.panic({
      id: CODES.ContentTypesMissing,
      context: {
        sourceMessage: `Please check if your contentTypeFilter is configured properly. Content types were filtered down to none.`,
      },
    })
  }

  // Store processed content types in cache for sourceNodes
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`
  const CACHE_CONTENT_TYPES = `contentful-content-types-${sourceId}`
  await cache.set(CACHE_CONTENT_TYPES, contentTypeItems)

  return contentTypeItems
}

export async function createSchemaCustomization(
  { schema, actions, reporter, cache },
  pluginOptions
) {
  const { createTypes } = actions

  const pluginConfig = createPluginConfig(pluginOptions)

  let contentTypeItems
  if (process.env.GATSBY_WORKER_ID) {
    const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
      `environment`
    )}`
    contentTypeItems = await cache.get(`contentful-content-types-${sourceId}`)
  } else {
    contentTypeItems = await getContentTypesFromContentful({
      cache,
      reporter,
      pluginConfig,
    })
  }

  // Generate schemas based on Contentful content model
  return generateSchema({
    createTypes,
    schema,
    pluginConfig,
    contentTypeItems,
    cache,
    actions,
  })
}
