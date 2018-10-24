const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)
const invariant = require(`invariant`)
const loki = require(`lokijs`)
const lokiFsStructuredAdapter = require(`lokijs/src/loki-fs-structured-adapter`)

/////////////////////////////////////////////////////////////////////
// DB Initialization
/////////////////////////////////////////////////////////////////////

// Must be set using `start()`
let db

function startDb(saveFile) {
  return new Promise((resolve, reject) => {
    const adapter = new lokiFsStructuredAdapter()
    const dbOptions = {
      adapter,
      autoload: true,
      autoloadCallback: err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
      autosave: true,
      autosaveInterval: 1000,
    }
    db = new loki(saveFile, dbOptions)
  })
}

/**
 * Starts a loki database. If the file already exists, it will be
 * loaded as the database state. If not, a new database will be
 * created.
 *
 * @param {string} saveFile on disk file that the database will be
 * saved to. We use a loki-fs-structured-adapter which will result in
 * db.0, db.1, db.2... being written to disk in the containing folder.
 * @returns {Promise} promise that is resolved once the database and
 * (optionally) the existing state has been loaded
 */
async function start({ saveFile }) {
  if (!_.isString(saveFile)) {
    throw new Error(`saveFile must be a path`)
  }
  const saveDir = path.dirname(saveFile)
  await fs.ensureDir(saveDir)
  await startDb(saveFile)
}

/**
 * Returns a reference to the database. If undefined, the db has not been
 * initalized yet. Call `start()`
 *
 * @returns {Object} database, or undefined
 */
function getDb() {
  return db
}

/**
 * Deletes all collections.
 */
function deleteAllCollections() {
  if (db) {
    _.forEach(db.listCollections(), collInfo => {
      const coll = db.getCollection(collInfo.name)
      coll.clear({ removeIndices: true })
      db.removeCollection(collInfo.name)
    })
  }
}

/**
 * Deletes all collections that are empty
 */
function deleteEmptyCollections() {
  if (db) {
    _.forEach(db.listCollections(), collInfo => {
      const coll = db.getCollection(collInfo.name)
      if (coll.count() === 0) {
        db.removeCollection(collInfo.name)
      }
    })
  }
}

/////////////////////////////////////////////////////////////////////
// Insertions/Updates/Deletions
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

  let coll = db.getCollection(type)
  if (!coll) {
    coll = db.addCollection(type, { unique: [`id`], indices: [`id`] })
  }

  return coll.insert(node)
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

  let coll = db.getCollection(type)
  if (!coll) {
    invariant(coll, `${type} collection doesn't exist. When trying to update`)
  }

  if (!oldNode) {
    oldNode = getNode(node.id)
  }
  const updateNode = _.merge(oldNode, node)

  coll.update(updateNode)
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

  let coll = db.getCollection(type)
  if (!coll) {
    invariant(coll, `${type} collection doesn't exist. When trying to delete`)
  }

  if (coll.by(`id`, node.id)) {
    coll.remove(node)
  } else {
    console.log(
      `WARN: deletion of node failed because it wasn't in coll. Node = [${node}]`
    )
  }
}

/////////////////////////////////////////////////////////////////////
// Queries
/////////////////////////////////////////////////////////////////////

/**
 * Returns the node with `id` == id, or null if not found
 */
function getNode(id) {
  invariant(id, `id is null`)

  // We store a collection per node type. So to lookup the node by ID,
  // we first need to find which collection that node is in, which is
  // accomplished by iterating through all of them until one is found.
  //
  // This is obviously slow. We should consider creating a lookup
  // collection mapping IDs to their collections. This would require
  // an additional operation per insert, but would result in faster
  // lookups
  const collInfo = _.find(db.listCollections(), collInfo => {
    const coll = db.getCollection(collInfo.name)
    return coll.by(`id`, id)
  })
  if (collInfo) {
    const coll = db.getCollection(collInfo.name)
    return coll.by(`id`, id)
  } else {
    return undefined
  }
}

/**
 * Returns all nodes of a type (where typeName == node.internal.type)
 */
function getNodesByType(typeName) {
  const coll = db.getCollection(typeName)
  if (!coll) return null
  return coll.data
}

/**
 * Returns the collection of all nodes. This should be deprecated
 */
function getNodes() {
  return _.flatMap(db.listCollections(), collInfo =>
    getNodesByType(collInfo.name)
  )
}

/**
 * Returns the list of node typeNames
 */
function getNodeTypes() {
  return _.map(db.listCollections(), collInfo => collInfo.name)
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

module.exports = {
  start,
  getDb,
  deleteAllCollections,
  deleteEmptyCollections,

  createNode,
  updateNode,
  deleteNode,

  getNode,
  getNodes,
  getNodeTypes,
  getNodesByType,
  getNodeAndSavePathDependency,
  hasNodeChanged,
}
