import url from "url"
import fs from "fs"
import openurl from "better-opn"

import glob from "glob"

import { bootstrap } from "../bootstrap"
import { store } from "../redux"
import { syncStaticDir } from "../utils/get-static-dir"
import report from "gatsby-cli/lib/reporter"
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages"
import chalk from "chalk"
import address from "address"
import telemetry from "gatsby-telemetry"

import { bootstrapSchemaHotReloader } from "../bootstrap/schema-hot-reloader"
import bootstrapPageHotReloader from "../bootstrap/page-hot-reloader"
import { initTracer } from "../utils/tracer"
import db from "../db"
import { detectPortInUseAndPrompt } from "../utils/detect-port-in-use-and-prompt"
import onExit from "signal-exit"
import queryUtil from "../query"
import queryWatcher from "../query/query-watcher"
import * as requiresWriter from "../bootstrap/requires-writer"
import {
  reportWebpackWarnings,
  structureWebpackErrors,
} from "../utils/webpack-error-utils"
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"

import { IProgram } from "./types"
import {
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
} from "../services"
import { startServer } from "../utils/start-server"

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
  const { bootstrapGraphQLFunction } = await bootstrap({ program })

  // Start the createPages hot reloader.
  bootstrapPageHotReloader(bootstrapGraphQLFunction)

  // Start the schema hot reloader.
  bootstrapSchemaHotReloader()

  const { queryIds } = await calculateDirtyQueries({ store })

  await runStaticQueries({ queryIds, store, program })
  await runPageQueries({ queryIds, store, program })

  require(`../redux/actions`).boundActionCreators.setProgramStatus(
    `BOOTSTRAP_QUERY_RUNNING_FINISHED`
  )
  await db.saveState()

  await waitUntilAllJobsComplete()
  requiresWriter.startListener()
  db.startAutosave()
  queryUtil.startListeningToDevelopQueue({
    graphqlTracing: program.graphqlTracing,
  })
  queryWatcher.startWatchDeletePage()

  let { compiler, webpackActivity } = await startServer(program)

  interface IPreparedUrls {
    lanUrlForConfig: string
    lanUrlForTerminal: string
    localUrlForTerminal: string
    localUrlForBrowser: string
  }

  function prepareUrls(
    protocol: `http` | `https`,
    host: string,
    port: number
  ): IPreparedUrls {
    const formatUrl = (hostname: string): string =>
      url.format({
        protocol,
        hostname,
        port,
        pathname: `/`,
      })
    const prettyPrintUrl = (hostname: string): string =>
      url.format({
        protocol,
        hostname,
        port: chalk.bold(String(port)),
        pathname: `/`,
      })

    const isUnspecifiedHost = host === `0.0.0.0` || host === `::`
    let prettyHost = host
    let lanUrlForConfig
    let lanUrlForTerminal
    if (isUnspecifiedHost) {
      prettyHost = `localhost`

      try {
        // This can only return an IPv4 address
        lanUrlForConfig = address.ip()
        if (lanUrlForConfig) {
          // Check if the address is a private ip
          // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
          if (
            /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
              lanUrlForConfig
            )
          ) {
            // Address is private, format it for later use
            lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig)
          } else {
            // Address is not private, so we will discard it
            lanUrlForConfig = undefined
          }
        }
      } catch (_e) {
        // ignored
      }
    }
    // TODO collect errors (GraphQL + Webpack) in Redux so we
    // can clear terminal and print them out on every compile.
    // Borrow pretty printing code from webpack plugin.
    const localUrlForTerminal = prettyPrintUrl(prettyHost)
    const localUrlForBrowser = formatUrl(prettyHost)
    return {
      lanUrlForConfig,
      lanUrlForTerminal,
      localUrlForTerminal,
      localUrlForBrowser,
    }
  }

  function printInstructions(appName: string, urls: IPreparedUrls): void {
    console.log()
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`)
    console.log()

    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold(`Local:`)}            ${urls.localUrlForTerminal}`
      )
      console.log(
        `  ${chalk.bold(`On Your Network:`)}  ${urls.lanUrlForTerminal}`
      )
    } else {
      console.log(`  ${urls.localUrlForTerminal}`)
    }

    console.log()
    console.log(
      `View ${
        process.env.GATSBY_GRAPHQL_IDE === `playground`
          ? `the GraphQL Playground`
          : `GraphiQL`
      }, an in-browser IDE, to explore your site's data and schema`
    )
    console.log()

    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold(`Local:`)}            ${
          urls.localUrlForTerminal
        }___graphql`
      )
      console.log(
        `  ${chalk.bold(`On Your Network:`)}  ${
          urls.lanUrlForTerminal
        }___graphql`
      )
    } else {
      console.log(`  ${urls.localUrlForTerminal}___graphql`)
    }

    console.log()
    console.log(`Note that the development build is not optimized.`)
    console.log(
      `To create a production build, use ` + `${chalk.cyan(`gatsby build`)}`
    )
    console.log()
  }

  function printDeprecationWarnings(): void {
    type DeprecatedAPIList = ["boundActionCreators", "pathContext"] // eslint-disable-line
    const deprecatedApis: DeprecatedAPIList = [
      `boundActionCreators`,
      `pathContext`,
    ]
    const fixMap = {
      boundActionCreators: {
        newName: `actions`,
        docsLink: `https://gatsby.dev/boundActionCreators`,
      },
      pathContext: {
        newName: `pageContext`,
        docsLink: `https://gatsby.dev/pathContext`,
      },
    }
    const deprecatedLocations = {
      boundActionCreators: [] as string[],
      pathContext: [] as string[],
    }

    glob
      .sync(`{,!(node_modules|public)/**/}*.js`, { nodir: true })
      .forEach(file => {
        const fileText = fs.readFileSync(file)
        const matchingApis = deprecatedApis.filter(api =>
          fileText.includes(api)
        )
        matchingApis.forEach(api => deprecatedLocations[api].push(file))
      })

    deprecatedApis.forEach(api => {
      if (deprecatedLocations[api].length) {
        console.log(
          `%s %s %s %s`,
          chalk.cyan(api),
          chalk.yellow(`is deprecated. Please use`),
          chalk.cyan(fixMap[api].newName),
          chalk.yellow(
            `instead. For migration instructions, see ${fixMap[api].docsLink}\nCheck the following files:`
          )
        )
        console.log()
        deprecatedLocations[api].forEach(file => console.log(file))
        console.log()
      }
    })
  }

  // compiler.hooks.invalid.tap(`log compiling`, function(...args) {
  //   console.log(`set invalid`, args, this)
  // })

  compiler.hooks.watchRun.tapAsync(`log compiling`, function (_, done) {
    if (webpackActivity) {
      webpackActivity.end()
    }
    webpackActivity = report.activityTimer(`Re-building development bundle`, {
      id: `webpack-develop`,
    })
    webpackActivity.start()

    done()
  })

  let isFirstCompile = true
  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tapAsync(`print gatsby instructions`, function (
    stats,
    done
  ) {
    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const urls = prepareUrls(
      program.https ? `https` : `http`,
      program.host,
      program.proxyPort
    )
    const isSuccessful = !messages.errors.length

    if (isSuccessful && isFirstCompile) {
      printInstructions(
        program.sitePackageJson.name || `(Unnamed package)`,
        urls
      )
      printDeprecationWarnings()
      if (program.open) {
        Promise.resolve(openurl(urls.localUrlForBrowser)).catch(() =>
          console.log(
            `${chalk.yellow(
              `warn`
            )} Browser not opened because no browser was found`
          )
        )
      }
    }

    isFirstCompile = false

    if (webpackActivity) {
      reportWebpackWarnings(stats)

      if (!isSuccessful) {
        const errors = structureWebpackErrors(
          `develop`,
          stats.compilation.errors
        )
        webpackActivity.panicOnBuild(errors)
      }
      webpackActivity.end()
      webpackActivity = null
    }

    done()
  })
}
