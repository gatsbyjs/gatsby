import * as chokidar from "chokidar"
import * as fs from "fs"
import * as path from "path"
import { Machine, interpret, Interpreter, EventObject } from "xstate"
import { PluginOptions, SourceNodesArgs } from "gatsby"
import { createFileNode } from "./create-file-node"

interface IStateSchema {
  states: {
    BOOTSTRAP: {
      states: {
        BOOTSTRAPPING: {}
        BOOTSTRAPPED: {}
      }
    }
    CHOKIDAR: {
      states: {
        NOT_READY: {}
        READY: {}
      }
    }
  }
}

// export type TBootstrapEvent = "BOOTSTRAPPING" | "BOOTSTRAP_FINISHED"
// export interface IBootstrapEvent extends EventObject {
//   type: TBootstrapEvent
// }

export type TEvent =
  | "BOOTSTRAPPING"
  | "BOOTSTRAP_FINISHED"
  | "NOT_READY"
  | "CHOKIDAR_READY"
  | "CHOKIDAR_ADD"
  | "CHOKIDAR_CHANGE"
  | "CHOKIDAR_UNLINK"
export interface ITagEvent extends EventObject {
  type: TEvent
  resolve?: () => void
  reject?: () => void
  pathType?: string
  path?: string
}

/**
 * Create a state machine to manage Chokidar's not-ready/ready states.
 */
function createFSMachine(
  {
    actions: { createNode, deleteNode },
    getNode,
    createNodeId,
    reporter,
  }: SourceNodesArgs,
  pluginOptions: PluginOptions
): Interpreter<{}, IStateSchema, ITagEvent> {
  const createAndProcessNode = (path: string): Promise<null> =>
    createFileNode(path, createNodeId, pluginOptions).then(fileNode => {
      createNode(fileNode)
      return null
    })

  const deletePathNode = (path: string): void => {
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
  let pathQueue: Array<{ op: string; path: string }> = []
  const flushPathQueue = (): Promise<Array<void | null>> => {
    const queue = pathQueue.slice()
    pathQueue = []
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

  const fsMachine = Machine<{}, IStateSchema, ITagEvent>(
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
                CHOKIDAR_ADD: {
                  actions: [`createAndProcessNode`],
                },
                CHOKIDAR_CHANGE: {
                  actions: [`createAndProcessNode`],
                },
                CHOKIDAR_UNLINK: {
                  actions: [`deletePathNode`],
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        createAndProcessNode(_, { pathType, path }, meta): void {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          createAndProcessNode(path!).catch(err => reporter.error(err))
          if (meta?.state?.matches(`BOOTSTRAP.BOOTSTRAPPED`)) {
            reporter.info(`add or changed ${pathType} at ${path}`)
          }
        },
        deletePathNode(_, { pathType, path }, meta): void {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          deletePathNode(path!)
          if (meta?.state?.matches(`BOOTSTRAP.BOOTSTRAPPED`)) {
            reporter.info(`deleted ${pathType} at ${path}`)
          }
        },
        flushPathQueue(_, { resolve, reject }): void {
          flushPathQueue().then(resolve, reject)
        },
        queueNodeDeleting(_, { path }): void {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pathQueue.push({ op: `delete`, path: path! })
        },
        queueNodeProcessing(_, { path }): void {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pathQueue.push({ op: `upsert`, path: path! })
        },
      },
    }
  )
  return interpret(fsMachine).start()
}

export function sourceNodes(
  api: SourceNodesArgs,
  options: PluginOptions & { path: string; ignore?: string[] }
): Promise<void> {
  // Validate that the path exists.
  if (!fs.existsSync(options.path)) {
    api.reporter.panic(`
The path passed to gatsby-source-filesystem does not exist on your file system:
${options.path}
Please pick a path to an existing directory.
See docs here - https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
      `)
  }

  // Validate that the path is absolute.
  // Absolute paths are required to resolve images correctly.
  if (!path.isAbsolute(options.path)) {
    options.path = path.resolve(process.cwd(), options.path)
  }

  const fsMachine = createFSMachine(api, options)

  // Once bootstrap is finished, we only let one File node update go through
  // the system at a time.
  api.emitter.on(`BOOTSTRAP_FINISHED`, () => {
    fsMachine.send(`BOOTSTRAP_FINISHED`)
  })

  const watcher = chokidar.watch(options.path, {
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
      ...(options.ignore || []),
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

export { extendFileNode as setFieldsOnGraphQLNodeType } from "./extend-file-node"
