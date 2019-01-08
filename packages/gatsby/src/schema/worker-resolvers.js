const path = require(`path`)
const invariant = require(`invariant`)
const Worker = require(`jest-worker`).default
const { store } = require(`../redux`)
const nodesAPI = require(`../db/nodes`)
const reporter = require(`gatsby-cli/lib/reporter`)

// From jest-worker library `src/types.js`
const JEST_WORKER_PARENT_MESSAGE_IPC = 3

// The collection of fields that will be executed in worker processes
// instead of in the main process.
const fields = []

// The jest-worker pool of workers. Should be initialized via `initPool()`
let pool

/**
 * Handler for IPC `reporter` calls from workers. These are simply
 * called on this processes `reporter` instance, without responding
 * back to the worker
 */
function reporterHandler({ fnName, args }) {
  reporter[fnName].apply(null, args)
}

const rpcMethods = {
  ...nodesAPI,
  reporter: reporterHandler,
}

/**
 * Handler for IPC calls made from the workers back to the main
 * process. The request contains the name of the method it wishes to
 * call, along with args. These are called against `rpcMethods`, and
 * if an `id` was present in the rpc, a response is sent back to the
 * child process, which uses the `id` to reconcile the response with
 * the initial call
 *
 * @param child the child-process that made the IPC call
 * @param request the raw message args sent from the worker.
 */
function ipcCallback(child, request) {
  invariant(request, `Empty IPC request`)
  const [rpc] = request
  invariant(
    rpc,
    `IPC request should be an array with a single element representing the "rpc"`
  )
  const { name, args, id } = rpc
  invariant(name, `RPC should contain the name of the RPC being called`)
  const response = rpcMethods[name].apply(null, args)
  // Only respond if id is present (this means the message was an RPC)
  if (id) {
    const replyMessage = {
      id,
      type: `response`,
      response,
    }
    child.send([JEST_WORKER_PARENT_MESSAGE_IPC, replyMessage])
  }
}

/**
 * Returns an object that contains all the information needed by a
 * worker-resolver to initialize itself and start answering requests
 * for the passed in field
 */
function makeFieldSetup({ typeName, fieldName, fieldConfig, plugin }) {
  const resolverFile = path.join(plugin.resolve, `gatsby-node.js`)
  const type = { name: typeName }
  return {
    fieldName,
    resolverFile,
    type,
    pluginOptions: plugin.pluginOptions,
  }
}

/**
 * Called by jest-worker before a worker function is invoked to
 * determine which worker to send the task too. See
 * https://github.com/facebook/jest/tree/master/packages/jest-worker
 *
 * In this case, we return the node.id so that the same node is always
 * sent to the same worker, ensuring that worker caches are sharded by
 * node ID.
 */
function computeWorkerKey(method, typeName, fieldName, node) {
  invariant(node, `computeWorkerKey: node not present`)
  invariant(node.id, `computeWorkerKey: node has no ID`)
  return node.id
}

function getSitePrefix() {
  let pathPrefix = ``
  if (store.getState().program.prefixPaths) {
    pathPrefix = store.getState().config.pathPrefix
  }
  return pathPrefix
}

/**
 * Creates and returns a jest-worker pool. Each worker will be setup
 * to handle requests for the supplied fields. See
 * `./resolver-worker.js` for how each worker functions.
 */
function makeJestWorkerPool(fields) {
  const pathPrefix = getSitePrefix()
  const setupArgs = [{ pathPrefix, fields: fields.map(makeFieldSetup) }]
  const workerOptions = {
    ipcCallback,
    forkOptions: {
      silent: false,
    },
    setupArgs,
    exposedMethods: [`execResolver`],
    computeWorkerKey,
  }
  const workerFile = require.resolve(`./resolver-worker.js`)
  return new Worker(workerFile, workerOptions)
}

/**
 * Initializes a pool of jest-workers which will handle resolver calls
 * for the `fields` array at the top of this file
 */
function initPool() {
  if (!fields) {
    reporter.info(`no worker fields configured. Not creating worker pool`)
    return
  }
  pool = makeJestWorkerPool(fields)
}

function endPool() {
  pool.end()
  pool = undefined
}

/**
 * Creates and returns a GraphQL resolver that will call a jest-worker
 * to handle the resolver
 */
function workerResolver({ typeName, fieldName }) {
  return async (node, args) => {
    try {
      return await pool.execResolver(typeName, fieldName, node, args)
    } catch (e) {
      reporter.panicOnBuild(
        `Error calling worker resolver. type = [${typeName}], field = [${fieldName}].\n
        ${e.message}`
      )
      return null // Never reached. for linter
    }
  }
}

/**
 * Given the name of a plugin, returns the plugin object stored in
 * redux
 */
function getPlugin(pluginName) {
  const plugins = store.getState().flattenedPlugins
  return plugins.find(p => p.name === pluginName)
}

/**
 * Add `field` to the list of worker resolver fields and return a new
 * resolve function that will call the worker
 */
function defineResolver(field) {
  // Bunch of checks to make sure field is what we expect
  invariant(field, `field passed to defineResolver is undefined`)
  const { typeName, fieldName, fieldConfig } = field
  invariant(typeName, `field.typeName passed to defineResolver is undefined`)
  invariant(fieldName, `field.fieldName passed to defineResolver is undefined`)
  invariant(
    fieldConfig,
    `field.fieldConfig passed to defineResolver is undefined`
  )
  invariant(
    fieldConfig.workerPlugin,
    `field.fieldConfig.workerPlugin passed to defineResolver is undefined`
  )
  invariant(
    fieldConfig.workerPlugin,
    `field.fieldConfig.workerPlugin passed to defineResolver is undefined`
  )

  // Make sure workerPlugin is valid
  const { workerPlugin } = fieldConfig
  const plugin = getPlugin(workerPlugin)
  if (!plugin) {
    throw new Error(
      `can't find [${workerPlugin}] workerPlugin specified in GraphQL field [${fieldName}] for type [${typeName}]. workerPlugin should be the name of the plugin that implements the "setFieldsOnGraphQLNodeType" API.`
    )
  }

  // TODO clear on CLEAR_CACHE etc
  fields.push({ plugin, ...field })
  return workerResolver(field)
}

module.exports = {
  initPool,
  endPool,
  defineResolver,
}
