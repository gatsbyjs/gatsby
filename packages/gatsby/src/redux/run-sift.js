// @flow
const sift = require(`sift`)
const _ = require(`lodash`)
const prepareRegex = require(`../utils/prepare-regex`)
const { resolveNodes, resolveRecursive } = require(`./prepare-nodes`)

/////////////////////////////////////////////////////////////////////
// Parse filter
/////////////////////////////////////////////////////////////////////

function siftifyArgs(object) {
  const newObject = {}
  _.each(object, (v, k) => {
    if (_.isPlainObject(v)) {
      if (k === `elemMatch`) {
        k = `$elemMatch`
      }
      newObject[k] = siftifyArgs(v)
    } else {
      // Compile regex first.
      if (k === `regex`) {
        newObject[`$regex`] = prepareRegex(v)
      } else if (k === `glob`) {
        const Minimatch = require(`minimatch`).Minimatch
        const mm = new Minimatch(v)
        newObject[`$regex`] = mm.makeRe()
      } else {
        newObject[`$${k}`] = v
      }
    }
  })
  return newObject
}

// Build an object that excludes the innermost leafs,
// this avoids including { eq: x } when resolving fields.
const extractFieldsToSift = filter =>
  Object.keys(filter).reduce((acc, key) => {
    let value = filter[key]
    let k = Object.keys(value)[0]
    let v = value[k]
    if (_.isPlainObject(value) && _.isPlainObject(v)) {
      acc[key] =
        k === `elemMatch` ? extractFieldsToSift(v) : extractFieldsToSift(value)
    } else {
      acc[key] = true
    }
    return acc
  }, {})

/**
 * Parse filter and returns an object with two fields:
 * - siftArgs: the filter in a format that sift understands
 * - fieldsToSift: filter with operate leaves (e.g { eq: 3 })
 *   removed. Used later to resolve all filter fields
 */
function parseFilter(filter) {
  const siftArgs = []
  let fieldsToSift = {}
  if (filter) {
    _.each(filter, (v, k) => {
      siftArgs.push(
        siftifyArgs({
          [k]: v,
        })
      )
    })
    fieldsToSift = extractFieldsToSift(filter)
  }
  return { siftArgs, fieldsToSift }
}

/////////////////////////////////////////////////////////////////////
// Run Sift
/////////////////////////////////////////////////////////////////////

function isEqId(firstOnly, fieldsToSift, siftArgs) {
  return (
    firstOnly &&
    Object.keys(fieldsToSift).length === 1 &&
    Object.keys(fieldsToSift)[0] === `id` &&
    Object.keys(siftArgs[0].id).length === 1 &&
    Object.keys(siftArgs[0].id)[0] === `$eq`
  )
}

function handleFirst(siftArgs, nodes) {
  const index = _.isEmpty(siftArgs)
    ? 0
    : sift.indexOf(
        {
          $and: siftArgs,
        },
        nodes
      )

  if (index !== -1) {
    return [nodes[index]]
  } else {
    return []
  }
}

function handleMany(siftArgs, nodes, sort) {
  let result = _.isEmpty(siftArgs)
    ? nodes
    : sift(
        {
          $and: siftArgs,
        },
        nodes
      )

  if (!result || !result.length) return null

  // Sort results.
  if (sort) {
    // create functions that return the item to compare on
    // uses _.get so nested fields can be retrieved
    const sortFields = sort.fields.map(field => v => _.get(v, field))
    const sortOrder = sort.order.map(order => order.toLowerCase())

    result = _.orderBy(result, sortFields, sortOrder)
  }
  return result
}

/**
 * Filters a list of nodes using mongodb-like syntax.
 *
 * @param args raw graphql query filter as an object
 * @param nodes The nodes array to run sift over (Optional
 *   will load itself if not present)
 * @param type gqlType. Created in build-node-types
 * @param firstOnly true if you want to return only the first result
 *   found. This will return a collection of size 1. Not a single
 *   element
 * @returns Collection of results. Collection will be limited to size
 *   if `firstOnly` is true
 */
module.exports = (args: Object) => {
  const { getNode, getNodesByType } = require(`../db/nodes`)

  const { queryArgs, gqlType, firstOnly = false } = args

  // If nodes weren't provided, then load them from the DB
  const nodes = args.nodes || getNodesByType(gqlType.name)

  const { siftArgs, fieldsToSift } = parseFilter(queryArgs.filter)
  // FIXME: fieldsToSift must include `sort.fields` as well as the
  // `field` arg on `group` and `distinct`

  // If the the query for single node only has a filter for an "id"
  // using "eq" operator, then we'll just grab that ID and return it.
  if (isEqId(firstOnly, fieldsToSift, siftArgs)) {
    const node = getNode(siftArgs[0].id[`$eq`])

    if (!node || (node.internal && node.internal.type !== gqlType.name)) {
      return []
    }

    return resolveRecursive(node, fieldsToSift, gqlType.getFields()).then(
      node => (node ? [node] : [])
    )
  }

  return resolveNodes(
    nodes,
    gqlType.name,
    firstOnly,
    fieldsToSift,
    gqlType.getFields()
  ).then(resolvedNodes => {
    if (firstOnly) {
      return handleFirst(siftArgs, resolvedNodes)
    } else {
      return handleMany(siftArgs, resolvedNodes, queryArgs.sort)
    }
  })
}
