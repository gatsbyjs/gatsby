const Queue = require(`better-queue`)

const queryRunner = require(`./query-runner`)
const { store, emitter } = require(`../../redux`)
const websocketManager = require(`../../utils/websocket-manager`)
const FastMemoryStore = require(`./better-queue-custom-store`)

const processing = new Set()
const waiting = new Map()

const queueOptions = {
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

// During builds we don't need all the filtering, etc. so we
// remove them to speed up queries
if (process.env.gatsby_executing_command === `build`) {
  delete queueOptions.filter
  delete queueOptions.priority
  delete queueOptions.merge
}

const queue = new Queue((plObj, callback) => {
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
}, queueOptions)

// Pause running queries when new nodes are added (processing starts).
emitter.on(`CREATE_NODE`, () => {
  queue.pause()
})

// Resume running queries as soon as the api queue is empty.
emitter.on(`API_RUNNING_QUEUE_EMPTY`, () => {
  queue.resume()
})

queue.on(`drain`, () => {
  emitter.emit(`QUERY_QUEUE_DRAINED`)
})

queue.on(`task_queued`, () => {
  emitter.emit(`QUERY_ENQUEUED`)
})

module.exports = queue
