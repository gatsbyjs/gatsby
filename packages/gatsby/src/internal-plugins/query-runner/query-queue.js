const Queue = require(`better-queue`)

const queryRunner = require(`./query-runner`)
const { store } = require(`../../redux`)
const { boundActionCreators } = require(`../../redux/actions`)
const websocketManager = require(`../../utils/websocket-manager`)
const FastMemoryStore = require(`./better-queue-custom-store`)

const makeOptions = ({ processing, waiting }) => {
  return {
    concurrent: 4,
    // Merge duplicate jobs.
    merge: (oldTask, newTask, cb) => {
      cb(null, newTask)
    },
    priority: (job, cb) => {
      const activePaths = Array.from(websocketManager.activePaths.values())
      if (job.id && activePaths.includes(job.id)) {
        cb(null, 10)
      } else {
        cb(null, 1)
      }
    },
    // Filter out new query jobs if that query is already running.  When the
    // query finshes, it checks the waiting map and pushes another job to
    // make sure all the user changes are captured.
    filter: (job, cb) => {
      if (processing.has(job.id)) {
        waiting.set(job.id, job)
        cb(`already running`)
      } else {
        cb(null, job)
      }
    },
    store: FastMemoryStore(),
  }
}

const create = () => {
  const processing = new Set()
  const waiting = new Map()
  const queue = new Queue((queryJob, callback) => {
    const component = store.getState().components[queryJob.component]
    return queryRunner({ queryJob, component })
      .catch(e => console.log(`Error running queryRunner`, e))
      .then(
        result => {
          processing.delete(queryJob.id)
          if (waiting.has(queryJob.id)) {
            queue.push(waiting.get(queryJob.id))
            waiting.delete(queryJob.id)
          }

          // Send event that the page query finished.
          boundActionCreators.pageQueryRun({
            path: queryJob.id,
            componentPath: queryJob.componentPath,
            isPage: queryJob.isPage,
          })

          return callback(null, result)
        },
        error => callback(error)
      )
  }, makeOptions({ processing, waiting }))
  return queue
}

module.exports = {
  create,
}
