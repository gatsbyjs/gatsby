const _ = require(`lodash`)
const invariant = require(`invariant`)
const Promise = require(`bluebird`)
const { getDb, colls } = require(`./index`)
const prepareRegex = require(`../../utils/prepare-regex`)

/////////////////////////////////////////////////////////////////////
// Queries
/////////////////////////////////////////////////////////////////////

/**
 * Returns the node with `id` == id, or null if not found
 */
function getNode(id) {
  invariant(id, `id is null`)

  const nodeMetaColl = getDb().getCollection(colls.nodeMeta.name)
  const typeCollName = nodeMetaColl.by(`id`, id)
  if (typeCollName) {
    const typeColl = getDb().getCollection(typeCollName)
    invariant(typeColl)
    return typeColl.by(`id`, id)
  } else {
    return undefined
  }
}

/**
 * Returns all nodes of a type (where typeName == node.internal.type)
 */
function getNodesByType(typeName) {
  invariant(typeName, `typeName is null`)
  const coll = getDb().getCollection(typeName)
  if (!coll) return null
  return coll.data
}

/**
 * Returns the collection of all nodes. This should be deprecated
 */
function getNodes() {
  return _.flatMap(getDb().listCollections(), collInfo =>
    getNodesByType(collInfo.name)
  )
}

/**
 * Looks up the node by id, records a dependency between the node and
 * the path, and then returns the path
 *
 * @param {string} id node id to lookup
 * @param {string} path the page path to record a node dependency
 * against
 * @returns {Object} node or undefined if not found
 */
function getNodeAndSavePathDependency(id, path) {
  invariant(id, `id is null`)
  invariant(id, `path is null`)
  const {
    createPageDependency,
  } = require(`../redux/actions/add-page-dependency`)
  const node = getNode(id)
  createPageDependency({ path, nodeId: id })
  return node
}

/**
 * Determine if node has changed (by comparing its
 * `internal.contentDigest`
 *
 * @param {string} id
 * @param {string} digest
 * @returns {boolean}
 */
function hasNodeChanged(id, digest) {
  const node = getNode(id)
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

/////////////////////////////////////////////////////////////////////
// Query Filter
/////////////////////////////////////////////////////////////////////

// Takes a raw graphql filter and converts it into a mongo-like args
// object. E.g `eq` becomes `$eq`. gqlFilter should be the raw graphql
// filter returned from graphql-js. e.g:
//
// {
//   internal: {
//     type: {
//       eq: "TestNode"
//     },
//     content: {
//       glob: "et"
//     }
//   },
//   id: {
//     glob: "12*"
//   }
// }
//
// would return
//
// {
//   internal: {
//     type: {
//       $eq: "TestNode"  // append $ to eq
//     },
//     content: {
//       $regex: new MiniMatch(v) // convert glob to regex
//     }
//   },
//   id: {
//     $regex: // as above
//   }
// }
function toMongoArgs(gqlFilter) {
  const mongoArgs = {}
  _.each(gqlFilter, (v, k) => {
    if (_.isPlainObject(v)) {
      if (k === `elemMatch`) {
        k = `$elemMatch`
      }
      mongoArgs[k] = toMongoArgs(v)
    } else {
      // Compile regex first.
      if (k === `regex`) {
        mongoArgs[`$regex`] = prepareRegex(v)
      } else if (k === `glob`) {
        const Minimatch = require(`minimatch`).Minimatch
        const mm = new Minimatch(v)
        mongoArgs[`$regex`] = mm.makeRe()
      } else if (k === `in`) {
        mongoArgs[`$contains`] = v
      } else {
        mongoArgs[`$${k}`] = v
      }
    }
  })
  return mongoArgs
}

// Converts a nested mongo args object into a dotted notation. acc
// (accumulator) must be a reference to an empty object. The converted
// fields will be added to it. E.g
//
// {
//   internal: {
//     type: {
//       $eq: "TestNode"
//     },
//     content: {
//       $regex: new MiniMatch(v)
//     }
//   },
//   id: {
//     $regex: newMiniMatch(v)
//   }
// }
//
// After execution, acc would be:
//
// {
//   "internal.type": {
//     $eq: "TestNode"
//   },
//   "internal.content": {
//     $regex: new MiniMatch(v)
//   },
//   "id": {
//     $regex: // as above
//   }
// }
function dotNestedFields(acc, o, path = ``) {
  if (_.isPlainObject(o)) {
    if (_.isPlainObject(_.sample(o))) {
      _.forEach(o, (v, k) => {
        dotNestedFields(acc, v, path + `.` + k)
      })
    } else {
      acc[_.trimStart(path, `.`)] = o
    }
  }
}

// Converts graphQL args to a loki query
function convertArgs(gqlArgs) {
  const dottedFields = {}
  dotNestedFields(dottedFields, toMongoArgs(gqlArgs.filter))
  return dottedFields
}

// Converts graphql Sort args into the form expected by loki, which is
// a vector where the first value is a field name, and the second is a
// boolean `isDesc`. Nested fields delimited by `___` are replaced by
// periods. E.g
//
// {
//   fields: [ `frontmatter___date`, `id` ],
//   order: `desc`
// }
//
// would return
//
// [ [ `frontmatter.date`, true ], [ `id`, true ] ]
function toSortFields(sortArgs) {
  const { fields, order } = sortArgs
  return _.map(fields, field => [
    field.replace(/___/g, `.`),
    _.lowerCase(order) === `desc`,
  ])
}

// Ensure there is an index for each query field. If the index already
// exists, this is a noop (handled by lokijs).
function ensureIndexes(coll, findArgs) {
  _.forEach(findArgs, (v, fieldName) => {
    coll.ensureIndex(fieldName)
  })
}

/**
 * Runs the graphql query over the loki nodes db.
 *
 * @param {Object} args. Object with:
 *
 * {Object} gqlType: built during `./build-node-types.js`
 *
 * {Object} queryArgs: The raw graphql query as a js object. E.g `{
 * filter: { fields { slug: { eq: "/somepath" } } } }`
 *
 * {Object} context: The context from the QueryJob
 *
 * {boolean} firstOnly: Whether to return the first found match, or
 * all matching result.
 *
 * @returns {promise} A promise that will eventually be resolved with
 * a collection of matching objects (even if `firstOnly` is true)
 */
function runQuery({ gqlType, queryArgs, context = {}, firstOnly }) {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const gqlArgs = JSON.parse(JSON.stringify(queryArgs))

  const lokiArgs = convertArgs(gqlArgs)

  const coll = getDb().getCollection(gqlType.name)

  // Allow page creators to specify that they want indexes
  // automatically created for their pages.
  if (context.useQueryIndex) {
    ensureIndexes(coll, lokiArgs)
  }

  let chain = coll.chain().find(lokiArgs, firstOnly)

  const { sort } = gqlArgs
  if (sort) {
    const sortFields = toSortFields(sort)
    _.forEach(sortFields, ([fieldName]) => {
      coll.ensureIndex(fieldName)
    })
    chain = chain.compoundsort(sortFields)
  }

  return Promise.resolve(chain.data())
}

/////////////////////////////////////////////////////////////////////
// Insertions/Updates/Deletions
/////////////////////////////////////////////////////////////////////

function makeTypeCollName(type) {
  return `gatsby:nodeType:${type}`
}

function createNodeTypeCollection(type) {
  const collName = makeTypeCollName(type)
  const nodeTypesColl = getDb().getCollection(colls.nodeTypes.name)
  invariant(nodeTypesColl, `Collection ${colls.nodeTypes.name} should exist`)
  nodeTypesColl.insert({ type, collName })
  const coll = getDb().addCollection(collName, {
    unique: [`id`],
    indices: [`id`],
  })
  // TODO make into transaction
  return coll
}

function getTypeCollName(type) {
  const nodeTypesColl = getDb().getCollection(colls.nodeTypes.name)
  invariant(nodeTypesColl, `Collection ${colls.nodeTypes.name} should exist`)
  let nodeTypeInfo = nodeTypesColl.by(`type`, type)
  return nodeTypeInfo ? nodeTypeInfo.collName : undefined
}

function getNodeTypeCollection(type) {
  const typeCollName = getTypeCollName(type)
  let coll
  if (typeCollName) {
    coll = getDb().getCollection(typeCollName)
    invariant(
      coll,
      `Type [${type}] Collection doesn't exist for nodeTypeInfo: [${typeCollName}]`
    )
    return coll
  } else {
    return undefined
  }
}

function deleteNodeTypeCollections(force = false) {
  const nodeTypesColl = getDb().getCollection(colls.nodeTypes.name)
  const nodeTypes = nodeTypesColl.find()
  for (let nodeType of nodeTypes) {
    let coll = getDb().getCollection(nodeType.collName)
    if (coll.count() === 0 || force) {
      getDb().removeCollection(coll.name)
      nodeTypesColl.remove(nodeType)
    }
  }
}

function deleteAll() {
  deleteNodeTypeCollections(true)
  getDb()
    .getCollection(colls.nodeMeta.name)
    .clear()
}

/**
 * Creates a node in the DB. Will create a collection for the node
 * type if one hasn't been created yet
 *
 * @param {Object} node The ndoe to add. Must have an `id` and
 * `internal.type`
 */
function createNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let nodeTypeColl = getNodeTypeCollection(type)
  if (!nodeTypeColl) {
    nodeTypeColl = createNodeTypeCollection(type)
  }

  // TODO make into transaction
  const nodeMetaColl = getDb().getCollection(colls.nodeMeta.name)
  invariant(nodeMetaColl, `Collection ${colls.nodeMeta.name} should exist`)
  nodeMetaColl.insert({ id: node.id, typeCollName: nodeTypeColl.name })
  return nodeTypeColl.insert(node)
}

/**
 * Updates a node in the DB
 *
 * @param {Object} node The new node information. Will be merged over
 * the old one (shallow merge)
 * @param {Object} oldNode The old node to merge the new node
 * over. Optional. If not supplied, the old node is found by querying
 * by node.id
 */
function updateNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let coll = getNodeTypeCollection(type)
  if (!coll) {
    invariant(coll, `${type} collection doesn't exist. When trying to update`)
  }

  let existingNode = getNode(node.id)
  invariant(existingNode, `Updating node that doesn't exist`)
  for (const [k] of existingNode) {
    if (k !== `$loki` && k !== `meta`) {
      delete existingNode[k]
    }
  }
  Object.assign(existingNode, node)
  coll.update(existingNode)
}

/**
 * Deletes a node from its type collection.
 *
 * @param {Object} the node to delete. Must have an `id`
 */
function deleteNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let nodeTypeColl = getNodeTypeCollection(type)
  if (!nodeTypeColl) {
    invariant(
      nodeTypeColl,
      `${type} collection doesn't exist. When trying to delete`
    )
  }

  if (nodeTypeColl.by(`id`, node.id)) {
    const nodeMetaColl = getDb().getCollection(colls.nodeMeta.name)
    invariant(nodeMetaColl, `Collection ${colls.nodeMeta.name} should exist`)
    // TODO make into transaction
    nodeMetaColl.findAndRemove({ id: node.id })
    nodeTypeColl.remove(node)
  } else {
    console.log(
      `WARN: deletion of node failed because it wasn't in coll. Node = [${node}]`
    )
  }
}

function deleteNodes(nodes) {
  for (const node of nodes) {
    deleteNode(node)
  }
}

/////////////////////////////////////////////////////////////////////
// Reducer
/////////////////////////////////////////////////////////////////////

function reducer(state = new Map(), action) {
  switch (action.type) {
    case `DELETE_CACHE`:
      deleteAll()
      return new Map()

    case `CREATE_NODE`: {
      createNode(action.payload)
      return new Map()
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      updateNode(action.payload)
      return new Map()

    case `DELETE_NODE`: {
      deleteNode(action.payload)
      return new Map()
    }

    case `DELETE_NODES`: {
      deleteNodes(action.payload)
      return new Map()
    }

    default:
      return new Map()
  }
}

module.exports = {
  getNodes,
  getNode,
  getNodesByType,
  hasNodeChanged,
  getNodeAndSavePathDependency,
  convertArgs,
  runQuery,

  createNode,
  updateNode,
  deleteNode,

  deleteNodeTypeCollections,
  deleteAll,

  reducer,
}
