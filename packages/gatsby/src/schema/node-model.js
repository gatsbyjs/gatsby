// @flow

const _ = require(`lodash`)
const {
  isAbstractType,
  GraphQLOutputType,
  GraphQLUnionType,
  GraphQLList,
  getNamedType,
  getNullableType,
  isCompositeType,
} = require(`graphql`)
const invariant = require(`invariant`)
const reporter = require(`gatsby-cli/lib/reporter`)

type TypeOrTypeName = string | GraphQLOutputType

/**
 * Optional page dependency information.
 *
 * @typedef {Object} PageDependencies
 * @property {string} path The path of the page that depends on the retrieved nodes' data
 * @property {string} [connectionType] Mark this dependency as a connection
 */
interface PageDependencies {
  path: string;
  connectionType?: string;
}

interface QueryArguments {
  type: TypeOrTypeName;
  query: { filter: Object, sort?: Object };
  firstOnly?: boolean;
}

export interface NodeModel {
  getNodeById(
    { id: string, type?: TypeOrTypeName },
    pageDependencies?: PageDependencies
  ): any | null;
  getNodesByIds(
    { ids: Array<string>, type?: TypeOrTypeName },
    pageDependencies?: PageDependencies
  ): Array<any>;
  getAllNodes(
    { type?: TypeOrTypeName },
    pageDependencies?: PageDependencies
  ): Array<any>;
  runQuery(
    args: QueryArguments,
    pageDependencies?: PageDependencies
  ): Promise<any>;
  getTypes(): Array<string>;
  trackPageDependencies<nodeOrNodes: Node | Node[]>(
    result: nodeOrNodes,
    pageDependencies?: PageDependencies
  ): nodesOrNodes;
  findRootNodeAncestor(obj: any, predicate: () => boolean): Node | null;
  trackInlineObjectsInRootNode(node: Node, sanitize: boolean): Node;
}

class LocalNodeModel {
  constructor({ schema, schemaComposer, nodeStore, createPageDependency }) {
    this.schema = schema
    this.schemaComposer = schemaComposer
    this.nodeStore = nodeStore
    this.createPageDependency = createPageDependency

    this._rootNodeMap = new WeakMap()
    this._trackedRootNodes = new Set()
    this._prepareNodesQueues = {}
    this._prepareNodesPromises = {}
    this._preparedNodesCache = new Map()
  }

  withContext(context) {
    return new ContextualNodeModel(this, context)
  }

  /**
   * Get a node from the store by ID and optional type.
   *
   * @param {Object} args
   * @param {string} args.id ID of the requested node
   * @param {(string|GraphQLOutputType)} [args.type] Optional type of the node
   * @param {PageDependencies} [pageDependencies]
   * @returns {(Node|null)}
   */
  getNodeById(args, pageDependencies) {
    const { id, type } = args || {}

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

    if (result) {
      this.trackInlineObjectsInRootNode(node)
    }

    return this.trackPageDependencies(result, pageDependencies)
  }

  /**
   * Get nodes from the store by IDs and optional type.
   *
   * @param {Object} args
   * @param {string[]} args.ids IDs of the requested nodes
   * @param {(string|GraphQLOutputType)} [args.type] Optional type of the nodes
   * @param {PageDependencies} [pageDependencies]
   * @returns {Node[]}
   */
  getNodesByIds(args, pageDependencies) {
    const { ids, type } = args || {}

    const nodes = Array.isArray(ids)
      ? ids.map(id => getNodeById(this.nodeStore, id)).filter(Boolean)
      : []

    let result
    if (!nodes.length || !type) {
      result = nodes
    } else {
      const nodeTypeNames = toNodeTypeNames(this.schema, type)
      result = nodes.filter(node => nodeTypeNames.includes(node.internal.type))
    }

    if (result) {
      result.forEach(node => this.trackInlineObjectsInRootNode(node))
    }

    return this.trackPageDependencies(result, pageDependencies)
  }

  /**
   * Get all nodes in the store, or all nodes of a specified type. Note that
   * this doesn't add tracking to all the nodes, unless pageDependencies are
   * passed.
   *
   * @param {Object} args
   * @param {(string|GraphQLOutputType)} [args.type] Optional type of the nodes
   * @param {PageDependencies} [pageDependencies]
   * @returns {Node[]}
   */
  getAllNodes(args, pageDependencies) {
    const { type } = args || {}

    let result
    if (!type) {
      result = this.nodeStore.getNodes()
    } else {
      const nodeTypeNames = toNodeTypeNames(this.schema, type)
      const nodes = nodeTypeNames.reduce((acc, typeName) => {
        acc.push(...this.nodeStore.getNodesByType(typeName))
        return acc
      }, [])
      result = nodes.filter(Boolean)
    }

    if (result) {
      result.forEach(node => this.trackInlineObjectsInRootNode(node))
    }

    if (pageDependencies) {
      return this.trackPageDependencies(result, pageDependencies)
    } else {
      return result
    }
  }

  /**
   * Get nodes of a type matching the specified query.
   *
   * @param {Object} args
   * @param {Object} args.query Query arguments (`filter` and `sort`)
   * @param {(string|GraphQLOutputType)} args.type Type
   * @param {boolean} [args.firstOnly] If true, return only first match
   * @param {PageDependencies} [pageDependencies]
   * @returns {Promise<Node[]>}
   */
  async runQuery(args, pageDependencies) {
    const { query, firstOnly, type } = args || {}

    // We don't support querying union types (yet?), because the combined types
    // need not have any fields in common.
    const gqlType = typeof type === `string` ? this.schema.getType(type) : type
    invariant(
      !(gqlType instanceof GraphQLUnionType),
      `Querying GraphQLUnion types is not supported.`
    )

    const fields = getQueryFields({
      filter: query.filter,
      sort: query.sort,
      group: query.group,
      distinct: query.distinct,
    })
    const fieldsToResolve = determineResolvableFields(
      this.schemaComposer,
      this.schema,
      gqlType,
      fields
    )

    let nodeTypeNames
    if (isAbstractType(gqlType)) {
      nodeTypeNames = toNodeTypeNames(this.schema, gqlType)
    } else {
      nodeTypeNames = [gqlType.name]
    }

    await this.prepareNodes(gqlType, fields, fieldsToResolve, nodeTypeNames)

    const queryResult = await this.nodeStore.runQuery({
      queryArgs: query,
      firstOnly,
      gqlSchema: this.schema,
      gqlComposer: this.schemaComposer,
      gqlType,
      resolvedFields: fieldsToResolve,
      nodeTypeNames,
    })

    let result = queryResult
    if (args.firstOnly) {
      if (result && result.length > 0) {
        result = result[0]
        this.trackInlineObjectsInRootNode(result)
      } else {
        result = null
      }
    } else if (result) {
      result.forEach(node => this.trackInlineObjectsInRootNode(node))
    }

    return this.trackPageDependencies(result, pageDependencies)
  }

  prepareNodes(type, queryFields, fieldsToResolve, nodeTypeNames) {
    const typeName = type.name
    if (!this._prepareNodesQueues[typeName]) {
      this._prepareNodesQueues[typeName] = []
    }

    this._prepareNodesQueues[typeName].push({
      queryFields,
      fieldsToResolve,
    })

    if (!this._prepareNodesPromises[typeName]) {
      this._prepareNodesPromises[typeName] = new Promise(resolve => {
        process.nextTick(async () => {
          await this._doResolvePrepareNodesQueue(type, nodeTypeNames)
          resolve()
        })
      })
    }

    return this._prepareNodesPromises[typeName]
  }

  async _doResolvePrepareNodesQueue(type, nodeTypeNames) {
    const typeName = type.name
    const queue = this._prepareNodesQueues[typeName]
    this._prepareNodesQueues[typeName] = []
    this._prepareNodesPromises[typeName] = null

    const { queryFields, fieldsToResolve } = queue.reduce(
      (
        { queryFields, fieldsToResolve },
        { queryFields: nextQueryFields, fieldsToResolve: nextFieldsToResolve }
      ) => {
        return {
          queryFields: _.merge(queryFields, nextQueryFields),
          fieldsToResolve: _.merge(fieldsToResolve, nextFieldsToResolve),
        }
      },
      {
        queryFields: {},
        fieldsToResolve: {},
      }
    )

    const actualFieldsToResolve = deepObjectDifference(
      fieldsToResolve,
      this._preparedNodesCache.get(typeName) || {}
    )

    if (!_.isEmpty(actualFieldsToResolve)) {
      await this.nodeStore.saveResolvedNodes(nodeTypeNames, async node => {
        this.trackInlineObjectsInRootNode(node)
        const resolvedFields = await resolveRecursive(
          this,
          this.schemaComposer,
          this.schema,
          node,
          type,
          queryFields,
          actualFieldsToResolve
        )
        const mergedResolved = _.merge(
          node.__gatsby_resolved || {},
          resolvedFields
        )
        return mergedResolved
      })
      this._preparedNodesCache.set(
        typeName,
        _.merge(
          {},
          this._preparedNodesCache.get(typeName) || {},
          actualFieldsToResolve
        )
      )
    }
  }

  /**
   * Get the names of all node types in the store.
   *
   * @returns {string[]}
   */
  getTypes() {
    return this.nodeStore.getTypes()
  }

  /**
   * Adds link between inline objects/arrays contained in Node object
   * and that Node object.
   * @param {Node} node Root Node
   */
  trackInlineObjectsInRootNode(node) {
    if (!this._trackedRootNodes.has(node.id)) {
      addRootNodeToInlineObject(this._rootNodeMap, node, node.id, true, true)
      this._trackedRootNodes.add(node.id)
    }
  }

  /**
   * Finds top most ancestor of node that contains passed Object or Array
   * @param {(Object|Array)} obj Object/Array belonging to Node object or Node object
   * @param {nodePredicate} [predicate] Optional callback to check if ancestor meets defined conditions
   * @returns {Node} Top most ancestor if predicate is not specified
   * or first node that meet predicate conditions if predicate is specified
   */
  findRootNodeAncestor(obj, predicate = null) {
    let iterations = 0
    let node = obj

    while (iterations++ < 100) {
      if (predicate && predicate(node)) return node

      const parent = node.parent && getNodeById(this.nodeStore, node.parent)
      const id = this._rootNodeMap.get(node)
      const trackedParent = id && getNodeById(this.nodeStore, id)

      if (!parent && !trackedParent) return node

      node = parent || trackedParent
    }

    reporter.error(
      `It looks like you have a node that's set its parent as itself:\n\n` +
        node
    )
    return null
  }

  /**
   * Given a result, that's either a single node or an array of them, track them
   * using pageDependencies. Defaults to tracking according to current resolver
   * path. Returns the result back.
   *
   * @param {Node | Node[]} result
   * @param {PageDependencies} [pageDependencies]
   * @returns {Node | Node[]}
   */
  trackPageDependencies(result, pageDependencies = {}) {
    const { path, connectionType } = pageDependencies
    if (path) {
      if (connectionType) {
        this.createPageDependency({ path, connection: connectionType })
      } else {
        const nodes = Array.isArray(result) ? result : [result]
        for (const node of nodes) {
          if (node) {
            this.createPageDependency({ path, nodeId: node.id })
          }
        }
      }
    }

    return result
  }
}

class ContextualNodeModel {
  constructor(rootNodeModel, context) {
    this.nodeModel = rootNodeModel
    this.context = context
  }

  withContext(context) {
    return new ContextualNodeModel(this.nodeModel, {
      ...this.context,
      ...context,
    })
  }

  getNodeById(...args) {
    return this.nodeModel.getNodeById(...args)
  }

  getNodesByIds(...args) {
    return this.nodeModel.getNodesByIds(...args)
  }

  getAllNodes(...args) {
    return this.nodeModel.getAllNodes(...args)
  }

  runQuery(...args) {
    return this.nodeModel.runQuery(...args)
  }
  prepareNodes(...args) {
    return this.nodeModel.prepareNodes(...args)
  }

  getTypes(...args) {
    return this.nodeModel.getTypes(...args)
  }

  trackInlineObjectsInRootNode(...args) {
    return this.nodeModel.trackInlineObjectsInRootNode(...args)
  }

  findRootNodeAncestor(...args) {
    return this.nodeModel.findRootNodeAncestor(...args)
  }

  createPageDependency(...args) {
    return this.nodeModel.createPageDependency(...args)
  }

  trackPageDependencies(result, pageDependencies) {
    const fullDependencies = {
      path: this.context.path,
      ...(pageDependencies || {}),
    }

    return this.nodeModel.trackPageDependencies(result, fullDependencies)
  }
}

const getNodeById = (nodeStore, id) =>
  id != null ? nodeStore.getNode(id) : null

const toNodeTypeNames = (schema, gqlTypeName) => {
  const gqlType =
    typeof gqlTypeName === `string` ? schema.getType(gqlTypeName) : gqlTypeName

  if (!gqlType) return []

  const possibleTypes = isAbstractType(gqlType)
    ? schema.getPossibleTypes(gqlType)
    : [gqlType]

  return possibleTypes
    .filter(type => type.getInterfaces().some(iface => iface.name === `Node`))
    .map(type => type.name)
}

const getQueryFields = ({ filter, sort, group, distinct }) => {
  const filterFields = filter ? dropQueryOperators(filter) : {}
  const sortFields = (sort && sort.fields) || []

  if (group && !Array.isArray(group)) {
    group = [group]
  } else if (group == null) {
    group = []
  }

  if (distinct && !Array.isArray(distinct)) {
    distinct = [distinct]
  } else if (distinct == null) {
    distinct = []
  }

  return _.merge(
    filterFields,
    ...sortFields.map(pathToObject),
    ...group.map(pathToObject),
    ...distinct.map(pathToObject)
  )
}

const pathToObject = path => {
  if (path && typeof path === `string`) {
    return path.split(`.`).reduceRight((acc, key) => {
      return { [key]: acc }
    }, true)
  }
  return {}
}

const dropQueryOperators = filter =>
  Object.keys(filter).reduce((acc, key) => {
    const value = filter[key]
    const k = Object.keys(value)[0]
    const v = value[k]
    if (_.isPlainObject(value) && _.isPlainObject(v)) {
      acc[key] =
        k === `elemMatch` ? dropQueryOperators(v) : dropQueryOperators(value)
    } else {
      acc[key] = true
    }
    return acc
  }, {})

const getFields = (schema, type, node) => {
  if (!isAbstractType(type)) {
    return type.getFields()
  }

  const concreteType = type.resolveType(node)
  return schema.getType(concreteType).getFields()
}

async function resolveRecursive(
  nodeModel,
  schemaComposer,
  schema,
  node,
  type,
  queryFields,
  fieldsToResolve
) {
  const gqlFields = getFields(schema, type, node)
  let resolvedFields = {}
  for (const fieldName of Object.keys(fieldsToResolve)) {
    const fieldToResolve = fieldsToResolve[fieldName]
    const queryField = queryFields[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlNonNullType = getNullableType(gqlField.type)
    const gqlFieldType = getNamedType(gqlField.type)
    let innerValue
    if (gqlField.resolve) {
      innerValue = await resolveField(
        nodeModel,
        schemaComposer,
        schema,
        node,
        gqlField,
        fieldName
      )
    } else {
      innerValue = node[fieldName]
    }
    if (gqlField && innerValue != null) {
      if (
        isCompositeType(gqlFieldType) &&
        !(gqlNonNullType instanceof GraphQLList)
      ) {
        innerValue = await resolveRecursive(
          nodeModel,
          schemaComposer,
          schema,
          innerValue,
          gqlFieldType,
          queryField,
          _.isObject(fieldToResolve) ? fieldToResolve : queryField
        )
      } else if (
        isCompositeType(gqlFieldType) &&
        _.isArray(innerValue) &&
        gqlNonNullType instanceof GraphQLList
      ) {
        innerValue = await Promise.all(
          innerValue.map(item =>
            resolveRecursive(
              nodeModel,
              schemaComposer,
              schema,
              item,
              gqlFieldType,
              queryField,
              _.isObject(fieldToResolve) ? fieldToResolve : queryField
            )
          )
        )
      }
    }
    if (innerValue != null) {
      resolvedFields[fieldName] = innerValue
    }
  }

  Object.keys(queryFields).forEach(key => {
    if (!fieldsToResolve[key] && node[key]) {
      resolvedFields[key] = node[key]
    }
  })

  return _.pickBy(resolvedFields, (value, key) => queryFields[key])
}

function resolveField(
  nodeModel,
  schemaComposer,
  schema,
  node,
  gqlField,
  fieldName
) {
  const withResolverContext = require(`./context`)
  return gqlField.resolve(
    node,
    gqlField.args.reduce((acc, arg) => {
      acc[arg.name] = arg.defaultValue
      return acc
    }, {}),
    withResolverContext({
      schema,
      schemaComposer,
      nodeModel,
    }),
    {
      fieldName,
      schema,
      returnType: gqlField.type,
    }
  )
}

const determineResolvableFields = (schemaComposer, schema, type, fields) => {
  const fieldsToResolve = {}
  const gqlFields = type.getFields()
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlFieldType = getNamedType(gqlField.type)
    const typeComposer = schemaComposer.getAnyTC(type.name)
    const needsResolve = typeComposer.getFieldExtension(
      fieldName,
      `needsResolve`
    )
    if (_.isObject(field) && gqlField) {
      const innerResolved = determineResolvableFields(
        schemaComposer,
        schema,
        gqlFieldType,
        field
      )
      if (!_.isEmpty(innerResolved)) {
        fieldsToResolve[fieldName] = innerResolved
      }
    }

    if (!fieldsToResolve[fieldName] && needsResolve) {
      fieldsToResolve[fieldName] = true
    }
  })
  return fieldsToResolve
}

const addRootNodeToInlineObject = (
  rootNodeMap,
  data,
  nodeId,
  isNode = false
) => {
  const isPlainObject = _.isPlainObject(data)

  if (isPlainObject || _.isArray(data)) {
    _.each(data, (o, key) => {
      if (!isNode || key !== `internal`) {
        addRootNodeToInlineObject(rootNodeMap, o, nodeId)
      }
    })
    // don't need to track node itself
    if (!isNode) {
      rootNodeMap.set(data, nodeId)
    }
  }
}

const deepObjectDifference = (from, to) => {
  const result = {}
  Object.keys(from).forEach(key => {
    const toValue = to[key]
    if (toValue) {
      if (_.isPlainObject(toValue)) {
        const deepResult = deepObjectDifference(from[key], toValue)
        if (!_.isEmpty(deepResult)) {
          result[key] = deepResult
        }
      }
    } else {
      result[key] = from[key]
    }
  })
  return result
}

module.exports = {
  LocalNodeModel,
}
