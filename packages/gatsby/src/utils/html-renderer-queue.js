const Promise = require(`bluebird`)
const convertHrtime = require(`convert-hrtime`)
const Worker = require(`jest-worker`).default
const { chunk } = require(`lodash`)

const workerPool = () => {
  // Default number of workers === physical CPU count,
  // or default to 1 if we can't detect
  let numOfWorkers = require(`physical-cpu-count`) || 1

  if (process.env.GATSBY_CPU_COUNT) {
    switch (typeof process.env.GATSBY_CPU_COUNT) {
      case `string`:
        // Leave at Default number of workers
        // if process.env.GATSBY_CPU_COUNT === `physical_cores`)

        // Number of workers === logical CPU count or default
        if (process.env.GATSBY_CPU_COUNT === `logical_cores`) {
          numOfWorkers = require(`os`).cpus().length || numOfWorkers
        }
        break

      case `number`:
        // Number of workers === passed in count,
        numOfWorkers = parseInt(process.env.GATSBY_CPU_COUNT, 10)
        break

      default:
        break
    }
  }

  return new Worker(require.resolve(`./worker`), {
    numOfWorkers,
    forkOptions: {
      silent: false,
    },
  })
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
