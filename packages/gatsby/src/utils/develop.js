/* @flow */
const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const glob = require(`glob`)
const request = require(`request`)
const bootstrap = require(`../bootstrap`)
const webpack = require(`webpack`)
const webpackConfig = require(`./webpack.config`)
const React = require(`react`)
const ReactDOMServer = require(`react-dom/server`)
const rl = require(`readline`)
const parsePath = require(`parse-filepath`)
const _ = require(`lodash`)
const { store } = require(`../redux`)
const copyStaticDirectory = require(`./copy-static-directory`)
const developHtml = require(`./develop-html`)

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

const debug = require(`debug`)(`gatsby:application`)

async function startServer(program) {
  const directory = program.directory

  // Start bootstrap process.
  await bootstrap(program)
  await developHtml(program).catch(err => {
    console.log(err)
    process.exit(1)
  })

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `develop`,
    program.port
  )

  const devConfig = compilerConfig.resolve()
  const compiler = webpack(devConfig)

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
      res.sendFile(`${process.cwd()}/public/index.html`, err => {
        if (err) {
          res.status(500).end()
        }
      })
    }
  })

  // As last step, check if the file exists in the public folder.
  app.get(`*`, (req, res) => {
    // Load file but ignore errors.
    res.sendFile(`${process.cwd()}/public/${req.url}`, err => {
      if (err) {
        res.status(404).end()
      }
    })
  })

  const listener = app.listen(program.port, program.host, e => {
    if (e) {
      if (e.code === `EADDRINUSE`) {
        // eslint-disable-next-line max-len
        console.log(
          `Unable to start Gatsby on port ${program.port} as there's already a process listing on that port.`
        )
      } else {
        console.log(e)
      }

      process.exit()
    } else {
      if (program.open) {
        const host =
          listener.address().address === `127.0.0.1`
            ? `localhost`
            : listener.address().address
        const opn = require(`opn`)
        opn(`http://${host}:${listener.address().port}`)
      }
    }
  })
}

module.exports = (program: any) => {
  const detect = require(`detect-port`)
  const port =
    typeof program.port === `string` ? parseInt(program.port, 10) : program.port

  detect(port, (err, _port) => {
    if (err) {
      console.error(err)
      process.exit()
    }

    if (port !== _port) {
      // eslint-disable-next-line max-len
      const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n] `

      return rlInterface.question(question, answer => {
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          program.port = _port // eslint-disable-line no-param-reassign
          console.log(`changed the port`)
        }

        return startServer(program)
      })
    }

    return startServer(program)
  })
}
