const _ = require(`lodash`)
const invariant = require(`invariant`)
const { getNodesCollection, getNodeTypesCollection } = require(`./index`)

/////////////////////////////////////////////////////////////////////
// Node collection metadata
/////////////////////////////////////////////////////////////////////

function makeTypesViewName(types) {
  return `gatsby.nodesTypeView.${types.sort().join(`.`)}`
}

/**
 * Returns a reference to the collection that contains nodes of the
 * specified type, where type is the node's `node.internal.type`
 */
function getNodeTypeCollection(typeOrTypes) {
  let types
  if (Array.isArray(typeOrTypes)) {
    types = typeOrTypes
  } else {
    types = [typeOrTypes]
  }
  const typesViewName = makeTypesViewName(types)
  const coll = getNodesCollection()
  let view = coll.getDynamicView(typesViewName)
  if (!view) {
    view = coll.addDynamicView(typesViewName)
    view.applySimpleSort(`id`)
    view.applyFind({
      "internal.type": { $in: types },
    })
  }
  return view
}
/**
 * Deletes all nodes from all the node type collections, including the
 * id -> type metadata. There will be no nodes related data in loki
 * after this is called
 */
function deleteAll() {
  const nodeColl = getNodesCollection()
  if (nodeColl) {
    nodeColl.clear()
  }
  const nodeTypesColl = getNodeTypesCollection()
  if (nodeTypesColl) {
    nodeTypesColl.clear()
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
  const nodeColl = getNodesCollection()
  return nodeColl.by(`id`, id)
}

/**
 * Returns all nodes of a type (where `typeName ==
 * node.internal.type`). This is an O(1) operation since nodes are
 * already stored in separate collections by type
 */
function getNodesByType(typeName) {
  invariant(typeName, `typeName is null`)
  const nodeColl = getNodeTypeCollection(typeName)
  return nodeColl.data()
}

/**
 * Returns the collection of all nodes. This should be deprecated and
 * `getNodesByType` should be used instead. Or at least where possible
 */
function getNodes() {
  return getNodesCollection().data
}

/**
 * Returns the unique collection of all node types
 */
function getTypes() {
  const nodeTypes = getNodeTypesCollection().data
  return nodeTypes.map(nodeType => nodeType.type)
}

/**
 * Looks up the node by id, records a dependency between the node and
 * the path, and then returns the node
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
 * @param {Object} node The node to add. Must have an `id` and
 * `internal.type`
 */
function createNode(node, oldNode) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  // Loki doesn't provide "upsert", so if the node already exists, we
  // delete and then create it
  if (oldNode) {
    deleteNode(oldNode)
  }

  const nodeTypeColl = getNodeTypesCollection()
  if (!nodeTypeColl.by(`type`, node.internal.type)) {
    nodeTypeColl.insert({ type: node.internal.type })
  }

  const nodeColl = getNodesCollection()
  return nodeColl.insert(node)
}

/**
 * Updates a node in the DB. The contents of `node` will completely
 * overwrite value in the DB. Note, `node` must be a loki node. i.e it
 * has `$loki` and `meta` fields.
 *
 * @param {Object} node The new node information. This should be all
 * the node information. Not just changes
 */
function updateNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const nodeColl = getNodesCollection()
  nodeColl.update(node)
}

/**
 * Deletes a node from its type collection and removes its id ->
 * collName mapping. Function is idempotent. If the node has already
 * been deleted, this is a noop.
 *
 * @param {Object} the node to delete. Must have an `id` and
 * `internal.type`
 */
function deleteNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const nodeColl = getNodesCollection()

  if (nodeColl.by(`id`, node.id)) {
    nodeColl.remove(node)
  }
  // idempotent. Do nothing if node wasn't already in DB
}

/**
 * deprecated
 */
function deleteNodes(nodes) {
  for (const node of nodes) {
    deleteNode(node)
  }
}

const updateNodesByType = async (typeName, updater) => {
  const nodes = getNodesByType(typeName)
  const updated = await Promise.all(nodes.map(node => updater(node)))
  const nodeColl = getNodesCollection()
  nodeColl.update(updated)
}

// Cleared on DELETE_CACHE
let fieldUsages = null
const FIELD_INDEX_THRESHOLD = 5

// Every time we run a query, we increment a counter for each of its
// fields, so that we can determine which fields are used the
// most. Any time a field is seen more than `FIELD_INDEX_THRESHOLD`
// times, we create a loki index so that future queries with that
// field will execute faster.
function ensureFieldIndexes(lokiArgs, sortArgs) {
  if (fieldUsages == null) {
    const { emitter } = require(`../../redux`)

    emitter.on(`DELETE_CACHE`, () => {
      fieldUsages = {}
      for (var field in fieldUsages) {
        delete fieldUsages[field]
      }
    })
  }

  const nodeColl = getNodesCollection()

  _.forEach(lokiArgs, (v, fieldName) => {
    // Increment the usages of the field
    _.update(fieldUsages, fieldName, n => (n ? n + 1 : 1))
    // If we have crossed the threshold, then create the index
    if (_.get(fieldUsages, fieldName) === FIELD_INDEX_THRESHOLD) {
      // Loki ensures that this is a noop if index already exists. E.g
      // if it was previously added via a sort field
      nodeColl.ensureIndex(fieldName)
    }
  })
}

/////////////////////////////////////////////////////////////////////
// Reducer
/////////////////////////////////////////////////////////////////////

function reducer(state = new Map(), action) {
  switch (action.type) {
    case `DELETE_CACHE`:
      deleteAll()
      return null

    case `CREATE_NODE`: {
      createNode(action.payload, action.oldNode)
      return null
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      updateNode(action.payload)
      return null

    case `DELETE_NODE`: {
      if (action.payload) {
        deleteNode(action.payload)
      }
      return null
    }

    case `DELETE_NODES`: {
      deleteNodes(action.payload)
      return null
    }

    default:
      return null
  }
}

/////////////////////////////////////////////////////////////////////
// Exports
/////////////////////////////////////////////////////////////////////

module.exports = {
  getNodeTypeCollection,

  getNodes,
  getNode,
  getNodesByType,
  getTypes,
  hasNodeChanged,
  getNodeAndSavePathDependency,

  createNode,
  updateNode,
  deleteNode,

  deleteAll,

  reducer,

  updateNodesByType,

  ensureFieldIndexes,
}
