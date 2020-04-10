import Bluebird from "bluebird"
import webpack from "webpack"
import fs from "fs-extra"
// import convertHrtime from "convert-hrtime"
import { chunk } from "lodash"
import webpackConfig from "../utils/webpack.config"
import reporter from "gatsby-cli/lib/reporter"
import { createErrorFromString } from "gatsby-cli/lib/reporter/errors"
import telemetry from "gatsby-telemetry"
import { BuildHTMLStage, IProgram } from "./types"

type IActivity = any // TODO
type IWorkerPool = any // TODO

import { structureWebpackErrors } from "../utils/webpack-error-utils"

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
  program: IProgram,
  webpackConfig: webpack.Configuration
): Promise<string> => {
  const { directory } = program
  const stats = await runWebpack(webpackConfig)
  // render-page.js is hard coded in webpack.config
  const outputFile = `${directory}/public/render-page.js`
  if (stats.hasErrors()) {
    reporter.panic(
      structureWebpackErrors(`build-html`, stats.compilation.errors)
    )
  }
  return outputFile
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
  return await doBuildRenderer(program, config)
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
  // let finished = 0

  await Bluebird.map(segments, async pageSegment => {
    await workerPool.renderHTML({
      htmlComponentRendererPath,
      paths: pageSegment,
      envVars,
    })
    // finished += pageSegment.length
    if (activity && activity.tick) {
      activity.tick(pageSegment.length)
      // activity.setStatus(
      //   `${finished}/${pages.length} ${(
      //     finished / convertHrtime(process.hrtime(start)).seconds
      //   ).toFixed(2)} pages/second`
      // )
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
  } catch (e) {
    const prettyError = await createErrorFromString(
      e.stack,
      `${rendererPath}.map`
    )
    prettyError.context = e.context
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
