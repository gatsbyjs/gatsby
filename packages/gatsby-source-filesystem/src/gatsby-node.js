const chokidar = require(`chokidar`)
const fs = require(`fs`)
const path = require(`path`)
const { Machine, interpret } = require(`xstate`)

const { createFileNode } = require(`./create-file-node`)

/**
 * Create a state machine to manage Chokidar's not-ready/ready states.
 */
const createFSMachine = (
  { actions: { createNode, deleteNode }, getNode, createNodeId, reporter },
  pluginOptions
) => {
  const createAndProcessNode = path => {
    const fileNodePromise = createFileNode(
      path,
      createNodeId,
      pluginOptions
    ).then(fileNode => {
      createNode(fileNode)
      return null
    })
    return fileNodePromise
  }

  const deletePathNode = path => {
    const node = getNode(createNodeId(path))
    // It's possible the node was never created as sometimes tools will
    // write and then immediately delete temporary files to the file system.
    if (node) {
      deleteNode({ node })
    }
  }

  // For every path that is reported before the 'ready' event, we throw them
  // into a queue and then flush the queue when 'ready' event arrives.
  // After 'ready', we handle the 'add' event without putting it into a queue.
  let pathQueue = []
  const flushPathQueue = () => {
    let queue = pathQueue.slice()
    pathQueue = null
    return Promise.all(
      // eslint-disable-next-line consistent-return
      queue.map(({ op, path }) => {
        switch (op) {
          case `delete`:
            return deletePathNode(path)
          case `upsert`:
            return createAndProcessNode(path)
        }
      })
    )
  }

  const fsMachine = Machine(
    {
      id: `fs`,
      type: `parallel`,
      states: {
        BOOTSTRAP: {
          initial: `BOOTSTRAPPING`,
          states: {
            BOOTSTRAPPING: {
              on: {
                BOOTSTRAP_FINISHED: `BOOTSTRAPPED`,
              },
            },
            BOOTSTRAPPED: {
              type: `final`,
            },
          },
        },
        CHOKIDAR: {
          initial: `NOT_READY`,
          states: {
            NOT_READY: {
              on: {
                CHOKIDAR_READY: `READY`,
                CHOKIDAR_ADD: { actions: `queueNodeProcessing` },
                CHOKIDAR_CHANGE: { actions: `queueNodeProcessing` },
                CHOKIDAR_UNLINK: { actions: `queueNodeDeleting` },
              },
              exit: `flushPathQueue`,
            },
            READY: {
              on: {
                CHOKIDAR_ADD: { actions: `createAndProcessNode` },
                CHOKIDAR_CHANGE: { actions: `createAndProcessNode` },
                CHOKIDAR_UNLINK: { actions: `deletePathNode` },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        createAndProcessNode(_, { pathType, path }, { state }) {
          if (state.matches(`BOOTSTRAP.BOOTSTRAPPED`)) {
            reporter.info(`added ${pathType} at ${path}`)
          }
          createAndProcessNode(path).catch(err => reporter.error(err))
        },
        deletePathNode(_, { pathType, path }, { state }) {
          if (state.matches(`BOOTSTRAP.BOOTSTRAPPED`)) {
            reporter.info(`${pathType} deleted at ${path}`)
          }
          deletePathNode(path)
        },
        flushPathQueue(_, { resolve, reject }) {
          flushPathQueue().then(resolve, reject)
        },
        queueNodeDeleting(_, { path }) {
          pathQueue.push({ op: `delete`, path })
        },
        queueNodeProcessing(_, { path }) {
          pathQueue.push({ op: `upsert`, path })
        },
      },
    }
  )
  return interpret(fsMachine).start()
}

exports.sourceNodes = (api, pluginOptions) => {
  const typeDefs = `
    type File implements Node @infer {
      birthtime: Date @deprecated(reason: "Use \`birthTime\` instead")
      birthtimeMs: Float @deprecated(reason: "Use \`birthTime\` instead")
    }
  `
  api.actions.createTypes(typeDefs)

  // Validate that the path exists.
  if (!fs.existsSync(pluginOptions.path)) {
    api.reporter.panic(`
The path passed to gatsby-source-filesystem does not exist on your file system:

${pluginOptions.path}

Please pick a path to an existing directory.

See docs here - https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
      `)
  }

  // Validate that the path is absolute.
  // Absolute paths are required to resolve images correctly.
  if (!path.isAbsolute(pluginOptions.path)) {
    pluginOptions.path = path.resolve(process.cwd(), pluginOptions.path)
  }

  const fsMachine = createFSMachine(api, pluginOptions)

  // Once bootstrap is finished, we only let one File node update go through
  // the system at a time.
  api.emitter.on(`BOOTSTRAP_FINISHED`, () => {
    fsMachine.send(`BOOTSTRAP_FINISHED`)
  })

  const watcher = chokidar.watch(pluginOptions.path, {
    ignored: [
      `**/*.un~`,
      `**/.DS_Store`,
      `**/.gitignore`,
      `**/.npmignore`,
      `**/.babelrc`,
      `**/yarn.lock`,
      `**/bower_components`,
      `**/node_modules`,
      `../**/dist/**`,
      ...(pluginOptions.ignore || []),
    ],
  })

  watcher.on(`add`, path => {
    fsMachine.send({ type: `CHOKIDAR_ADD`, pathType: `file`, path })
  })

  watcher.on(`change`, path => {
    fsMachine.send({ type: `CHOKIDAR_CHANGE`, pathType: `file`, path })
  })

  watcher.on(`unlink`, path => {
    fsMachine.send({ type: `CHOKIDAR_UNLINK`, pathType: `file`, path })
  })

  watcher.on(`addDir`, path => {
    fsMachine.send({ type: `CHOKIDAR_ADD`, pathType: `directory`, path })
  })

  watcher.on(`unlinkDir`, path => {
    fsMachine.send({ type: `CHOKIDAR_UNLINK`, pathType: `directory`, path })
  })

  return new Promise((resolve, reject) => {
    watcher.on(`ready`, () => {
      fsMachine.send({ type: `CHOKIDAR_READY`, resolve, reject })
    })
  })
}

exports.setFieldsOnGraphQLNodeType = require(`./extend-file-node`)
