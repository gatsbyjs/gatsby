const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)
const loki = require(`lokijs`)
const lokiFsStructuredAdapter = require(`lokijs/src/loki-fs-structured-adapter`)
const invariant = require(`invariant`)

console.log(`creating db`)

// Must be set using `start`
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

async function start({ saveFile }) {
  if (!_.isString(saveFile)) {
    throw new Error(`saveFile must be a path`)
  }
  const saveDir = path.dirname(saveFile)
  await fs.ensureDir(saveDir)
  await startDb(saveFile)
}

function getDb() {
  return db
}

// Deletes all data from all collections, including indexes
function clearAll() {
  if (db) {
    _.forEach(db.listCollections(), collInfo => {
      const coll = db.getCollection(collInfo.name)
      coll.clear({ removeIndices: true })
    })
  }
}

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

// TODO: Create ID to coll lookup
function getNode(id) {
  invariant(id, `id is null`)
  const collInfo = _.find(db.listCollections(), collInfo => {
    const coll = db.getCollection(collInfo.name)
    return coll.by(`id`, id)
  })
  if (collInfo) {
    const coll = db.getCollection(collInfo.name)
    return coll.by(`id`, id)
  } else {
    return null
  }
}

function getNodesByType(typeName) {
  const coll = db.getCollection(typeName)
  if (!coll) return null
  return coll.data
}

function getNodes() {
  return _.flatMap(db.listCollections(), collInfo =>
    getNodesByType(collInfo.name)
  )
}

function getNodeGroups() {
  return _.reduce(
    db.listCollections(),
    (groups, collInfo) => {
      const type = collInfo.name
      groups[type] = db.getCollection(type).data
      return groups
    },
    {}
  )
}

function getNodeAndSavePathDependency(id, path) {
  const {
    createPageDependency,
  } = require(`../redux/actions/add-page-dependency`)
  const node = getNode(id)
  createPageDependency({ path, nodeId: id })
  return node
}

/**
 * Determine if node has changed.
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
  getDb,
  clearAll,
  getNode,
  getNodes,
  getNodesByType,
  getNodeGroups,
  getNodeAndSavePathDependency,
  hasNodeChanged,
  deleteEmptyCollections,
  start,
}
