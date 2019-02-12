const _ = require(`lodash`)
const { isAbstractType } = require(`graphql`)

const createPageDependency = require(`../redux/actions/add-page-dependency`)

let nodeStore
let schema

const _setSchema = gqSchema => {
  schema = gqSchema
}
const _setNodeStore = store => {
  nodeStore = store
}

const withPageDependencies = fn => async (args, pageDependencies) => {
  const result = await fn(args)

  const { path, connectionType } = pageDependencies || {}
  if (path) {
    if (connectionType) {
      createPageDependency({ path, connection: connectionType })
    } else {
      const nodes = Array.isArray(result) ? result : [result]
      nodes
        .filter(Boolean)
        .map(node => createPageDependency({ path, nodeId: node.id }))
    }
  }

  return result
}

const toNodeTypeNames = gqlTypeName => {
  const gqlType =
    typeof gqlTypeName === `string` ? schema.getType(gqlTypeName) : gqlTypeName

  if (!gqlType) return null

  const possibleTypes = isAbstractType(gqlType)
    ? schema.getPossibleTypes(gqlType)
    : [gqlType]

  return possibleTypes
    .filter(type => type.getInterfaces().some(iface => iface.name === `Node`))
    .map(type => type.name)
}

const getNodeById = id => {
  // This is for cases when the `id` has already been resolved
  // to a full Node for the input filter, and is also in the selection
  // set. E.g. `{ foo(parent: { id: { eq: 1 } } ) { parent { id }} }`.
  if (_.isPlainObject(id) && id.id) {
    return id
  }
  return id != null ? nodeStore.getNode(id) : null
}

const getNodeByGQLTypeName = ({ id, type }) => {
  const node = getNodeById(id)
  if (!node) return null
  if (!type) return node
  const nodeTypeNames = toNodeTypeNames(type)
  return nodeTypeNames.includes(node.internal.type) ? node : null
}

const getNodesByGQLTypeName = type => {
  const nodeTypeNames = toNodeTypeNames(type)
  const nodes = nodeTypeNames.reduce(
    (acc, typeName) => acc.concat(nodeStore.getNodesByType(typeName)),
    []
  )
  return nodes.filter(Boolean)
}

const getNodesByIds = ({ ids, type }) => {
  if (!ids) {
    return type ? getNodesByGQLTypeName(type) : nodeStore.getNodes()
  }
  const nodes = ids.map(getNodeById).filter(Boolean)
  if (!type) return nodes
  const nodeTypeNames = toNodeTypeNames(type)
  return nodes.filter(node => nodeTypeNames.includes(node.internal.type))
}

const runQueryForGQLType = async args => {
  const { query, firstOnly, type } = args || {}
  const result = await nodeStore.runQuery({
    queryArgs: query,
    firstOnly,
    gqlType: typeof type === `string` ? schema.getType(type) : type,
  })
  if (args.firstOnly) {
    if (result && result.length > 0) {
      return result[0]
    }
    return null
  }
  return result
}

const getNodeTypes = () => nodeStore.getTypes()

const findRootNode = () => nodeStore.findRootNodeAncestor

const nodeModel = {
  findRootNodeAncestor: findRootNode,
  getNode: withPageDependencies(getNodeByGQLTypeName),
  getNodes: withPageDependencies(getNodesByIds),
  getTypes: getNodeTypes,
  runQuery: withPageDependencies(runQueryForGQLType),
  _setSchema,
  _setNodeStore,
}

module.exports = nodeModel
