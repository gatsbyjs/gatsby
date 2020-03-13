// FYI: "blotting" is the process if flattening an object to a list of dotted
// fields for each leaf property, separated with path separator stored in Λ
// This means `{a: {b: 1, c: {d: 2}}` becomes `a.b` and `a.b.c.d`

const BOLD = `\x1b[;1;1m`
const GREEN = `\x1b[32m`
const PURPLE = `\x1b[35m`
const RESET = `\x1b[0m`
const RED = `\x1b[31m`

const SILENT_LOG = false
const log = SILENT_LOG ? () => {} : console.debug // debug is an alias for log but is not wrapped by the framework meaning i can log inside a reducer o:)

// Use Λ for a configurable field separator for flat object representation
// (foo.bar=a -> fooΛbar=a) Note: since we use arbitrary field names we must
// already backtick-escape any field anyways because they might accidentally be
// reserved words. This won't protect against `sqlite_` prefixes :/
const Λ = `.`

const MAIN_NODE = `$gatsby_node$` // Entire node is serialized into this field
const ARRAY_PREFIX = `$array$` // Field prefix for array field names
const OBJECT_PREFIX = `` // Field prefix for object field names

const SILENT_DB = false
const dbLog = (...args) =>
  (process.env.GATSBY_SQLITE_VERBOSE
    ? process.env.GATSBY_SQLITE_VERBOSE === `1`
    : !SILENT_DB) && console.debug(...args)

async function start(...args) {
  console.lg(`sqlite/index/start`, args)
}

function saveState(...args) {
  console.lg(`sqlite/index/saveState`, args)
}

function getDb(...args) {
  console.lg(`sqlite/index/getDb`, args)
}

function encodeJsToSqlite(v) {
  // https://www.sqlite.org/datatype3.html
  // sqlite only supports null, floats, strings, and (binary) blob
  // We encode non-numbers as strings with prefixes
  switch (typeof v) {
    case `boolean`:
      return String(v)
    case `number`:
      if (!isFinite(v)) {
        if (isNaN(v)) {
          throw new Error(
            `sqlite/nodes.js: Error: Unable to encode NaN. (Note: an occurrence of NaN is likely to be a bug somewhere)`
          )
        }
        throw new Error(
          `sqlite/nodes.js: Error: Unable to encode Infinity. (Note: there is potentially a bug unless you expected this value to appear)`
        )
      }
      // TODO: confirm there's a test for integers (they need .0 suffix in sql)
      // TODO: add test for 1e100 kind of notations (exponent)
      // TODO: add test for .5 kind of notation (leading dot)
      // Since sqlite supports number types, let prepared statements encode them
      return v
    case `string`:
      // Prefix with quote to signify a string value (vs null / bool)
      return `"` + v
    case `undefined`:
      // This case shouldn't reasonably happen in graphql
      return `undefined`
    case `object`:
      if (v === null) return `null` // different from actual NULL values in db
      throw new Error(
        `sqlite/nodes.js: Error: Should only receive primitives in this function`
      )
    default:
      // function, symbol, bigint, ...?
      throw new Error(
        `sqlite/nodes.js: Error: Can not encode this type of value`
      )
  }
}
function decodeSqliteToJs(v) {
  if (typeof v === `number`) {
    // TODO: I don't think numbers come out as such
    return v
  }
  if (v === null) {
    return undefined // property that was not specified for this node
  }
  switch (v[0]) {
    case `"`:
      return v.slice(1) // The string is NOT encoded, only prefixed
    case `t`:
      return true
    case `f`:
      return false
    case `n`:
      return null
    case `u`:
      return undefined // Shouldn't happen
    case `0`:
    case `1`:
    case `2`:
    case `3`:
    case `4`:
    case `5`:
    case `6`:
    case `7`:
    case `8`:
    case `9`:
    case `.`: // `.5` is a valid float. sqlite may never do this tho..?
      // Numbers are turned into strings so encode them as such
      return parseFloat(v)
    default:
      throw new Error(
        `sqlite/nodes.js: Error: Unable to decode value, did not recognize encoding: \`` +
          JSON.stringify(v) +
          `\`.`
      )
  }
}

module.exports = {
  ARRAY_PREFIX,
  MAIN_NODE,
  OBJECT_PREFIX,

  start,
  getDb,
  saveState,

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
}
