const BOLD = `\x1b[;1;1m`
const GREEN = `\x1b[32m`
const PURPLE = `\x1b[35m`
const RESET = `\x1b[0m`
const RED = `\x1b[31m`

const log = () => {} //console.debug // debug is an alias for log but is not wrapped by the framework meaning i can log inside a reducer o:)
const Λ = `_` // Field separator for flat object representation (foo.bar=a -> fooΛbar=a)

/**
 * Runs the graphql query over the loki nodes db.
 *
 * @param {Object} args. Object with:
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
  log(PURPLE + `sqlite/nodes-query/` + BOLD + `runQuery:` + RESET)

  // We care about queryArgs: {filter, sort, group, distinct}, firstOnly: bool, and nodeTypeNames: string[]
  // We'll also want to care about resolvedFields at some point

  let { firstOnly, nodeTypeNames, queryArgs = {} } = query
  let { filter = {}, sort, group, distinct, ...rest } = queryArgs
  let { fields: filterFields, order: filterOrder } = filter

  let dottedFilter = filter ? [...blot(filterFields, `fields`)] : []

  log(`Filter:`, filter)
  log(`- filterFields:`, filterFields)
  log(`- filterFields:`, filterOrder)
  log(`Dotted filter:`, dottedFilter)
  log(`Sort:`, sort)
  log(`Group:`, group)
  log(`Distinct:`, distinct)
  log(`firstOnly:`, firstOnly)
  log(`nodeTypeNames:`, nodeTypeNames)
  log(`Other query args that seem to be ignoring:`, nodeTypeNames)

  let queryConds = dottedFilter.map(([key, value]) => {
    let lo = key.lastIndexOf(Λ)
    let op = key.slice(lo + 1)
    let path = key.slice(0, lo)
    switch (op) {
      case `eq`:
        return `AND \`` + path + `\` = '` + value + `'` // TOOD: make this structured properly... not easy
    }
    throw new Error(`sqlite runQuery: Unsupported op: \`` + op + `\``)
  })

  let db = global.sqlitedb
  try {
    let query = `
      SELECT \`$gatsby_node$\` FROM nodes
      WHERE 1
        ${queryConds.join(`\n`)}
        ${
          !nodeTypeNames
            ? ``
            : `AND \`internal${Λ}type\` in (${nodeTypeNames.map(
                s => `'` + s + `'`
              )})`
        }
      ${firstOnly ? `LIMIT 1` : ``}
    `
    log(`Query:\n` + GREEN + query + RESET)
    let nodes = db
      .prepare(query)
      .all()
      .map(json => JSON.parse(json.$gatsby_node$))

    log(`  - runQuery returning`, nodes.length, `nodes`)

    return nodes
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
}

module.exports = runQuery

// TODO: dedupe
function blot(obj, prefix = ``, paths = []) {
  // TODO: prevent cyclic loop issues
  obj &&
    Object.keys(obj).forEach(key => {
      let newPrefix = prefix + (prefix ? Λ : ``) + key
      let v = obj[key]
      if (typeof v === `string` || typeof v === `number` || v === null) {
        paths.push([newPrefix, v])
        return
      }
      if (typeof v === `boolean` || v === undefined) {
        paths.push([newPrefix, String(v)])
        return
      }
      if (Array.isArray(v)) {
        // We could support arrays more granularly later (int keys == array or smth)
        paths.set([newPrefix, JSON.stringify(v)])
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
