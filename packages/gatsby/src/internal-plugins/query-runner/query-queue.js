const Queue = require(`better-queue`)

const queryRunner = require(`./query-runner`)
const { store, emitter } = require(`../../redux`)
const websocketManager = require(`../../utils/websocket-manager`)

const processing = new Set()
const waiting = new Map()

const queue = new Queue(
  (plObj, callback) => {
    const state = store.getState()
    processing.add(plObj.path)

    return queryRunner(plObj, state.components[plObj.component]).then(
      result => {
        processing.delete(plObj.path)
        if (waiting.has(plObj.path)) {
          queue.push(waiting.get(plObj.path))
          waiting.delete(plObj.path)
        }
        return callback(null, result)
      },
      error => callback(error)
    )
  },
  {
    concurrent: 4,
    // Merge duplicate jobs.
    merge: (oldTask, newTask, cb) => {
      cb(null, newTask)
    },
    priority: (job, cb) => {
      const activePaths = Array.from(websocketManager.activePaths.values())
      if (activePaths.includes(job.path)) {
        cb(null, 10)
      } else {
        cb(null, 1)
      }
    },
    // Filter out new query jobs if that query is already running.  When the
    // query finshes, it checks the waiting map and pushes another job to
    // make sure all the user changes are captured.
    filter: (job, cb) => {
      if (processing.has(job.path)) {
        waiting.set(job.path, job)
        cb(`already running`)
      } else {
        cb(null, job)
      }
    },
  }
)

queue.on(`drain`, () => {
  emitter.emit(`QUERY_QUEUE_DRAINED`)
})

module.exports = queue
