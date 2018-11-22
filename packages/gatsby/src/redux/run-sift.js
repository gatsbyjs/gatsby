// @flow
const sift = require(`sift`)
const _ = require(`lodash`)
const prepareRegex = require(`../utils/prepare-regex`)
const Promise = require(`bluebird`)
const { trackInlineObjectsInRootNode } = require(`../db/node-tracking`)
const { getNode, getNodesByType } = require(`../db/nodes`)

const resolvedNodesCache = new Map()
const enhancedNodeCache = new Map()
const enhancedNodePromiseCache = new Map()
const enhancedNodeCacheId = ({ node, args }) =>
  node && node.internal && node.internal.contentDigest
    ? JSON.stringify({
        nodeid: node.id,
        digest: node.internal.contentDigest,
        ...args,
      })
    : null

const nodesCache = new Map()

function loadNodes(type) {
  let nodes
  // this caching can be removed if we move to loki
  if (process.env.NODE_ENV === `production` && nodesCache.has(type)) {
    nodes = nodesCache.get(type)
  } else {
    nodes = getNodesByType(type)
    nodesCache.set(type, nodes)
  }
  return nodes
}

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
function extractFieldsToSift(prekey, key, preobj, obj, val) {
  if (_.isPlainObject(val)) {
    _.forEach((val: any), (v, k) => {
      if (k === `elemMatch`) {
        // elemMatch is operator for arrays and not field we want to prepare
        // so we need to skip it
        extractFieldsToSift(prekey, key, preobj, obj, v)
        return
      }
      preobj[prekey] = obj
      extractFieldsToSift(key, k, obj, {}, v)
    })
  } else {
    preobj[prekey] = true
  }
}

/**
 * Parse filter and returns an object with two fields:
 * - siftArgs: the filter in a format that sift understands
 * - fieldsToSift: filter with operate leaves (e.g { eq: 3 })
 *   removed. Used later to resolve all filter fields
 */
function parseFilter(filter) {
  const siftArgs = []
  const fieldsToSift = {}
  if (filter) {
    _.each(filter, (v, k) => {
      // Ignore connection and sorting args.
      if (_.includes([`skip`, `limit`, `sort`], k)) return

      siftArgs.push(
        siftifyArgs({
          [k]: v,
        })
      )
      extractFieldsToSift(``, k, {}, fieldsToSift, v)
    })
  }
  return { siftArgs, fieldsToSift }
}

/////////////////////////////////////////////////////////////////////
// Resolve nodes
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

function awaitSiftField(fields, node, k) {
  const field = fields[k]
  if (field.resolve) {
    return field.resolve(
      node,
      {},
      {},
      {
        fieldName: k,
      }
    )
  } else if (node[k] !== undefined) {
    return node[k]
  }

  return undefined
}

// Resolves every field used in the node.
function resolveRecursive(node, siftFieldsObj, gqFields) {
  return Promise.all(
    _.keys(siftFieldsObj).map(k =>
      Promise.resolve(awaitSiftField(gqFields, node, k))
        .then(v => {
          const innerSift = siftFieldsObj[k]
          const innerGqConfig = gqFields[k]
          if (
            _.isObject(innerSift) &&
            v != null &&
            innerGqConfig &&
            innerGqConfig.type
          ) {
            if (_.isFunction(innerGqConfig.type.getFields)) {
              // this is single object
              return resolveRecursive(
                v,
                innerSift,
                innerGqConfig.type.getFields()
              )
            } else if (
              _.isArray(v) &&
              innerGqConfig.type.ofType &&
              _.isFunction(innerGqConfig.type.ofType.getFields)
            ) {
              // this is array
              return Promise.all(
                v.map(item =>
                  resolveRecursive(
                    item,
                    innerSift,
                    innerGqConfig.type.ofType.getFields()
                  )
                )
              )
            }
          }

          return v
        })
        .then(v => [k, v])
    )
  ).then(resolvedFields => {
    const myNode = {
      ...node,
    }
    resolvedFields.forEach(([k, v]) => (myNode[k] = v))
    return myNode
  })
}

function resolveNodes(nodes, typeName, firstOnly, fieldsToSift, gqlFields) {
  const nodesCacheKey = JSON.stringify({
    // typeName + count being the same is a pretty good
    // indication that the nodes are the same.
    typeName,
    firstOnly,
    nodesLength: nodes.length,
    ...fieldsToSift,
  })
  if (
    process.env.NODE_ENV === `production` &&
    resolvedNodesCache.has(nodesCacheKey)
  ) {
    return Promise.resolve(resolvedNodesCache.get(nodesCacheKey))
  } else {
    return Promise.all(
      nodes.map(node => {
        const cacheKey = enhancedNodeCacheId({
          node,
          args: fieldsToSift,
        })
        if (cacheKey && enhancedNodeCache.has(cacheKey)) {
          return Promise.resolve(enhancedNodeCache.get(cacheKey))
        } else if (cacheKey && enhancedNodePromiseCache.has(cacheKey)) {
          return enhancedNodePromiseCache.get(cacheKey)
        }

        const enhancedNodeGenerationPromise = new Promise(resolve => {
          resolveRecursive(node, fieldsToSift, gqlFields).then(resolvedNode => {
            trackInlineObjectsInRootNode(resolvedNode)
            if (cacheKey) {
              enhancedNodeCache.set(cacheKey, resolvedNode)
            }
            resolve(resolvedNode)
          })
        })
        enhancedNodePromiseCache.set(cacheKey, enhancedNodeGenerationPromise)
        return enhancedNodeGenerationPromise
      })
    ).then(resolvedNodes => {
      resolvedNodesCache.set(nodesCacheKey, resolvedNodes)
      return resolvedNodes
    })
  }
}

/////////////////////////////////////////////////////////////////////
// Run Sift
/////////////////////////////////////////////////////////////////////

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
    const convertedFields = sort.fields
      .map(field => field.replace(/___/g, `.`))
      .map(field => v => _.get(v, field))

    // Gatsby's sort interface only allows one sort order (e.g `desc`)
    // to be specified. However, multiple sort fields can be
    // provided. This is inconsistent. The API should allow the
    // setting of an order per field. Until the API can be changed
    // (probably v3), we apply the sort order to the first field only,
    // implying asc order for the remaining fields.
    result = _.orderBy(result, convertedFields, [sort.order])
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
  const { queryArgs, gqlType, firstOnly = false } = args
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const clonedArgs = JSON.parse(JSON.stringify(queryArgs))

  // If nodes weren't provided, then load them from the DB
  const nodes = args.nodes || loadNodes(gqlType.name)

  const { siftArgs, fieldsToSift } = parseFilter(clonedArgs.filter)

  // If the the query for single node only has a filter for an "id"
  // using "eq" operator, then we'll just grab that ID and return it.
  if (isEqId(firstOnly, fieldsToSift, siftArgs)) {
    return resolveRecursive(
      getNode(siftArgs[0].id[`$eq`]),
      fieldsToSift,
      gqlType.getFields()
    ).then(node => (node ? [node] : []))
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
      return handleMany(siftArgs, resolvedNodes, clonedArgs.sort)
    }
  })
}
