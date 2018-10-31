// @flow
const sift = require(`sift`)
const _ = require(`lodash`)
const prepareRegex = require(`./prepare-regex`)
const Promise = require(`bluebird`)
const { trackInlineObjectsInRootNode } = require(`./node-tracking`)
const { getNode } = require(`../db/nodes`)

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

/**
 * Filters a list of nodes using mongodb-like syntax.
 *
 * @param args raw graphql query filter as an object
 * @param nodes The nodes array to run sift over
 * @param type gqlType
 * @param typeName
 * @param firstOnly true if you want to return only the first result
 * found. This will return a collection of size 1. Not a single
 * element
 * @returns Collection of results. Collection will be limited to size
 * if `firstOnly` is true
 */
module.exports = ({
  args,
  nodes,
  type,
  typeName,
  firstOnly = false,
}: Object) => {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const clonedArgs = JSON.parse(JSON.stringify(args))

  const siftifyArgs = object => {
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

  const siftArgs = []
  const fieldsToSift = {}
  if (clonedArgs.filter) {
    _.each(clonedArgs.filter, (v, k) => {
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

  // If the the query for single node only has a filter for an "id"
  // using "eq" operator, then we'll just grab that ID and return it.
  if (
    firstOnly &&
    Object.keys(fieldsToSift).length === 1 &&
    Object.keys(fieldsToSift)[0] === `id` &&
    Object.keys(siftArgs[0].id).length === 1 &&
    Object.keys(siftArgs[0].id)[0] === `$eq`
  ) {
    return resolveRecursive(
      getNode(siftArgs[0].id[`$eq`]),
      fieldsToSift,
      type.getFields()
    ).then(node => (node ? [node] : []))
  }

  const nodesPromise = () => {
    const nodesCacheKey = JSON.stringify({
      // typeName + count being the same is a pretty good
      // indication that the nodes are the same.
      typeName,
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
            resolveRecursive(node, fieldsToSift, type.getFields()).then(
              resolvedNode => {
                trackInlineObjectsInRootNode(resolvedNode)
                if (cacheKey) {
                  enhancedNodeCache.set(cacheKey, resolvedNode)
                }
                resolve(resolvedNode)
              }
            )
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
  const tempPromise = nodesPromise().then(myNodes => {
    if (firstOnly) {
      const index = _.isEmpty(siftArgs)
        ? 0
        : sift.indexOf(
            {
              $and: siftArgs,
            },
            myNodes
          )

      if (index !== -1) {
        return [myNodes[index]]
      } else {
        return []
      }
    } else {
      let result = _.isEmpty(siftArgs)
        ? myNodes
        : sift(
            {
              $and: siftArgs,
            },
            myNodes
          )

      if (!result || !result.length) return null

      // Sort results.
      if (clonedArgs.sort) {
        // create functions that return the item to compare on
        // uses _.get so nested fields can be retrieved
        const convertedFields = clonedArgs.sort.fields
          .map(field => field.replace(/___/g, `.`))
          .map(field => v => _.get(v, field))

        result = _.orderBy(result, convertedFields, clonedArgs.sort.order)
      }
      return result
    }
  })

  return tempPromise
}
