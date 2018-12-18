const { fork } = require(`child_process`)
const path = require(`path`)
const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)

const rpcs = new Map()

/////////////////////////////////////////////////////////////////////
// Incoming Requests
/////////////////////////////////////////////////////////////////////

function getNode(id) {
  return {
    id,
    foo: `bar`,
  }
}

const rpcMethods = {
  getNode,
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
  console.log(`msg`, msg)
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
  return (node, args, context) => {
    console.log(`rpc called`)
    return new Promise((resolve, reject) => {
      sendRpc({
        child,
        name: fieldName,
        args,
        resolve,
        reject,
      })
    })
  }
}

function makeNewResolver({ type, fieldName, asyncFile }) {
  const workerJsFile = path.join(__dirname, `query-worker.js`)
  const child = fork(workerJsFile)
  child.on(`message`, message => handleMessage(message, child))
  child.send({ init: { asyncFile, type } })
  return childResolve(child, fieldName)
}

function upgradeResolver(fieldConfig, fieldName, type) {
  invariant(fieldConfig, `fieldConfig`)
  invariant(fieldName, `fieldName`)
  invariant(type, `type`)
  const { asyncFile } = fieldConfig
  if (asyncFile) {
    fieldConfig.resolve = makeNewResolver({ type, fieldName, asyncFile })
  }
}

module.exports = {
  upgradeResolver,
}
