// "engines-fs-provider" must be first import, as it sets up global
// fs and this need to happen before anything else tries to import fs
import "../../utils/engines-fs-provider"

import { ExecutionResult, Source } from "graphql"
import crypto from "crypto"
import { uuid } from "gatsby-core-utils"
import { build } from "../index"
import { setupLmdbStore } from "../../datastore/lmdb/lmdb-datastore"
import { store } from "../../redux"
import { actions } from "../../redux/actions"
import reporter from "gatsby-cli/lib/reporter"
import { GraphQLRunner, IQueryOptions } from "../../query/graphql-runner"
import { waitJobsByRequest } from "../../utils/wait-until-jobs-complete"
import { setGatsbyPluginCache } from "../../utils/require-gatsby-plugin"
import apiRunnerNode from "../../utils/api-runner-node"
import { findPageByPath } from "../../utils/find-page-by-path"
import { runWithEngineContext } from "../../utils/engine-context"
import { getDataStore } from "../../datastore"
import {
  gatsbyNodes,
  gatsbyWorkers,
  flattenedPlugins,
  // @ts-ignore
} from ".cache/query-engine-plugins"
import { initTracer } from "../../utils/tracer"
import { createPageDependencyBatcher } from "../../redux/actions/add-page-dependency"
import type {
  IGatsbyPage,
  IGatsbyState,
  DataTrackingActionsToReplay,
} from "../../redux/types"

type MaybePhantomActivity =
  | ReturnType<typeof reporter.phantomActivity>
  | undefined

const tracerReadyPromise = initTracer(
  process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``
)

export interface IDataTrackingResult {
  actionsToReplay: DataTrackingActionsToReplay
}

export class GraphQLEngine {
  // private schema: GraphQLSchema
  private runnerPromise?: Promise<GraphQLRunner>
  private isCollectingDataTrackingActions = false

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

      // TODO: FLATTENED_PLUGINS needs to be merged with plugin options from gatsby-config
      //  (as there might be non-serializable options, i.e. functions)
      store.dispatch({
        type: `SET_SITE_FLATTENED_PLUGINS`,
        payload: flattenedPlugins,
      })

      for (const pluginName of Object.keys(gatsbyNodes)) {
        setGatsbyPluginCache(
          { name: pluginName, resolve: `` },
          `gatsby-node`,
          gatsbyNodes[pluginName]
        )
      }
      for (const pluginName of Object.keys(gatsbyWorkers)) {
        setGatsbyPluginCache(
          { name: pluginName, resolve: `` },
          `gatsby-worker`,
          gatsbyWorkers[pluginName]
        )
      }

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

  public startCollectDataTrackingActions(
    actionsToReplay: DataTrackingActionsToReplay
  ): () => void {
    if (this.isCollectingDataTrackingActions) {
      throw new Error(
        `Engine is already tracking data, multiple data tracking at the same time won't work correctly and seems like integration is wrong.`
      )
    }
    this.isCollectingDataTrackingActions = true

    // -- DEBUG START --
    let counter = 0
    const distinctActionTypes = new Set<string>()
    // -- DEBUG END --

    const unsubscribe = store.subscribe(() => {
      const action = store.getState().lastAction
      if (
        action.type === `QUERY_START` ||
        action.type === `PAGE_QUERY_RUN` ||
        action.type === `ADD_PENDING_PAGE_DATA_WRITE` ||
        action.type === `CREATE_COMPONENT_DEPENDENCY`
      ) {
        actionsToReplay.push(action)
      }

      counter++
      distinctActionTypes.add(action.type)
    })

    return function finishCollectingDataTrackingActions(
      this: GraphQLEngine
    ): void {
      createPageDependencyBatcher.flush()
      unsubscribe()
      this.isCollectingDataTrackingActions = false

      // -- DEBUG START --
      console.log(
        `Collected ${actionsToReplay.length} data tracking actions of ${counter} total. Distinct action types:`,
        distinctActionTypes
      )
      // -- DEBUG END --
    }.bind(this)
  }

  public startQuery(payload: {
    path: string
    componentPath: string
    isPage?: boolean
  }): void {
    store.dispatch(
      actions.queryStart({
        path: payload.path,
        componentPath: payload.componentPath,
        isPage: payload.isPage ?? true,
      })
    )
  }

  public endQuery(payload: {
    path: string
    componentPath: string
    result: Record<string, unknown>
    isPage?: boolean
  }): void {
    const resultHash = crypto
      .createHash(`sha1`)
      .update(JSON.stringify(payload.result))
      .digest(`base64`)

    store.dispatch(
      actions.pageQueryRun({
        path: payload.path,
        componentPath: payload.componentPath,
        isPage: payload.isPage ?? true,
        resultHash,
      })
    )
  }
}

export default { GraphQLEngine }
