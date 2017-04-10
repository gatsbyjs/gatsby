/* @flow */
const express = require("express")
const graphqlHTTP = require("express-graphql")
const glob = require("glob")
const webpackRequire = require("webpack-require")
const bootstrap = require("../bootstrap")
const webpack = require("webpack")
const webpackConfig = require("./webpack.config")
const React = require("react")
const ReactDOMServer = require("react-dom/server")
const rl = require("readline")
const parsePath = require("parse-filepath")
const _ = require("lodash")

const rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const debug = require("debug")("gatsby:application")

async function startServer(program) {
  const directory = program.directory

  // Load pages for the site.
  const { schema } = await bootstrap(program)

  // Generate random port for webpack to listen on.
  // Perhaps should check if port is open.
  //const webpackPort = Math.round(Math.random() * 1000 + 1000)
  const compilerConfig = await webpackConfig(
    program,
    directory,
    `develop`,
    program.port
  )

  const devConfig = compilerConfig.resolve()
  const compiler = webpack(devConfig)

  const HTMLPath = glob.sync(`${directory}/html.*`)[0]
  // Check if we can't find an html component in root of site.
  if (!HTMLPath) {
    throw new Error(`Couldn't find an html.js at the root of your site`)
  }

  // We use the program port not the webpack-dev-server port as if you import
  // files in your html.js they won't be available through the webpack-dev-server.
  // By using the program port, requesting these imported files might accidentally work
  // as the imported files will be available in /public. TODO test how expensive
  // it'd be to do an actual static compile of the html.js on startup to avoid
  // this discprenecy between dev and prod.
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
      `/graphql`,
      graphqlHTTP({
        schema,
        graphiql: true,
      })
    )
    let htmlStr
    app.use((req, res, next) => {
      const parsedPath = parsePath(req.originalUrl)
      if (parsedPath.extname === `` || parsedPath.extname === `.html`) {
        if (htmlStr) {
          return res.send(htmlStr)
        } else {
          try {
            const apiRunner = require(`${directory}/.intermediate-representation/api-runner-ssr`)
            const htmlElement = React.createElement(HTML, {
              body: ``,
              headComponents: _.flattenDeep(
                apiRunner(`modifyHeadComponents`, { headComponents: [] }, [])
              ),
              postBodyComponents: _.flattenDeep(
                apiRunner(`modifyPostBodyComponents`, { headComponents: [] }, [
                ])
              ).concat([<script src="/commons.js" />]),
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
          const opn = require("opn")
          opn(
            `http://${listener.address().address}:${listener.address().port}`
          )
        }
        console.log(
          `Listening at: http://${listener.address().address}:${listener.address().port}`
        )
      }
    })
  })
}

module.exports = (program: any) => {
  const detect = require("detect-port")
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
          console.log("changed the port")
        }

        return startServer(program)
      })
    }

    return startServer(program)
  })
}
