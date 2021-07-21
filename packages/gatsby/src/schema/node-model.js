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
import { store } from "../redux"
import {
  getDataStore,
  getNode,
  getNodes,
  getNodesByType,
  getTypes,
} from "../datastore"
import { isIterable } from "../datastore/common/iterable"

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
  constructor({ schema, schemaComposer, createPageDependency }) {
    this.schema = schema
    this.schemaComposer = schemaComposer
    this.createPageDependencyActionCreator = createPageDependency

    // this._rootNodeMap = new WeakMap()
    // this._trackedRootNodes = new WeakSet()
    this._prepareNodesQueues = {}
    this._prepareNodesPromises = {}
    this._preparedNodesCache = new Map()
    this.replaceFiltersCache()
  }

  createPageDependency(createPageDependencyArgs) {
    if (createPageDependencyArgs.connection) {
      const nodeTypeNames = toNodeTypeNames(
        this.schema,
        createPageDependencyArgs.connection
      )
      if (nodeTypeNames) {
        nodeTypeNames.forEach(typeName => {
          this.createPageDependencyActionCreator({
            ...createPageDependencyArgs,
            connection: typeName,
          })
        })
        return
      }
    }

    this.createPageDependencyActionCreator(createPageDependencyArgs)
  }

  /**
   * Replace the cache either with the value passed on (mainly for tests) or
   * an empty new Map.
   *
   * @param {undefined | null | FiltersCache} map
   *   (This cached is used in redux/nodes.js and caches a set of buckets (Sets)
   *   of Nodes based on filter and tracks this for each set of types which are
   *   actually queried. If the filter targets `id` directly, only one Node is
   *   cached instead of a Set of Nodes. If null, don't create or use a cache.
   */
  replaceFiltersCache(map = new Map()) {
    this._filtersCache = map // See redux/nodes.js for usage
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

    const node = getNodeById(id)

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
      ? ids.map(id => getNodeById(id)).filter(Boolean)
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
   * this adds connectionType tracking by default if type is passed.
   *
   * @param {Object} args
   * @param {(string|GraphQLOutputType)} [args.type] Optional type of the nodes
   * @param {PageDependencies} [pageDependencies]
   * @returns {Node[]}
   */
  getAllNodes(args, pageDependencies = {}) {
    // TODO: deprecate this method in favor of runQuery
    const { type = `Node` } = args || {}

    let result
    if (type === `Node`) {
      result = getNodes()
    } else {
      const nodeTypeNames = toNodeTypeNames(this.schema, type)
      const nodesByType = nodeTypeNames.map(typeName =>
        getNodesByType(typeName)
      )
      const nodes = [].concat(...nodesByType)
      result = nodes.filter(Boolean)
    }

    if (result) {
      result.forEach(node => this.trackInlineObjectsInRootNode(node))
    }

    if (typeof pageDependencies.connectionType === `undefined`) {
      pageDependencies.connectionType =
        typeof type === `string` ? type : type.name
    }

    return this.trackPageDependencies(result, pageDependencies)
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
  async runQuery(args, pageDependencies = {}) {
    // TODO: show deprecation warning in v4
    // reporter.warn(
    //   `nodeModel.runQuery() is deprecated. Use nodeModel.findAll() or nodeModel.findOne() instead`
    // )
    if (args.firstOnly) {
      return this.findOne(args, pageDependencies)
    }
    const { skip, limit, ...query } = args.query
    const result = await this.findAll({ ...args, query }, pageDependencies)
    return Array.from(result.entries)
  }

  async _query(args) {
    const { query, type, stats, tracer } = args || {}

    // We don't support querying union types (yet?), because the combined types
    // need not have any fields in common.
    const gqlType = typeof type === `string` ? this.schema.getType(type) : type
    invariant(
      !(gqlType instanceof GraphQLUnionType),
      `Querying GraphQLUnion types is not supported.`
    )

    const nodeTypeNames = toNodeTypeNames(this.schema, gqlType)

    let materializationActivity
    if (tracer) {
      materializationActivity = reporter.phantomActivity(`Materialization`, {
        parentSpan: tracer.getParentActivity().span,
      })
      materializationActivity.start()
    }
    const fields = getQueryFields({
      filter: query.filter,
      sort: query.sort,
      group: query.group,
      distinct: query.distinct,
      max: query.max,
      min: query.min,
      sum: query.sum,
    })
    const fieldsToResolve = determineResolvableFields(
      this.schemaComposer,
      this.schema,
      gqlType,
      fields,
      nodeTypeNames
    )

    for (const nodeTypeName of nodeTypeNames) {
      const gqlNodeType = this.schema.getType(nodeTypeName)
      await this.prepareNodes(gqlNodeType, fields, fieldsToResolve)
    }

    if (materializationActivity) {
      materializationActivity.end()
    }

    let runQueryActivity
    if (tracer) {
      runQueryActivity = reporter.phantomActivity(`runQuery`, {
        parentSpan: tracer.getParentActivity().span,
      })
      runQueryActivity.start()
    }

    const { entries, totalCount } = await getDataStore().runQuery({
      queryArgs: query,
      gqlSchema: this.schema,
      gqlComposer: this.schemaComposer,
      gqlType,
      resolvedFields: fieldsToResolve,
      nodeTypeNames,
      filtersCache: this._filtersCache,
      stats,
    })

    if (runQueryActivity) {
      runQueryActivity.end()
    }

    return {
      gqlType,
      entries: entries.map(node => {
        // With GatsbyIterable it happens lazily as we iterate
        this.trackInlineObjectsInRootNode(node)
        return node
      }),
      totalCount,
    }
  }

  async findAll(args, pageDependencies = {}) {
    // TODO: add this as a public API in v4 (together with deprecating runQuery)
    const { gqlType, ...result } = await this._query(args, pageDependencies)

    // Tracking connections by default:
    if (typeof pageDependencies.connectionType === `undefined`) {
      pageDependencies.connectionType = gqlType.name
    }
    this.trackPageDependencies(result.entries, pageDependencies)
    return result
  }

  async findOne(args, pageDependencies = {}) {
    // TODO: add this as a public API in v4 (together with deprecating runQuery)
    const { query } = args
    if (query.sort?.fields?.length > 0) {
      // If we support sorting and return the first node based on sorting
      // we'll have to always track connection not an individual node
      reporter.warn(
        `nodeModel.findOne() does not support sorting. Use nodeModel.findAll({ query: { limit: 1 } }) instead`
      )
      // TODO: throw in v4
      // throw new Error(
      //   `nodeModel.findOne() does not support sorting. Use nodeModel.findAll({ query: { limit: 1 } }) instead`
      // )
    }
    const { gqlType, entries } = await this._query({
      ...args,
      query: { ...query, skip: 0, limit: 1, sort: undefined },
    })
    const result = Array.from(entries)
    const first = result[0] ?? null

    if (!first) {
      // Couldn't find matching node.
      //  This leads to a state where data tracking for this query gets empty.
      //  It means we will NEVER re-run this query on any data updates
      //  (even if a new node matching this query is added at some point).
      //  To workaround this, we have to add a connection tracking to re-run
      //  the query whenever any node of this type changes.
      pageDependencies.connectionType = gqlType.name
    }
    return this.trackPageDependencies(first, pageDependencies)
  }

  prepareNodes(type, queryFields, fieldsToResolve) {
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
          await this._doResolvePrepareNodesQueue(type)
          resolve()
        })
      })
    }

    return this._prepareNodesPromises[typeName]
  }

  async _doResolvePrepareNodesQueue(type) {
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
      const resolvedNodes = new Map()
      for (const node of getDataStore().iterateNodesByType(typeName)) {
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
        if (!node.__gatsby_resolved) {
          node.__gatsby_resolved = {}
        }
        resolvedNodes.set(
          node.id,
          _.merge(node.__gatsby_resolved, resolvedFields)
        )
      }
      if (resolvedNodes.size) {
        await saveResolvedNodes(typeName, resolvedNodes)
      }
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
    return getTypes()
  }

  /**
   * Adds link between inline objects/arrays contained in Node object
   * and that Node object.
   * @param {Node} node Root Node
   */
  trackInlineObjectsInRootNode() {
    // if (!this._trackedRootNodes.has(node)) {
    //   addRootNodeToInlineObject(
    //     this._rootNodeMap,
    //     node,
    //     node.id,
    //     true,
    //     new Set()
    //   )
    //   this._trackedRootNodes.add(node)
    // }
  }

  /**
   * Finds top most ancestor of node that contains passed Object or Array
   * @param {(Object|Array)} obj Object/Array belonging to Node object or Node object
   * @param {nodePredicate} [predicate] Optional callback to check if ancestor meets defined conditions
   * @returns {Node} Top most ancestor if predicate is not specified
   * or first node that meet predicate conditions if predicate is specified
   */
  findRootNodeAncestor(obj, predicate = null) {
    // let iterations = 0
    // let node = obj

    // while (iterations++ < 100) {
    //   if (predicate && predicate(node)) return node

    //   const parent = getNodeById(node.parent)
    //   const id = this._rootNodeMap.get(node)
    //   const trackedParent = getNodeById(id)

    //   if (!parent && !trackedParent) {
    //     const isMatchingRoot = !predicate || predicate(node)
    //     return isMatchingRoot ? node : null
    //   }

    //   node = parent || trackedParent
    // }

    // reporter.error(
    //   `It looks like you have a node that's set its parent as itself:\n\n` +
    //     node
    // )
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
    const { path, connectionType, track = true } = pageDependencies
    if (path && track) {
      if (connectionType) {
        this.createPageDependency({ path, connection: connectionType })
      } else {
        const nodes = isIterable(result) ? result : [result]
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

  _getFullDependencies(pageDependencies) {
    return {
      path: this.context.path,
      ...(pageDependencies || {}),
    }
  }

  getNodeById(args, pageDependencies) {
    return this.nodeModel.getNodeById(
      args,
      this._getFullDependencies(pageDependencies)
    )
  }

  getNodesByIds(args, pageDependencies) {
    return this.nodeModel.getNodesByIds(
      args,
      this._getFullDependencies(pageDependencies)
    )
  }

  getAllNodes(args, pageDependencies) {
    return this.nodeModel.getAllNodes(
      args,
      this._getFullDependencies(pageDependencies)
    )
  }

  runQuery(args, pageDependencies) {
    return this.nodeModel.runQuery(
      args,
      this._getFullDependencies(pageDependencies)
    )
  }

  findOne(args, pageDependencies) {
    return this.nodeModel.findOne(
      args,
      this._getFullDependencies(pageDependencies)
    )
  }

  findAll(args, pageDependencies) {
    return this.nodeModel.findAll(
      args,
      this._getFullDependencies(pageDependencies)
    )
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
    return this.nodeModel.trackPageDependencies(
      result,
      this._getFullDependencies(pageDependencies)
    )
  }
}

const getNodeById = id => (id != null ? getNode(id) : null)

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

const getQueryFields = ({ filter, sort, group, distinct, max, min, sum }) => {
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

  if (max && !Array.isArray(max)) {
    max = [max]
  } else if (max == null) {
    max = []
  }

  if (min && !Array.isArray(min)) {
    min = [min]
  } else if (min == null) {
    min = []
  }

  if (sum && !Array.isArray(sum)) {
    sum = [sum]
  } else if (sum == null) {
    sum = []
  }

  return _.merge(
    filterFields,
    ...sortFields.map(pathToObject),
    ...group.map(pathToObject),
    ...distinct.map(pathToObject),
    ...max.map(pathToObject),
    ...min.map(pathToObject),
    ...sum.map(pathToObject)
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
  const resolvedFields = {}
  for (const fieldName of Object.keys(fieldsToResolve)) {
    const fieldToResolve = fieldsToResolve[fieldName]
    const queryField = queryFields[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlNonNullType = getNullableType(gqlField.type)
    const gqlFieldType = getNamedType(gqlField.type)
    let innerValue = await resolveField(
      nodeModel,
      schemaComposer,
      schema,
      node,
      gqlField,
      fieldName
    )
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
            item == null
              ? item
              : resolveRecursive(
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

  for (const fieldName of Object.keys(queryFields)) {
    if (!fieldsToResolve[fieldName] && node[fieldName]) {
      // It is possible that this field still has a custom resolver
      // See https://github.com/gatsbyjs/gatsby/issues/27368
      resolvedFields[fieldName] = await resolveField(
        nodeModel,
        schemaComposer,
        schema,
        node,
        gqlFields[fieldName],
        fieldName
      )
    }
  }

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
  if (!gqlField?.resolve) {
    return node[fieldName]
  }
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

const determineResolvableFields = (
  schemaComposer,
  schema,
  type,
  fields,
  nodeTypeNames,
  isNestedType = false
) => {
  const fieldsToResolve = {}
  const gqlFields = type.getFields()
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlFieldType = getNamedType(gqlField.type)
    const typeComposer = schemaComposer.getAnyTC(type.name)
    const possibleTCs = [
      typeComposer,
      ...nodeTypeNames.map(name => schemaComposer.getAnyTC(name)),
    ]
    let needsResolve = false
    for (const tc of possibleTCs) {
      needsResolve = tc.getFieldExtension(fieldName, `needsResolve`) || false
      if (needsResolve) {
        break
      }
    }

    if (_.isObject(field) && gqlField) {
      const innerResolved = determineResolvableFields(
        schemaComposer,
        schema,
        gqlFieldType,
        field,
        toNodeTypeNames(schema, gqlFieldType),
        true
      )
      if (!_.isEmpty(innerResolved)) {
        fieldsToResolve[fieldName] = innerResolved
      }
    }

    if (!fieldsToResolve[fieldName] && needsResolve) {
      fieldsToResolve[fieldName] = true
    }
    if (!fieldsToResolve[fieldName] && isNestedType) {
      // If parent field needs to be resolved - all nested fields should be added as well
      // See https://github.com/gatsbyjs/gatsby/issues/26056
      fieldsToResolve[fieldName] = true
    }
  })
  return fieldsToResolve
}

// const addRootNodeToInlineObject = (
//   rootNodeMap,
//   data,
//   nodeId,
//   isNode /* : boolean */,
//   path /* : Set<mixed> */
// ) /* : void */ => {
//   const isPlainObject = _.isPlainObject(data)

//   if (isPlainObject || _.isArray(data)) {
//     if (path.has(data)) return
//     path.add(data)

//     _.each(data, (o, key) => {
//       if (!isNode || key !== `internal`) {
//         addRootNodeToInlineObject(rootNodeMap, o, nodeId, false, path)
//       }
//     })

//     // don't need to track node itself
//     if (!isNode) {
//       rootNodeMap.set(data, nodeId)
//     }
//   }
// }

const saveResolvedNodes = async (typeName, resolvedNodes) => {
  store.dispatch({
    type: `SET_RESOLVED_NODES`,
    payload: {
      key: typeName,
      nodes: resolvedNodes,
    },
  })
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
