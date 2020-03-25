import Bluebird from "bluebird"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import { createErrorFromString } from "gatsby-cli/lib/reporter/errors"
import telemetry from "gatsby-telemetry"
import { chunk } from "lodash"
import webpack from "webpack"

import webpackConfig from "../utils/webpack.config"
import { structureWebpackErrors } from "../utils/webpack-error-utils"

import { BuildHTMLStage, IProgram } from "./types"

type IActivity = any // TODO
type IWorkerPool = any // TODO

const runWebpack = (compilerConfig): Bluebird<webpack.Stats> =>
  new Bluebird((resolve, reject) => {
    webpack(compilerConfig).run((err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats)
      }
    })
  })

const doBuildRenderer = async (
  { directory }: IProgram,
  webpackConfig: webpack.Configuration
): Promise<string> => {
  const stats = await runWebpack(webpackConfig)
  if (stats.hasErrors()) {
    reporter.panic(
      structureWebpackErrors(`build-html`, stats.compilation.errors)
    )
  }

  // render-page.js is hard coded in webpack.config
  return `${directory}/public/render-page.js`
}

const buildRenderer = async (
  program: IProgram,
  stage: BuildHTMLStage,
  parentSpan: IActivity
): Promise<string> => {
  const { directory } = program
  const config = await webpackConfig(program, directory, stage, null, {
    parentSpan,
  })

  return doBuildRenderer(program, config)
}

const deleteRenderer = async (rendererPath: string): Promise<void> => {
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
  pages: string[]
): Promise<void> => {
  // We need to only pass env vars that are set programmatically in gatsby-cli
  // to child process. Other vars will be picked up from environment.
  const envVars = [
    [`NODE_ENV`, process.env.NODE_ENV],
    [`gatsby_executing_command`, process.env.gatsby_executing_command],
    [`gatsby_log_level`, process.env.gatsby_log_level],
  ]

  // const start = process.hrtime()
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

const doBuildPages = async (
  rendererPath: string,
  pagePaths: string[],
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
    prettyError.context = error.context
    throw prettyError
  }
}

export const buildHTML = async ({
  program,
  stage,
  pagePaths,
  activity,
  workerPool,
}: {
  program: IProgram
  stage: BuildHTMLStage
  pagePaths: string[]
  activity: IActivity
  workerPool: IWorkerPool
}): Promise<void> => {
  const rendererPath = await buildRenderer(program, stage, activity.span)
  await doBuildPages(rendererPath, pagePaths, activity, workerPool)
  await deleteRenderer(rendererPath)
}
