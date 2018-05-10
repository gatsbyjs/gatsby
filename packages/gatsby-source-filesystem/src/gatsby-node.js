const chokidar = require(`chokidar`)
const fs = require(`fs`)
const { Machine } = require(`xstate`)

const { createFileNode } = require(`./create-file-node`)

/**
 * Create a state machine to manage Chokidar's not-ready/ready states and for
 * emitting file system events into Gatsby.
 *
 * On the latter, this solves the problem where if you call createNode for the
 * same File node in quick succession, this can leave Gatsby's internal state
 * in disarray causing queries to fail. The latter state machine tracks when
 * Gatsby is "processing" a node update or when it's "idle". If updates come in
 * while Gatsby is processing, we queue them until the system returns to an
 * "idle" state.
 */
const fsMachine = Machine({
  key: `emitFSEvents`,
  parallel: true,
  strict: true,
  states: {
    CHOKIDAR: {
      initial: `CHOKIDAR_NOT_READY`,
      states: {
        CHOKIDAR_NOT_READY: {
          on: {
            CHOKIDAR_READY: `CHOKIDAR_WATCHING`,
            BOOTSTRAP_FINISHED: `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`,
          },
        },
        CHOKIDAR_WATCHING: {
          on: {
            BOOTSTRAP_FINISHED: `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`,
            CHOKIDAR_READY: `CHOKIDAR_WATCHING`,
          },
        },
        CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED: {
          on: {
            CHOKIDAR_READY: `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`,
          },
        },
      },
    },
    PROCESSING: {
      initial: `BOOTSTRAPPING`,
      states: {
        BOOTSTRAPPING: {
          on: {
            BOOTSTRAP_FINISHED: `IDLE`,
          },
        },
        IDLE: {
          on: {
            EMIT_FS_EVENT: `PROCESSING`,
          },
        },
        PROCESSING: {
          on: {
            QUERY_QUEUE_DRAINED: `IDLE`,
            TOUCH_NODE: `IDLE`,
          },
        },
      },
    },
  },
})

let currentState = fsMachine.initialState

exports.sourceNodes = (
  { actions, getNode, createNodeId, hasNodeChanged, reporter, emitter },
  pluginOptions
) => {
  const { createNode, deleteNode } = actions

  // Validate that the path exists.
  if (!fs.existsSync(pluginOptions.path)) {
    reporter.panic(`
The path passed to gatsby-source-filesystem does not exist on your file system:

${pluginOptions.path}

Please pick a path to an existing directory.

See docs here - https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
      `)
  }
  let fileNodeQueue = new Map()

  // Once bootstrap is finished, we only let one File node update go through
  // the system at a time.
  emitter.on(`BOOTSTRAP_FINISHED`, () => {
    currentState = fsMachine.transition(
      currentState.value,
      `BOOTSTRAP_FINISHED`
    )
  })
  emitter.on(`TOUCH_NODE`, () => {
    // If we create a node which is the same as the previous version, createNode
    // returns TOUCH_NODE and then nothing else happens so we listen to that
    // to return the state back to IDLE.
    currentState = fsMachine.transition(currentState.value, `TOUCH_NODE`)
  })

  emitter.on(`QUERY_QUEUE_DRAINED`, () => {
    currentState = fsMachine.transition(
      currentState.value,
      `QUERY_QUEUE_DRAINED`
    )
    // If we have any updates queued, run one of them now.
    if (fileNodeQueue.size > 0) {
      const toProcess = fileNodeQueue.get(Array.from(fileNodeQueue.keys())[0])
      fileNodeQueue.delete(toProcess.id)
      currentState = fsMachine.transition(currentState.value, `EMIT_FS_EVENT`)
      createNode(toProcess)
    }
  })

  const watcher = chokidar.watch(pluginOptions.path, {
    ignored: [
      `**/*.un~`,
      `**/.gitignore`,
      `**/.npmignore`,
      `**/.babelrc`,
      `**/yarn.lock`,
      `**/node_modules`,
      `../**/dist/**`,
    ],
  })

  const createAndProcessNode = path => {
    const fileNodePromise = createFileNode(
      path,
      createNodeId,
      pluginOptions
    ).then(fileNode => {
      if (currentState.value.PROCESSING === `PROCESSING`) {
        fileNodeQueue.set(fileNode.id, fileNode)
      } else {
        currentState = fsMachine.transition(currentState.value, `EMIT_FS_EVENT`)
        createNode(fileNode)
      }
    })
    return fileNodePromise
  }

  // For every path that is reported before the 'ready' event, we throw them
  // into a queue and then flush the queue when 'ready' event arrives.
  // After 'ready', we handle the 'add' event without putting it into a queue.
  let pathQueue = []
  const flushPathQueue = () => {
    let queue = pathQueue.slice()
    pathQueue = []
    return Promise.all(queue.map(createAndProcessNode))
  }

  watcher.on(`add`, path => {
    if (currentState.value.CHOKIDAR !== `CHOKIDAR_NOT_READY`) {
      if (
        currentState.value.CHOKIDAR === `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`
      ) {
        reporter.info(`added file at ${path}`)
      }
      createAndProcessNode(path).catch(err => reporter.error(err))
    } else {
      pathQueue.push(path)
    }
  })

  watcher.on(`change`, path => {
    if (
      currentState.value.CHOKIDAR === `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`
    ) {
      reporter.info(`changed file at ${path}`)
    }
    createAndProcessNode(path).catch(err => reporter.error(err))
  })

  watcher.on(`unlink`, path => {
    if (
      currentState.value.CHOKIDAR === `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`
    ) {
      reporter.info(`file deleted at ${path}`)
    }
    const node = getNode(createNodeId(path))
    // It's possible the file node was never created as sometimes tools will
    // write and then immediately delete temporary files to the file system.
    if (node) {
      currentState = fsMachine.transition(currentState.value, `EMIT_FS_EVENT`)
      deleteNode({ node })
    }
  })

  watcher.on(`addDir`, path => {
    if (currentState.value.CHOKIDAR !== `CHOKIDAR_NOT_READY`) {
      if (
        currentState.value.CHOKIDAR === `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`
      ) {
        reporter.info(`added directory at ${path}`)
      }
      createAndProcessNode(path).catch(err => reporter.error(err))
    } else {
      pathQueue.push(path)
    }
  })

  watcher.on(`unlinkDir`, path => {
    if (
      currentState.value.CHOKIDAR === `CHOKIDAR_WATCHING_BOOTSTRAP_FINISHED`
    ) {
      reporter.info(`directory deleted at ${path}`)
    }
    const node = getNode(createNodeId(path))
    deleteNode({ node })
  })

  return new Promise((resolve, reject) => {
    watcher.on(`ready`, () => {
      currentState = fsMachine.transition(currentState.value, `CHOKIDAR_READY`)
      flushPathQueue().then(resolve, reject)
    })
  })
}

exports.setFieldsOnGraphQLNodeType = require(`./extend-file-node`)
