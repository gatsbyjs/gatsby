const Queue = require(`better-queue`)
const convertHrtime = require(`convert-hrtime`)
const Worker = require(`jest-worker`).default
const physicalCpuCount = require(`physical-cpu-count`)

const myWorker = new Worker(require.resolve(`./worker`), {
  numWorkers: physicalCpuCount,
})

module.exports = (htmlComponentRendererPath, pages, activity) =>
  new Promise((resolve, reject) => {
    const start = process.hrtime()
    const queue = new Queue(
      (path, callback) => {
        myWorker
          .renderHTML({ htmlComponentRendererPath, path })
          .then(callback)
          .catch(reject)
      },
      {
        concurrent: 20,
      }
    )

    pages.forEach(page => {
      queue.push(page)
    })

    queue.on(`task_finish`, () => {
      const stats = queue.getStats()
      if (activity) {
        activity.setStatus(
          `${stats.total}/${pages.length} ${(
            stats.total / convertHrtime(process.hrtime(start)).seconds
          ).toFixed(2)} pages/second`
        )
      }
    })

    queue.on(`drain`, () => {
      resolve()
    })
  })
