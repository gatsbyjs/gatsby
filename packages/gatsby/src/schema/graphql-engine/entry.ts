// "engines-fs-provider" must be first import, as it sets up global
// fs and this need to happen before anything else tries to import fs
import "../../utils/engines-fs-provider"

import { ExecutionResult, Source } from "graphql"
import { uuid } from "gatsby-core-utils"
import { build } from "../index"
import { setupLmdbStore } from "../../datastore/lmdb/lmdb-datastore"
import { store } from "../../redux"
import { actions } from "../../redux/actions"
import _ from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import { GraphQLRunner, IQueryOptions } from "../../query/graphql-runner"
import { waitJobsByRequest } from "../../utils/wait-until-jobs-complete"
import { setGatsbyPluginCache } from "../../utils/require-gatsby-plugin"
import apiRunnerNode from "../../utils/api-runner-node"
import type {
  IFlattenedPlugin,
  IGatsbyPage,
  IGatsbyState,
} from "../../redux/types"
import { findPageByPath } from "../../utils/find-page-by-path"
import { runWithEngineContext } from "../../utils/engine-context"
import { getDataStore } from "../../datastore"
import {
  gatsbyNodes,
  gatsbyConfigs,
  gatsbyWorkers,
  subPlugins,
  // @ts-ignore
} from ".cache/query-engine-plugins"
import { initTracer } from "../../utils/tracer"
import { setGatsbyConfigCache } from "../../utils/require-gatsby-config"
import { loadConfig } from "../../bootstrap/load-config"
import { loadPlugins } from "../../bootstrap/load-plugins"

type MaybePhantomActivity =
  | ReturnType<typeof reporter.phantomActivity>
  | undefined

const tracerReadyPromise = initTracer(
  process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``
)

process.env.GATSBY_IS_GRAPHQL_ENGINE = `true`

export class GraphQLEngine {
  // private schema: GraphQLSchema
  private runnerPromise?: Promise<GraphQLRunner>

  constructor({ dbPath }: { dbPath: string }) {
    setupLmdbStore({ dbPath })
    // start initializing runner ASAP
    this.getRunner()
  }

  private async _doGetRunner(): Promise<GraphQLRunner> {
    await tracerReadyPromise

    const wrapActivity = reporter.phantomActivity(`Initializing GraphQL Engine`)
    wrapActivity.start()
    try {
      // @ts-ignore SCHEMA_SNAPSHOT is being "inlined" by bundler
      store.dispatch(actions.createTypes(SCHEMA_SNAPSHOT))

      store.dispatch({
        type: `SET_PROGRAM`,
        payload: {
          // @ts-ignore SITE_DIRECTORY is being "inlined" by bundler
          directory: SITE_DIRECTORY,
        },
      })

      for (const pluginName of Object.keys(gatsbyNodes)) {
        setGatsbyPluginCache(
          { name: pluginName, resolve: `` },
          `gatsby-node`,
          gatsbyNodes[pluginName]
        )
      }
      for (const pluginName of Object.keys(subPlugins)) {
        setGatsbyPluginCache(
          { name: pluginName, resolve: `` },
          `gatsby-node`,
          subPlugins[pluginName]
        )
      }
      for (const pluginName of Object.keys(gatsbyWorkers)) {
        setGatsbyPluginCache(
          { name: pluginName, resolve: `` },
          `gatsby-worker`,
          gatsbyWorkers[pluginName]
        )
      }

      // @ts-ignore GATSBY_ENGINE_ENV_VARS is being "inlined" by bundler
      for (const [key, value] of Object.entries(GATSBY_ENGINE_ENV_VARS)) {
        // @ts-ignore
        process.env[key] = value
      }

      for (const gatsbyConfig of Object.keys(gatsbyConfigs)) {
        setGatsbyConfigCache(gatsbyConfig, gatsbyConfigs[gatsbyConfig])
      }

      const siteDirectory = store.getState().program.directory
      const config = await loadConfig({ siteDirectory })
      await loadPlugins(config, siteDirectory)

      const flattenedPlugins = store.getState().flattenedPlugins
      const flattenedPLuginsWithSubPlugins = flattenedPlugins.map(plugin => {
        return {
          ...plugin,
          pluginOptions: _.cloneDeepWith(
            plugin.pluginOptions,
            (value: IFlattenedPlugin) => {
              if (
                typeof value === `object` &&
                value !== null &&
                value.resolve
              ) {
                const { ...subPlugin } = value
                return {
                  ...subPlugin,
                  module: subPlugins[subPlugin.resolve],
                  resolve: ``,
                  pluginFilepath: ``,
                }
              }
              return undefined
            }
          ),
        }
      })

      store.dispatch({
        type: `SET_SITE_FLATTENED_PLUGINS`,
        payload: flattenedPLuginsWithSubPlugins,
      })

      if (_CFLAGS_.GATSBY_MAJOR === `4`) {
        await apiRunnerNode(`onPluginInit`, { parentSpan: wrapActivity.span })
      } else {
        await apiRunnerNode(`unstable_onPluginInit`, {
          parentSpan: wrapActivity.span,
        })
      }
      await apiRunnerNode(`createSchemaCustomization`, {
        parentSpan: wrapActivity.span,
      })

      // Build runs
      // Note: skipping inference metadata because we rely on schema snapshot
      await build({ fullMetadataBuild: false, parentSpan: wrapActivity.span })

      return new GraphQLRunner(store)
    } finally {
      wrapActivity.end()
    }
  }

  private async getRunner(): Promise<GraphQLRunner> {
    if (!this.runnerPromise) {
      this.runnerPromise = this._doGetRunner()
    }
    return this.runnerPromise
  }

  public async ready(): Promise<void> {
    // We don't want to expose internal runner freely. We do expose `runQuery` function already.
    // The way internal runner works can change, so we should not make it a public API.
    // Here we just want to expose way to await it being ready
    await this.getRunner()
  }

  public async runQuery(
    query: string | Source,
    context: Record<string, any> = {},
    opts?: IQueryOptions
  ): Promise<ExecutionResult> {
    const engineContext = {
      requestId: uuid.v4(),
    }

    const doRunQuery = async (): Promise<ExecutionResult> => {
      if (!opts) {
        opts = {
          queryName: `GraphQL Engine query`,
          parentSpan: undefined,
        }
      }

      let gettingRunnerActivity: MaybePhantomActivity
      let graphqlRunner: GraphQLRunner
      try {
        if (opts.parentSpan) {
          gettingRunnerActivity = reporter.phantomActivity(
            `Waiting for graphql runner to init`,
            {
              parentSpan: opts.parentSpan,
            }
          )
          gettingRunnerActivity.start()
        }
        graphqlRunner = await this.getRunner()
      } finally {
        if (gettingRunnerActivity) {
          gettingRunnerActivity.end()
        }
      }

      // graphqlRunner creates it's own Span as long as we pass `parentSpan`
      const result = await graphqlRunner.query(query, context, opts)

      let waitingForJobsCreatedByCurrentRequestActivity: MaybePhantomActivity
      try {
        if (opts.parentSpan) {
          waitingForJobsCreatedByCurrentRequestActivity =
            reporter.phantomActivity(`Waiting for jobs to finish`, {
              parentSpan: opts.parentSpan,
            })
          waitingForJobsCreatedByCurrentRequestActivity.start()
        }
        await waitJobsByRequest(engineContext.requestId)
      } finally {
        if (waitingForJobsCreatedByCurrentRequestActivity) {
          waitingForJobsCreatedByCurrentRequestActivity.end()
        }
      }
      return result
    }

    try {
      return await runWithEngineContext(engineContext, doRunQuery)
    } finally {
      // Reset job-to-request mapping
      store.dispatch({
        type: `CLEAR_JOB_V2_CONTEXT`,
        payload: engineContext,
      })
    }
  }

  public findPageByPath(pathName: string): IGatsbyPage | undefined {
    // adapter so `findPageByPath` use SitePage nodes in datastore
    // instead of `pages` redux slice
    const state = {
      pages: {
        get(pathName: string): IGatsbyPage | undefined {
          return getDataStore().getNode(`SitePage ${pathName}`) as
            | IGatsbyPage
            | undefined
        },
        values(): Iterable<IGatsbyPage> {
          return getDataStore().iterateNodesByType(
            `SitePage`
          ) as Iterable<IGatsbyPage>
        },
      },
    } as unknown as IGatsbyState

    return findPageByPath(state, pathName, false)
  }
}

export default { GraphQLEngine }
