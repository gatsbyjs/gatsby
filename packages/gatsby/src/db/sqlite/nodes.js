const BOLD = `\x1b[;1;1m`
const OVER = `\x1b[32;53m`
const DIM = `\x1b[30;1m`
const BLINK = `\x1b[;5;1m`
const RED = `\x1b[31m`
const GREEN = `\x1b[32m`
const PURPLE = `\x1b[35m`
const RESET = `\x1b[0m`

const log = () => {} //console.debug // debug is an alias for log but is not wrapped by the framework meaning i can log inside a reducer o:)
const Λ = `_` // Field separator for flat object representation (foo.bar=a -> fooΛbar=a). Note: this is lower cased! So don't use upper case here

let shh = true
let dblog = (...args) => shh || console.debug(args)
let db

let INSERT_cache_key
let INSERT
let SELECT_BY_ID
let SELECT_BY_TYPE
let SELECT_ALL
let UPDATE_CHILDREN

let knownFields

function getdb() {
  if (db) return db

  db = require(`better-sqlite3`)(`clitest`, { verbose: dblog })

  global.sqlitedb = db
  // https://old.sqliteonline.com/
  db.prepare(`DROP TABLE IF EXISTS nodes`).run()
  // Room for improvement. For now we add fields on the fly, as TEXT
  knownFields = [`id`, `$gatsby_node$`, `children`, `internal` + Λ + `type`] // Ordered because the prepared statement is ordered
  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS nodes
    (
      \`id\` TEXT PRIMARY KEY UNIQUE NOT NULL,
      \`$gatsby_node$\` TEXT NOT NULL,
      \`children\` TEXT,
      \`internal${Λ}type\` TEXT
    );
`
  ).run()

  INSERT_cache_key = ``
  INSERT = updatePreparedInsert(knownFields)
  SELECT_BY_ID = db.prepare(`
    SELECT \`$gatsby_node$\` FROM nodes WHERE id = ? LIMIT 1
  `)
  SELECT_BY_TYPE = db.prepare(`
    SELECT \`$gatsby_node$\` FROM nodes WHERE \`internal${Λ}type\` = ?
  `)
  SELECT_ALL = db.prepare(`
    SELECT \`$gatsby_node$\` FROM nodes
  `)
  UPDATE_CHILDREN = db.prepare(`
    UPDATE nodes
    SET
      \`$gatsby_node$\` = ?,
      \`children\` = ?
    WHERE id = ?
    LIMIT 1
  `)

  return db
}

// We prepare an INSERT and replace it whenever we add a new field
function updatePreparedInsert(fieldNames) {
  let cols = fieldNames.map(s => `\`` + s + `\``).join(`, `)
  if (cols === INSERT_cache_key) return INSERT // currently prepared
  // log('Updating prepared INSERT for', fieldNames.length, 'fields, out of', knownFields.length, 'known fields')
  INSERT_cache_key = cols
  return getdb().prepare(`
    INSERT INTO nodes (${cols}) VALUES (${fieldNames
    .map(() => `?`)
    .join(`, `)});
  `)
}

function getNodeTypeCollection(...args) {
  log(PURPLE + `sqlite/nodes/getNodeTypeCollection:` + RESET, args)
}

function getNodes(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `getNodes:` + RESET, args)

  let jsons = SELECT_ALL.all()

  // log('all jsons:', jsons)

  let nodes = jsons.map(json => json && JSON.parse(json.$gatsby_node$))

  log(`  -> returning`, nodes.length, `nodes`)

  return nodes
}

function getNode(id, ...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `getNode:` + RESET, [id])

  let json = SELECT_BY_ID.get(id)

  log(`  -->`, !!json)
  // log(' ----->', json)

  let node = json && JSON.parse(json.$gatsby_node$)

  // log(' ----->', node)

  return node
}

function getNodesByType(targetType, ...args) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `getNodesByType:` + RESET,
    [targetType],
    args
  )

  let jsons = SELECT_BY_TYPE.all([targetType])

  let nodes = jsons.map(json => json && JSON.parse(json.$gatsby_node$))

  log(`  -> returning`, nodes.length, `nodes`)

  return nodes
}

function getTypes(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `getTypes:` + RESET, args)

  let query = `SELECT DISTINCT \`internal` + Λ + `type\` FROM nodes`
  log(`  - Query: ` + query)

  let jsons = getdb()
    .prepare(query)
    .all()
  // log('-->', jsons)

  let types = jsons.map(json => json && json[`internal` + Λ + `type`])

  log(`  ->`, [types.join(`, `)])

  return types
}

function hasNodeChanged(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `hasNodeChanged:` + RESET, args)
}

function getNodeAndSavePathDependency(...args) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `getNodeAndSavePathDependency:` + RESET,
    args
  )
}

function createNode(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `createNode:` + RESET, args)
}

function updateNode(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `updateNode:` + RESET, args)
}

function deleteNode(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `deleteNode:` + RESET, args)
}

function deleteNodeTypeCollections(...args) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `deleteNodeTypeCollections:` + RESET,
    args
  )
}

function deleteAll(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `deleteAll:` + RESET, args)
}

function addFieldToTableIfNew(key) {
  // Key is assumed to be lower cased already (db is case insensitive)
  if (knownFields.includes(key)) {
    return false
  }

  let k = key.replace(/`/g, `\\\``)
  log(`# Injecting \`` + k + `\` column into table`)

  // The name can't be prepared (it seems?)
  getdb()
    .prepare(`ALTER TABLE nodes ADD COLUMN \`${k}\` TEXT;`)
    .run()
  knownFields.push(k)
  return true
}

// TODO: dedupe
function blot(obj, prefix = ``, paths = new Map()) {
  // TODO: prevent cyclic loop issues
  Object.keys(obj).forEach(key => {
    let newPrefix = prefix + (prefix ? Λ : ``) + key
    let v = obj[key]
    if (typeof v === `string` || typeof v === `number` || v === null) {
      paths.set(newPrefix, v)
      return
    }
    if (typeof v === `boolean` || v === undefined) {
      paths.set(newPrefix, String(v))
      return
    }
    if (Array.isArray(v)) {
      // We could support arrays more granularly later (int keys == array or smth)
      paths.set(newPrefix, JSON.stringify(v))
      return
    }
    if (typeof v === `object`) {
      // Not null, not array, assue plain object for the sake of it
      blot(v, newPrefix, paths)
      return
    }

    throw new Error(
      `Cannot serialize this type: ` + typeof v + `(path=` + newPrefix + `)`
    )
  })

  return paths
}

function reducer(state = new Map(), action) {
  log(PURPLE + `sqlite/nodes/reducer: ` + BOLD + action.type + RESET)

  let node = action.payload

  switch (action.type) {
    case `LOG`:
      return null

    case `DELETE_CACHE`:
      getdb()
        .prepare(`DELETE FROM nodes;`)
        .run() // This is TRUNCATE TABLE
      return null

    case `CREATE_NODE`: {
      // log(' - Now walking', node)
      // log('   ok wtf?', Object.keys(node))
      // Go through payload (the new node). Create dotted fields for all
      // properties (and nested properties). Those are the fields in our table.
      // Any unknown field should be added as a text field to the table.

      let paths = blot(node, ``)

      // log('So output:', paths)

      // Next step is to make sure the fields are part of the table, add new
      // fields as TEXT, and to build up an argument list for the prepared
      // statement at the same time. Note that nodes may not contain all field
      // names seen so far, so we have to build up an arg and field list.
      let preparedFields = [`$gatsby_node$`]
      let preparedArgs = [JSON.stringify(node)]
      let added = false
      paths.forEach((value, key) => {
        // TODO: protect against cycles (we cant support those, anyways...?)
        let lkey = key.toLowerCase() // sqlite is case insensitive
        if (addFieldToTableIfNew(lkey)) {
          added = true
        }
        preparedArgs.push(value)
        preparedFields.push(lkey)
      })

      // log('testing new prep', preparedArgs.length, preparedArgs.length);

      INSERT = updatePreparedInsert(preparedFields)

      // log("  ->", action.payload)
      // log('  - sending', knownFields.length)
      // log('  - fields with', preparedArgs.length, 'args')
      // log('INSERT:',INSERT)
      INSERT.run(preparedArgs)

      log(`  - Created node with id =`, [node.id])
      return null
    }

    case `ADD_FIELD_TO_NODE`: {
      // Note: Loki would just drop the old node and use the new node
      // We don't need to but we may need to add a new field to the table

      // Note: this adds `{fields: {[addedField]: ...}}` (not directly on node)

      let unqualifiedAddedField = action.addedField
      let qualifiedAddedField = `fields` + Λ + unqualifiedAddedField
      let addedValue = action.payload.fields[unqualifiedAddedField]
      addFieldToTableIfNew(qualifiedAddedField)

      // I'm assuming this node exists ...
      // TODO: can this prepared query be cached? Won't be _that_ many props
      getdb()
        .prepare(
          `
        UPDATE nodes
        SET
          \`$gatsby_node$\` = ?,
          \`${qualifiedAddedField}\` = ?
        WHERE id = ?
        LIMIT 1
      `
        )
        .run([
          JSON.stringify(action.payload), // The payload should be the new node
          addedValue,
          action.payload.id,
        ])

      log(
        `  - should have added \`` +
          qualifiedAddedField +
          `\` to id=` +
          action.payload.id +
          ` with value=` +
          addedValue
      )

      return null
    }
    case `ADD_CHILD_NODE_TO_PARENT_NODE`: {
      // Note: Loki would just drop the old node and use the new node
      // We don't need to and the `children` field is not new
      // Just update the `children` field

      // I'm assuming this node exists
      UPDATE_CHILDREN.run([
        JSON.stringify(action.payload), // The payload should be the new node
        JSON.stringify(action.payload.children),
        action.payload.id,
      ])

      log(
        `  - should be updated`
        // ,action.payload.children
      )

      return null
    }

    case `DELETE_NODE`: {
      if (action.payload) {
        // deleteNode(action.payload)
      }
      return null
    }

    case `DELETE_NODES`: {
      // deleteNodes(action.fullNodes)
      return null
    }

    default:
      log(`  - (This event is ignored by loki)`)
      return null
  }
}

function saveResolvedNodes(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `saveResolvedNodes:` + RESET, args)
}

function ensureFieldIndexes(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `ensureFieldIndexes:` + RESET, args)
}

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

  deleteNodeTypeCollections,
  deleteAll,

  reducer,

  saveResolvedNodes,
  ensureFieldIndexes,
}
