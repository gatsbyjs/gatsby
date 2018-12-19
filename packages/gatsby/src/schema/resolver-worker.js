const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const Cache = require(`../utils/cache`)
const _ = require(`lodash`)

const resolvers = {}
const rpcs = new Map()

function handleRpcResponse(rpc) {
  console.log(`child got callback`, rpc)
  invariant(rpc, `rpc`)
  const { id, response } = rpc
  invariant(id, `id`)
  const { resolve } = rpcs.get(id)
  invariant(resolve, `resolve`)
  rpcs.delete(id)
  resolve(response)
}

function handleIpc(ipc) {
  const [rpc] = ipc
  if (rpc.type === `response`) {
    handleRpcResponse(rpc)
  } else {
    throw new Error(`Invalid RPC. Must have "name" or "response"`)
  }
}

function sendRpc({ name, args, resolve, reject }) {
  invariant(name, `rpc name`)
  invariant(resolve, `rpc resolve`)
  invariant(reject, `rpc reject`)
  // TODO id should be composite of processId and incrementing number. Perhaps
  const id = uuidv4()
  const rpc = {
    name,
    args,
    id,
  }
  console.log(`send rpc`, rpc)
  rpcs.set(id, {
    time: new Date(),
    resolve,
    reject,
  })
  process.send([3, rpc])
}

function makeRpc(fnName) {
  return (...args) =>
    new Promise((resolve, reject) => {
      sendRpc({
        name: fnName,
        args,
        resolve,
        reject,
      })
    })
}

function makeRpcs() {
  return {
    getNode: makeRpc(`getNode`),
    getNodesByType: makeRpc(`getNodesByType`),
  }
}

async function initModule({
  fieldName,
  resolverFile,
  pluginOptions,
  type,
  pathPrefix,
}) {
  invariant(resolverFile, `asyncFile`)
  invariant(pluginOptions, `pluginOptions`)
  const module = require(resolverFile)
  const cache = new Cache({ name: `some cache` }).init()
  const api = { type, pathPrefix, cache, ...makeRpcs() }
  const newFields = await module.setFieldsOnGraphQLNodeType(api, pluginOptions)
  _.forEach(newFields, (v, k) => {
    resolvers[k] = v.resolve
  })
}

async function setup(args) {
  const { fields } = args
  invariant(fields, `setup fields`)
  console.log(`worker setup`)
  for (const field of fields) {
    await initModule(field)
  }
  console.log(`setup complete`)
}

async function execResolver(resolver, node, args) {
  console.log(resolver, node, args)
  const result = await resolvers[resolver](node, args)
  console.log(`result`, result)
  return result
}

process.on(`ipc`, handleIpc)

module.exports = {
  setup,
  execResolver,
}
