import fs from "fs-extra"
import glob from "globby"
import path from "path"
import webpack from "webpack"

import { ParentSpanPluginArgs, PluginOptions } from "gatsby"

export async function onPreInit(
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
