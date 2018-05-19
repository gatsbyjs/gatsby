const chokidar = require(`chokidar`)
const fs = require(`fs`)

const { createId, createFileNode } = require(`./create-file-node`)

/**
 * Determines whether ignore matcher is valid
 * @param {any} matcher
 * @return {Boolean}
 */
const isValidIgnoreMatcher = matcher => (typeof matcher === `string` || typeof matcher === `function` || matcher instanceof RegExp)

// Default paths matchers to not be watched
const DEFAULT_PATHS_TO_IGNORE = [
  `**/*.un~`,
  `**/.gitignore`,
  `**/.npmignore`,
  `**/.babelrc`,
  `**/yarn.lock`,
  `**/node_modules`,
  `../**/dist/**`,
]

exports.sourceNodes = (
  { boundActionCreators, getNode, reporter },
  pluginOptions
) => {
  if (!(pluginOptions && pluginOptions.path)) {
    reporter.panic(`
"path" is a required option for gatsby-source-filesystem

See docs here - https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
    `)
  }

  // Validate that the path exists.
  if (!fs.existsSync(pluginOptions.path)) {
    reporter.panic(`
The path passed to gatsby-source-filesystem does not exist on your file system:

${pluginOptions.path}

Please pick a path to an existing directory.
      `)
  }

  if (pluginOptions.hasOwnProperty(`ignore`)
      && !(isValidIgnoreMatcher(pluginOptions.ignore) || (Array.isArray(pluginOptions.ignore) && pluginOptions.ignore.every(isValidIgnoreMatcher)))) {
    reporter.panic(`
  The 'ignore' passed to gatsby-source-filesystem must be one of the following:
    - string to be directly matched,
    - string with glob patterns,
    - regular expression test,
    - function that takes the testString as an argument and returns a truthy value if it should be matched,
    - an array of any number and mix of these types.

  Please pick a valid 'ignore'. See docs here - https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
    `)
  }

  const { createNode, deleteNode } = boundActionCreators

  let ready = false

  const watcher = chokidar.watch(pluginOptions.path, {
    ignored: pluginOptions.ignore ? DEFAULT_PATHS_TO_IGNORE.concat(pluginOptions.ignore) : DEFAULT_PATHS_TO_IGNORE,
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
    // It's possible the file node was never created as sometimes tools will
    // write and then immediately delete temporary files to the file system.
    if (node) {
      deleteNode(node.id, node)
    }
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
