/* @flow */

const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const request = require(`request`)
const bootstrap = require(`../bootstrap`)
const chokidar = require(`chokidar`)
const webpack = require(`webpack`)
const webpackConfig = require(`./webpack.config`)
const rl = require(`readline`)
const parsePath = require(`parse-filepath`)
const { store } = require(`../redux`)
const copyStaticDirectory = require(`./copy-static-directory`)
const developHtml = require(`./develop-html`)
const { withBasePath } = require(`./path`)
const report = require(`../reporter`)
const { formatStaticBuildError } = require(`../reporter/errors`)

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

        ` + formatStaticBuildError(err)
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
      log: () => {},
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

  app.use(express.static(__dirname + `/public`))

  app.use(
    require(`webpack-dev-middleware`)(compiler, {
      noInfo: true,
      quiet: true,
      publicPath: devConfig.output.publicPath,
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
  // Render an HTML page and serve it.
  app.use((req, res, next) => {
    const parsedPath = parsePath(req.originalUrl)
    if (parsedPath.extname === `` || parsedPath.extname === `.html`) {
      res.sendFile(directoryPath(`public/index.html`), err => {
        if (err) {
          res.status(500).end()
        }
      })
    } else {
      next()
    }
  })

  // As last step, check if the file exists in the public folder.
  app.get(`*`, (req, res) => {
    // Load file but ignore errors.
    res.sendFile(directoryPath(`/public/${req.url}`), err => {
      if (err) {
        res.status(404).end()
      }
    })
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
          `Unable to start Gatsby on port ${program.port} as there's already a process listing on that port.`
        )
        return
      }

      report.panic(`There was a problem starting the development server`, err)
    }

    if (program.open) {
      const host =
        listener.address().address === `127.0.0.1`
          ? `localhost`
          : listener.address().address
      require(`opn`)(`http://${host}:${listener.address().port}`)
    }
  })

  // Register watcher that rebuilds index.html every time html.js changes.
  const watchGlobs = [`src/html.js`, `**/gatsby-ssr.js`].map(directoryPath)
  chokidar.watch(watchGlobs).on(`change`, async () => {
    await createIndexHtml()
    io.to(`clients`).emit(`reload`)
  })
}

module.exports = (program: any) => {
  const detect = require(`detect-port`)
  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port

  detect(port, (err, _port) => {
    if (err) {
      report.panic(err)
    }

    if (port !== _port) {
      // eslint-disable-next-line max-len
      const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n] `

      return rlInterface.question(question, answer => {
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          program.port = _port // eslint-disable-line no-param-reassign
        }

        return startServer(program)
      })
    }

    return startServer(program)
  })
}
