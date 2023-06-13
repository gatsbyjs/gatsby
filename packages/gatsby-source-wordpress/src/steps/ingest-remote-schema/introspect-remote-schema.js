import chalk from "chalk"
import * as diff from "diff"
import { uniqBy } from "lodash"
import { getStore } from "~/store"
import { setPersistentCache, getPersistentCache } from "~/utils/cache"
import fetchGraphql from "~/utils/fetch-graphql"
import { introspectionQuery } from "~/utils/graphql-queries"

/**
 * Builds the cache key for retrieving cached introspection data
 */
const getCachedRemoteIntrospectionDataCacheKey = () => {
  const state = getStore().getState()
  const { pluginOptions } = state.gatsbyApi

  const INTROSPECTION_CACHE_KEY = `${pluginOptions.url}--introspection-data`

  return INTROSPECTION_CACHE_KEY
}

/**
 * Returns cached introspection data for the remote WPGraphQL schema
 */
const getCachedRemoteIntrospectionData = async () => {
  const INTROSPECTION_CACHE_KEY = getCachedRemoteIntrospectionDataCacheKey()
  const introspectionData = await getPersistentCache({
    key: INTROSPECTION_CACHE_KEY,
  })

  return introspectionData
}

/**
 * Checks if WPGraphQL is exposing a field on a type
 * for example `GatsbyPreviewData.manifestIds`
 * This allows us to make otherwise breaking changes in a backwards compatible way
 */
export const remoteSchemaSupportsFieldNameOnTypeName = async ({
  fieldName,
  typeName,
}) => {
  const introspectionData = await getCachedRemoteIntrospectionData()

  const type = introspectionData.__schema.types.find(
    ({ name }) => name === typeName
  )

  const fieldExists = !!type?.fields?.find(({ name }) => name === fieldName)

  return fieldExists
}

const introspectAndStoreRemoteSchema = async () => {
  const state = getStore().getState()
  const { pluginOptions } = state.gatsbyApi
  const { schemaWasChanged } = state.remoteSchema

  let introspectionData = await getCachedRemoteIntrospectionData()

  const printSchemaDiff =
    pluginOptions?.debug?.graphql?.printIntrospectionDiff ||
    pluginOptions?.debug?.preview

  let staleIntrospectionData

  if (!introspectionData || schemaWasChanged) {
    const { data } = await fetchGraphql({
      query: introspectionQuery,
    })

    if (introspectionData) {
      staleIntrospectionData = introspectionData
    }

    introspectionData = data

    const INTROSPECTION_CACHE_KEY = getCachedRemoteIntrospectionDataCacheKey()

    // cache introspection response
    await setPersistentCache({
      key: INTROSPECTION_CACHE_KEY,
      value: introspectionData,
    })
  }

  if (staleIntrospectionData && printSchemaDiff) {
    console.log(`\nData changed in WordPress schema:`)
    staleIntrospectionData.__schema.types.forEach(type => {
      const staleTypeJSON = JSON.stringify(type, null, 2)

      const newType = introspectionData.__schema.types.find(
        ({ name }) => name === type.name
      )
      const newTypeJSON = JSON.stringify(newType, null, 2)

      if (staleTypeJSON === newTypeJSON) {
        return
      }

      const typeDiff =
        type && newType ? uniqBy(diff.diffJson(type, newType), `value`) : null

      if (typeDiff?.length) {
        console.log(`\nFound changes to the ${type.name} type\n`)
        typeDiff.forEach(part => {
          if (part.added || part.removed) {
            console.log(
              chalk.green(
                chalk.bold(`${part.added ? `Added` : `Removed`}:\n`) +
                  part.value
                    .trim()
                    .split(`\n`)
                    .map(
                      (line, index) =>
                        `${part.added ? `+` : `-`}${
                          index === 0 ? `\t` : ` `
                        }${line}`
                    )
                    .join(`\n`)
              )
            )
          }
        })
        console.log(`\n`)
      }
    })
  }

  const typeMap = new Map(
    introspectionData.__schema.types.map(type => [type.name, type])
  )

  getStore().dispatch.remoteSchema.setState({ introspectionData, typeMap })
}

export { introspectAndStoreRemoteSchema }
