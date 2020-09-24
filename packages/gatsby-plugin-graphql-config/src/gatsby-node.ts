import * as fs from "fs-extra"
import { resolve } from "path"
import type { GatsbyReduxStore } from "gatsby/src/redux"
import {
  cacheSchema,
  cacheGraphQLConfig,
  createSchemaCacheHandler,
  createFragmentCacheHandler,
} from "./lib"

export async function onPostBootstrap({
  store,
  emitter,
}: {
  store: GatsbyReduxStore
  emitter: any
}): Promise<void> {
  const { program, schema } = store.getState()

  const cacheDirectory = resolve(program.directory, `.cache`)

  if (!fs.existsSync(cacheDirectory)) {
    return
  }
  // cache initial schema
  await cacheSchema(cacheDirectory, schema)
  // cache graphql config file
  await cacheGraphQLConfig(program)
  // Important! emitter.on is an internal Gatsby API. It is highly discouraged to use in plugins and can break without a notice.
  // FIXME: replace it with a more appropriate API call when available.
  emitter.on(
    `SET_GRAPHQL_DEFINITIONS`,
    createFragmentCacheHandler(cacheDirectory, store)
  )
  emitter.on(`SET_SCHEMA`, createSchemaCacheHandler(cacheDirectory, store))
}
