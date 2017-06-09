/* @flow */
const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const glob = require(`glob`)
const request = require(`request`)
const webpackRequire = require(`webpack-require`)
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

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `develop`,
    program.port
  )

  const devConfig = compilerConfig.resolve()
  const compiler = webpack(devConfig)

  let HTMLPath = glob.sync(`${directory}/src/html.*`)[0]
  // Check if we can't find an html component in root of site.
  if (!HTMLPath) {
    HTMLPath = `${directory}/.cache/default-html.js`
  }

  // We use the program port not the webpack-dev-server port as if you import
  // files in your html.js they won't be available through the
  // webpack-dev-server.  By using the program port, requesting these
  // imported files might accidentally work as the imported files will be
  // available in /public. TODO test how expensive it'd be to do an actual
  // static compile of the html.js on startup to avoid this discprenecy
  // between dev and prod.
  const htmlCompilerConfig = await webpackConfig(
    program,
    directory,
    `develop-html`,
    program.port
  )

  webpackRequire(htmlCompilerConfig.resolve(), HTMLPath, (error, factory) => {
    if (error) {
      console.log(`Failed to require ${directory}/html.js`)
      error.forEach(e => {
        console.log(e)
      })
      process.exit()
    }
    const HTML = factory()
    debug(`Configuring develop server`)

    const app = express()
    app.use(
      require(`webpack-hot-middleware`)(compiler, {
        log: console.log,
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
    let htmlStr
    // Render an HTML page and serve it.
    app.use((req, res, next) => {
      const parsedPath = parsePath(req.originalUrl)
      if (parsedPath.extname === `` || parsedPath.extname === `.html`) {
        if (htmlStr) {
          return res.send(htmlStr)
        } else {
          try {
            const apiRunner = require(`${directory}/.cache/api-runner-ssr`)

            let headComponents = []
            let preBodyComponents = []
            let postBodyComponents = []
            let bodyProps = {}

            const setHeadComponents = components => {
              headComponents = headComponents.concat(components)
            }

            const setPreBodyComponents = components => {
              console.log('+++ setPreBodyComponents', components)
              preBodyComponents = preBodyComponents.concat(components)
            }

            const setPostBodyComponents = components => {
              console.log('+++ setPostBodyComponents', components)
              postBodyComponents = postBodyComponents.concat(components)
            }

            const setBodyProps = props => {
              bodyProps = _.merge({}, bodyProps, props)
            }

            apiRunner(`onRenderBody`, {
              setHeadComponents,
              setPreBodyComponents,
              setPostBodyComponents,
              setBodyProps,
            })

            const htmlElement = React.createElement(HTML, {
              ...bodyProps,
              body: ``,
              headComponents,
              preBodyComponents,
              postBodyComponents: postBodyComponents.concat([
                <script src="/commons.js" />,
              ]),
            })
            htmlStr = ReactDOMServer.renderToStaticMarkup(htmlElement)
            htmlStr = `<!DOCTYPE html>\n${htmlStr}`
            return res.send(htmlStr)
          } catch (e) {
            console.log(e.stack)
            throw e
          }
        }
      } else {
        return next()
      }
    })
    app.use(
      require(`webpack-dev-middleware`)(compiler, {
        noInfo: true,
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
          const opn = require(`opn`)
          opn(`http://${listener.address().address}:${listener.address().port}`)
        }
        const host = listener.address().address === `127.0.0.1`
          ? `localhost`
          : listener.address().address
        console.log(
          `
The development server is listening at: http://${host}:${listener.address()
            .port}
GraphiQL can be accessed at: http://${host}:${listener.address()
            .port}/___graphql
          `
        )
      }
    })
  })
}

module.exports = (program: any) => {
  const detect = require(`detect-port`)
  const port = typeof program.port === `string`
    ? parseInt(program.port, 10)
    : program.port

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
