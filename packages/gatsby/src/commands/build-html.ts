import Bluebird from "bluebird"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import { createErrorFromString } from "gatsby-cli/lib/reporter/errors"
import telemetry from "gatsby-telemetry"
import { chunk } from "lodash"
import webpack from "webpack"

import { emitter } from "../redux"
import webpackConfig from "../utils/webpack.config"
import { structureWebpackErrors } from "../utils/webpack-error-utils"

import { IProgram, Stage } from "./types"

type IActivity = any // TODO
type IWorkerPool = any // TODO

export interface IWebpackWatchingPauseResume extends webpack.Watching {
  suspend: () => void
  resume: () => void
}

let devssrWebpackCompiler: webpack.Compiler
let devssrWebpackWatcher: IWebpackWatchingPauseResume
let needToRecompileSSRBundle = true
export const getDevSSRWebpack = (): Record<
  IWebpackWatchingPauseResume,
  webpack.Compiler,
  needToRecompileSSRBundle
> => {
  if (process.env.gatsby_executing_command !== `develop`) {
    throw new Error(`This function can only be called in development`)
  }

  return {
    devssrWebpackWatcher,
    devssrWebpackCompiler,
    needToRecompileSSRBundle,
  }
}

let oldHash = ``
let newHash = ``
const runWebpack = (
  compilerConfig,
  stage: Stage,
  directory
): Bluebird<webpack.Stats> =>
  new Bluebird((resolve, reject) => {
    if (!process.env.GATSBY_EXPERIMENTAL_DEV_SSR || stage === `build-html`) {
      webpack(compilerConfig).run((err, stats) => {
        if (err) {
          return reject(err)
        } else {
          return resolve(stats)
        }
      })
    } else if (
      process.env.GATSBY_EXPERIMENTAL_DEV_SSR &&
      stage === `develop-html`
    ) {
      devssrWebpackCompiler = webpack(compilerConfig)
      devssrWebpackCompiler.hooks.invalid.tap(`ssr file invalidation`, file => {
        needToRecompileSSRBundle = true
      })
      devssrWebpackWatcher = devssrWebpackCompiler.watch(
        {
          ignored: /node_modules/,
        },
        (err, stats) => {
          needToRecompileSSRBundle = false
          emitter.emit(`DEV_SSR_COMPILATION_DONE`)
          devssrWebpackWatcher.suspend()

          if (err) {
            return reject(err)
          } else {
            newHash = stats.hash || ``

            const {
              restartWorker,
            } = require(`../utils/dev-ssr/render-dev-html`)
            // Make sure we use the latest version during development
            if (oldHash !== `` && newHash !== oldHash) {
              restartWorker(`${directory}/public/render-page.js`)
            }

            oldHash = newHash

            return resolve(stats)
          }
        }
      )
    }
  })

const doBuildRenderer = async (
  { directory }: IProgram,
  webpackConfig: webpack.Configuration,
  stage: Stage
): Promise<string> => {
  const stats = await runWebpack(webpackConfig, stage, directory)
  if (stats.hasErrors()) {
    reporter.panic(structureWebpackErrors(stage, stats.compilation.errors))
  }

  // render-page.js is hard coded in webpack.config
  return `${directory}/public/render-page.js`
}

export const buildRenderer = async (
  program: IProgram,
  stage: Stage,
  parentSpan?: IActivity
): Promise<string> => {
  const { directory } = program
  const config = await webpackConfig(program, directory, stage, null, {
    parentSpan,
  })

  return doBuildRenderer(program, config, stage)
}

export const deleteRenderer = async (rendererPath: string): Promise<void> => {
  try {
    await fs.remove(rendererPath)
    await fs.remove(`${rendererPath}.map`)
  } catch (e) {
    // This function will fail on Windows with no further consequences.
  }
}

const renderHTMLQueue = async (
  workerPool: IWorkerPool,
  activity: IActivity,
  htmlComponentRendererPath: string,
  pages: Array<string>
): Promise<void> => {
  // We need to only pass env vars that are set programmatically in gatsby-cli
  // to child process. Other vars will be picked up from environment.
  const envVars = [
    [`NODE_ENV`, process.env.NODE_ENV],
    [`gatsby_executing_command`, process.env.gatsby_executing_command],
    [`gatsby_log_level`, process.env.gatsby_log_level],
  ]

  const segments = chunk(pages, 50)

  await Bluebird.map(segments, async pageSegment => {
    await workerPool.renderHTML({
      envVars,
      htmlComponentRendererPath,
      paths: pageSegment,
    })

    if (activity && activity.tick) {
      activity.tick(pageSegment.length)
    }
  })
}

class BuildHTMLError extends Error {
  codeFrame = ``
  context?: {
    path: string
  }

  constructor(error: Error) {
    super(error.message)

    // We must use getOwnProperty because keys like `stack` are not enumerable,
    // but we want to copy over the entire error
    Object.getOwnPropertyNames(error).forEach(key => {
      this[key] = error[key]
    })
  }
}

export const doBuildPages = async (
  rendererPath: string,
  pagePaths: Array<string>,
  activity: IActivity,
  workerPool: IWorkerPool
): Promise<void> => {
  telemetry.addSiteMeasurement(`BUILD_END`, {
    pagesCount: pagePaths.length,
  })

  try {
    await renderHTMLQueue(workerPool, activity, rendererPath, pagePaths)
  } catch (error) {
    const prettyError = await createErrorFromString(
      error.stack,
      `${rendererPath}.map`
    )
    const buildError = new BuildHTMLError(prettyError)
    buildError.context = error.context
    throw buildError
  }
}

// TODO remove in v4 - this could be a "public" api
export const buildHTML = async ({
  program,
  stage,
  pagePaths,
  activity,
  workerPool,
}: {
  program: IProgram
  stage: Stage
  pagePaths: Array<string>
  activity: IActivity
  workerPool: IWorkerPool
}): Promise<void> => {
  const rendererPath = await buildRenderer(program, stage, activity.span)
  await doBuildPages(rendererPath, pagePaths, activity, workerPool)
  await deleteRenderer(rendererPath)
}
