const { fork } = require(`child_process`)
const path = require(`path`)
const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const {
  loadNodeContent,
  getNodes,
  getNode,
  getNodesByType,
  hasNodeChanged,
  getNodeAndSavePathDependency,
} = require(`../../db/nodes`)
const { store } = require(`../../redux`)

const rpcs = new Map()

/////////////////////////////////////////////////////////////////////
// Incoming Requests
/////////////////////////////////////////////////////////////////////

const rpcMethods = {
  getNode,
  getNodesByType,
}

function handleRpcResponse(rpc) {
  invariant(rpc, `rpc`)
  const { id, response } = rpc
  invariant(id, `id`)
  const { resolve } = rpcs.get(id)
  invariant(resolve, `resolve`)
  rpcs.delete(id)
  resolve(response)
}

function handleRpcRequest(rpc, child) {
  const { name, args, id } = rpc
  invariant(name, `rpc name`)
  invariant(id, `rpc id`)
  const response = rpcMethods[name].apply(null, args)
  console.log(`response is`, response)
  const replyMessage = {
    rpc: {
      id,
      type: `response`,
      response,
    },
  }
  console.log(`server sending back`, replyMessage)
  child.send(replyMessage)
}

function handleMessage(message, child) {
  console.log(`handle message`)
  const { rpc } = message
  invariant(rpc, `rpc`)
  if (rpc.hasOwnProperty(`response`)) {
    handleRpcResponse(rpc)
  } else if (rpc.hasOwnProperty(`name`)) {
    handleRpcRequest(rpc, child)
  } else {
    throw new Error(`Invalid RPC. Must have "name" or "response"`)
  }
}

/////////////////////////////////////////////////////////////////////
// Outgoing Requests
/////////////////////////////////////////////////////////////////////

function sendRpc({ child, name, args, resolve, reject }) {
  invariant(name, `rpc name`)
  invariant(resolve, `rpc resolve`)
  invariant(reject, `rpc reject`)
  console.log(`send rpc`)
  // TODO id should be composite of processId and incrementing number. Perhaps
  const id = uuidv4()
  const msg = {
    rpc: {
      name,
      args,
      id,
    },
  }
  console.log(`msg`, name, args)
  rpcs.set(id, {
    time: new Date(),
    resolve,
    reject,
  })
  console.log(rpcs)
  child.send(msg)
}

/////////////////////////////////////////////////////////////////////
// Setup new worker
/////////////////////////////////////////////////////////////////////

function childResolve(child, fieldName) {
  return (node, args2, context) => {
    console.log(`rpc called`)
    return new Promise((resolve, reject) => {
      sendRpc({
        child,
        name: fieldName,
        args: [node, args2],
        resolve,
        reject,
      })
    })
  }
}

function getPlugin(pluginName) {
  invariant(pluginName, `no pluginName`)
  const plugins = store.getState().flattenedPlugins
  const plugin = plugins.find(p => p.name === pluginName)
  invariant(plugin, `plugin not found`)
  return plugin
}

function makeNewResolver({ type, fieldName, asyncPlugin }) {
  const workerJsFile = path.join(__dirname, `query-worker.js`)
  const child = fork(workerJsFile)
  child.on(`message`, message => handleMessage(message, child))
  let pathPrefix = ``
  if (store.getState().program.prefixPaths) {
    pathPrefix = store.getState().config.pathPrefix
  }
  const plugin = getPlugin(asyncPlugin)
  const asyncFile = path.join(plugin.resolve, `gatsby-node.js`)
  invariant(asyncFile, `new resolver asyncFile`)
  const initPayload = {
    asyncFile,
    pluginOptions: plugin.pluginOptions,
    type,
    pathPrefix,
  }
  child.send({ init: initPayload })
  return childResolve(child, fieldName)
}

function upgradeResolver(fieldConfig, fieldName, type) {
  invariant(fieldConfig, `fieldConfig`)
  invariant(fieldName, `fieldName`)
  invariant(type, `type`)
  const { asyncPlugin } = fieldConfig
  if (asyncPlugin) {
    fieldConfig.resolve = makeNewResolver({ type, fieldName, asyncPlugin })
  }
}

module.exports = {
  upgradeResolver,
}
