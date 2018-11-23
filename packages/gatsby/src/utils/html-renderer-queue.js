const Promise = require(`bluebird`)
const convertHrtime = require(`convert-hrtime`)
const Worker = require(`jest-worker`).default
const numWorkers = require(`physical-cpu-count`) || 1
const { chunk } = require(`lodash`)
const { store } = require(`../redux`)
const fs = require(`fs-extra`)
const path = require(`path`)

const workerPool = new Worker(require.resolve(`./worker`), {
  numWorkers,
  forkOptions: {
    silent: false,
  },
})

// copied from https://github.com/markdalgleish/static-site-generator-webpack-plugin/blob/master/index.js#L161
const generatePathToOutput = outputPath => {
  let outputFileName = outputPath.replace(/^(\/|\\)/, ``) // Remove leading slashes for webpack-dev-server

  if (!/\.(html?)$/i.test(outputFileName)) {
    outputFileName = path.join(outputFileName, `index.html`)
  }

  return path.join(process.cwd(), `public`, outputFileName)
}

module.exports = (htmlComponentRendererPath, pages, activity) =>
  new Promise((resolve, reject) => {
    // We need to only pass env vars that are set programatically in gatsby-cli
    // to child process. Other vars will be picked up from environment.
    const envVars = Object.entries({
      NODE_ENV: process.env.NODE_ENV,
      gatsby_executing_command: process.env.gatsby_executing_command,
      gatsby_log_level: process.env.gatsby_log_level,
    })

    const start = process.hrtime()
    const segments = chunk(pages, 50)
    let finished = 0

    Promise.map(
      segments,
      pageSegment =>
        new Promise((resolve, reject) => {
          workerPool
            .renderHTML({
              htmlComponentRendererPath,
              paths: pageSegment,
              envVars,
            })
            .then(async results => {
              await Promise.all(
                results.map(async ({ path: outputPath, html, renderData }) => {
                  await fs.outputFile(generatePathToOutput(outputPath), html)

                  const { program, pages, jsonDataPaths } = store.getState()
                  const page = pages.get(outputPath)
                  const jsonDataPath = jsonDataPaths[page.jsonName]

                  const resultPath = path.join(
                    program.directory,
                    `public`,
                    `static`,
                    `d`,
                    `${jsonDataPath}.json`
                  )
                  const jsonData = await fs.readJson(resultPath)
                  const newJsonData = {
                    ...jsonData,
                    render: renderData || {},
                  }
                  await fs.writeJson(resultPath, newJsonData)
                })
              )
            })
            .then(() => {
              finished += pageSegment.length
              if (activity) {
                activity.setStatus(
                  `${finished}/${pages.length} ${(
                    finished / convertHrtime(process.hrtime(start)).seconds
                  ).toFixed(2)} pages/second`
                )
              }
              resolve()
            })
            .catch(reject)
        })
    )
      .then(resolve)
      .catch(reject)
  })
