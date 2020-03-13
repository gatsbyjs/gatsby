// FYI: "blotting" is the process if flattening an object to a list of dotted
// fields for each leaf property, separated with path separator stored in Λ
// This means `{a: {b: 1, c: {d: 2}}` becomes `a.b` and `a.b.c.d`

const {
  ARRAY_PREFIX,
  MAIN_NODE,
  OBJECT_PREFIX,

  BOLD,
  GREEN,
  PURPLE,
  RESET,
  RED,

  log,
  dbLog,
  decodeSqliteToJs,
  encodeJsToSqlite,
  Λ,
} = require(`./index.js`)
const { makeRe } = require(`micromatch`)

// TODO: config?
const NAME_DB =
  process.env.GATSBY_SQLITE_DB_NAME || process.env.NODE_ENV === `production`
    ? `gatsby_prod_default`
    : `gatsby_dev_default`
const NAME_TABLE = process.env.GATSBY_SQLITE_TABLE_NAME || `nodes`

let db

let INSERT_cache_key
let INSERT
let SELECT_BY_ID
let SELECT_BY_TYPE
let SELECT_ALL
let UPDATE_CHILDREN

let knownFields
let knownArrayFields = new Set() // Lower case! These may always also be null
let knownObjectFields = new Set() // Lower case! These may always also be null

function getdb() {
  if (db) return db

  db = require(`better-sqlite3`)(NAME_DB, { verbose: dbLog })
    .function(`regexp`, { deterministic: true }, function(r, qv) {
      // This makes `where a regexp b` work. But it's a user function so could be anything really
      // Note: we encode regexes as strings, meaning it'll be prefixed by a
      // double quote in the query. We have to slice that off too.
      // TODO: the regex can only be passed on as a string, but we can prepare and cache that regex in js-land and pass on an identifier for it, instead. Should be a little faster in the end.

      const regexBody = r.slice(2, r.lastIndexOf(`/`))
      const regexFlags = r.slice(r.lastIndexOf(`/`) + 1)
      const regex = new RegExp(regexBody, regexFlags)

      const v = decodeSqliteToJs(qv)

      console.log(
        `## Custom sqlite \`regexp\` function is being invoked:`,
        arguments,
        `body:` + regexBody,
        `flags:` + regexFlags,
        regex,
        v === null ? `false because null` : regex.test(v)
      )
      if (v === null) return 0 // TODO: null never matches in sqlite (should it for us?). Test passes when we add this.
      // `r` should be a stringified regex, including slashes and (optional) flags
      // `v` should be a string
      // Apparently the return value should be 0 or 1, rather than boolean.
      return regex.test(v) ? 1 : 0
    })
    .function(`micromatch_glob`, { deterministic: true }, function(qglob, qv) {
      console.log(
        `## Custom sqlite \`micromatch_glob\` function is being invoked:`,
        arguments
      )

      const glob = decodeSqliteToJs(qglob)
      const v = decodeSqliteToJs(qv)

      // TODO: cache these
      // Apparently the return value should be 0 or 1, rather than boolean.
      return makeRe(glob).test(v) ? 1 : 0
    })

  // https://old.sqliteonline.com/
  db.prepare(`DROP TABLE IF EXISTS \`${NAME_TABLE}\``).run()
  // Room for improvement. For now we add fields on the fly, as TEXT
  knownFields = [`id`, MAIN_NODE, `children`, `internal` + Λ + `type`] // Ordered because the prepared statement is ordered
  db.prepare(
    `
      CREATE TABLE IF NOT EXISTS \`${NAME_TABLE}\`
        (
          \`id\` TEXT PRIMARY KEY UNIQUE NOT NULL,
          \`${MAIN_NODE}\` TEXT NOT NULL,
          \`children\` TEXT,
          \`internal${Λ}type\` TEXT
        );
    `
  ).run()

  INSERT_cache_key = ``
  INSERT = updatePreparedInsert(knownFields)
  SELECT_BY_ID = db.prepare(`
    SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\` WHERE id = ? LIMIT 1
  `)
  SELECT_BY_TYPE = db.prepare(`
    SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\` WHERE \`internal${Λ}type\` = ?
  `)
  SELECT_ALL = db.prepare(`
    SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\`
  `)
  UPDATE_CHILDREN = db.prepare(`
    UPDATE \`${NAME_TABLE}\`
    SET
      \`${MAIN_NODE}\` = ?,
      \`children\` = ?
    WHERE id = ?
    LIMIT 1
  `)

  return db
}

function isArrayField(fieldName) {
  return knownArrayFields.has(fieldName)
}
function isObjectField(fieldName) {
  return knownObjectFields.has(fieldName)
}
function getKnownFields() {
  return knownFields
}

// We prepare an INSERT and replace it whenever we add a new field
function updatePreparedInsert(fieldNames) {
  let cols = fieldNames.map(s => `\`` + s + `\``).join(`, `)
  if (cols === INSERT_cache_key) return INSERT // currently prepared
  // log('Updating prepared INSERT for', fieldNames.length, 'fields, out of', knownFields.length, 'known fields')
  INSERT_cache_key = cols
  return getdb().prepare(`
    INSERT INTO \`${NAME_TABLE}\` (${cols}) VALUES (${fieldNames
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
    return
  }

  let k = key.replace(/`/g, `\\\``)
  log(`# Injecting \`` + k + `\` column into table`)

  // The name can't be prepared (it seems?)
  getdb()
    .prepare(`ALTER TABLE \`${NAME_TABLE}\` ADD COLUMN \`${k}\` TEXT;`)
    .run()
  knownFields.push(k)
}

// TODO: dedupe
function blot(obj, prefix = ``, paths = new Map()) {
  // TODO: prevent cyclic loop issues
  Object.keys(obj).forEach(key => {
    let newPrefix = prefix + (prefix ? Λ : ``) + key.toLowerCase()
    let v = obj[key]
    if (
      typeof v === `string` ||
      typeof v === `number` ||
      typeof v === `boolean` ||
      v === null ||
      v === undefined
    ) {
      paths.set(newPrefix, encodeJsToSqlite(v))
      return
    }
    if (Array.isArray(v)) {
      log(
        RED +
          `  - Marking \`` +
          key +
          `\` as an array field because value is \`` +
          JSON.stringify(v) +
          `\`` +
          RESET
      )
      // We track this to support `in` on fields that are arrays. Doing it in
      // this function because it receives all the values and we need to also
      // consider fields that are `null` the first time they are seen.
      knownArrayFields.add(newPrefix)
      // Set a special field to mark an array as "existing property" this way
      // an empty array (which will not have other fields) can still be
      // considered as a "set property" for NULL checks. It's not pretty... ino!
      paths.set(ARRAY_PREFIX + newPrefix, encodeJsToSqlite(true))

      // Process arrays the same as any other object, with numbers as keys
      blot(v, newPrefix, paths)
      return
    }
    if (typeof v === `object`) {
      // Not null, not array, assume plain object for the sake of it

      // We track this to support sorting on fields containing an object value.
      // The problem is that these still need to sort in the proper order for
      // the case of object, null, and non-existing. Not sure this ever makes
      // sense in the real world.
      knownObjectFields.add(newPrefix)
      // Set a special field to mark the object as "existing property" this way
      // an empty object (which will not have other fields) can still be
      // considered as a "set property" for NULL checks. It's not pretty... ino!
      // Note: picking `false` because its encoding will sort properly ...
      // (For example: `false` < `null`, `false` < `"str`, etc)
      paths.set(OBJECT_PREFIX + newPrefix, encodeJsToSqlite(false))

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
        .prepare(`DELETE FROM \`${NAME_TABLE}\`;`)
        .run() // This is TRUNCATE TABLE
      return null

    case `CREATE_NODE`: {
      // log(' - Now walking', node)
      // log('   ok wtf?', Object.keys(node))
      // Go through payload (the new node). Create dotted fields for all
      // properties (and nested properties). Those are the fields in our table.
      // Any unknown field should be added as a text field to the table.

      let paths = blot(node, ``)
      log(`  - Blotted::`, paths)

      // Next step is to make sure the fields are part of the table, add new
      // fields as TEXT, and to build up an argument list for the prepared
      // statement at the same time. Note that nodes may not contain all field
      // names seen so far, so we have to build up an arg and field list.
      let preparedFields = [MAIN_NODE]
      let preparedArgs = [JSON.stringify(node)]
      paths.forEach((value, key) => {
        // TODO: protect against cycles (we cant support those, anyways...?)
        let lkey = key.toLowerCase() // sqlite is case insensitive
        addFieldToTableIfNew(lkey)
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

      let unqualifiedAddedField = String(action.addedField).toLowerCase()
      let qualifiedAddedField = `fields` + Λ + unqualifiedAddedField
      let addedValue = action.payload.fields[unqualifiedAddedField]
      addFieldToTableIfNew(qualifiedAddedField)

      if (Array.isArray(addedValue)) {
        log(
          RED +
            `  - Marking \`` +
            qualifiedAddedField +
            `\` as an array field because value is \`` +
            JSON.stringify(addedValue) +
            `\`` +
            RESET
        )
        // We track this to support `in` on fields that are arrays
        knownArrayFields.add(qualifiedAddedField)
      } else {
        log(
          GREEN +
            `  - Marking \`` +
            qualifiedAddedField +
            `\` NOT as an array field because value is \`` +
            JSON.stringify(addedValue) +
            `\`` +
            RESET
        )
      }

      // I'm assuming this node exists ...
      // TODO: can this prepared query be cached? Won't be _that_ many props
      getdb()
        .prepare(
          `
            UPDATE \`${NAME_TABLE}\`
            SET
              \`${MAIN_NODE}\` = ?,
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
  NAME_TABLE,

  getNodeTypeCollection,

  getdb,
  getKnownFields,
  isArrayField,
  isObjectField,

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
