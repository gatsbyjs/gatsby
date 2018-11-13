const _ = require(`lodash`)
const invariant = require(`invariant`)
const { getDb, colls } = require(`./index`)

/////////////////////////////////////////////////////////////////////
// Node collection metadata
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

/**
 * Returns the name of the collection that contains nodes of the
 * specified type, where type is the node's node.internal.type
 */
function getTypeCollName(type) {
  const nodeTypesColl = getDb().getCollection(colls.nodeTypes.name)
  invariant(nodeTypesColl, `Collection ${colls.nodeTypes.name} should exist`)
  let nodeTypeInfo = nodeTypesColl.by(`type`, type)
  return nodeTypeInfo ? nodeTypeInfo.collName : undefined
}

/**
 * Returns the collection that contains nodes of the specified type,
 * where type is the node's node.internal.type
 */
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
  const db = getDb()
  if (db) {
    deleteNodeTypeCollections(true)
    db.getCollection(colls.nodeMeta.name).clear()
  }
}

/////////////////////////////////////////////////////////////////////
// Queries
/////////////////////////////////////////////////////////////////////

/**
 * Returns the node with `id` == id, or null if not found
 */
function getNode(id) {
  if (!id) {
    return null
  }
  const nodeMetaColl = getDb().getCollection(colls.nodeMeta.name)
  invariant(nodeMetaColl, `nodeMeta collection should exist`)
  const nodeMeta = nodeMetaColl.by(`id`, id)
  if (nodeMeta) {
    const { typeCollName } = nodeMeta
    const typeColl = getDb().getCollection(typeCollName)
    invariant(
      typeColl,
      `type collection ${typeCollName} referenced by nodeMeta but doesn't exist`
    )
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
  const collName = getTypeCollName(typeName)
  const coll = getDb().getCollection(collName)
  if (!coll) return []
  return coll.data
}

/**
 * Returns the collection of all nodes. This should be deprecated
 */
function getNodes() {
  const nodeTypes = getDb().getCollection(colls.nodeTypes.name).data
  return _.flatMap(nodeTypes, nodeType => getNodesByType(nodeType.type))
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
  const createPageDependency = require(`../../redux/actions/add-page-dependency`)
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
// Create/Update/Delete
/////////////////////////////////////////////////////////////////////

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
function updateNode(node, oldNode) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let coll = getNodeTypeCollection(type)
  if (!coll) {
    invariant(coll, `${type} collection doesn't exist. When trying to update`)
  }

  if (oldNode) {
    const lokiKeys = new Set([`$loki`, `meta`, `id`])
    _.forEach(oldNode, (v, k) => {
      if (!lokiKeys.has(k)) {
        delete oldNode[k]
      }
    })
    Object.assign(oldNode, node)
    coll.update(oldNode)
  } else {
    coll.update(node)
  }
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
  }
  // idempotent. Do nothing if node wasn't already in DB
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
      if (action.oldNode) {
        updateNode(action.payload, action.oldNode)
      } else {
        createNode(action.payload)
      }
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
  getNodeTypeCollection,

  getNodes,
  getNode,
  getNodesByType,
  hasNodeChanged,
  getNodeAndSavePathDependency,

  createNode,
  updateNode,
  deleteNode,

  deleteNodeTypeCollections,
  deleteAll,

  reducer,
}
