// @flow
const sift = require(`sift`)
const _ = require(`lodash`)
const { connectionFromArray } = require(`graphql-skip-limit`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const prepareRegex = require(`./prepare-regex`)
const Promise = require(`bluebird`)
const { trackInlineObjectsInRootNode } = require(`./node-tracking`)
const { getNode } = require(`../redux`)

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

/*
 * Filters a list of nodes using mongodb-like syntax.
 * Returns a single unwrapped element if connection = false.
 *
 */
module.exports = ({
  args,
  nodes,
  type,
  typeName,
  connection = false,
  path = ``,
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
              innerGqConfig.type &&
              _.isFunction(innerGqConfig.type.getFields)
            ) {
              return resolveRecursive(
                v,
                innerSift,
                innerGqConfig.type.getFields()
              )
            } else {
              return v
            }
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

  // If the the query only has a filter for an "id", then we'll just grab
  // that ID and return it.
  if (
    Object.keys(fieldsToSift).length === 1 &&
    Object.keys(fieldsToSift)[0] === `id`
  ) {
    const node = resolveRecursive(
      getNode(siftArgs[0].id[`$eq`]),
      fieldsToSift,
      type.getFields()
    )

    if (node) {
      createPageDependency({
        path,
        nodeId: node.id,
      })
    }

    return node
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
      process.env.NODE_ENV !== `test` &&
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
    if (!connection) {
      const index = _.isEmpty(siftArgs)
        ? 0
        : sift.indexOf(
            {
              $and: siftArgs,
            },
            myNodes
          )

      // If a node is found, create a dependency between the resulting node and
      // the path.
      if (index !== -1) {
        createPageDependency({
          path,
          nodeId: myNodes[index].id,
        })

        return myNodes[index]
      } else {
        return null
      }
    }

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

    const connectionArray = connectionFromArray(result, args)
    connectionArray.totalCount = result.length
    if (result.length > 0 && result[0].internal) {
      createPageDependency({
        path,
        connection: result[0].internal.type,
      })
    }
    return connectionArray
  })

  return tempPromise
}
