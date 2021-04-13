import fs from "fs-extra"
import glob from "glob"
import path from "path"
import webpack from "webpack"
import multer from "multer"
import * as express from "express"
import { urlResolve } from "gatsby-core-utils"
import { ParentSpanPluginArgs, CreateDevServerArgs } from "gatsby"
import TerserPlugin from "terser-webpack-plugin"
import { internalActions } from "../../redux/actions"

export async function onPreBootstrap({
  reporter,
  store,
}: ParentSpanPluginArgs): Promise<void> {
  const activity = reporter.activityTimer(`Compiling Gatsby Functions`)
  activity.start()

  const {
    program: { directory: siteDirectoryPath },
    functions,
  } = store.getState()

  const functionsGlob = `**/*.{js,ts}`

  const functionsDirectoryPath = path.join(siteDirectoryPath, `src/api`)

  const functionsDirectory = path.resolve(
    siteDirectoryPath,
    functionsDirectoryPath as string
  )

  const files = await new Promise((resolve, reject) => {
    glob(functionsGlob, { cwd: functionsDirectory }, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })

  if (files?.length === 0) {
    reporter.warn(
      `No functions found in directory: ${path.relative(
        siteDirectoryPath,
        functionsDirectory
      )}`
    )
  }

  reporter.verbose(`Attaching functions to development server`)

  const knownFunctions = new Map(
    files.map(file => [
      urlResolve(path.parse(file).dir, path.parse(file).name),
      file,
    ])
  )

  store.dispatch(internalActions.setFunctions(knownFunctions))

  await fs.ensureDir(path.join(siteDirectoryPath, `.cache`, `functions`))

  await fs.emptyDir(path.join(siteDirectoryPath, `.cache`, `functions`))

  const gatsbyVarObject = Object.keys(process.env).reduce((acc, key) => {
    if (/^GATSBY_/.test(key)) {
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
      Array.from(knownFunctions).map(([_, file]) => {
        const config = {
          entry: path.join(functionsDirectory, file),
          output: {
            path: path.join(siteDirectoryPath, `.cache`, `functions`),
            filename: file.replace(`.ts`, `.js`),
            libraryTarget: `commonjs2`,
          },
          target: `node`,

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
          // optimization: {
          // minimize: true,
          // minimizer: [
          // new TerserPlugin({
          // extractComments: false,
          // }),
          // ],
          // },
          plugins: [new webpack.DefinePlugin(varObject)],
        }

        return new Promise((resolve, reject) =>
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
}: CreateDevServerArgs): Promise<void> {
  const {
    program: { directory: siteDirectoryPath },
    functions,
  } = store.getState()

  reporter.verbose(`Attaching functions to development server`)

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
          siteDirectoryPath,
          `.cache`,
          `functions`
        )
        const funcNameToJs = functions.get(functionName) as string

        try {
          const fn = require(path.join(compiledFunctionsDir, funcNameToJs))

          const fnToExecute = (fn && fn.default) || fn

          fnToExecute(req, res)
        } catch (e) {
          reporter.error(e)
          res.sendStatus(500)
        }
      } else {
        next()
      }
    }
  )
}
