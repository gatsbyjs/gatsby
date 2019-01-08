const invariant = require(`invariant`)
const uuidv4 = require(`uuid/v4`)
const Cache = require(`../utils/cache`)
const _ = require(`lodash`)

const types = {}
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

function makeReporter() {
  return {
    table: (...args) => console.log(`table`, args),
    step: (...args) => console.log(`step`, args),
    inspect: (...args) => console.log(`inspect`, args),
    list: (...args) => console.log(`list`, args),
    header: (...args) => console.log(`header`, args),
    footer: (...args) => console.log(`footer`, args),
    log: (...args) => console.log(`log`, args),
    success: (...args) => console.log(`success`, args),
    error: (...args) => console.log(`error`, args),
    info: (...args) => console.log(`info`, args),
    command: (...args) => console.log(`command`, args),
    warn: (...args) => console.log(`warn`, args),
    question: (...args) => console.log(`question`, args),
    tree: (...args) => console.log(`tree`, args),
    activitySet: (...args) => console.log(`activitySet`, args),
    activity: (...args) => console.log(`activity`, args),
    select: (...args) => console.log(`select`, args),
    progress: (...args) => console.log(`progress`, args),
    close: (...args) => console.log(`close`, args),
    createReporter: (...args) => console.log(`createReporter`, args),
    panic: (...args) => console.log(`panic`, args),
    panicOnBuild: (...args) => console.log(`panicOnBuild`, args),
    uptime: (...args) => console.log(`uptime`, args),
  }
}

function makeRpcs() {
  return {
    getNode: makeRpc(`getNode`),
    getNodesByType: makeRpc(`getNodesByType`),
    reporter: makeReporter(),
  }
}

function storeResolver(typeName, fieldName, fieldConfig) {
  _.set(types, [typeName, `fields`, fieldName], fieldConfig)
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
  _.forEach(newFields, (fieldConfig, fieldName) => {
    storeResolver(type.name, fieldName, fieldConfig)
  })
}

async function setup(args) {
  const { fields } = args
  invariant(fields, `setup fields`)
  for (const field of fields) {
    await initModule(field)
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
