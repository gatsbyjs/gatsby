const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const Cache = require(`../../utils/cache`)

/////////////////////////////////////////////////////////////////////
// Handle Incoming requests
/////////////////////////////////////////////////////////////////////

let pluginFields

async function handleRpcRequest(rpc) {
  try {
    invariant(rpc, `rpc`)
    const { id, name, args } = rpc
    invariant(id, `id`)
    invariant(name, `name`)
    invariant(pluginFields, `pluginFields hasn't been init'd yet`)
    const resolver = pluginFields[name].resolve
    invariant(resolver, `resolver`)
    const response = await resolver.apply(null, args)
    const replyMessage = {
      rpc: {
        id,
        type: `response`,
        response,
      },
    }
    process.send(replyMessage)
  } catch (e) {
    console.log(e)
  }
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

/////////////////////////////////////////////////////////////////////
// Outgoing requests
/////////////////////////////////////////////////////////////////////

const rpcs = new Map()

function sendRpc({ name, args, resolve, reject }) {
  invariant(name, `rpc name`)
  invariant(resolve, `rpc resolve`)
  invariant(reject, `rpc reject`)
  // TODO id should be composite of processId and incrementing number. Perhaps
  const id = uuidv4()
  const msg = {
    rpc: {
      name,
      args,
      id,
    },
  }
  rpcs.set(id, {
    time: new Date(),
    resolve,
    reject,
  })
  process.send(msg)
}

function makeRpc(fnName) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      sendRpc({
        name: fnName,
        args,
        resolve,
        reject,
      })
    })
  }
}

/////////////////////////////////////////////////////////////////////
// Init
/////////////////////////////////////////////////////////////////////

function makeRpcs() {
  return {
    getNode: makeRpc(`getNode`),
    getNodesByType: makeRpc(`getNodesByType`),
  }
}

async function init({ asyncFile, pluginOptions, type, pathPrefix }) {
  invariant(asyncFile, `asyncFile`)
  invariant(pluginOptions, `pluginOptions`)
  const module = require(asyncFile)
  const cache = new Cache({ name: `some cache` }).init()
  const api = { type, pathPrefix, cache, ...makeRpcs() }
  invariant(!pluginFields, `plugin fields already initialized`)
  pluginFields = await module.setFieldsOnGraphQLNodeType(api, pluginOptions)
}

function handleMessage(message) {
  if (message.hasOwnProperty(`rpc`)) {
    const { rpc } = message
    if (rpc.type === `response`) {
      handleRpcResponse(rpc)
    } else if (rpc.hasOwnProperty(`name`)) {
      // async
      handleRpcRequest(rpc)
    } else {
      throw new Error(`Invalid RPC. Must have "name" or "response"`)
    }
  } else if (message.hasOwnProperty(`init`)) {
    init(message.init)
  } else {
    throw new Error(`Invalid message`)
  }
}

process.on(`message`, handleMessage)

// TODO periodically expire old rpc calls (unanswered from parent)
