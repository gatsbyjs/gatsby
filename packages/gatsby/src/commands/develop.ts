import { syncStaticDir } from "../utils/get-static-dir"
import report from "gatsby-cli/lib/reporter"
import chalk from "chalk"
import telemetry from "gatsby-telemetry"

import bootstrapSchemaHotReloader from "../bootstrap/schema-hot-reloader"
import bootstrapPageHotReloader from "../bootstrap/page-hot-reloader"
import getSslCert from "../utils/get-ssl-cert"
import { initTracer } from "../utils/tracer"
import db from "../db"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import onExit from "signal-exit"
import queryUtil from "../query"
import queryWatcher from "../query/query-watcher"
import requiresWriter from "../bootstrap/requires-writer"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"

import { IProgram } from "./types"

import { developMachine } from "../state-machines/develop"
import { interpret } from "xstate"

// checks if a string is a valid ip
const REGEX_IP = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/

// const isInteractive = process.stdout.isTTY

// Watch the static directory and copy files to public as they're added or
// changed. Wait 10 seconds so copying doesn't interfere with the regular
// bootstrap.
setTimeout(() => {
  syncStaticDir()
}, 10000)

onExit(() => {
  telemetry.trackCli(`DEVELOP_STOP`)
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

  const developService = interpret(
    developMachine.withContext({
      program,
      recursionCount: 0,
      nodesMutatedDuringQueryRun: false,
      firstRun: true,
    })
  ).start()

  developService.onTransition(async context => {
    console.log(`on transition`, context.value)
  })

  // Start bootstrap process

  // Start the createPages hot reloader
  // bootstrapPageHotReloader(graphqlRunner)

  // Start the schema hot reloader.
  // bootstrapSchemaHotReloader()

  // Run initial queries

  // require(`../redux/actions`).boundActionCreators.setProgramStatus(
  //   `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  // )
  // await db.saveState()

  // Await jobs

  // requiresWriter.startListener()
  // db.startAutosave()
  // queryUtil.startListeningToDevelopQueue()
  // queryWatcher.startWatchDeletePage()

  // Run webpack
}
