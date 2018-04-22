const Queue = require(`better-queue`)

const queryRunner = require(`./query-runner`)
const { store, emitter } = require(`../../redux`)
const websocketManager = require(`../../utils/websocket-manager`)

const processing = new Set()
const waiting = new Map()

const queue = new Queue(
  (plObj, callback) => {
    const state = store.getState()
    processing.add(plObj.id)

    return queryRunner(plObj, state.components[plObj.component])
      .catch(e => console.log(`Error running queryRunner`, e))
      .then(
        result => {
          processing.delete(plObj.id)
          if (waiting.has(plObj.id)) {
            queue.push(waiting.get(plObj.id))
            waiting.delete(plObj.id)
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
      if (job.path && activePaths.includes(job.path)) {
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
  }
)

queue.on(`drain`, () => {
  emitter.emit(`QUERY_QUEUE_DRAINED`)
})

module.exports = queue
