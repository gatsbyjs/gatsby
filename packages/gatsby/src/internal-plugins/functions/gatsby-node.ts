import fs from "fs-extra"
import glob from "glob"
import path from "path"
import webpack from "webpack"
import multer from "multer"
import * as express from "express"
import { urlResolve, getMatchPath } from "gatsby-core-utils"
import { ParentSpanPluginArgs, CreateDevServerArgs } from "gatsby"
import TerserPlugin from "terser-webpack-plugin"
import { internalActions } from "../../redux/actions"
import { reportWebpackWarnings } from "../../utils/webpack-error-utils"
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages"
import dotenv from "dotenv"
import chokidar from "chokidar"
import pathToRegexp from "path-to-regexp"

const isProductionEnv = process.env.gatsby_executing_command !== `develop`

const createWebpackConfig = async ({
  siteDirectoryPath,
  functionsDirectory,
  store,
  reporter,
}): Promise<webpack.Configuration> => {
  const files = await new Promise((resolve, reject) => {
    glob(`**/*.{js,ts}`, { cwd: functionsDirectory }, (err, files) => {
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

  const knownFunctions = new Map(
    files.map(file => {
      const { dir, name } = path.parse(file)
      const finalName = urlResolve(dir, name === `index` ? `` : name)
      return [finalName, { file, matchPath: getMatchPath(finalName) }]
    })
  )

  console.log({ knownFunctions })

  store.dispatch(internalActions.setFunctions(knownFunctions))

  // Load environment variables from process.env.GATSBY_* and .env.* files.
  // Logic is shared with webpack.config.js

  // node env should be DEVELOPMENT | PRODUCTION as these are commonly used in node land
  const nodeEnv = process.env.NODE_ENV || `${defaultNodeEnv}`
  // config env is dependent on the env that it's run, this can be anything from staging-production
  // this allows you to set use different .env environments or conditions in gatsby files
  const configEnv = process.env.GATSBY_ACTIVE_ENV || nodeEnv
  const envFile = path.join(siteDirectoryPath, `./.env.${configEnv}`)
  let parsed = {}
  try {
    parsed = dotenv.parse(fs.readFileSync(envFile, { encoding: `utf8` }))
  } catch (err) {
    if (err.code !== `ENOENT`) {
      report.error(
        `There was a problem processing the .env file (${envFile})`,
        err
      )
    }
  }

  const envObject = Object.keys(parsed).reduce((acc, key) => {
    acc[key] = JSON.stringify(parsed[key])
    return acc
  }, {})

  const varsFromProcessEnv = Object.keys(process.env).reduce((acc, key) => {
    acc[key] = JSON.stringify(process.env[key])
    return acc
  }, {})

  // Don't allow overwriting of NODE_ENV, PUBLIC_DIR as to not break gatsby things
  envObject.NODE_ENV = JSON.stringify(nodeEnv)
  envObject.PUBLIC_DIR = JSON.stringify(`${siteDirectoryPath}/public`)

  const mergedEnvVars = Object.assign(envObject, varsFromProcessEnv)

  const processEnvVars = Object.keys(mergedEnvVars).reduce(
    (acc, key) => {
      acc[`process.env.${key}`] = mergedEnvVars[key]
      return acc
    },
    {
      "process.env": `({})`,
    }
  )
  const compiledFunctionsDir = path.join(
    siteDirectoryPath,
    `.cache`,
    `functions`
  )

  // Write out manifest for use by `gatsby serve` and plugins
  const manifest = {}
  Array.from(knownFunctions).forEach(([, { file }]) => {
    const name = path.parse(file).name
    const compiledPath = path.join(compiledFunctionsDir, name + `.js`)
    manifest[name] = compiledPath
  })

  fs.writeFileSync(
    path.join(compiledFunctionsDir, `manifest.json`),
    JSON.stringify(manifest, null, 4)
  )

  const entries = {}
  Array.from(knownFunctions).forEach(([, { file }]) => {
    const filePath = path.join(functionsDirectory, file)

    // Get path without the extension (as it could be ts or js)
    const parsed = path.parse(file)
    const name = path.join(parsed.dir, parsed.name)

    entries[name] = filePath
  })

  const config = {
    entry: entries,
    output: {
      path: compiledFunctionsDir,
      filename: `[name].js`,
      libraryTarget: `commonjs2`,
    },
    target: `node`,

    mode: isProductionEnv ? `production` : `development`,
    // watch: !isProductionEnv,
    module: {
      rules: [
        {
          test: [/.js$/, /.ts$/],
          exclude: /node_modules/,
          use: {
            loader: `babel-loader`,
            options: {
              presets: [`@babel/typescript`],
            },
          },
        },
      ],
    },
    plugins: [new webpack.DefinePlugin(processEnvVars)],
  }

  return config
}

export async function onPreBootstrap({
  reporter,
  store,
}: ParentSpanPluginArgs): Promise<void> {
  const activity = reporter.activityTimer(`Compiling Gatsby Functions`)
  activity.start()

  const {
    program: { directory: siteDirectoryPath },
  } = store.getState()

  const functionsDirectoryPath = path.join(siteDirectoryPath, `src/api`)

  const functionsDirectory = path.resolve(
    siteDirectoryPath,
    functionsDirectoryPath as string
  )

  reporter.verbose(`Attaching functions to development server`)

  await fs.ensureDir(path.join(siteDirectoryPath, `.cache`, `functions`))

  await fs.emptyDir(path.join(siteDirectoryPath, `.cache`, `functions`))

  try {
    // We do this ungainly thing as we need to make accessible
    // the resolve/reject functions to our shared callback function
    // eslint-disable-next-line
    await new Promise(async (resolve, reject) => {
      const config = await createWebpackConfig({
        siteDirectoryPath,
        functionsDirectory,
        store,
        reporter,
      })

      function callback(err, stats): any {
        const rawMessages = stats.toJson({ moduleTrace: false })
        if (rawMessages.warnings.length > 0) {
          reporter.warn(reportWebpackWarnings(rawMessages.warnings))
        }

        if (err) return reject(err)
        const errors = stats.compilation.errors || []

        // If there's errors, reject in production and print to the console
        // in development.
        if (isProductionEnv) {
          if (errors.length > 0) return reject(stats.compilation.errors)
        } else {
          const formated = formatWebpackMessages({
            errors: rawMessages.errors.map(e => e.message),
            warnings: [],
          })
          reporter.error(formated.errors)
        }

        // Log success in dev
        if (!isProductionEnv) {
          reporter.success(`Re-building functions`)
        }

        return resolve()
      }

      if (isProductionEnv) {
        webpack(config).run(callback)
      } else {
        // When in watch mode, you call things differently
        let compiler = webpack(config).watch({}, callback)

        // Watch for env files to change and restart the webpack watcher.
        chokidar
          .watch(
            [`${siteDirectoryPath}/.env*`, `${siteDirectoryPath}/src/api/**/*`],
            { ignoreInitial: true }
          )
          .on(`all`, (event, path) => {
            // Ignore change events from the API directory
            if (event === `change` && path.includes(`/src/api/`)) {
              return
            }

            reporter.log(
              `Restarting function watcher due to change to "${path}"`
            )

            // Otherwise, restart the watcher
            compiler.close(async err => {
              const config = await createWebpackConfig({
                siteDirectoryPath,
                functionsDirectory,
                store,
                reporter,
              })
              compiler = webpack(config).watch({}, callback)
            })
          })
      }
    })
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
  } = store.getState()

  reporter.verbose(`Attaching functions to development server`)

  app.use(
    `/api/*`,
    multer().none(),
    express.urlencoded({ extended: true }),
    express.text(),
    express.json(),
    express.raw(),
    async (req, res, next) => {
      console.log(req.params)
      const { "0": pathFragment } = req.params

      const { functions } = store.getState()

      console.log({ functions })

      let functionKey

      if (functions.has(pathFragment)) {
        functionKey = pathFragment
      } else {
        // Check if there's any matchPaths that match
        // Only loop until we find a match
        Array.from(functions).some(([funcName, { matchPath }]) => {
          let exp
          const keys = []
          if (matchPath) {
            exp = pathToRegexp(matchPath, keys)
          }
          console.log({
            matchPath,
            exp,
            keys,
            pathFragment,
            result: exp && exp.exec(pathFragment),
          })
          if (exp && exp.exec(pathFragment) !== null) {
            functionKey = funcName
            const matches = [...pathFragment.match(exp)].slice(1)
            console.log({ matches, keys })
            const newParams = {}
            matches.forEach(
              (match, index) => (newParams[keys[index].name] = match)
            )
            req.params = newParams

            return true
          } else {
            return false
          }
        })
      }

      if (functionKey) {
        reporter.verbose(`Running ${functionKey}`)
        const start = Date.now()
        const compiledFunctionsDir = path.join(
          siteDirectoryPath,
          `.cache`,
          `functions`
        )

        // Ignore the original extension as all compiled functions now end with js.
        const parsed = path.parse(functions.get(functionKey).file)
        const funcNameToJs = path.join(parsed.dir, parsed.name + `.js`)

        try {
          const pathToFunction = path.join(compiledFunctionsDir, funcNameToJs)
          delete require.cache[require.resolve(pathToFunction)]
          const fn = require(pathToFunction)

          const fnToExecute = (fn && fn.default) || fn

          await Promise.resolve(fnToExecute(req, res))
        } catch (e) {
          reporter.error(e)
          res.sendStatus(500)
        }

        const end = Date.now()
        reporter.log(
          `Executed function "/api/${functionKey}" in ${end - start}ms`
        )
      } else {
        next()
      }
    }
  )
}
