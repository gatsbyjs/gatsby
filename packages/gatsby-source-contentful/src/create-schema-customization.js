// @ts-check
import _ from "lodash"
import { fetchContentTypes } from "./fetch"
import { generateSchema } from "./generate-schema"
import { createPluginConfig } from "./plugin-options"
import { CascadedContext } from "./cascaded-context"

async function getContentTypesFromContentful({
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

  const localeState = new CascadedContext({ reporter })

  actions.createResolverContext({ localeState })
  actions.createFieldExtension({
    name: `contentfulLocalized`,
    args: {
      contentfulFieldId: {
        type: `String!`,
      },
    },
    extend(options) {
      return {
        args: {
          locale: `String`,
        },
        resolve(source, args, context, info) {
          reporter.verbose(
            `contentfulLocalized field extension resolver`,
            JSON.stringify(
              {
                source,
                args,
                contextSourceContentful: context.sourceContentful,
              },
              null,
              2
            )
          )

          let locale
          // @todo we need to figure out the querys locale,
          // the argument is not available for the whole query yet
          if (args.locale) {
            context.sourceContentful.localeState.set(info, args.locale)
            locale = args.locale
          } else {
            locale = context.sourceContentful.localeState.get(info) || `en-US` // @todo we need default locale
          }
          console.log({
            localeTest: source.localeTest,
            locale,
            localeState: context.sourceContentful.localeState,
          })
          // @todo rename localeTest || move it to root
          const fieldValue = source.localeTest[options.contentfulFieldId] || {}

          reporter.verbose(`Resolving field value`, {
            fieldValue,
            locale,
            options,
          })

          if (
            typeof fieldValue[locale] !== `undefined` &&
            fieldValue[locale] !== null
          ) {
            return fieldValue[locale]
          }

          return null
        },
      }
    },
  })

  // Generate schemas based on Contentful content model
  generateSchema({ createTypes, schema, pluginConfig, contentTypeItems })
}
