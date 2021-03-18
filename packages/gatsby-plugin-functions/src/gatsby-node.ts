import fs from "fs-extra"
import glob from "globby"
import path from "path"
import webpack from "webpack"

import { urlResolve } from "gatsby-core-utils"

import {
  ParentSpanPluginArgs,
  PluginOptions,
  CreateDevServerArgs,
} from "gatsby"

const DEFAULT_FUNCTIONS_DIRECTORY_PATH = path.join(process.cwd(), `src/api`)

export async function onPreBootstrap(
  { reporter }: ParentSpanPluginArgs,
  {
    path: functionsDirectoryPath = DEFAULT_FUNCTIONS_DIRECTORY_PATH,
  }: PluginOptions
): Promise<void> {
  const activity = reporter.activityTimer(`Compiling Gatsby Functions`)
  activity.start()

  const functionsDirectory = path.resolve(
    process.cwd(),
    functionsDirectoryPath as string
  )

  const functionsGlob = `**/*.{js,ts}`

  // Get initial list of files
  const files = await glob(functionsGlob, { cwd: functionsDirectory })

  if (files?.length === 0) {
    reporter.warn(`No functions found in directory: ${functionsDirectory}.`)
    return
  }

  await fs.ensureDir(path.join(process.cwd(), `.cache`, `functions`))

  await fs.emptyDir(path.join(process.cwd(), `.cache`, `functions`))

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

  try {
    await Promise.all(
      files.map(file => {
        const config = {
          entry: path.join(functionsDirectory, file),
          output: {
            path: path.join(process.cwd(), `.cache`, `functions`),
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
            if (stats?.compilation?.warnings) {
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
    reporter.panicOnBuild(e.message)
  }

  activity.end()
}

export async function onCreateDevServer(
  { reporter, app }: CreateDevServerArgs,
  {
    path: functionsDirectoryPath = DEFAULT_FUNCTIONS_DIRECTORY_PATH,
  }: PluginOptions
): Promise<void> {
  const functionsGlob = `**/*.{js,ts}`
  const functionsDirectory = path.resolve(
    process.cwd(),
    functionsDirectoryPath as string
  )
  const files = await glob(functionsGlob, { cwd: functionsDirectory })

  reporter.info(`Attaching Functions to development server.`)

  const knownFunctions = new Map(
    files.map(file => [
      urlResolve(path.parse(file).dir, path.parse(file).name),
      file,
    ])
  )

  app.use(`/api/:functionName`, (req, res, next) => {
    const { functionName } = req.params

    if (knownFunctions.has(functionName)) {
      const activity = reporter.activityTimer(
        `Executing function ${functionName}`
      )
      activity.start()
      const compiledFunctionsDir = path.join(
        process.cwd(),
        `.cache`,
        `functions`
      )
      const funcNameToJs = (knownFunctions.get(functionName) as string).replace(
        `ts`,
        `js`
      )

      const fn = require(path.join(compiledFunctionsDir, funcNameToJs))

      const fnToExecute = (fn && fn.default) || fn

      try {
        fnToExecute(req, res)
      } catch (e) {
        reporter.error(e.message)
      }
      activity.end()
    } else {
      next()
    }
  })
}
