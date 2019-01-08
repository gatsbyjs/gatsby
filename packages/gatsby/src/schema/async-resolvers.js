const path = require(`path`)
const Worker = require(`jest-worker`).default
const { store } = require(`../redux`)
const invariant = require(`invariant`)
const { getNode, getNodesByType } = require(`../db/nodes`)

let fields = []
let pool

const rpcMethods = {
  getNode,
  getNodesByType,
}

function ipcCallback(child, request) {
  invariant(child, `no child`)
  invariant(request, `request`)
  const [rpc] = request
  invariant(rpc, `rpc`)
  const { name, args, id } = rpc
  invariant(name, `rpc name`)
  invariant(id, `rpc id`)
  const response = rpcMethods[name].apply(null, args)
  const replyMessage = {
    id,
    type: `response`,
    response,
  }
  child.send([3, replyMessage])
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
  const { pluginName } = fieldConfig
  let pathPrefix = ``
  if (store.getState().program.prefixPaths) {
    pathPrefix = store.getState().config.pathPrefix
  }
  const plugin = getPlugin(pluginName)
  const resolverFile = path.join(plugin.resolve, `gatsby-node.js`)
  invariant(resolverFile, `new resolver asyncFile`)
  const type = { name: typeName }
  return {
    fieldName,
    resolverFile,
    pathPrefix,
    type,
    pluginOptions: plugin.pluginOptions,
  }
}

function makePool(fields) {
  const setupArgs = [{ fields: fields.map(makeFieldSetup) }]
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
