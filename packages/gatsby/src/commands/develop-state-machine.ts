import { syncStaticDir } from "../utils/get-static-dir"
import report from "gatsby-cli/lib/reporter"
import chalk from "chalk"
import telemetry from "gatsby-telemetry"
import express from "express"
import getSslCert from "../utils/get-ssl-cert"
import { initTracer } from "../utils/tracer"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
// import { startListeningToDevelopQueue } from "../query"
import onExit from "signal-exit"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"

import { IProgram } from "./types"

import { developMachine, INITIAL_CONTEXT } from "../state-machines/develop"
import { interpret } from "xstate"
import { saveState, startAutosave } from "../db"

// checks if a string is a valid ip
const REGEX_IP = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/

// const isInteractive = process.stdout.isTTY

module.exports = async (program: IProgram): Promise<void> => {
  report.log(`Using experimental develop state machine`)

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
      // eslint-disable-next-line no-unused-expressions
      process.send?.({
        type: `HEARTBEAT`,
      })
    }, 1000)
  }

  process.on(`message`, msg => {
    if (msg.type === `COMMAND` && msg.action.type === `EXIT`) {
      process.exit(msg.action.payload)
    }
  })

  onExit(() => {
    telemetry.trackCli(`DEVELOP_STOP`)
  })

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
  report.pendingActivity({ id: `webpack-develop` })
  telemetry.trackCli(`DEVELOP_START`)
  telemetry.startBackgroundUpdate()

  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port

  // In order to enable custom ssl, --cert-file --key-file and -https flags must all be
  // used together
  if ((program[`cert-file`] || program[`key-file`]) && !program.https) {
    report.panic(
      `for custom ssl --https, --cert-file, and --key-file must be used together`
    )
  }

  try {
    program.port = await detectPortInUseAndPrompt(port)
  } catch (e) {
    if (e.message === `USER_REJECTED`) {
      process.exit(0)
    }

    throw e
  }

  // Check if https is enabled, then create or get SSL cert.
  // Certs are named 'devcert' and issued to the host.
  if (program.https) {
    const sslHost =
      program.host === `0.0.0.0` || program.host === `::`
        ? `localhost`
        : program.host

    if (REGEX_IP.test(sslHost)) {
      report.panic(
        `You're trying to generate a ssl certificate for an IP (${sslHost}). Please use a hostname instead.`
      )
    }

    program.ssl = await getSslCert({
      name: sslHost,
      certFile: program[`cert-file`],
      keyFile: program[`key-file`],
      directory: program.directory,
    })
  }

  const app = express()
  const developService = interpret(
    developMachine.withContext({
      ...INITIAL_CONTEXT,
      app,
      program,
    })
  ).start()

  let last = developService.state

  developService.onTransition(async state => {
    if (state.changed && !last.matches(state) && state.context.store) {
      console.log(`Transitioning to`, state.value)
      state.context.store.dispatch({
        type: `SET_BUILD_STATE`,
        payload: state.value,
      })
      last = state
    }
  })

  /**
   * Refresh external data sources.
   * This behavior is disabled by default, but the ENABLE_GATSBY_REFRESH_ENDPOINT env var enables it
   * If no GATSBY_REFRESH_TOKEN env var is available, then no Authorization header is required
   **/
  const REFRESH_ENDPOINT = `/__refresh`
  const refresh = async (req: express.Request): Promise<void> => {
    // console.log(`WEBHOOK`)
    developService.send(`WEBHOOK_RECEIVED`, { body: req.body })
  }
  app.use(REFRESH_ENDPOINT, express.json())
  app.post(REFRESH_ENDPOINT, (req, res) => {
    const enableRefresh = true || process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
    const refreshToken = process.env.GATSBY_REFRESH_TOKEN
    const authorizedRefresh =
      !refreshToken || req.headers.authorization === refreshToken

    if (enableRefresh && authorizedRefresh) {
      refresh(req)
    }
    res.end()

    // TODO await transition
  })

  // emitter.on(`ENQUEUE_NODE_MUTATION`, event => {
  //   developService.send(`ADD_NODE_MUTATION`, { payload: event })
  // })

  // emitter.on(`SOURCE_FILE_CHANGED`, event => {
  //   console.log({ event })
  //   developService.send(`SOURCE_FILE_CHANGED`, { payload: event })
  // })

  // require(`../redux/actions`).boundActionCreators.setProgramStatus(
  //   `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  // )
  await saveState()

  startAutosave()

  // queryWatcher.startWatchDeletePage()
}
