import { syncStaticDir } from "../utils/get-static-dir"
import report from "gatsby-cli/lib/reporter"
import chalk from "chalk"
import telemetry from "gatsby-telemetry"
import express from "express"
import { initTracer } from "../utils/tracer"
import db from "../db"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import onExit from "signal-exit"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"
import { startRedirectListener } from "../bootstrap/redirects-writer"
import { markWebpackStatusAsPending } from "../utils/webpack-status"

import { IProgram } from "./types"
import {
  IBuildContext,
  initialize,
  rebuildSchemaWithSitePage,
  writeOutRedirects,
  startWebpackServer,
} from "../services"
import { boundActionCreators } from "../redux/actions"
import { ProgramStatus } from "../redux/types"
import {
  MachineConfig,
  AnyEventObject,
  Machine,
  interpret,
  Actor,
  Interpreter,
  forwardTo,
} from "xstate"
import { dataLayerMachine } from "../state-machines/data-layer"
import { IDataLayerContext } from "../state-machines/data-layer/types"
import { globalTracer } from "opentracing"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { queryRunningMachine } from "../state-machines/query-running"
import { IWaitingContext } from "../state-machines/waiting/types"
import {
  ADD_NODE_MUTATION,
  runMutationAndMarkDirty,
} from "../state-machines/shared-transition-configs"
import { buildActions } from "../state-machines/actions"
import { waitingMachine } from "../state-machines/waiting"
import reporter from "gatsby-cli/lib/reporter"

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
  reporter.setVerbose(program.verbose)
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
    report.panic(
      `The flag ${chalk.yellow(
        `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES`
      )} is not available with ${chalk.cyan(
        `gatsby develop`
      )}, please retry using ${chalk.cyan(`gatsby build`)}`
    )
  }
  initTracer(program.openTracingConfigFile)
  markWebpackStatusAsPending()
  report.pendingActivity({ id: `webpack-develop` })
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
            actions: [`assignStoreAndWorkerPool`, `spawnMutationListener`],
          },
        },
      },
      initializingDataLayer: {
        on: {
          ADD_NODE_MUTATION: runMutationAndMarkDirty,
        },
        invoke: {
          src: `initializeDataLayer`,
          data: ({ parentSpan, store }: IBuildContext): IDataLayerContext => {
            return { parentSpan, store, firstRun: true }
          },
          onDone: {
            actions: `assignServiceResult`,
            target: `finishingBootstrap`,
          },
        },
      },
      finishingBootstrap: {
        on: {
          ADD_NODE_MUTATION: runMutationAndMarkDirty,
        },
        invoke: {
          src: async (): Promise<void> => {
            // These were previously in `bootstrap()` but are now
            // in part of the state machine that hasn't been added yet
            await rebuildSchemaWithSitePage({ parentSpan: bootstrapSpan })

            await writeOutRedirects({ parentSpan: bootstrapSpan })

            startRedirectListener()
            bootstrapSpan.finish()
          },
          onDone: {
            target: `runningQueries`,
          },
        },
      },
      runningQueries: {
        on: {
          ADD_NODE_MUTATION,
        },
        invoke: {
          src: `runQueries`,
          data: ({
            program,
            store,
            parentSpan,
            gatsbyNodeGraphQLFunction,
            graphqlRunner,
            websocketManager,
          }: IBuildContext): IQueryRunningContext => {
            return {
              firstRun: true,
              program,
              store,
              parentSpan,
              gatsbyNodeGraphQLFunction,
              graphqlRunner,
              websocketManager,
            }
          },
          onDone: {
            target: `doingEverythingElse`,
          },
        },
      },
      doingEverythingElse: {
        on: {
          ADD_NODE_MUTATION,
        },
        invoke: {
          src: async (): Promise<void> => {
            // All the stuff that's not in the state machine yet

            boundActionCreators.setProgramStatus(
              ProgramStatus.BOOTSTRAP_QUERY_RUNNING_FINISHED
            )

            await db.saveState()

            db.startAutosave()
          },
          onDone: [
            {
              target: `startingDevServers`,
              cond: ({ compiler }: IBuildContext): boolean => !compiler,
            },
            {
              target: `waiting`,
            },
          ],
        },
      },
      startingDevServers: {
        on: {
          ADD_NODE_MUTATION,
        },
        invoke: {
          src: `startWebpackServer`,
          onDone: {
            target: `waiting`,
            actions: `assignServers`,
          },
        },
      },
      waiting: {
        on: {
          ADD_NODE_MUTATION: {
            actions: forwardTo(`waiting`),
          },
        },
        invoke: {
          id: `waiting`,
          src: `waitForMutations`,
          data: ({
            store,
            nodeMutationBatch = [],
          }: IBuildContext): IWaitingContext => {
            return { store, nodeMutationBatch }
          },
          onDone: {
            // These are mutations added while we were running the last
            // batch. We'll hold on to them til we've finished this build.
            actions: `assignServiceResult`,
            target: `rebuildingPages`,
          },
        },
      },
      rebuildingPages: {
        on: {
          ADD_NODE_MUTATION,
        },
        invoke: {
          src: `initializeDataLayer`,
          data: ({ parentSpan, store }: IBuildContext): IDataLayerContext => {
            return { parentSpan, store, firstRun: false, skipSourcing: true }
          },
          onDone: {
            actions: `assignServiceResult`,
            target: `runningQueries`,
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
        waitForMutations: waitingMachine,
        startWebpackServer: startWebpackServer,
      },
      actions: buildActions,
    }).withContext({ program, parentSpan: bootstrapSpan, app })
  )

  const isInterpreter = <T>(
    actor: Actor<T> | Interpreter<T>
  ): actor is Interpreter<T> => `machine` in actor

  const listeners = new WeakSet()

  let last = service.state

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
