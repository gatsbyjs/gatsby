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

export async function onPreBootstrap(
  { reporter }: ParentSpanPluginArgs,
  { path: functionsDirectoryPath }: PluginOptions
): Promise<void> {
  const activity = reporter.activityTimer(`building functions`)
  activity.start()

  const functionsDirectory = path.resolve(
    process.cwd(),
    functionsDirectoryPath as string
  )

  const functionsGlob = `**/*.{js,ts}`

  // Get initial list of files
  const files = await glob(functionsGlob, { cwd: functionsDirectory })

  // console.log({ files })

  const knownFunctions = new Set(files)

  // console.log({ knownFunctions })

  // if (![`develop`, `build-javascript`].includes(stage)) {
  //   return Promise.resolve()
  // }

  await fs.ensureDir(path.join(process.cwd(), `.cache`, `functions`))

  await fs.emptyDir(path.join(process.cwd(), `.cache`, `functions`))

  // console.log({
  //   path: path.join(functionsDirectory, `month.js`),
  // })

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
        // devtool: `source-map`,
      }

      return new Promise((resolve, reject) =>
        // if (stage === `develop`) {
        //   webpack(config).watch({}, () => {})

        //   return resolve()
        // }

        webpack(config).run((err, stats) => {
          console.log({
            warnings: stats.compilation.warnings,
          })
          if (err) return reject(err)
          const errors = stats.compilation.errors || []
          if (errors.length > 0) return reject(stats.compilation.errors)
          return resolve()
        })
      )
    })
  )

  activity.end()
}

export async function onCreateDevServer(
  { reporter, app }: CreateDevServerArgs,
  { path: functionsDirectoryPath }: PluginOptions
): Promise<void> {
  const functionsGlob = `**/*.{js,ts}`
  const functionsDirectory = path.resolve(
    process.cwd(),
    functionsDirectoryPath as string
  )
  const files = await glob(functionsGlob, { cwd: functionsDirectory })

  // console.log({ files })

  const knownFunctions = new Map(
    files.map(file => [
      urlResolve(path.parse(file).dir, path.parse(file).name),
      file,
    ])
  )
  // console.log(app, functionsDirectoryPath)

  app.use((req, res, next) => {
    const functionName = urlResolve(...req.path.split(`/`).splice(2))

    if (knownFunctions.has(functionName)) {
      const fn = require(path.join(
        functionsDirectory,
        knownFunctions.get(functionName)
      ))

      fn(req, res)
    } else {
      next()
    }
  })
  // const activity = reporter.activityTimer(`building functions`)
  // activity.start()
  // const functionsDirectory = path.resolve(
  //   process.cwd(),
  //   functionsDirectoryPath as string
  // )
  // const functionsGlob = `**/*.{js,ts}`
  // // Get initial list of files
  // const files = await glob(functionsGlob, { cwd: functionsDirectory })
  // // console.log({ files })
  // const knownFunctions = new Set(files)
  // // console.log({ knownFunctions })
  // // if (![`develop`, `build-javascript`].includes(stage)) {
  // //   return Promise.resolve()
  // // }
  // await fs.ensureDir(path.join(process.cwd(), `.cache`, `functions`))
  // await fs.emptyDir(path.join(process.cwd(), `.cache`, `functions`))
}
