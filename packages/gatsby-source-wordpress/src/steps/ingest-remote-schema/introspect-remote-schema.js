import chalk from "chalk"
import * as diff from "diff"
import { uniqBy } from "lodash"
import store from "~/store"
import { setPersistentCache, getPersistentCache } from "~/utils/cache"
import fetchGraphql from "~/utils/fetch-graphql"
import { introspectionQuery } from "~/utils/graphql-queries"

const introspectAndStoreRemoteSchema = async () => {
  const state = store.getState()
  const { pluginOptions } = state.gatsbyApi
  const { schemaWasChanged } = state.remoteSchema

  const INTROSPECTION_CACHE_KEY = `${pluginOptions.url}--introspection-data`
  let introspectionData = await getPersistentCache({
    key: INTROSPECTION_CACHE_KEY,
  })

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

  store.dispatch.remoteSchema.setState({ introspectionData, typeMap })
}

export { introspectAndStoreRemoteSchema }
