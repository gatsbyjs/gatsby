import { syncStaticDir } from "../utils/get-static-dir"
import express from "express"

import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"

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

interface IDevelopArgs extends IProgram {
  debugInfo: IDebugInfo | null
}

module.exports = async (program: IDevelopArgs): Promise<void> => {
  program.port = 8001
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
  const parentSpan = tracer.startSpan(`bootstrap`)

  const machine = developMachine.withContext({
    program,
    parentSpan,
    app,
    pendingQueryRuns: new Set([`/`]),
  })

  const service = interpret(machine)

  if (program.verbose) {
    logTransitions(service)
  }

  service.start()
}
