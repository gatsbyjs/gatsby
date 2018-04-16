const chokidar = require(`chokidar`)
const createFileNode = require(`./create-file-node`)
const fs = require(`fs`)
const { Machine } = require(`xstate`)
const path = require(`path`)

/**
 * Create a state machine to manage Chokidar's not-ready/ready states and for
 * emitting file system events into Gatsby.
 *
 * On the latter, this solves the problem where if you call createNode for the
 * same File node in quick succession, this can leave Gatsby's internal state
 * in disarray causing queries to fail. The latter state machine tracks when
 * Gatsby is "busy" with a node update or when it's "idle". If updates come in
 * while Gatsby is processing, we queue them until the system returns to an
 * "idle" state.
 */

const fsMachine = Machine({
  key: `emitFSEvents`,
  parallel: true,
  states: {
    SRC_FS: {
      initial: `SRC_FS_INIT`,
      states: {
        SRC_FS_BUSY: {
          on: {
            SRC_FS_IDLE: `SRC_FS_IDLE`,
          },
        },
        SRC_FS_IDLE: {
          on: {
            SRC_FS_BUSY: `SRC_FS_BUSY`,
          },
        },
        SRC_FS_INIT: {
          on: {
            SRC_FS_READY: `SRC_FS_READY`,
            SRC_FS_SETUP: `SRC_FS_SETUP`,
          },
        },
        SRC_FS_READY: {
          on: {
            SRC_FS_SETUP: `SRC_FS_IDLE`,
          },
        },
        SRC_FS_SETUP: {
          on: {
            SRC_FS_READY: `SRC_FS_IDLE`,
          },
        },
      },
    },
  },
  strict: true,
})

let state = fsMachine.initialState

exports.sourceNodes = (
  { actions, createNodeId, emitter, getNode, reporter },
  opts = {}
) => {
  const { createNode, deleteNode } = actions

  // Verify the path exists.
  if (!fs.existsSync(opts.path)) {
    reporter.panic(`gatsby-source-filesystem: "${opts.path}" does not exist.
    Specify the path to an existing directory.

    Visit https://www.gatsbyjs.org/packages/gatsby-source-filesystem/ for details.
    `)
  }

  const queue = (() => {
    let instance

    const init = () => {
      instance = instance || new Map()
      return instance
    }

    const addNode = async (msg, src) => {
      await createFileNode(src, createNodeId, opts)
        .then(node => {
          emitter.emit(`SRC_FS_BUSY`)
          reporter.info(`${msg} at "${src}"`)
          createNode(node)
          emitter.emit(`SRC_FS_IDLE`)
        })
        .catch(reporter.error)
    }

    const delNode = (msg, src) => {
      emitter.emit(`SRC_FS_BUSY`)
      const node = getNode(createNodeId(src))

      reporter.info(`${msg} at "${src}"`)
      if (node) {
        deleteNode(node.id, node)
      }
      emitter.emit(`SRC_FS_IDLE`)
    }

    const flush = () => {
      const q = init()

      q.forEach(({ evt, msg, src }, key) => {
        if (/(IDLE|READY|SETUP)$/.test(state.value.SRC_FS)) {
          evt === `add` ? addNode(msg, src) : delNode(msg, src)
          q.delete(key)
        }
      })
    }

    return {
      add: (evt, msg, src) => {
        init().set(src, { evt, msg, src })
        flush()
      },
      flush: flush,
    }
  })()

  emitter.on(`BOOTSTRAP_FINISHED`, () => {
    state = fsMachine.transition(state.value, `SRC_FS_SETUP`)
    queue.flush()
  })

  emitter.on(`SRC_FS_READY`, () => {
    state = fsMachine.transition(state.value, `SRC_FS_READY`)
    queue.flush()
  })

  emitter.on(`SRC_FS_IDLE`, () => {
    state = fsMachine.transition(state.value, `SRC_FS_IDLE`)
  })

  emitter.on(`SRC_FS_BUSY`, () => {
    state = fsMachine.transition(state.value, `SRC_FS_BUSY`)
  })

  chokidar
    .watch(opts.path, {
      ignored: [
        `../**/dist/**`,
        `**/.babelrc`,
        `**/.gitignore`,
        `**/.npmignore`,
        `**/*.un~`,
        `**/node_modules`,
        `**/yarn.lock`,
      ],
    })
    .on(`add`, src => {
      queue.add(`add`, `added file`, src)
      queue.add(`add`, `changed directory`, path.dirname(src))
    })
    .on(`change`, src => queue.add(`add`, `changed file`, src))
    .on(`unlink`, src => {
      queue.add(`del`, `deleted file`, src)
      queue.add(`add`, `changed directory`, path.dirname(src))
    })
    .on(`addDir`, src => queue.add(`add`, `added directory`, src))
    .on(`unlinkDir`, src => queue.add(`del`, `deleted directory`, src))
    .on(`ready`, () => emitter.emit(`SRC_FS_READY`))
}

exports.setFieldsOnGraphQLNodeType = require(`./extend-file-node`)
