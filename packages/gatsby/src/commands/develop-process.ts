import { syncStaticDir } from "../utils/get-static-dir"
import reporter from "gatsby-cli/lib/reporter"
import chalk from "chalk"
import telemetry from "gatsby-telemetry"
import express from "express"
import { bootstrapSchemaHotReloader } from "../bootstrap/schema-hot-reloader"
import bootstrapPageHotReloader from "../bootstrap/page-hot-reloader"
import { initTracer } from "../utils/tracer"
import db from "../db"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import onExit from "signal-exit"
import queryUtil from "../query"
import queryWatcher from "../query/query-watcher"
import * as requiresWriter from "../bootstrap/requires-writer"
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"
import { startRedirectListener } from "../bootstrap/redirects-writer"
import { markWebpackStatusAsPending } from "../utils/webpack-status"

import { IProgram } from "./types"
import {
  startWebpackServer,
  writeOutRequires,
  IBuildContext,
  initialize,
  postBootstrap,
  rebuildSchemaWithSitePage,
  writeOutRedirects,
} from "../services"
import { boundActionCreators } from "../redux/actions"
import { ProgramStatus } from "../redux/types"
import {
  MachineConfig,
  AnyEventObject,
  assign,
  Machine,
  DoneEventObject,
  interpret,
  Actor,
  Interpreter,
  State,
} from "xstate"
import { DataLayerResult, dataLayerMachine } from "../state-machines/data-layer"
import { IDataLayerContext } from "../state-machines/data-layer/types"
import { globalTracer } from "opentracing"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { queryRunningMachine } from "../state-machines/query-running"

const tracer = globalTracer()

// const isInteractive = process.stdout.isTTY

// Watch the static directory and copy files to public as they're added or
// changed. Wait 10 seconds so copying doesn't interfere with the regular
// bootstrap.
setTimeout(() => {
  syncStaticDir()
}, 10000)

// Time for another story...
// When the parent process is killed by SIGKILL, Node doesm't kill spawned child processes
// Hence, we peiodically send a heart beat to the parent to check if it is still alive
// This will crash with Error [ERR_IPC_CHANNEL_CLOSED]: Channel closed
// and kill the orphaned child process as a result
if (process.send) {
  setInterval(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.send!({
      type: `HEARTBEAT`,
    })
  }, 1000)
}

onExit(() => {
  telemetry.trackCli(`DEVELOP_STOP`)
})

process.on(`message`, msg => {
  if (msg.type === `COMMAND` && msg.action.type === `EXIT`) {
    process.exit(msg.action.payload)
  }
})

module.exports = async (program: IProgram): Promise<void> => {
  const bootstrapSpan = tracer.startSpan(`bootstrap`)

  // We want to prompt the feedback request when users quit develop
  // assuming they pass the heuristic check to know they are a user
  // we want to request feedback from, and we're not annoying them.
  process.on(
    `SIGINT`,
    async (): Promise<void> => {
      if (await userPassesFeedbackRequestHeuristic()) {
        showFeedbackRequest()
      }
      process.exit(0)
    }
  )

  if (process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES) {
    reporter.panic(
      `The flag ${chalk.yellow(
        `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES`
      )} is not available with ${chalk.cyan(
        `gatsby develop`
      )}, please retry using ${chalk.cyan(`gatsby build`)}`
    )
  }
  initTracer(program.openTracingConfigFile)
  markWebpackStatusAsPending()
  reporter.pendingActivity({ id: `webpack-develop` })
  telemetry.trackCli(`DEVELOP_START`)
  telemetry.startBackgroundUpdate()

  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port

  try {
    program.port = await detectPortInUseAndPrompt(port)
  } catch (e) {
    if (e.message === `USER_REJECTED`) {
      process.exit(0)
    }

    throw e
  }

  const app = express()

  const developConfig: MachineConfig<IBuildContext, any, AnyEventObject> = {
    id: `build`,
    initial: `initializing`,
    states: {
      initializing: {
        invoke: {
          src: `initialize`,
          onDone: {
            target: `initializingDataLayer`,
            actions: `assignStoreAndWorkerPool`,
          },
        },
      },
      initializingDataLayer: {
        invoke: {
          src: `initializeDataLayer`,
          data: ({ parentSpan, store }: IBuildContext): IDataLayerContext => {
            return { parentSpan, store, firstRun: true }
          },
          onDone: {
            actions: `assignDataLayer`,
            target: `finishingBootstrap`,
          },
        },
      },
      finishingBootstrap: {
        invoke: {
          src: async ({
            gatsbyNodeGraphQLFunction,
          }: IBuildContext): Promise<void> => {
            // These were previously in `bootstrap()` but are now
            // in part of the state machine that hasn't been added yet
            await rebuildSchemaWithSitePage({ parentSpan: bootstrapSpan })

            await writeOutRedirects({ parentSpan: bootstrapSpan })

            startRedirectListener()
            bootstrapSpan.finish()
            await postBootstrap({ parentSpan: bootstrapSpan })

            // These are the parts that weren't in bootstrap

            // Start the createPages hot reloader.
            bootstrapPageHotReloader(gatsbyNodeGraphQLFunction)

            // Start the schema hot reloader.
            bootstrapSchemaHotReloader()
          },
          onDone: {
            target: `runningQueries`,
          },
        },
      },
      runningQueries: {
        invoke: {
          src: `runQueries`,
          data: ({
            program,
            store,
            parentSpan,
            gatsbyNodeGraphQLFunction,
            graphqlRunner,
            firstRun,
          }: IBuildContext): IQueryRunningContext => {
            return {
              firstRun,
              program,
              store,
              parentSpan,
              gatsbyNodeGraphQLFunction,
              graphqlRunner,
            }
          },
          onDone: {
            target: `doingEverythingElse`,
          },
        },
      },
      doingEverythingElse: {
        invoke: {
          src: async ({ workerPool, store, app }): Promise<void> => {
            // All the stuff that's not in the state machine yet

            await writeOutRequires({ store })
            boundActionCreators.setProgramStatus(
              ProgramStatus.BOOTSTRAP_QUERY_RUNNING_FINISHED
            )

            await db.saveState()

            await waitUntilAllJobsComplete()
            requiresWriter.startListener()
            db.startAutosave()
            queryUtil.startListeningToDevelopQueue({
              graphqlTracing: program.graphqlTracing,
            })
            queryWatcher.startWatchDeletePage()

            await startWebpackServer({ program, app, workerPool, store })
          },
          onDone: {
            actions: assign<IBuildContext, any>({ firstRun: false }),
          },
        },
      },
    },
  }

  const service = interpret(
    Machine(developConfig, {
      services: {
        initializeDataLayer: dataLayerMachine,
        initialize,
        runQueries: queryRunningMachine,
      },
      actions: {
        assignStoreAndWorkerPool: assign<IBuildContext, DoneEventObject>(
          (_context, event) => {
            const { store, workerPool } = event.data
            return {
              store,
              workerPool,
            }
          }
        ),
        assignDataLayer: assign<IBuildContext, DoneEventObject>(
          (_, { data }): DataLayerResult => data
        ),
      },
    }).withContext({ program, parentSpan: bootstrapSpan, app, firstRun: true })
  )

  const isInterpreter = <T>(
    actor: Actor<T> | Interpreter<T>
  ): actor is Interpreter<T> => `machine` in actor

  const listeners = new WeakSet()
  let last: State<IBuildContext, AnyEventObject, any, any>

  service.onTransition(state => {
    if (!last) {
      last = state
    } else if (!state.changed || last.matches(state)) {
      return
    }
    last = state
    reporter.verbose(`Transition to ${JSON.stringify(state.value)}`)
    // eslint-disable-next-line no-unused-expressions
    service.children?.forEach(child => {
      // We want to ensure we don't attach a listener to the same
      // actor. We don't need to worry about detaching the listener
      // because xstate handles that for us when the actor is stopped.

      if (isInterpreter(child) && !listeners.has(child)) {
        let sublast = child.state
        child.onTransition(substate => {
          if (!sublast) {
            sublast = substate
          } else if (!substate.changed || sublast.matches(substate)) {
            return
          }
          sublast = substate
          reporter.verbose(
            `Transition to ${JSON.stringify(state.value)} > ${JSON.stringify(
              substate.value
            )}`
          )
        })
        listeners.add(child)
      }
    })
  })
  service.start()
}
