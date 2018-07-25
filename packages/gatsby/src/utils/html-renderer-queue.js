const convertHrtime = require(`convert-hrtime`)
const Worker = require(`jest-worker`).default
const numWorkers = require(`physical-cpu-count`) || 1
const { chunk } = require(`lodash`)

const workerPool = new Worker(require.resolve(`./worker`), {
  numWorkers,
})

module.exports = (htmlComponentRendererPath, pages, activity) =>
  new Promise((resolve, reject) => {
    const start = process.hrtime()
    const segments = chunk(pages, 50)
    let finished = 0

    Promise.map(
      segments,
      pageSegment =>
        new Promise((resolve, reject) => {
          workerPool
            .renderHTML({ htmlComponentRendererPath, paths: pageSegment })
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
