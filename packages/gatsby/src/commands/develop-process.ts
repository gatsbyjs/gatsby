import { syncStaticDir } from "../utils/get-static-dir"
import reporter from "gatsby-cli/lib/reporter"
import { isTruthy } from "gatsby-core-utils"
import express from "express"
import inspector from "inspector"
import { initTracer } from "../utils/tracer"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import {
  userGetsSevenDayFeedback,
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
  showSevenDayFeedbackRequest,
} from "../utils/feedback"
import { markWebpackStatusAsPending } from "../utils/webpack-status"

import { IProgram, IDebugInfo } from "./types"
import { interpret } from "xstate"
import { globalTracer } from "opentracing"
import { developMachine } from "../state-machines/develop"
import { logTransitions } from "../utils/state-machine-logging"

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

process.on(
  `message`,
  (msg: {
    type: string
    action: { type: string; payload: number | undefined }
  }) => {
    if (msg.type === `COMMAND` && msg.action.type === `EXIT`) {
      process.exit(msg.action.payload)
    }
  }
)

interface IDevelopArgs extends IProgram {
  debugInfo: IDebugInfo | null
}

const openDebuggerPort = (debugInfo: IDebugInfo): void => {
  if (inspector.url() !== undefined) {
    return // fixes #26708
  }

  if (debugInfo.break) {
    inspector.open(debugInfo.port, undefined, true)
    // eslint-disable-next-line no-debugger
    debugger
  } else {
    inspector.open(debugInfo.port)
  }
}

module.exports = async (program: IDevelopArgs): Promise<void> => {
  // provide global Gatsby object
  global.__GATSBY = process.env.GATSBY_NODE_GLOBALS
    ? JSON.parse(process.env.GATSBY_NODE_GLOBALS)
    : {}

  if (isTruthy(process.env.VERBOSE)) {
    program.verbose = true
  }
  reporter.setVerbose(program.verbose)

  if (program.debugInfo) {
    openDebuggerPort(program.debugInfo)
  }

  // We want to prompt the feedback request when users quit develop
  // assuming they pass the heuristic check to know they are a user
  // we want to request feedback from, and we're not annoying them.
  process.on(`SIGINT`, async (): Promise<void> => {
    if (await userGetsSevenDayFeedback()) {
      showSevenDayFeedbackRequest()
    } else if (await userPassesFeedbackRequestHeuristic()) {
      showFeedbackRequest()
    }
    process.exit(0)
  })

  await initTracer(
    process.env.GATSBY_OPEN_TRACING_CONFIG_FILE || program.openTracingConfigFile
  )
  markWebpackStatusAsPending()
  reporter.pendingActivity({ id: `webpack-develop` })

  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port
  const hostname = program.host
  try {
    program.port = await detectPortInUseAndPrompt(port, hostname)
  } catch (e) {
    if (e.message === `USER_REJECTED`) {
      process.exit(0)
    }

    throw e
  }

  const app = express()
  const parentSpan = tracer.startSpan(`bootstrap`)

  app.use((req, res, next) => {
    try {
      decodeURIComponent(req.path)
    } catch (e) {
      return res.status(500).send(`URI malformatted`)
    }

    return next()
  })

  const machine = developMachine.withContext({
    program,
    parentSpan,
    app,
    reporter,
    pendingQueryRuns: new Set([`/`]),
    shouldRunInitialTypegen: true,
  })

  const service = interpret(machine)

  if (program.verbose) {
    logTransitions(service)
  }

  service.start()
}
