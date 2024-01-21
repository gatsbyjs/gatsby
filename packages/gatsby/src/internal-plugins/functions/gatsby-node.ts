import fs from "fs-extra"
import glob from "glob"
import path from "path"
import webpack from "webpack"
import _ from "lodash"
import { getMatchPath, urlResolve } from "gatsby-core-utils"
import { CreateDevServerArgs, ParentSpanPluginArgs } from "gatsby"
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages"
import dotenv from "dotenv"
import chokidar from "chokidar"
import { reportWebpackWarnings } from "../../utils/webpack-error-utils"
import { internalActions } from "../../redux/actions"
import { IGatsbyFunction } from "../../redux/types"
import { functionMiddlewares } from "./middleware"
import mod from "module"

const isProductionEnv = process.env.gatsby_executing_command !== `develop`

interface IGlobPattern {
  /** The plugin that owns this namespace **/
  pluginName: string
  /** The root path to the functions **/
  rootPath: string
  /** The glob pattern **/
  globPattern: string
  /** The glob ignore pattern */
  ignorePattern: Array<string>
}

// During development, we lazily compile functions only when they're requested.
// Here we keep track of which functions have been requested so are "active"
const activeDevelopmentFunctions = new Set<IGatsbyFunction>()
let activeEntries = {}

async function ensureFunctionIsCompiled(
  functionObj: IGatsbyFunction,
  compiledFunctionsDir: string
): Promise<any> {
  // stat the compiled function. If it's there, then return.
  let compiledFileExists = false
  try {
    compiledFileExists = !!(await fs.stat(functionObj.absoluteCompiledFilePath))
  } catch (e) {
    // ignore
  }
  if (compiledFileExists) {
    return
  } else {
    // Otherwise, restart webpack by touching the file and watch for the file to be
    // compiled.
    const time = new Date()
    fs.utimesSync(functionObj.originalAbsoluteFilePath, time, time)
    await new Promise(resolve => {
      const watcher = chokidar
        // Watch the root of the compiled function directory in .cache as chokidar
        // can't watch files in directories that don't yet exist.
        .watch(compiledFunctionsDir)
        .on(`add`, async _path => {
          if (_path === functionObj.absoluteCompiledFilePath) {
            await watcher.close()

            resolve(null)
          }
        })
    })
  }
}

// Create glob type w/ glob, plugin name, root path
const createGlobArray = (siteDirectoryPath, plugins): Array<IGlobPattern> => {
  const globs: Array<IGlobPattern> = []

  function globIgnorePatterns(
    root: string,
    pluginName?: string
  ): Array<string> {
    const nestedFolder = pluginName ? `/${pluginName}/**/` : `/**/`

    return [
      `${root}/src/api${nestedFolder}__tests__/**/*.+(js|ts)`, // Jest tests
      `${root}/src/api${nestedFolder}+(*.)+(spec|test).+(js|ts)`,
      `${root}/src/api${nestedFolder}+(*.)+(d).ts`, // .d.ts files
    ]
  }

  // Add the default site src/api directory.
  globs.push({
    globPattern: `${siteDirectoryPath}/src/api/**/*.{js,ts}`,
    ignorePattern: globIgnorePatterns(siteDirectoryPath),
    rootPath: path.join(siteDirectoryPath, `src/api`),
    pluginName: `default-site-plugin`,
  })

  // Add each plugin
  plugins.forEach(plugin => {
    // Ignore the "default" site plugin (aka the src tree) as we're
    // already watching that.
    if (plugin.name === `default-site-plugin`) {
      return
    }
    // Ignore any plugins we include by default. In the very unlikely case
    // we want to ship default functions, we'll special case add them. In the
    // meantime, we'll avoid extra FS IO.
    if (plugin.resolve.includes(`internal-plugin`)) {
      return
    }
    if (plugin.resolve.includes(`gatsby-plugin-typescript`)) {
      return
    }
    if (plugin.resolve.includes(`gatsby-plugin-page-creator`)) {
      return
    }

    const glob = {
      globPattern: `${plugin.resolve}/src/api/${plugin.name}/**/*.{js,ts}`,
      ignorePattern: globIgnorePatterns(plugin.resolve, plugin.name),
      rootPath: path.join(plugin.resolve, `src/api`),
      pluginName: plugin.name,
    } as IGlobPattern
    globs.push(glob)
  })

  // Only return unique paths
  return _.union(globs)
}

async function globAsync(
  pattern: string,
  options: glob.IOptions = {}
): Promise<Array<string>> {
  return await new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

const createWebpackConfig = async ({
  siteDirectoryPath,
  store,
  reporter,
}): Promise<webpack.Configuration> => {
  const compiledFunctionsDir = path.join(
    siteDirectoryPath,
    `.cache`,
    `functions`
  )

  const globs = createGlobArray(
    siteDirectoryPath,
    store.getState().flattenedPlugins
  )

  const seenFunctionIds = new Set<string>()
  // Glob and return object with relative/absolute paths + which plugin
  // they belong to.
  const allFunctions = await Promise.all(
    globs.map(async (glob): Promise<Array<IGatsbyFunction>> => {
      const knownFunctions: Array<IGatsbyFunction> = []
      const files = await globAsync(glob.globPattern, {
        ignore: glob.ignorePattern,
      })
      files.map(file => {
        const originalAbsoluteFilePath = file
        const originalRelativeFilePath = path.relative(glob.rootPath, file)

        const { dir, name } = path.parse(originalRelativeFilePath)
        // Ignore the original extension as all compiled functions now end with js.
        const compiledFunctionName = path.join(dir, name + `.js`)
        const compiledPath = path.join(
          compiledFunctionsDir,
          compiledFunctionName
        )
        const finalName = urlResolve(dir, name === `index` ? `` : name)

        // functionId should have only alphanumeric characters and dashes
        const functionIdBase = _.kebabCase(compiledFunctionName).replace(
          /[^a-zA-Z0-9-]/g,
          `-`
        )

        let functionId = functionIdBase

        if (seenFunctionIds.has(functionId)) {
          let counter = 2
          do {
            functionId = `${functionIdBase}-${counter}`
            counter++
          } while (seenFunctionIds.has(functionId))
        }

        knownFunctions.push({
          functionRoute: finalName,
          pluginName: glob.pluginName,
          originalAbsoluteFilePath,
          originalRelativeFilePath,
          relativeCompiledFilePath: compiledFunctionName,
          absoluteCompiledFilePath: compiledPath,
          matchPath: getMatchPath(finalName),
          functionId,
        })
      })

      return knownFunctions
    })
  )

  // Combine functions by the route name so that functions in the default
  // functions directory can override the plugin's implementations.
  // @ts-ignore - Seems like a TS bug: https://github.com/microsoft/TypeScript/issues/28010#issuecomment-713484584
  const knownFunctions = _.unionBy(...allFunctions, func => func.functionRoute)

  store.dispatch(internalActions.setFunctions(knownFunctions))

  // Write out manifest for use by `gatsby serve` and plugins
  fs.writeFileSync(
    path.join(compiledFunctionsDir, `manifest.json`),
    JSON.stringify(knownFunctions, null, 4)
  )

  const {
    config: { pathPrefix },
    program,
  } = store.getState()

  // Load environment variables from process.env.* and .env.* files.
  // Logic is shared with webpack.config.js

  // node env should be DEVELOPMENT | PRODUCTION as these are commonly used in node land
  const nodeEnv = process.env.NODE_ENV || `development`
  // config env is dependent on the env that it's run, this can be anything from staging-production
  // this allows you to set use different .env environments or conditions in gatsby files
  const configEnv = process.env.GATSBY_ACTIVE_ENV || nodeEnv
  const envFile = path.join(siteDirectoryPath, `./.env.${configEnv}`)
  let parsed = {}
  try {
    parsed = dotenv.parse(fs.readFileSync(envFile, { encoding: `utf8` }))
  } catch (err) {
    if (err.code !== `ENOENT`) {
      reporter.error(
        `There was a problem processing the .env file (${envFile})`,
        err
      )
    }
  }

  const envObject = Object.keys(parsed).reduce((acc, key) => {
    acc[key] = JSON.stringify(parsed[key])
    return acc
  }, {} as Record<string, string>)

  const varsFromProcessEnv = Object.keys(process.env).reduce((acc, key) => {
    acc[key] = JSON.stringify(process.env[key])
    return acc
  }, {} as Record<string, string>)

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

  const entries = {}

  const precompileDevFunctions =
    isProductionEnv ||
    process.env.GATSBY_PRECOMPILE_DEVELOP_FUNCTIONS === `true` ||
    process.env.GATSBY_PRECOMPILE_DEVELOP_FUNCTIONS === `1`

  const functionsList = precompileDevFunctions
    ? knownFunctions
    : activeDevelopmentFunctions

  functionsList.forEach(functionObj => {
    // Get path without the extension (as it could be ts or js)
    const parsedFile = path.parse(functionObj.originalRelativeFilePath)
    const compiledNameWithoutExtension = path.join(
      parsedFile.dir,
      parsedFile.name
    )

    let entryToTheFunction = functionObj.originalAbsoluteFilePath
    // we wrap user defined function with our preamble that handles matchPath as well as body parsing
    // see api-function-webpack-loader.ts for more info
    entryToTheFunction += `?matchPath=` + (functionObj.matchPath ?? ``)
    entries[compiledNameWithoutExtension] = entryToTheFunction
  })

  activeEntries = entries

  const stage = isProductionEnv
    ? `functions-production`
    : `functions-development`

  const gatsbyPluginTSRequire = mod.createRequire(
    require.resolve(`gatsby-plugin-typescript`)
  )

  return {
    entry: entries,
    output: {
      path: compiledFunctionsDir,
      filename: `[name].js`,
      libraryTarget: `commonjs2`,
    },
    target: `node`,

    // Minification is expensive and not as helpful for serverless functions.
    optimization: {
      minimize: false,
    },

    // Resolve files ending with .ts and the default extensions of .js, .json, .wasm
    resolve: {
      extensions: [`.ts`, `...`],
    },

    // Have webpack save its cache to the .cache/webpack directory
    cache: {
      type: `filesystem`,
      name: stage,
      cacheLocation: path.join(
        siteDirectoryPath,
        `.cache`,
        `webpack`,
        `stage-` + stage
      ),
    },

    mode: isProductionEnv ? `production` : `development`,
    // watch: !isProductionEnv,
    module: {
      rules: [
        // Webpack expects extensions when importing ESM modules as that's what the spec describes.
        // Not all libraries have adapted so we don't enforce its behaviour
        // @see https://github.com/webpack/webpack/issues/11467
        {
          test: /\.[tj]sx?$/,
          resourceQuery: /matchPath/,
          use: {
            loader: require.resolve(`./api-function-webpack-loader`),
          },
        },
        {
          test: /\.mjs$/i,
          resolve: {
            byDependency: {
              esm: {
                fullySpecified: false,
              },
            },
          },
        },
        {
          test: /\.js$/i,
          descriptionData: {
            type: `module`,
          },
          resolve: {
            byDependency: {
              esm: {
                fullySpecified: false,
              },
            },
          },
          use: {
            loader: require.resolve(`babel-loader`),
            options: {
              presets: [
                gatsbyPluginTSRequire.resolve(`@babel/preset-typescript`),
              ],
            },
          },
        },
        {
          test: [/.js$/, /.ts$/],
          exclude: /node_modules/,
          use: {
            loader: require.resolve(`babel-loader`),
            options: {
              presets: [
                gatsbyPluginTSRequire.resolve(`@babel/preset-typescript`),
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        PREFIX_TO_STRIP: JSON.stringify(
          program.prefixPaths ? pathPrefix?.replace(/(^\/+|\/+$)/g, ``) : ``
        ),
        ...processEnvVars,
      }),
      new webpack.IgnorePlugin({
        checkResource(resource): boolean {
          if (resource === `lmdb`) {
            reporter.warn(
              `LMDB and other modules with native dependencies are not supported in Gatsby Functions.\nIf you are importing utils from \`gatsby-core-utils\`, make sure to import from a specific module (for example \`gatsby-core-utils/create-content-digest\`).`
            )
            return true
          }
          return false
        },
      }),
    ],
  }
}

let isFirstBuild = true
export async function onPreBootstrap({
  reporter,
  store,
  parentSpan,
}: ParentSpanPluginArgs): Promise<void> {
  const activity = reporter.activityTimer(`Compiling Gatsby Functions`, {
    parentSpan,
  })
  activity.start()

  const {
    program: { directory: siteDirectoryPath },
  } = store.getState()

  const compiledFunctionsDir = path.join(
    siteDirectoryPath,
    `.cache`,
    `functions`
  )

  await fs.ensureDir(compiledFunctionsDir)
  await fs.emptyDir(compiledFunctionsDir)

  try {
    // We do this ungainly thing as we need to make accessible
    // the resolve/reject functions to our shared callback function
    // eslint-disable-next-line
    await new Promise<any>(async (resolve, reject) => {
      const config = await createWebpackConfig({
        siteDirectoryPath,
        store,
        reporter,
      })

      function callback(err, stats?: webpack.Stats): void {
        const rawMessages = stats?.toJson({
          all: false,
          warnings: true,
          errors: true,
        })
        if (rawMessages?.warnings && rawMessages.warnings.length > 0) {
          reportWebpackWarnings(rawMessages.warnings, reporter)
        }

        if (err) return reject(err)
        const errors = stats?.compilation.errors || []

        // If there's errors, reject in production and print to the console
        // in development.
        if (isProductionEnv) {
          if (errors.length > 0) return reject(errors)
        } else {
          const formatted = formatWebpackMessages({
            errors: rawMessages?.errors
              ? rawMessages.errors.map(e => e.message)
              : [],
            warnings: [],
          })
          reporter.error(formatted.errors)
        }

        // Log success in dev
        if (!isProductionEnv) {
          if (isFirstBuild) {
            isFirstBuild = false
          } else {
            reporter.success(`Re-building functions`)
          }
        }

        return resolve(null)
      }

      if (isProductionEnv) {
        webpack(config).run(callback)
      } else {
        // When in watch mode, you call things differently
        let compiler = webpack(config).watch({}, callback)

        const globs = createGlobArray(
          siteDirectoryPath,
          store.getState().flattenedPlugins
        )

        // Watch for env files to change and restart the webpack watcher.
        chokidar
          .watch(
            [
              `${siteDirectoryPath}/.env*`,
              ...globs.map(glob => glob.globPattern),
            ],
            { ignoreInitial: true }
          )
          .on(`all`, async (event, path) => {
            // Ignore change events from the API directory for functions we're
            // already watching.
            if (
              event === `change` &&
              Object.values(activeEntries).includes(path) &&
              path.includes(`/src/api/`)
            ) {
              return
            }

            reporter.log(
              `Restarting function watcher due to change to "${path}"`
            )

            // Otherwise, restart the watcher
            compiler.close(async () => {
              const config = await createWebpackConfig({
                siteDirectoryPath,
                store,
                reporter,
              })
              compiler = webpack(config).watch({}, callback)
            })
          })
      }
    })
  } catch (error) {
    activity.panic({
      id: `11332`,
      error,
      context: {},
    })
  }

  activity.end()
}

export async function onCreateDevServer({
  reporter,
  app,
  store,
}: CreateDevServerArgs): Promise<void> {
  reporter.verbose(`Attaching functions to development server`)

  const {
    program: { directory: siteDirectoryPath },
  } = store.getState()

  const compiledFunctionsDir = path.join(
    siteDirectoryPath,
    `.cache`,
    `functions`
  )

  app.use(
    `/api/*`,
    ...functionMiddlewares({
      getFunctions(): Array<IGatsbyFunction> {
        const { functions }: { functions: Array<IGatsbyFunction> } =
          store.getState()
        return functions
      },
      async prepareFn(functionObj: IGatsbyFunction): Promise<void> {
        activeDevelopmentFunctions.add(functionObj)
        await ensureFunctionIsCompiled(functionObj, compiledFunctionsDir)
      },
      showDebugMessageInResponse: true,
    })
  )
}
