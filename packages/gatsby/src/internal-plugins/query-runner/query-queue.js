const Queue = require(`better-queue`)

const queryRunner = require(`./query-runner`)
const { store } = require(`../../redux`)
const { boundActionCreators } = require(`../../redux/actions`)
const websocketManager = require(`../../utils/websocket-manager`)
const FastMemoryStore = require(`./better-queue-custom-store`)

const makeBaseOptions = () => {
  return {
    concurrent: 4,
    store: FastMemoryStore(),
  }
}

const pageQueryRun = (queryJob, result) => {
  // Send event that the page query finished.
  boundActionCreators.pageQueryRun({
    path: queryJob.id,
    componentPath: queryJob.componentPath,
    isPage: queryJob.isPage,
  })
}

const makeDaemonOptions = ({ processing, waiting }) => {
  return {
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
  }
}

/**
 * Creates a queue that is optimized for running as a daemon during
 * gatsby develop. It pushes query result changes to the
 * websock-manager so they can be used by the running develop app. It
 * also ensures that concurrent user changes are not lost.
 */
const createDaemon = () => {
  const processing = new Set()
  const waiting = new Map()
  const queueOptions = {
    ...makeBaseOptions(),
    ...makeDaemonOptions({ processing, waiting }),
  }
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
          pageQueryRun(queryJob, result)

          return callback(null, result)
        },
        error => callback(error)
      )
  }, queueOptions)
  return queue
}

const createBuild = () => {
  const queueOptions = makeBaseOptions()
  const queue = new Queue((queryJob, callback) => {
    const component = store.getState().components[queryJob.component]
    return queryRunner({ queryJob, component })
      .catch(e => console.log(`Error running queryRunner`, e))
      .then(
        result => {
          // Send event that the page query finished.
          pageQueryRun(queryJob, result)
          return callback(null, result)
        },
        error => callback(error)
      )
  }, queueOptions)
  return queue
}

module.exports = {
  createDaemon,
  createBuild,
}
