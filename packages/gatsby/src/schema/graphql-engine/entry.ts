// import { buildSchema } from "../schema"
import { build } from "../index"
import { setupLmdbStore } from "../../datastore/lmdb/lmdb-datastore"
import { store } from "../../redux"
import { actions } from "../../redux/actions"
import reporter from "gatsby-cli/lib/reporter"
import {
  createGraphQLRunner,
  Runner,
} from "../../bootstrap/create-graphql-runner"
// const { builtInFieldExtensions } = require(`./extensions`)

import { setGatsbyNodeCache } from "../../utils/api-runner-node"
import type { IGatsbyPage, IGatsbyState } from "../../redux/types"
import { findPageByPath } from "../../utils/find-page-by-path"
import { getDataStore } from "../../datastore"
import { mergeConfigOptions } from "./merge-config-options"
// @ts-ignore
import { gatsbyNodes, flattenedPlugins } from ".cache/query-engine-plugins"
// @ts-ignore
import gatsbyConfig from "user-gatsby-config"

export class GraphQLEngine {
  // private schema: GraphQLSchema
  private runner?: Runner
  private runnerPromise?: Promise<Runner>

  constructor({ dbPath }: { dbPath: string }) {
    setupLmdbStore({ dbPath })
    // start initting runner ASAP
    this.getRunner()
  }

  private async _doGetRunner(): Promise<Runner> {
    // @ts-ignore SCHEMA_SNAPSHOT is being "inlined" by bundler
    store.dispatch(actions.createTypes(SCHEMA_SNAPSHOT))

    const test = mergeConfigOptions({
      flattenedPlugins,
      gatsbyConfig,
      rootDir: process.cwd(),
    })

    console.log(test)

    store.dispatch({
      type: `SET_SITE_FLATTENED_PLUGINS`,
      payload: flattenedPlugins,
    })

    for (const pluginName of Object.keys(gatsbyNodes)) {
      setGatsbyNodeCache(pluginName, gatsbyNodes[pluginName])
    }

    // Build runs
    await build({ fullMetadataBuild: false, freeze: true })

    // this.schema = await buildSchema({
    //   types: [{ typeOrTypeDef: SCHEMA_SNAPSHOT }, { name: `query-engine` }],
    // })

    // this.schema = store.getState().schema

    return createGraphQLRunner(store, reporter)
  }

  private async getRunner(): Promise<Runner> {
    if (this.runner) {
      return this.runner
    } else if (this.runnerPromise) {
      return this.runnerPromise
    } else {
      this.runnerPromise = this._doGetRunner()
      this.runnerPromise.then(runner => {
        this.runner = runner
        this.runnerPromise = undefined
      })
      return this.runnerPromise
    }
  }

  public async runQuery(...args: Parameters<Runner>): ReturnType<Runner> {
    return (await this.getRunner())(...args)
    // return execute({
    //   schema: await this.getSchema(),
    //   document: parse(wat),
    // })
  }

  public findPageByPath(pathName: string): IGatsbyPage | undefined {
    // adapter so `findPageByPath` use SitePage nodes in datastore
    // instead of `pages` redux slice
    const state = ({
      pages: {
        get(pathName: string): IGatsbyPage | undefined {
          return getDataStore().getNode(`SitePage ${pathName}`) as
            | IGatsbyPage
            | undefined
        },
        values(): Iterable<IGatsbyPage> {
          return getDataStore().iterateNodesByType(`SitePage`) as Iterable<
            IGatsbyPage
          >
        },
      },
    } as unknown) as IGatsbyState

    return findPageByPath(state, pathName, false)
  }
}

export default { GraphQLEngine }
