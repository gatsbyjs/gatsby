const path = require(`path`)
const Worker = require(`jest-worker`).default
const { store } = require(`../redux`)
const invariant = require(`invariant`)
const nodesAPI = require(`../db/nodes`)
const reporter = require(`gatsby-cli/lib/reporter`)

// From jest-worker library `src/types.js`
const JEST_WORKER_PARENT_MESSAGE_IPC = 3

let fields = []
let pool

function reporterHandler({ fnName, args }) {
  reporter[fnName].apply(null, args)
}

const rpcMethods = {
  ...nodesAPI,
  reporter: reporterHandler,
}

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

function getPlugin(pluginName) {
  invariant(pluginName, `no pluginName`)
  const plugins = store.getState().flattenedPlugins
  const plugin = plugins.find(p => p.name === pluginName)
  invariant(plugin, `plugin not found`)
  return plugin
}

function makeFieldSetup({ fieldConfig, typeName, fieldName }) {
  invariant(fieldConfig, `fieldCOnfig`)
  invariant(typeName, `typeName`)
  invariant(fieldName, `fieldName`)
  const { workerPlugin } = fieldConfig
  const plugin = getPlugin(workerPlugin)
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

function makePool(fields) {
  let pathPrefix = ``
  if (store.getState().program.prefixPaths) {
    pathPrefix = store.getState().config.pathPrefix
  }
  const setupArgs = [{ pathPrefix, fields: fields.map(makeFieldSetup) }]
  const exposedMethods = [`execResolver`]
  const workerOptions = {
    ipcCallback,
    forkOptions: {
      silent: false,
    },
    setupArgs,
    exposedMethods,
  }
  const pool = new Worker(
    require.resolve(`./resolver-worker.js`),
    workerOptions
  )
  return pool
}

function initPool() {
  invariant(fields, `no fields configured`)
  pool = makePool(fields)
  invariant(pool, `pool`)
}

function endPool() {
  pool.end()
  pool = undefined
}

function add(field) {
  // TODO clear on CLEAR_CACHE etc
  fields.push(field)
}

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

function replaceResolver(field) {
  field.fieldConfig.resolve = workerResolver(field)
}

module.exports = {
  initPool,
  endPool,
  replaceResolver,
  add,
}
