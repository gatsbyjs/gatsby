import path from "path"
import fs from "fs"
import glob from "glob"
import base64 from "base-64"
import { cloneDeep } from "lodash"
import webpack from "webpack"

function handleErr(err, res) {
  res.statusCode = 500
  res.send(`Function invocation failed: ` + err.toString())
  console.log(`Error during invocation: `, err)
}

function createCallback(res) {
  return function callback(err, lambdaResponse) {
    if (err) {
      handleErr(err, res)
      return
    }

    res.statusCode = lambdaResponse.statusCode
    for (const key in lambdaResponse.headers) {
      res.setHeader(key, lambdaResponse.headers[key])
    }
    res.write(
      lambdaResponse.isBase64Encoded
        ? base64.decode(lambdaResponse.body)
        : lambdaResponse.body
    )
    res.end()
    return
  }
}

function promiseCallback(promise, callback) {
  if (
    promise &&
    typeof promise.then === `function` &&
    typeof callback === `function`
  )
    promise.then(data => callback(null, data), err => callback(err, null))
}

exports.onRunDevServer = (
  { app },
  { functionsSrc, functionsOutput, nodeTarget = `8.10` }
) => {
  app.use(`/.netlify/functions/`, (req, res, next) => {
    const func = req.path.replace(/\/$/, ``)
    const module = path.join(functionsOutput, func)
    let handler
    try {
      handler = require(module)
    } catch (err) {
      res.statusCode = 500
      res.send(`Function invocation failed: ` + err.toString())
      return
    }
    const isBase64 =
      req.body && !(req.headers[`content-type`] || ``).match(/text|application/)

    const lambdaRequest = {
      path: req.path,
      httpMethod: req.method,
      queryStringParameters: req.query || {},
      headers: req.headers,
      body: isBase64 ? base64.encode(req.body) : res.body,
      isBase64Encoded: isBase64,
    }

    const callback = createCallback(res)
    const promise = handler.handler(lambdaRequest, {}, callback)
    promiseCallback(promise, callback)
  })
}
exports.onCreateWebpackConfig = (
  { store, stage, getConfig, reporter, actions },
  { functionsSrc, functionsOutput, nodeTarget = `8.10` }
) => {
  if ([`develop`, `build-javascript`].includes(stage)) {
    if (!functionsSrc || !fs.existsSync(functionsSrc)) {
      reporter.panic(
        `"functionsSrc" is a required option for gatsby-plugin-netlify-functions and must exist`
      )
    }
    if (!functionsOutput) {
      reporter.panic(
        `"functionsOutput" is a required option for gatsby-plugin-netlify-functions`
      )
    }

    const gatsbyConfig = getConfig()
    const { program } = store.getState()

    const extensions = program.extensions.filter(e => !e.endsWith(`x`))
    const ext = `+(*${extensions.join(`|*`)})`

    const entry = glob
      .sync(`${functionsSrc}/${ext}`, { nodir: true })
      .reduce((acc, f) => {
        return { ...acc, [path.basename(f, path.extname(f))]: f }
      }, {})

    const rules = cloneDeep(
      gatsbyConfig.module.rules.filter(
        rule =>
          rule.use && rule.use.find(use => use.loader.includes(`babel-loader`))
      )
    )

    rules.forEach(rule =>
      rule.use[0].options.presets.forEach(preset => {
        if (preset[0].includes(`/preset-env/`))
          preset[1].targets = {
            node: nodeTarget,
          }
      })
    )

    const config = {
      ...gatsbyConfig,
      mode: `none`,
      devtool: false,
      target: `node`,
      entry,
      output: {
        path: functionsOutput,
        filename: `[name].js`,
        libraryTarget: `commonjs`,
      },
      module: {
        rules,
      },
      resolve: {
        extensions,
      },
      optimization: {},
      performance: {
        maxAssetSize: 2500000,
      },
    }

    // reporter.panic("wait")
    const compiler = webpack(config)
    const report = (err, stats) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(`Build netlify functions`)
      console.log(
        stats.toString({
          chunks: false, // Makes the build much quieter
          modules: false,
          entrypoints: false,
          hash: false,
          version: false,
          builtAt: false,
          colors: true, // Shows colors in the console
        })
      )
    }
    if (stage === `develop`)
      compiler.watch(
        {
          ignored: /node_modules/,
        },
        report
      )
    else compiler.run(report)
  }
}
