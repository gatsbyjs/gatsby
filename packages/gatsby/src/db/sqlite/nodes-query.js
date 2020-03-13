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
  encodeJsToSqlite,
  Λ,
} = require(`./index.js`)
const {
  getdb,
  isArrayField,
  isObjectField,
  getKnownFields,
} = require(`./nodes.js`)

function translatePathToWhereClause(
  path,
  op,
  processedValue,
  originalValue,
  preparedArgs
) {
  // https://www.sqlite.org/datatype3.html
  // sqlite only supports null, floats, strings, and (binary) blob
  // We encode non-numbers as strings with prefixes
  // Non-existing properties are NULL in sqlite, while graphql would filter out
  // `undefined` but allows JS `null`'s to exist.

  switch (op) {
    case `eq`:
      // Match NULL (properties that don't exist on a particular node) if and
      // only if explicitly matching against `null`

      if (isArrayField(path)) {
        // Special case; basically do `x in [value]` where x is an array
        return translatePathToWhereClause(
          path,
          `in`,
          [processedValue],
          [originalValue],
          preparedArgs
        )
      }

      preparedArgs.push(processedValue)

      if (originalValue === null) {
        return `( \`${path}\` = ? or \`${path}\` is null )`
      }

      return `\`${path}\` = ?`

    case `ne`:
      // Match nodes that do not have the property at all, except when checking
      // for `null` explicit. In that case, omit nodes that do not have the prop

      if (isArrayField(path)) {
        // Special case; basically do `x nin [value]` where x is an array
        return translatePathToWhereClause(
          path,
          `nin`,
          [processedValue],
          [originalValue],
          preparedArgs
        )
      }

      preparedArgs.push(processedValue)

      if (originalValue === null) {
        return `( \`${path}\` != ? AND \`${path}\` IS NOT NULL )`
      }

      return `( \`${path}\` != ? OR \`${path}\` IS NULL )`

    case `lt`:
      // TODO: what is the expected behavior for non-numbers here? Especially string case
      if (originalValue === null) {
        // Note: null is not expected to match anything
        return `0` // "Always false"
      }
      preparedArgs.push(processedValue)
      return `CAST( \`${path}\` as decimal ) < ?`

    case `lte`:
      // TODO: what is the expected behavior for non-numbers here? Especially string case
      if (originalValue === null) {
        // Note: null is not expected to match anything but itself
        // But the property must exist (NOT NULL)
        preparedArgs.push(processedValue)
        return `( \`${path}\` = ? AND \`${path}\` NOT NULL )`
      }
      preparedArgs.push(processedValue)
      return `CAST( \`${path}\` as decimal ) <= ?`

    case `gt`:
      // TODO: what is the expected behavior for non-numbers here? Especially string case
      if (originalValue === null) {
        // Note: null is not expected to match anything
        return `0` // "Always false"
      }
      preparedArgs.push(processedValue)
      return `CAST( \`${path}\` as decimal ) > ?`

    case `gte`:
      // TODO: what is the expected behavior for non-numbers here? Especially string case
      if (originalValue === null) {
        // Note: null is not expected to match anything but itself
        // But the property must exist (NOT NULL)
        preparedArgs.push(processedValue)
        return `( \`${path}\` = ? AND \`${path}\` NOT NULL )`
      }
      preparedArgs.push(processedValue)
      return `CAST( \`${path}\` as decimal ) >= ?`

    case `regex`:
      // TODO: this will invoke a userland function that we defined in ./nodes.js. There is much room for improvement but I doubt it will ever scale.
      // Nodes that do not have this property at all should never match (NULL)
      preparedArgs.push(processedValue)
      return `( \`${path}\` NOT NULL AND \`${path}\` REGEXP ? )`

    case `in`: {
      // If the array contains null we need to special case it due to sqlite
      let specialNullCase = originalValue.includes(null)
      log(`processedValue:`, processedValue)
      log(`specialNullCase:`, specialNullCase)

      if (isArrayField(path)) {
        log(`  - doing array-in-array`)
        // A field that is an array, so: `[1,2,3]` in `[5,3,5]`
        // All array elements get their own field so we query all fields.
        // What do you mean, "inefficient". How dare you. This is fiiiiine.
        let r = new RegExp(`^` + path + Λ + `\\d+$`)
        let x = []
        getKnownFields().forEach(f => {
          if (r.test(f)) {
            // You cannot bind an array so we'll have to manually scrub this in
            preparedArgs.push(...processedValue)
            // `f` must be `aΛbΛcΛ0` with a primitive value
            // If the field is/contains null, it should match iif the value has it
            // Do not check other fields because we only care about whether it
            // exists at all. If the first one exists, that's enough.
            // TODO: empty array
            x.push(
              `( ` +
                `\`${f}\` ${
                  specialNullCase ? `is null or` : `not null and`
                } \`${f}\` in ( ${processedValue.map(() => `?`).join(`, `)} )` +
                ` )`
            )
          }
        })

        return `\`${ARRAY_PREFIX + path}\` ${
          specialNullCase ? `is null or (` : `not null and (`
        } ${x.join(` OR `)} )`
      }

      log(`  - doing regular \`in\``)

      // You cannot bind an array so we'll have to manually scrub this in
      preparedArgs.push(...processedValue)

      return `( \`${path}\` ${
        specialNullCase ? `is null or` : `not null and`
      }  \`${path}\` in (${processedValue.map(() => `?`).join(`, `)}) )`
    }

    case `nin`: {
      // Same approach as `in`, mostly inverted
      // If the array contains null we need to special case it due to sqlite
      let specialNullCase = originalValue.includes(null)
      log(`processedValue:`, processedValue)
      log(`specialNullCase:`, specialNullCase)

      if (isArrayField(path)) {
        // A field that is an array, so: `[1,2,3]` nin `[5,3,5]`
        // All array elements get their own field so we query all fields.
        // What do you mean, "inefficient". How dare you. This is fiiiiine.
        let r = new RegExp(`^` + path + Λ + `\\d+$`)
        let x = []
        getKnownFields().forEach(f => {
          if (r.test(f)) {
            // You cannot bind an array so we'll have to manually scrub this in
            preparedArgs.push(...processedValue)
            // `f` must be `aΛbΛcΛ123` with a primitive value
            x.push(
              `( \`${f}\` ${
                specialNullCase ? `is null or` : `not null and`
              } \`${f}\` not in ( ${processedValue
                .map(() => `?`)
                .join(`, `)} ) )`
            )
          }
        })

        return `\`${ARRAY_PREFIX + path}\` ${
          specialNullCase ? `not null and (` : `is null or (`
        } ${x.join(` AND `)} )`
      }

      // You cannot bind an array so we'll have to manually scrub this in
      preparedArgs.push(...processedValue)

      // For `nin`, non-existing fields must also pass unless `null` is part of
      // the values being checked. NULL is special case for sqlite.
      // We only check whether the first array field exists.
      // TODO: empty array

      return `( \`${path}\` ${
        specialNullCase ? `not null and` : `is null or`
      } \`${path}\` not in ( ${processedValue.map(() => `?`).join(`, `)} ) )`
    }

    case `glob`: {
      // Similar to regex, except this uses the micromatch package to compile
      // the glob to a regex. So we use a custom function here for that

      preparedArgs.push(processedValue)
      return `micromatch_glob(?, \`${path}\`)`
    }
  }
  throw new Error(`sqlite runQuery: Unsupported op: \`` + op + `\``)
}

function sanitize(value) {
  // Note: `value` is what we receive from a filter

  if (typeof value === `object` && value !== null) {
    // Object values should be handled by ops that support it (`in`, `regex`)
    // and not be given for ops that wouldn't support it (like eq, ne)

    if (value instanceof RegExp) {
      // > https://www.sqlite.org/lang_expr.html#regexp
      // > The REGEXP operator is a special syntax for the regexp() user function. No regexp() user function is defined
      // > by default and so use of the REGEXP operator will normally result in an error message. If an application-defined
      // ? SQL function named "regexp" is added at run-time, then the "X REGEXP Y" operator will be implemented as a call
      // > to "regexp(Y,X)".
      // tldr there is no built-in regex support. There are non-cross-platform
      return value.slice(1, -1)
    }

    if (Array.isArray(value)) {
      return value.map(sanitize)
    }

    return value
  }

  return encodeJsToSqlite(value)
}

function expandElematch(path) {
  log(`  -- expandElematch(` + path + `)`)
  let pieces = path.split(Λ)

  // note: case insensitive, paths are lc
  if (!pieces.includes(`elemmatch`)) return [path]

  // Oh no.
  log(`  - Oh no. A wild elemMatch appears! path = ` + path)

  // An `elemMatch` _should_ only apply to arrays, but it will work with any.
  // The arg must be a full path from array to leaf, not partial. It can be
  // a sub tree (at least one leaf must be specified in the query).

  // { stuff: { elemMatch: { data: { tag: { eq: 5 } } } } }
  // -> match any object in the stuff array that has a subtree `[{data{tag{eq:5}}]`
  // Because it's about leafs, it's not an .includes but "just" an .endsWith

  // Match a subtree. This is a little difficult because of how we store
  // the object. At the same time, there is no easy way out here.
  // We first have to blot the subtree and find keys that match the
  // blotted key names. And have a common ancestor with non-flat subtrees

  // Node {x: 1, a: {b: [{c: {d: 'ab0cd'}, e: 'same'}, {c: {d: 'ab1cd'}, e: 'same'}]}}
  //   - blots;
  //      - x = 1
  //      - a.b.0.c.d = 'ab0cd'
  //      - a.b.0.e = 'same'
  //      - a.b.1.c.d = 'ab1cd'
  //      - a.b.1.e = 'same'

  // query: a: b: elemMatch: c: d: eq: 'ab0cd'
  // regex: a.b.\d+.c.d
  // finds: a.b.0.c.d and a.b.1.c.d
  // match: a.b.0.c.d

  // query: a: b: elemMatch: d: eq: 'ab0cd'
  // regex: a.b.\d+.d
  // finds: nothing (cannot query for partial subtree)
  // match: none

  // query: a: b: elemMatch: e: eq: 'same'
  // regex: a.b.\d+.e
  // finds: a.b.0.e and a.b.1.e
  // match: a.b.0.e and a.b.1.e

  // query: a: b: elemMatch: e: eq: 'x'
  // regex: a.b.\d+.e
  // finds: a.b.0.e and a.b.1.e
  // match: none

  // query: x: elemMatch: eq: 1
  // regex: x (it knows x is not an array)
  // finds: a.b.0.e and a.b.1.e
  // match: none

  // query: a: b: elemMatch: { c: { d: eq: 1 }, e: eq 2 }
  // regex: a.b.\d+.c.d and a.b.\d+.e (conjunction of both)
  // finds: (a.b.0.c.d + a.b.0.e) and (a.b.1.c.d + a.b.1.e)
  // match: none

  // The `elemMatch` can appear in multiple places. It's basically a wildcard
  // for the array index (but can also be used to target a specific non-array)
  // So we can turn it into a regular expression and test it against all known
  // field names to find the fields we're interested in...! :)
  // This also means we only run this function once, not recursively.

  // For the regex, we replace any `Λelemmatch` with `(Λ\d+)?` because either
  // it is an array, and then there will be `_0`, `_1`, `_143` suffixes, or the
  // value is not an array and then we just want the one case without numbers.

  // `data.tags.elemmatch.tag.document.elemmatch.number` ->
  //    `/^data\.tags(?:\.\d+)?\.tag\.document(?:\.\d+)?\.number$/`
  // We assume the `elemMatch` operator cannot be the first of a filter ...
  let emSplitRegex = new RegExp(Λ + `elemmatch`, `g`)
  let r = new RegExp(
    `^` +
      pieces
        .join(Λ)
        // Split on the `ΛelemMatch` because we want to make the whole `Λ123` bit optional
        .split(emSplitRegex)
        .join(`(?:` + Λ + `\\d+)?`) +
      `$`
  )
  log(`regex=`, r)
  log(
    `Testing against these fields:\n` +
      getKnownFields()
        .map(s => `- ` + s + `\n`)
        .join(``)
  )

  let l = []
  getKnownFields().forEach(f => r.test(f) && l.push(f))
  log(`Matches these fields:\n` + l.map(s => `- ` + s + `\n`).join(``))
  return l
}

/**
 * Runs the graphql query over the loki nodes db.
 *
 * @param {Object} query. Object with:
 *
 * {Object} gqlType: A GraphQL type
 *
 * {Object} queryArgs: The raw graphql query as a js object. E.g. `{
 * filter: { fields { slug: { eq: "/somepath" } } } }`
 *
 * {Object} context: The context from the QueryJob
 *
 * {boolean} firstOnly: Whether to return the first found match, or
 * all matching results
 *
 * @returns {promise} A promise that will eventually be resolved with
 * a collection of matching objects (even if `firstOnly` is true)
 */
async function runQuery(query, ...args) {
  log(PURPLE + `sqlite/nodes-query/` + BOLD + `runQuery:` + RESET, args)
  log(` `, query)

  // We care about queryArgs: {filter, sort, group, distinct}, firstOnly: bool, and nodeTypeNames: string[]
  // We'll also want to care about resolvedFields at some point

  let { firstOnly, nodeTypeNames, queryArgs = {} } = query

  let { filter = {}, sort = {}, group, distinct, limit, ...rest } = queryArgs

  let dottedFilter = filter ? [...blot(filter, ``)] : []

  let { fields, order = `` } = sort
  let dottedSort = fields
    ? fields.map(s => {
        s = s.split(`.`).join(Λ)
        if (isObjectField(s)) {
          return OBJECT_PREFIX + s
        }
        if (isArrayField(s)) {
          return ARRAY_PREFIX + s
        }
        return s
      })
    : []

  log(
    `\n@ Filter:`,
    JSON.stringify(filter).replace(/"/g, ``),
    `\n@ Dotted filter:`,
    dottedFilter,
    `\n@ Sort:`,
    sort,
    `\n@ Dotted sort:`,
    dottedSort,
    `\n@ Limit:`,
    limit,
    `\n@ Group:`,
    group,
    `\n@ Distinct:`,
    distinct,
    `\n@ firstOnly:`,
    firstOnly,
    `\n@ nodeTypeNames:`,
    nodeTypeNames,
    `\n@ Other query args that seem to be ignoring:`,
    rest
  )

  let preparedArgs = []
  let queryCondGroups = dottedFilter.map(([key, value]) => {
    // Assumes each field encodes the op as the last part aΛbΛcΛeq
    let lo = key.lastIndexOf(Λ)
    let op = key.slice(lo + 1)
    let path = key.slice(0, lo).toLowerCase() // I think it's already lc ...?

    // TODO: ideally we don't want to worry about storage details (ie. `0` is stored as `0.0` and so a where clause must add the fraction)
    // TODO: things might get awkward for rounding errors and numbers that do not serialize to simple `\d\.\d` patterns (exponent, NaN, Infinity)
    // TODO: how do negative numbers even?
    // TODO: null cases are handled very annoyingly (!= null must be "is not null" and won't match != "foo")
    let sansval = sanitize(value)

    // If a path contains elemMatch then it will pseudo-expand to multiple
    // paths, and return a hit if any of them match.
    let targetPaths = expandElematch(path)
    if (targetPaths.length === 0) {
      // "Never match" (because the elemMatch didn't actually match any fields)
      return [`0`]
    }

    return targetPaths.map(t =>
      translatePathToWhereClause(t, op, sansval, value, preparedArgs)
    )
  })

  let db = getdb()
  try {
    let query = `
        SELECT \`${MAIN_NODE}\` FROM nodes
      WHERE 1
        ${
          queryCondGroups.length
            ? `AND (\n     ` +
              queryCondGroups.map(queryConds => queryConds.join(`\n  OR `)) +
              `\n)\n`
            : ``
        }
        ${
          !nodeTypeNames
            ? ``
            : `AND \`internal${Λ}type\` in (${nodeTypeNames.map(
                s => `'` + encodeJsToSqlite(s) + `'`
              )})`
        }
        ${
          // We can order by, `order` is either undefined (default to asc), a
          // a string "asc" or "desc", or an array of "asc" or "desc". If array,
          // zip them together. Otherwise use the string for all fields.
          fields
            ? `ORDER BY ` +
              dottedSort
                .map((s, i) => {
                  let o = (Array.isArray(order) ? order[i] : order) ?? `asc`
                  // sqlite handles NULL values (non-existing field) different
                  let nulls = o === `asc` ? `nulls last` : `nulls first`
                  return `\`` + s + `\` ` + o + ` ` + nulls
                })
                .join(`, `)
            : ``
        }
      ${firstOnly ? `LIMIT 1` : limit ?? `` ? `LIMIT ` + limit : ``}
    `
    log(`Query:\n` + GREEN + query + RESET)
    let nodes = db
      .prepare(query)
      .all(preparedArgs)
      .map(json => JSON.parse(json.$gatsby_node$))

    log(
      `  - runQuery returning`,
      nodes.length,
      `nodes, ids:`,
      nodes.map(s => s.id)
    )

    return nodes.length ? nodes : null
  } catch (E) {
    log(
      `\n` +
        RED +
        `runQuery ran into an error: ` +
        RESET +
        BOLD +
        E +
        RESET +
        `\n`
    )
  }

  return null
}

module.exports = runQuery

// TODO: dedupe
function blot(obj, prefix = ``, paths = []) {
  // TODO: prevent cyclic loop issues
  if (!obj) return paths

  Object.keys(obj).forEach(key => {
    let newPrefix = prefix + (prefix ? Λ : ``) + key
    let v = obj[key]
    if (
      typeof v === `string` ||
      typeof v === `number` ||
      v === null ||
      typeof v === `boolean` ||
      v === undefined
    ) {
      paths.push([newPrefix, v])
      return
    }
    if (Array.isArray(v)) {
      // Arrays are a leaf node (`in` operator)
      paths.push([newPrefix, v])
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
