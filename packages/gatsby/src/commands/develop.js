/* @flow */

const url = require(`url`)
const glob = require(`glob`)
const fs = require(`fs`)
const chokidar = require(`chokidar`)
const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const parsePath = require(`parse-filepath`)
const request = require(`request`)
const rl = require(`readline`)
const webpack = require(`webpack`)
const webpackConfig = require(`../utils/webpack.config`)
const bootstrap = require(`../bootstrap`)
const { store } = require(`../redux`)
const copyStaticDirectory = require(`../utils/copy-static-directory`)
const developHtml = require(`./develop-html`)
const { withBasePath } = require(`../utils/path`)
const report = require(`gatsby-cli/lib/reporter`)
const launchEditor = require(`react-dev-utils/launchEditor`)
const formatWebpackMessages = require(`react-dev-utils/formatWebpackMessages`)
const chalk = require(`chalk`)
const address = require(`address`)
const sourceNodes = require(`../utils/source-nodes`)

// const isInteractive = process.stdout.isTTY

// Watch the static directory and copy files to public as they're added or
// changed. Wait 10 seconds so copying doesn't interfer with the regular
// bootstrap.
setTimeout(() => {
  copyStaticDirectory()
}, 10000)

const rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Quit immediately on hearing ctrl-c
rlInterface.on(`SIGINT`, () => {
  process.exit()
})

async function startServer(program) {
  const directory = program.directory
  const directoryPath = withBasePath(directory)
  const createIndexHtml = () =>
    developHtml(program).catch(err => {
      if (err.name !== `WebpackError`) {
        report.panic(err)
        return
      }
      report.panic(
        report.stripIndent`
          There was an error compiling the html.js component for the development server.

          See our docs page on debugging HTML builds for help https://goo.gl/yL9lND
        `,
        err
      )
    })

  // Start bootstrap process.
  await bootstrap(program)

  await createIndexHtml()

  const devConfig = await webpackConfig(
    program,
    directory,
    `develop`,
    program.port
  )

  const compiler = webpack(devConfig)

  /**
   * Set up the express app.
   **/
  const app = express()
  app.use(
    require(`webpack-hot-middleware`)(compiler, {
      log: false,
      path: `/__webpack_hmr`,
      heartbeat: 10 * 1000,
    })
  )
  app.use(
    `/___graphql`,
    graphqlHTTP({
      schema: store.getState().schema,
      graphiql: true,
    })
  )

  // Allow requests from any origin. Avoids CORS issues when using the `--host` flag.
  app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`)
    res.header(
      `Access-Control-Allow-Headers`,
      `Origin, X-Requested-With, Content-Type, Accept`
    )
    next()
  })

  /**
   * Refresh external data sources.
   * This behavior is disabled by default, but the ENABLE_REFRESH_ENDPOINT env var enables it
   * If no GATSBY_REFRESH_TOKEN env var is available, then no Authorization header is required
   **/
  app.post(`/__refresh`, (req, res) => {
    const enableRefresh = process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
    const refreshToken = process.env.GATSBY_REFRESH_TOKEN
    const authorizedRefresh =
      !refreshToken || req.headers.authorization === refreshToken

    if (enableRefresh && authorizedRefresh) {
      console.log(`Refreshing source data`)
      sourceNodes()
    }
    res.end()
  })

  app.get(`/__open-stack-frame-in-editor`, (req, res) => {
    launchEditor(req.query.fileName, req.query.lineNumber)
    res.end()
  })

  app.use(express.static(__dirname + `/public`))

  app.use(
    require(`webpack-dev-middleware`)(compiler, {
      logLevel: `trace`,
      publicPath: devConfig.output.publicPath,
      stats: `errors-only`,
    })
  )

  // Set up API proxy.
  const { proxy } = store.getState().config
  if (proxy) {
    const { prefix, url } = proxy
    app.use(`${prefix}/*`, (req, res) => {
      const proxiedUrl = url + req.originalUrl
      req.pipe(request(proxiedUrl)).pipe(res)
    })
  }

  // Check if the file exists in the public folder.
  app.get(`*`, (req, res, next) => {
    // Load file but ignore errors.
    res.sendFile(
      directoryPath(`/public${decodeURIComponent(req.path)}`),
      err => {
        // No err so a file was sent successfully.
        if (!err || !err.path) {
          next()
        } else if (err) {
          // There was an error. Let's check if the error was because it
          // couldn't find an HTML file. We ignore these as we want to serve
          // all HTML from our single empty SSR html file.
          const parsedPath = parsePath(err.path)
          if (
            parsedPath.extname === `` ||
            parsedPath.extname.startsWith(`.html`)
          ) {
            next()
          } else {
            res.status(404).end()
          }
        }
      }
    )
  })

  // Render an HTML page and serve it.
  app.use((req, res, next) => {
    const parsedPath = parsePath(req.path)
    if (
      parsedPath.extname === `` ||
      parsedPath.extname.startsWith(`.html`) ||
      parsedPath.path.endsWith(`/`)
    ) {
      res.sendFile(directoryPath(`public/index.html`), err => {
        if (err) {
          res.status(500).end()
        }
      })
    } else {
      next()
    }
  })

  /**
   * Set up the HTTP server and socket.io.
   **/

  const server = require(`http`).Server(app)
  const io = require(`socket.io`)(server)

  io.on(`connection`, socket => {
    socket.join(`clients`)
  })

  const listener = server.listen(program.port, program.host, err => {
    if (err) {
      if (err.code === `EADDRINUSE`) {
        // eslint-disable-next-line max-len
        report.panic(
          `Unable to start Gatsby on port ${
            program.port
          } as there's already a process listing on that port.`
        )
        return
      }

      report.panic(`There was a problem starting the development server`, err)
    }
  })

  // Register watcher that rebuilds index.html every time html.js changes.
  const watchGlobs = [`src/html.js`, `plugins/**/gatsby-ssr.js`].map(path =>
    directoryPath(path)
  )

  chokidar.watch(watchGlobs).on(`change`, async () => {
    await createIndexHtml()
    io.to(`clients`).emit(`reload`)
  })

  return [compiler, listener]
}

module.exports = async (program: any) => {
  const detect = require(`detect-port`)
  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port

  let compiler
  await new Promise(resolve => {
    detect(port, (err, _port) => {
      if (err) {
        report.panic(err)
      }

      if (port !== _port) {
        // eslint-disable-next-line max-len
        const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n] `

        rlInterface.question(question, answer => {
          if (answer.length === 0 || answer.match(/^yes|y$/i)) {
            program.port = _port // eslint-disable-line no-param-reassign
          }

          startServer(program).then(([c, l]) => {
            compiler = c
            resolve()
          })
        })
      } else {
        startServer(program).then(([c, l]) => {
          compiler = c
          resolve()
        })
      }
    })
  })

  function prepareUrls(protocol, host, port) {
    const formatUrl = hostname =>
      url.format({
        protocol,
        hostname,
        port,
        pathname: `/`,
      })
    const prettyPrintUrl = hostname =>
      url.format({
        protocol,
        hostname,
        port: chalk.bold(port),
        pathname: `/`,
      })

    const isUnspecifiedHost = host === `0.0.0.0` || host === `::`
    let lanUrlForConfig, lanUrlForTerminal
    if (isUnspecifiedHost) {
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
    const localUrlForTerminal = prettyPrintUrl(host)
    const localUrlForBrowser = formatUrl(host)
    return {
      lanUrlForConfig,
      lanUrlForTerminal,
      localUrlForTerminal,
      localUrlForBrowser,
    }
  }

  function printInstructions(appName, urls, useYarn) {
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
      `View GraphiQL, an in-browser IDE, to explore your site's data and schema`
    )
    console.log()
    console.log(`  ${urls.localUrlForTerminal}___graphql`)

    console.log()
    console.log(`Note that the development build is not optimized.`)
    console.log(
      `To create a production build, use ` + `${chalk.cyan(`gatsby build`)}`
    )
    console.log()
  }

  function printDeprecationWarnings() {
    const deprecatedApis = [`boundActionCreators`, `pathContext`]
    const deprecatedLocations = {}
    deprecatedApis.forEach(api => (deprecatedLocations[api] = []))

    glob.sync(`{,!(node_modules|public)/**/}*.js`).forEach(file => {
      const fileText = fs.readFileSync(file)
      const matchingApis = deprecatedApis.filter(
        api => fileText.indexOf(api) !== -1
      )
      matchingApis.forEach(api => deprecatedLocations[api].push(file))
    })

    deprecatedApis.forEach(api => {
      if (deprecatedLocations[api].length) {
        console.log(
          `${chalk.cyan(api)} ${chalk.yellow(
            `is deprecated but was found in the following files:`
          )}`
        )
        console.log()
        deprecatedLocations[api].forEach(file => console.log(file))
        console.log()
      }
    })
  }

  let isFirstCompile = true
  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin(`done`, stats => {
    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const urls = prepareUrls(`http`, program.host, program.port)
    const isSuccessful = !messages.errors.length && !messages.warnings.length
    // if (isSuccessful) {
    // console.log(chalk.green(`Compiled successfully!`))
    // }
    // if (isSuccessful && (isInteractive || isFirstCompile)) {
    if (isSuccessful && isFirstCompile) {
      printInstructions(program.sitePackageJson.name, urls, program.useYarn)
      printDeprecationWarnings()
      if (program.open) {
        require(`opn`)(urls.localUrlForBrowser)
      }
    }

    isFirstCompile = false

    // If errors exist, only show errors.
    // if (messages.errors.length) {
    // // Only keep the first error. Others are often indicative
    // // of the same problem, but confuse the reader with noise.
    // if (messages.errors.length > 1) {
    // messages.errors.length = 1
    // }
    // console.log(chalk.red("Failed to compile.\n"))
    // console.log(messages.errors.join("\n\n"))
    // return
    // }

    // Show warnings if no errors were found.
    // if (messages.warnings.length) {
    // console.log(chalk.yellow("Compiled with warnings.\n"))
    // console.log(messages.warnings.join("\n\n"))

    // // Teach some ESLint tricks.
    // console.log(
    // "\nSearch for the " +
    // chalk.underline(chalk.yellow("keywords")) +
    // " to learn more about each warning."
    // )
    // console.log(
    // "To ignore, add " +
    // chalk.cyan("// eslint-disable-next-line") +
    // " to the line before.\n"
    // )
    // }
  })
}
