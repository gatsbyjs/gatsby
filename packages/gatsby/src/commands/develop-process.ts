import { bootstrap } from "../bootstrap"
import { store } from "../redux"
import { syncStaticDir } from "../utils/get-static-dir"
import report from "gatsby-cli/lib/reporter"
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

import { markWebpackStatusAsPending } from "../utils/webpack-status"

import { IProgram } from "./types"
import {
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  startWebpackServer,
  writeOutRequires,
} from "../services"
import { boundActionCreators } from "../redux/actions"
import { ProgramStatus } from "../redux/types"

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

  // Start bootstrap process.
  const { gatsbyNodeGraphQLFunction, workerPool } = await bootstrap({ program })

  // Start the createPages hot reloader.
  bootstrapPageHotReloader(gatsbyNodeGraphQLFunction)

  // Start the schema hot reloader.
  bootstrapSchemaHotReloader()

  const { queryIds } = await calculateDirtyQueries({ store })

  await runStaticQueries({ queryIds, store, program })
  await runPageQueries({ queryIds, store, program })
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
  const app = express()

  await startWebpackServer({ program, app, workerPool })
}
