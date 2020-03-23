// FYI: "blotting" is the process if flattening an object to a list of dotted
// fields for each leaf property, separated with path separator stored in Λ
// This means `{a: {b: 1, c: {d: 2}}` becomes `a.b` and `a.b.c.d`

const {
  ARRAY_PREFIX,
  MAIN_NODE,
  OBJECT_PREFIX,
  SQLITE_ID,

  SqliteNode,

  BOLD,
  GREEN,
  BLUE,
  PURPLE,
  RESET,
  RED,

  log,
  dbLog,
  decodeSqliteToJs,
  encodeJsToSqlite,
  nodeStringDebug,
  Λ,
} = require(`./index.js`)
const { makeRe } = require(`micromatch`)
// v8.serialize instead of JSON.serialize to support nodes with circular refs
const v8 = require(`v8`)

// TODO: config?
const NAME_DB =
  process.env.GATSBY_SQLITE_DB_NAME ||
  (process.env.NODE_ENV === `production`
    ? `gatsby_prod_default`
    : `gatsby_dev_default`)
const NAME_TABLE = process.env.GATSBY_SQLITE_TABLE_NAME || `nodes`

let db

let INSERT_cache_key
let INSERT

let knownFields
let knownArrayFields = new Set() // Lower case! These may always also be null
let knownObjectFields = new Set() // Lower case! These may always also be null

function getdb() {
  if (db) return db

  log(BOLD + `opening sqlite database` + RESET, [NAME_DB], `and using table`, [
    NAME_TABLE,
  ])

  const betterSqlite3 = require(`better-sqlite3`)
  db = betterSqlite3(NAME_DB, { verbose: dbLog })
  db.function(`regexp`, { deterministic: true }, function(r, qv) {
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
  db.function(`micromatch_glob`, { deterministic: true }, function(qglob, qv) {
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
  // Omit SQLITE_ID from known keys. It's a hidden internal field for sqlite
  knownFields = [`id`, MAIN_NODE, `internal` + Λ + `type`] // Ordered because the prepared statement is ordered
  db.prepare(
    `
      CREATE TABLE IF NOT EXISTS \`${NAME_TABLE}\`
        (
          \`id\` TEXT PRIMARY KEY UNIQUE NOT NULL,
          \`${MAIN_NODE}\` BLOB NOT NULL,
          \`internal${Λ}type\` TEXT
        );
    `
  ).run()

  INSERT_cache_key = ``
  INSERT = updatePreparedInsert(knownFields)

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
  throw new Error(`implement me`)
}

function getNodes(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `getNodes:` + RESET, args)

  let jsons = db
    .prepare(
      `
    SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\`
  `
    )
    .all()

  // log('all jsons:', jsons)

  let nodes = jsons.map(
    json => json && SqliteNode(v8.deserialize(json.$gatsby_node$))
  )

  log(`  -> returning`, nodes.length, `nodes`)

  return nodes
}

function getNode(id, ...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `getNode:` + RESET, [id])

  let json = db
    .prepare(
      `
    SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\` WHERE id = ? LIMIT 1
  `
    )
    .get(encodeJsToSqlite(id))

  log(`  -->`, !!json)
  // log(' ----->', json)

  let node = json && SqliteNode(v8.deserialize(json.$gatsby_node$))

  // log(' ----->', node)

  return node
}

function getNodesByType(targetType, ...args) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `getNodesByType:` + RESET,
    [targetType],
    args
  )

  let jsons = db
    .prepare(
      `
    SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\` WHERE \`internal${Λ}type\` = ?
  `
    )
    .all([encodeJsToSqlite(targetType)])

  let nodes = jsons.map(
    json => json && SqliteNode(v8.deserialize(json.$gatsby_node$))
  )

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

  let types = jsons.map(
    json => json && decodeSqliteToJs(json[`internal` + Λ + `type`])
  )

  log(`  ->`, [types.join(`, `)])

  return types
}

function hasNodeChanged(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `hasNodeChanged:` + RESET, args)

  throw new Error(`Implement me`)
}

function getNodeAndSavePathDependency(...args) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `getNodeAndSavePathDependency:` + RESET,
    args
  )
}

function createNode(node, ...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `createNode:` + RESET, args)
  addNewNodeToDb()
}

function updateNode(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `updateNode:` + RESET, args)
  throw new Error(`Implement me`)
}

function deleteNode(node, ...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `deleteNode:` + RESET, args)
  removeNodeFromDb(node)
}

function deleteNodeTypeCollections(...args) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `deleteNodeTypeCollections:` + RESET,
    args
  )

  throw new Error(`Implement me`)
}

function deleteAll(...args) {
  log(PURPLE + `sqlite/nodes/` + BOLD + `deleteAll:` + RESET, args)

  throw new Error(`Implement me`)
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

let warnedForCirculars = false // Only emit one warn per session

// TODO: dedupe
function blot(obj, prefix = ``, paths = new Map(), recurStack = []) {
  // Note: obj should be an array or object here. If this changes and it can
  // be a primitive, then these guards should be moved behind a check too.
  if (recurStack.includes(obj)) {
    // While this won't work for certain queries, it doesn't necessarily
    // have to be a blocking problem and is likely an artifact from some
    // kind of automated system. So let's not make this a blocker here.
    if (!warnedForCirculars) {
      warnedForCirculars = true
      console.warn(
        `Warning: Detected circular reference. This may lead to unpredictable behavior.`
      )
    }
    return
  }
  recurStack.push(obj)
  // TODO: prevent cyclic loop issues
  Object.keys(obj).forEach(function recu(key) {
    let newPrefix = prefix + (prefix ? Λ : ``) + key.toLowerCase()

    if (isArrayField(newPrefix)) {
      log(`  -- \`` + newPrefix + `\` is an array so checking all array keys`)
      let r = new RegExp(`^` + newPrefix + Λ + `\\d+$`)
      getKnownFields().forEach(f => {
        if (r.test(f)) {
          log(`  ---> found \`` + f + `\`, processing now...`)

          blat(paths, obj, key, f, recurStack)
        }
      })
      return
    }

    blat(paths, obj, key, newPrefix, recurStack)
  })

  recurStack.pop()
  return paths
}

function blat(paths, obj, key, newPrefix, recurStack) {
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
      BLUE +
        `  - Marking \`` +
        key +
        `\` as an array field because value is \`` +
        nodeStringDebug(v) +
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
    blot(v, newPrefix, paths, recurStack)
    return
  }
  if (v instanceof SqliteNode) {
    log(`v is a SqliteNode!`)
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

    blot(v, newPrefix, paths, recurStack)
    return
  }

  throw new Error(
    `Cannot serialize this type: ` + typeof v + `(path=` + newPrefix + `)`
  )
}
function updateOneFieldAndNode(node, fieldName, value) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `updateOneFieldAndNode:` + RESET,
    fieldName,
    `-->`,
    value
  )

  // console.log(
  //   "-->",
  //   node instanceof SqliteNode,
  //   value instanceof SqliteNode ? "SqliteNode" : value
  // )

  // Assumes the node is already stored in db
  // Note: the value may be an object or array in which case there could still
  // be multiple fields being added/updated here

  // TODO: prevent this new object for the sake of nothing
  let blots =
    typeof value === `object`
      ? blot(value, fieldName)
      : blot({ [fieldName]: value }, fieldName)
  log(
    `   --> total blots found:\n   ---- ` + [...blots.keys()].join(`\n   ---- `)
  )

  // TODO: should we need to update the whole node field as well? or we can we drop that?
  let preparedArgs = [v8.serialize(node)]
  let preparedFields = [MAIN_NODE]
  blots.forEach((value, key) => {
    // TODO: protect against cycles (we cant support those, anyways...?)
    let lkey = key.toLowerCase() // sqlite is case insensitive
    addFieldToTableIfNew(lkey)
    preparedArgs.push(value)
    preparedFields.push(lkey)
  })

  console.log(`fields:`, preparedFields.length, `, args:`, preparedArgs.length)

  // log('testing new prep', preparedArgs.length, preparedArgs.length);

  // I'm assuming this node exists ...
  // TODO: can this prepared query be cached? Won't be _that_ many props
  getdb()
    .prepare(
      `
            UPDATE \`${NAME_TABLE}\`
            SET
              ${preparedFields.map(f => `\`${f}\` = ?`).join(`,\n            `)}
            WHERE id = ?
            LIMIT 1
          `
    )
    .run([].concat(preparedArgs, [encodeJsToSqlite(node.id)]))
}

function addNewNodeToDb(node) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `addNewNodeToDb:` + RESET,
    `-->`,
    node.id
  )

  let paths = blot(node, ``)
  log(`  - Blotted::`, paths)

  // Next step is to make sure the fields are part of the table, add new
  // fields as TEXT, and to build up an argument list for the prepared
  // statement at the same time. Note that nodes may not contain all field
  // names seen so far, so we have to build up an arg and field list.
  let preparedFields = [MAIN_NODE]
  let preparedArgs = [v8.serialize(node)]
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
}
function removeNodeFromDb(node) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `removeNodeFromDb:` + RESET,
    `-->`,
    node.id
  )

  getdb()
    .prepare(`DELETE FROM \`${NAME_TABLE}\` WHERE \`id\` = ? LIMIT 1`)
    .run([node.id])
}

function reducer(state = new Map(), action) {
  log(PURPLE + `sqlite/nodes/reducer: ` + BOLD + action.type + RESET)

  let node = action.payload

  switch (action.type) {
    case `LOG`:
      return null

    case `DELETE_CACHE`:
      // This is TRUNCATE TABLE
      getdb()
        .prepare(`DELETE FROM \`${NAME_TABLE}\`;`)
        .run()
      return null

    case `CREATE_NODE`: {
      // log(' - Now walking', node)
      // log('   ok wtf?', Object.keys(node))
      // Go through payload (the new node). Create dotted fields for all
      // properties (and nested properties). Those are the fields in our table.
      // Any unknown field should be added as a text field to the table.

      addNewNodeToDb(node)
      return null
    }

    case `ADD_FIELD_TO_NODE`: {
      // Note: Loki would just drop the old node and use the new node
      // We don't need to but we may need to add a new field to the table

      let unqualifiedAddedField = String(action.addedField).toLowerCase()
      let qualifiedAddedField = `fields` + Λ + unqualifiedAddedField
      let addedValue = action.payload.fields[unqualifiedAddedField]

      updateOneFieldAndNode(node, qualifiedAddedField, addedValue)

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

      updateOneFieldAndNode(action.payload, `children`, action.payload.children)

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

async function saveResolvedNodes(nodeTypeNames, resolver) {
  log(
    PURPLE + `sqlite/nodes/` + BOLD + `saveResolvedNodes:` + RESET,
    `for types:`,
    nodeTypeNames
  )

  let rows = getdb()
    .prepare(
      `SELECT \`${MAIN_NODE}\` FROM \`${NAME_TABLE}\` WHERE \`internal${Λ}type\` in ( ${nodeTypeNames
        .map(() => `?`)
        .join(`, `)} ) `
    )
    .all(nodeTypeNames.map(encodeJsToSqlite))

  log(`  - Updating`, rows.length, `rows`)

  for (let i = 0; i < rows.length; ++i) {
    let row = rows[i]
    let node = SqliteNode(v8.deserialize(row.$gatsby_node$))
    log(`  - Updating next node:`, node.id)
    node.__gatsby_resolved = await resolver(node)
    log(`  - Completed async resolve step, now updating node`)
    updateOneFieldAndNode(node, `__gatsby_resolved`, node.__gatsby_resolved)
  }

  // // sqlite
  // for (const typeName of nodeTypeNames) {
  //   const nodes = store.getState().nodesByType.get(typeName)
  //   const resolvedNodes = new Map()
  //   if (nodes) {
  //     for (const node of nodes.values()) {
  //       const resolved = await resolver(node)
  //       resolvedNodes.set(node.id, resolved)
  //     }
  //     store.dispatch({
  //       type: `SET_RESOLVED_NODES`,
  //       payload: {
  //         key: typeName,
  //         nodes: resolvedNodes,
  //       },
  //     })
  //   }
  // }
  //
  //
  // // loki
  // for (const typeName of nodeTypeNames) {
  //   const nodes = getNodesByType(typeName)
  //   const resolved = await Promise.all(
  //     nodes.map(async node => {
  //       node.__gatsby_resolved = await resolver(node)
  //       return node
  //     })
  //   )
  //   const nodeColl = getNodeTypeCollection(typeName)
  //   if (nodeColl) {
  //     nodeColl.update(resolved)
  //   }
  // }
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
