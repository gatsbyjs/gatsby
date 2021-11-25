// @ts-check
import _ from "lodash"
import { fetchContentTypes } from "./fetch"
import { generateSchema } from "./generate-schema"
import { createPluginConfig } from "./plugin-options"

async function getContentTypesFromContentFul({
  cache,
  reporter,
  pluginConfig,
}) {
  // Get content type items from Contentful
  const contentTypeItems = await fetchContentTypes({ pluginConfig, reporter })

  // Store processed content types in cache for sourceNodes
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`
  const CACHE_CONTENT_TYPES = `contentful-content-types-${sourceId}`
  await cache.set(CACHE_CONTENT_TYPES, contentTypeItems)

  console.log(JSON.stringify(contentTypeItems, null, 2))

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
    contentTypeItems = await getContentTypesFromContentFul({
      cache,
      reporter,
      pluginConfig,
    })
  }

  // Generate schemas based on Contentful content model
  generateSchema({ createTypes, schema, pluginConfig, contentTypeItems })
}
