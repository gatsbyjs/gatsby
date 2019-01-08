const _ = require(`lodash`)
const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const Cache = require(`../utils/cache`)
const createContentDigest = require(`../utils/create-content-digest`)
const reporter = require(`gatsby-cli/lib/reporter`)

// From jest-worker library `src/types.js`
const JEST_WORKER_CHILD_MESSAGE_IPC = 3

// Contains all the types that this worker is configured to handle
// requests for field resolvers for.
const types = {}

// List of all in-flight RPCs
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
  invariant(ipc, `handle IPC`)
  const [rpc] = ipc
  invariant(rpc, `handle rpc`)
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
  process.send([JEST_WORKER_CHILD_MESSAGE_IPC, rpc])
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

// panicOnBuild will send the panic message to the parent process,
// which will terminate, thus killing this and all other workers. All
// other reporter functions operate locally by calling gatsby-cli
// `reporter` directly
function makeReporter() {
  return Object.assign(reporter, {
    panicOnBuild(...args) {
      const msg = {
        name: `reporter`,
        args: { fnName: `panicOnBuild`, args },
      }
      process.send([JEST_WORKER_CHILD_MESSAGE_IPC, msg])
    },
  })
}

function makeRpcs(o, rpcNames) {
  for (const rpcName of rpcNames) {
    o[rpcName] = makeRpc(rpcName)
  }
  return o
}

function unsupportedFn(name) {
  return () => {
    throw new Error(`API [${name}] is unsupported in parallel resolver`)
  }
}

function makeUnsupportedProps(o, props) {
  for (const prop of props) {
    Object.defineProperty(o, prop, unsupportedFn(prop))
  }
  return o
}

function makeApi(type, pathPrefix) {
  const cache = new Cache({ name: `some cache` }).init()
  const api = {
    cache,
    createContentDigest,
    // TODO pass in plugin.name into worker so this can mimic api-runner-node
    // createNodeId: namespacedCreateNodeId,
    // TODO remember to remove from unsupported
    reporter: makeReporter(),
    type,
    pathPrefix,
  }
  makeUnsupportedProps(api, [
    `boundActionCreators`,
    `createNodeId`,
    `actions`,
    `store`,
    `emitter`,
    `tracing`,
    `getNodes`,
  ])
  makeRpcs(api, [
    `loadNodeContent`,
    `getNode`,
    `getNodesByType`,
    `hasNodeChanged`,
    `getNodeAndSavePathDependency`,
  ])
  return api
}

function storeResolver(typeName, fieldName, fieldConfig) {
  _.set(types, [typeName, `fields`, fieldName], fieldConfig)
}

async function initModule(
  pathPrefix,
  { fieldName, resolverFile, pluginOptions, type }
) {
  invariant(resolverFile, `asyncFile`)
  invariant(pluginOptions, `pluginOptions`)
  const module = require(resolverFile)
  const api = makeApi(type, pathPrefix)
  const newFields = await module.setFieldsOnGraphQLNodeType(api, pluginOptions)
  _.forEach(newFields, (fieldConfig, fieldName) => {
    storeResolver(type.name, fieldName, fieldConfig)
  })
}

async function setup(args) {
  const { pathPrefix, fields } = args
  invariant(fields, `setup fields`)
  for (const field of fields) {
    await initModule(pathPrefix, field)
  }
}

async function execResolver(typeName, fieldName, node, args) {
  try {
    invariant(typeName, `execResolver typeName`)
    invariant(fieldName, `execResolver fieldName`)
    const type = types[typeName]
    invariant(type, `execResolver type`)
    const field = type.fields[fieldName]
    invariant(field, `execResolver field`)
    const resolver = field.resolve
    invariant(resolver, `execResolver resolver`)
    return await resolver(node, args)
  } catch (e) {
    console.log(e)
    return null
  }
}

process.on(`ipc`, handleIpc)

module.exports = {
  setup,
  execResolver,
}
