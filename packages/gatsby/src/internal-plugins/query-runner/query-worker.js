const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const Cache = require(`../../utils/cache`)

/////////////////////////////////////////////////////////////////////
// Handle Incoming requests
/////////////////////////////////////////////////////////////////////

let pluginFields

async function handleRpcRequest(rpc) {
  invariant(rpc, `rpc`)
  const { id, name, args } = rpc
  invariant(id, `id`)
  invariant(name, `name`)
  invariant(pluginFields, `pluginFields hasn't been init'd yet`)
  const resolver = pluginFields[name].resolve
  invariant(resolver, `resolver`)
  const response = await resolver.apply(null, args)
  console.log(`response is`, response)
  const replyMessage = {
    rpc: {
      id,
      type: `response`,
      response,
    },
  }
  console.log(`sending back`, replyMessage)
  process.send(replyMessage)
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
  console.log(`worker send msg`, msg)
  rpcs.set(id, {
    time: new Date(),
    resolve,
    reject,
  })
  console.log(rpcs)
  process.send(msg)
}

function makeRpc(fnName) {
  return (...args) => {
    console.log(`rpc called`)
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

function init({ asyncFile, type, pathPrefix }) {
  console.log(`called worker`)
  invariant(asyncFile, `asyncFile`)
  const module = require(asyncFile)
  const cache = new Cache({ name: `some cache` }).init()
  const api = { type, pathPrefix, cache, ...makeRpcs() }
  invariant(!pluginFields, `plugin fields already initialized`)
  pluginFields = module.setFieldsOnGraphQLNodeType(api)
  console.log(`pluginFields`)
  console.log(pluginFields)
}

function handleMessage(message) {
  invariant(message, `message`)
  console.log(message)
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
