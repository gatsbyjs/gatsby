const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const Cache = require(`../utils/cache`)
const _ = require(`lodash`)

const resolvers = {}
const rpcs = new Map()

function handleRpcResponse(rpc) {
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
  for (const field of fields) {
    await initModule(field)
  }
}

async function execResolver(resolver, node, args) {
  const result = await resolvers[resolver](node, args)
  return result
}

process.on(`ipc`, handleIpc)

module.exports = {
  setup,
  execResolver,
}
