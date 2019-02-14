// @flow

const _ = require(`lodash`)
const { isAbstractType, GraphQLOutputType } = require(`graphql`)

type IDOrNode = string | { id: string }
type TypeOrTypeName = string | GraphQLOutputType

interface ConnectionArgs {
  path: string;
  connectionType?: GraphQLOutputType;
}

export interface NodeModel {
  getNodeById(
    { id: IDOrNode, type?: TypeOrTypeName },
    ConnectionArgs
  ): any | null;
  getNodesByIds(
    { ids: Array<IDOrNode>, type?: TypeOrTypeName },
    ConnectionArgs
  ): Array<any>;
  getAllNodes({ type?: TypeOrTypeName }, ConnectionArgs): Array<any>;
  runQuery(args: any): Promise<any>;
  getTypes(): Array<string>;
}

class LocalNodeModel {
  constructor({ schema, nodeStore, createPageDependency }) {
    this.schema = schema
    this.nodeStore = nodeStore
    this.createPageDependency = createPageDependency
  }

  getNodeById({ id, type }, pageDependencies) {
    const node = getNodeById(this.nodeStore, id)
    let result
    if (!node) {
      result = null
    } else if (!type) {
      result = node
    } else {
      const nodeTypeNames = toNodeTypeNames(this.schema, type)
      result = nodeTypeNames.includes(node.internal.type) ? node : null
    }
    return trackPageDependencies(
      result,
      pageDependencies,
      this.createPageDependency
    )
  }

  getNodesByIds({ ids, type }, pageDependencies) {
    const nodes = ids.map(id => getNodeById(this.nodeStore, id)).filter(Boolean)
    let result
    if (!type) {
      result = nodes
    } else {
      const nodeTypeNames = toNodeTypeNames(this.schema, type)
      result = nodes.filter(node => nodeTypeNames.includes(node.internal.type))
    }
    return trackPageDependencies(
      result,
      pageDependencies,
      this.createPageDependency
    )
  }

  getAllNodes({ type }, pageDependencies) {
    let result
    if (!type) {
      result = this.nodeStore.getNodes()
    } else {
      const nodeTypeNames = toNodeTypeNames(this.schema, type)
      const nodes = nodeTypeNames.reduce(
        (acc, typeName) => acc.concat(this.nodeStore.getNodesByType(typeName)),
        []
      )
      result = nodes.filter(Boolean)
    }

    return trackPageDependencies(
      result,
      pageDependencies,
      this.createPageDependency
    )
  }

  async runQuery(args, pageDependencies) {
    const { query, firstOnly, type } = args || {}
    const queryResult = await this.nodeStore.runQuery({
      queryArgs: query,
      firstOnly,
      gqlType: typeof type === `string` ? this.schema.getType(type) : type,
    })
    let result = queryResult
    if (args.firstOnly) {
      if (result && result.length > 0) {
        result = result[0]
      } else {
        result = null
      }
    }
    return trackPageDependencies(
      result,
      pageDependencies,
      this.createPageDependency
    )
  }

  getTypes() {
    return this.nodeStore.getTypes()
  }

  findRootNodeAncestor(...args) {
    return this.nodeStore.findRootNodeAncestor(...args)
  }
}

const getNodeById = (nodeStore, id) => {
  // This is for cases when the `id` has already been resolved
  // to a full Node for the input filter, and is also in the selection
  // set. E.g. `{ foo(parent: { id: { eq: 1 } } ) { parent { id }} }`.
  if (_.isPlainObject(id) && id.id) {
    return id
  }
  return id != null ? nodeStore.getNode(id) : null
}

const toNodeTypeNames = (schema, gqlTypeName) => {
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

const trackPageDependencies = (
  result,
  pageDependencies,
  createPageDependency
) => {
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

module.exports = {
  LocalNodeModel,
}
