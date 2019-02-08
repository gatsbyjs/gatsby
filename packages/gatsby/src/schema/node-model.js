const {
  getNodes,
  getNode,
  getNodesByType,
  getTypes,
  // hasNodeChanged,
  // getNodeAndSavePathDependency,
  runQuery,
} = require(`../db/nodes`)
const { findRootNodeAncestor } = require(`../db/node-tracking`)
const createPageDependency = require(`../redux/actions/add-page-dependency`)
const { store } = require(`../redux`)
const { isAbstractType } = require(`graphql`)

const withPageDependencies = fn => (args, pageDependencies) => {
  const result = fn(args)

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
  const { schema } = store.getState()
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

const getNodeByGQLTypeName = ({ id, type }) => {
  const node = getNode(id)
  const nodeTypeNames = toNodeTypeNames(type)
  return node && nodeTypeNames.includes(node.internal.type) ? node : null
}

const getNodesByGQLTypeName = type => {
  const nodeTypeNames = toNodeTypeNames(type)
  return nodeTypeNames.reduce(
    (acc, typeName) => acc.concat(getNodesByType(typeName)),
    []
  )
}

const runQueryForGQLType = async args => {
  // TODO: should runQuery handle abstract types by itself?
  const result = await runQuery(args)
  if (args.firstOnly) {
    if (result && result.length > 0) {
      return result[0]
    }
    return null
  }
  return result
}

const nodeModel = {
  findRootNodeAncestor,
  getNode: withPageDependencies(getNode),
  getNodeByType: withPageDependencies(getNodeByGQLTypeName),
  getNodes: withPageDependencies(getNodes),
  getNodesByType: withPageDependencies(getNodesByGQLTypeName),
  // TODO: What should this return? Schema types? Types in the store?
  getTypes: getTypes,
  runQuery: withPageDependencies(runQueryForGQLType),
}

module.exports = nodeModel
