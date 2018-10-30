const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)
const loki = require(`lokijs`)
const uuidv4 = require(`uuid/v4`)

const colls = {
  // Each object has keys `id` and `typeCollName`. It's a way of
  // quickly looking up the collection that a node is contained in.
  nodeMeta: {
    name: `gatsby:nodeMeta`,
    options: {
      unique: [`id`],
      indices: [`id`],
    },
  },
  // The list of all node type collections. Each object has keys
  // `type` and `collName` so you can quickly look up the collection
  // name for a node type
  nodeTypes: {
    name: `gatsby:nodeTypes`,
    options: {
      unique: [`type`, `collName`],
      indices: [`type`],
    },
  },
}

/////////////////////////////////////////////////////////////////////
// DB Initialization
/////////////////////////////////////////////////////////////////////

// Must be set using `start()`
let db

/**
 * Ensures that the collections that support nodes have been
 * created. These are:
 *
 * `nodeIdToType` - A collection whose elements are mappings of node
 * ID to the Type. E.g { id: `id1`, type: `SomeType` }. This allows
 * lookup of the type of a node by
 * db.getCollection(`nodeIdToType`).by(`id`, `id1`) => `SomeType`.
 *
 * `nodeTypes` - A collection of names of types.
 */
function ensureNodeCollections(db) {
  _.forEach(colls, collInfo => {
    const { name, options } = collInfo
    db.addCollection(name, options)
  })
}

function startFileDb(saveFile) {
  return new Promise((resolve, reject) => {
    const dbOptions = {
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

async function startInMemory() {
  db = new loki(uuidv4())
}

/**
 * Starts a loki database. If the file already exists, it will be
 * loaded as the database state. If not, a new database will be
 * created.
 *
 * @param {string} saveFile on disk file that the database will be
 * saved and loaded from.
 * @returns {Promise} promise that is resolved once the database and
 * (optionally) the existing state has been loaded
 */
async function start({ saveFile } = {}) {
  if (saveFile && !_.isString(saveFile)) {
    throw new Error(`saveFile must be a path`)
  }
  if (saveFile) {
    const saveDir = path.dirname(saveFile)
    await fs.ensureDir(saveDir)
    await startFileDb(saveFile)
  } else {
    startInMemory()
  }
  ensureNodeCollections(db)
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

module.exports = {
  start,
  getDb,
  colls,
}
