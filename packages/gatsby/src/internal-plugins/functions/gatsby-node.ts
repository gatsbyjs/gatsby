import fs from "fs-extra"
import glob from "globby"
import path from "path"
import webpack from "webpack"
import multer from "multer"
import * as express from "express"

// import { urlResolve } from "gatsby-core-utils"

// const { emitter, store } = require(`../../redux`)

import {
  ParentSpanPluginArgs,
  PluginOptions,
  CreateDevServerArgs,
} from "gatsby"

// const FUNCTION_INVOCATION_TIMEOUT = 30 * 1000

// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function onPreBootstrap(
  { reporter, store }: ParentSpanPluginArgs,
  { path: functionsDirectoryPath }: PluginOptions
): Promise<void> {
  const activity = reporter.activityTimer(`Compiling Gatsby Functions`)
  activity.start()

  const {
    program: { directory: siteDirectoryPath },
    functions,
  } = store.getState()

  // if (!functionsDirectoryPath) {
  functionsDirectoryPath = path.join(siteDirectoryPath, `src/api`)
  // }

  const functionsDirectory = path.resolve(
    siteDirectoryPath,
    functionsDirectoryPath as string
  )

  // const functionsGlob = `**/*.{js,ts}`

  // Get initial list of files
  // const files = await glob(functionsGlob, { cwd: functionsDirectory })

  // if (files?.length === 0) {
  //   reporter.warn(
  //     `No functions found in directory: ${path.relative(
  //       process.cwd(),
  //       functionsDirectory
  //     )}`
  //   )
  //   return
  // }

  // await fs.ensureDir(path.join(siteDirectoryPath, `.cache`, `functions`))

  // await fs.emptyDir(path.join(siteDirectoryPath, `.cache`, `functions`))

  const gatsbyVarObject = Object.keys(process.env).reduce((acc, key) => {
    if (key.match(/^GATSBY_/)) {
      acc[key] = JSON.stringify(process.env[key])
    }
    return acc
  }, {})

  const varObject = Object.keys(gatsbyVarObject).reduce(
    (acc, key) => {
      acc[`process.env.${key}`] = gatsbyVarObject[key]
      return acc
    },
    {
      "process.env": `({})`,
    }
  )

  console.log({
    functions,
  })

  try {
    await Promise.all(
      Array.from(functions).map(([name, file]) => {
        console.log({
          file,
        })

        const config = {
          entry: path.join(functionsDirectory, file),
          output: {
            path: path.join(siteDirectoryPath, `.cache`, `functions`),
            filename: file.replace(`.ts`, `.js`),
            libraryTarget: `commonjs2`,
          },
          target: `node`,
          // library: "yourLibName",

          mode: `production`,
          module: {
            rules: [
              {
                test: [/.js$/, /.ts$/],
                exclude: /node_modules/,
                loader: `babel-loader`,
              },
            ],
          },
          plugins: [new webpack.DefinePlugin(varObject)],
          // devtool: `source-map`,
        }

        return new Promise((resolve, reject) =>
          // if (stage === `develop`) {
          //   webpack(config).watch({}, () => {})

          //   return resolve()
          // }

          webpack(config).run((err, stats) => {
            if (stats?.compilation?.warnings?.length > 0) {
              reporter.warn(stats.compilation.warnings)
            }

            if (err) return reject(err)
            const errors = stats.compilation.errors || []
            if (errors.length > 0) return reject(stats.compilation.errors)
            return resolve()
          })
        )
      })
    )
  } catch (e) {
    activity.panic(`Failed to compile Gatsby Functions.`, e)
  }

  activity.end()
}

export async function onCreateDevServer({
  reporter,
  app,
  store,
}: CreateDevServerArgs): // { path: functionsDirectoryPath }: PluginOptions
Promise<void> {
  // const functionsGlob = `**/*.{js,ts}`

  const {
    //   program: { directory: siteDirectoryPath },
    functions,
  } = store.getState()

  // if (!functionsDirectoryPath) {
  //   functionsDirectoryPath = path.join(siteDirectoryPath, `src/api`)
  // }

  // const functionsDirectory = path.resolve(
  //   siteDirectoryPath,
  //   functionsDirectoryPath as string
  // )

  // const files = await glob(functionsGlob, { cwd: functionsDirectory })

  reporter.verbose(`Attaching functions to development server`)

  // const knownFunctions = new Map(
  //   files.map(file => [
  //     urlResolve(path.parse(file).dir, path.parse(file).name),
  //     file,
  //   ])
  // )

  app.use(
    `/api/:functionName`,
    multer().none(),
    express.urlencoded({ extended: true }),
    express.text(),
    express.json(),
    express.raw(),
    (req, res, next) => {
      const { functionName } = req.params

      if (functions.has(functionName)) {
        reporter.verbose(`Running ${functionName}`)
        const compiledFunctionsDir = path.join(
          process.cwd(),
          `.cache`,
          `functions`
        )
        const funcNameToJs = functions.get(functionName) as string

        try {
          const fn = require(path.join(compiledFunctionsDir, funcNameToJs))

          console.log({
            functions,
          })

          const fnToExecute = (fn && fn.default) || fn

          // Promise.race()
          fnToExecute(req, res)
        } catch (e) {
          reporter.error(e)
        }
      } else {
        next()
      }
    }
  )
}
