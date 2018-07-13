const Queue = require(`better-queue`)
const fs = require(`fs-extra`)
const path = require(`path`)
const convertHrtime = require(`convert-hrtime`)
const Worker = require(`jest-worker`).default
const numWorkers = require(`physical-cpu-count`)
const { chunk } = require('lodash')

const workerPool = new Worker(require.resolve(`./worker`), {
  numWorkers,
})

module.exports = async (htmlComponentRendererPath, pages, activity) => {

  const start = process.hrtime()

  const segments = chunk(pages, numWorkers)

  const concurrency = 30

  await Promise.all(segments.map(paths => workerPool.renderHTML({ htmlComponentRendererPath, paths, concurrency })))

  activity.setStatus(
    `${pages.length}/${pages.length} ${(
      pages.length / convertHrtime(process.hrtime(start)).seconds
    ).toFixed(2)} pages/second`
  )
}
