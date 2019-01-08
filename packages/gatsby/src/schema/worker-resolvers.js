const path = require(`path`)
const Worker = require(`jest-worker`).default
const { store } = require(`../redux`)
const invariant = require(`invariant`)
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
  invariant(child, `no child`)
  invariant(request, `request`)
  const [rpc] = request
  invariant(rpc, `rpc`)
  const { name, args, id } = rpc
  invariant(name, `rpc name`)
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
 * Given the name of a plugin, returns the plugin object stored in
 * redux
 */
function getPlugin(pluginName) {
  const plugins = store.getState().flattenedPlugins
  return plugins.find(p => p.name === pluginName)
}

/**
 * Returns an object that contains all the information needed by a
 * worker-resolver to initialize itself and start answering requests
 * for the passed in field
 */
function makeFieldSetup({ typeName, fieldName, fieldConfig }) {
  invariant(fieldConfig, `fieldConfig`)
  invariant(typeName, `typeName`)
  invariant(fieldName, `fieldName`)
  const { workerPlugin } = fieldConfig
  const plugin = getPlugin(workerPlugin)
  invariant(plugin, `plugin not found`)
  const resolverFile = path.join(plugin.resolve, `gatsby-node.js`)
  invariant(resolverFile, `new resolver asyncFile`)
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
  invariant(pool, `pool`)
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
      console.log(e)
      return null
    }
  }
}

/**
 * Add `field` to the list of worker resolver fields and return a new
 * resolve function that will call the worker
 */
function defineResolver(field) {
  // TODO clear on CLEAR_CACHE etc
  fields.push(field)
  return workerResolver(field)
}

module.exports = {
  initPool,
  endPool,
  defineResolver,
}
