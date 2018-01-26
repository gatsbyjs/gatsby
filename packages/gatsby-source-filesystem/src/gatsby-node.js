const chokidar = require(`chokidar`)
const fs = require(`fs`)

const { createId, createFileNode } = require(`./create-file-node`)

exports.sourceNodes = (
  { boundActionCreators, getNode, hasNodeChanged, reporter },
  pluginOptions
) => {
  const { createNode, deleteNode } = boundActionCreators

  let ready = false

  // Validate that the path exists.
  if (!fs.existsSync(pluginOptions.path)) {
    console.log(`
The path passed to gatsby-source-filesystem does not exist on your file system:

${pluginOptions.path}

Please pick a path to an existing directory.
      `)
    process.exit(1)
  }

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

  const createAndProcessNode = path =>
    createFileNode(path, pluginOptions).then(createNode)

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
    if (ready) {
      reporter.info(`added file at ${path}`)
      createAndProcessNode(path).catch(err => reporter.error(err))
    } else {
      pathQueue.push(path)
    }
  })

  watcher.on(`change`, path => {
    reporter.info(`changed file at ${path}`)
    createAndProcessNode(path).catch(err => reporter.error(err))
  })

  watcher.on(`unlink`, path => {
    reporter.info(`file deleted at ${path}`)
    const node = getNode(createId(path))
    deleteNode(node.id, node)

    // Also delete nodes for the file's transformed children nodes.
    node.children.forEach(childId => deleteNode(childId, getNode(childId)))
  })

  watcher.on(`addDir`, path => {
    if (ready) {
      reporter.info(`added directory at ${path}`)
      createAndProcessNode(path).catch(err => reporter.error(err))
    } else {
      pathQueue.push(path)
    }
  })

  watcher.on(`unlinkDir`, path => {
    reporter.info(`directory deleted at ${path}`)
    const node = getNode(createId(path))
    deleteNode(node.id, node)
  })

  return new Promise((resolve, reject) => {
    watcher.on(`ready`, () => {
      if (ready) return

      ready = true
      flushPathQueue().then(resolve, reject)
    })
  })
}

exports.setFieldsOnGraphQLNodeType = require(`./extend-file-node`)
