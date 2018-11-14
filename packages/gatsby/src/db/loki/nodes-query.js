const _ = require(`lodash`)
const prepareRegex = require(`../../utils/prepare-regex`)
const { getNodeTypeCollection } = require(`./nodes`)
const sift = require(`sift`)

// Takes a raw graphql filter and converts it into a mongo-like args
// object that can be understood by the `sift` library. E.g `eq`
// becomes `$eq`
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

// filter nodes using the `sift` library. But isn't this a loki query
// file? Yes, but we need to support all functionality provided by
// `run-sift`, and there are some operators that loki can't
// support. Like `elemMatch`, so for those fields, we fall back to
// sift
function runSift(nodes, query) {
  if (nodes) {
    const siftQuery = {
      $elemMatch: siftifyArgs(query),
    }
    return sift(siftQuery, nodes)
  } else {
    return null
  }
}

// Takes a raw graphql filter and converts it into a mongo-like args
// object that can be understood by loki. E.g `eq` becomes
// `$eq`. gqlFilter should be the raw graphql filter returned from
// graphql-js. e.g gqlFilter:
//
// {
//   internal: {
//     type: {
//       eq: "TestNode"
//     },
//     content: {
//       glob: "et"
//     }
//   },
//   id: {
//     glob: "12*"
//   }
// }
//
// would return
//
// {
//   internal: {
//     type: {
//       $eq: "TestNode"  // append $ to eq
//     },
//     content: {
//       $regex: new MiniMatch(v) // convert glob to regex
//     }
//   },
//   id: {
//     $regex: // as above
//   }
// }
function toMongoArgs(gqlFilter, lastFieldType) {
  const mongoArgs = {}
  _.each(gqlFilter, (v, k) => {
    if (_.isPlainObject(v)) {
      if (k === `elemMatch`) {
        // loki doesn't support elemMatch, so use sift (see runSift
        // comment above)
        mongoArgs[`$where`] = obj => {
          const result = runSift(obj, v)
          return result && result.length > 0
        }
      } else {
        const gqlFieldType = lastFieldType.getFields()[k].type
        mongoArgs[k] = toMongoArgs(v, gqlFieldType)
      }
    } else {
      // Compile regex first.
      if (k === `regex`) {
        mongoArgs[`$regex`] = prepareRegex(v)
      } else if (k === `glob`) {
        const Minimatch = require(`minimatch`).Minimatch
        const mm = new Minimatch(v)
        mongoArgs[`$regex`] = mm.makeRe()
      } else if (
        k === `in` &&
        lastFieldType &&
        lastFieldType.constructor.name === `GraphQLList`
      ) {
        mongoArgs[`$containsAny`] = v
      } else if (
        k === `nin` &&
        lastFieldType.constructor.name === `GraphQLList`
      ) {
        mongoArgs[`$containsNone`] = v
      } else if (k === `ne` && v === null) {
        mongoArgs[`$ne`] = undefined
      } else if (k === `nin` && lastFieldType.name === `Boolean`) {
        mongoArgs[`$nin`] = v.concat([false])
      } else {
        mongoArgs[`$${k}`] = v
      }
    }
  })
  return mongoArgs
}

// Converts a nested mongo args object into a dotted notation. acc
// (accumulator) must be a reference to an empty object. The converted
// fields will be added to it. E.g
//
// {
//   internal: {
//     type: {
//       $eq: "TestNode"
//     },
//     content: {
//       $regex: new MiniMatch(v)
//     }
//   },
//   id: {
//     $regex: newMiniMatch(v)
//   }
// }
//
// After execution, acc would be:
//
// {
//   "internal.type": {
//     $eq: "TestNode"
//   },
//   "internal.content": {
//     $regex: new MiniMatch(v)
//   },
//   "id": {
//     $regex: // as above
//   }
// }
function dotNestedFields(acc, o, path = ``) {
  if (_.isPlainObject(o)) {
    if (_.isPlainObject(_.sample(o))) {
      _.forEach(o, (v, k) => {
        dotNestedFields(acc, v, path + `.` + k)
      })
    } else {
      acc[_.trimStart(path, `.`)] = o
    }
  }
}

// The query language that Gatsby has used since day 1 is `sift`. Both
// sift and loki are mongo-like query languages, but they have some
// subtle differences. One is that in sift, a nested filter such as
// `{foo: {bar: {ne: true} } }` will return true if the foo field
// doesn't exist, is null, or bar is null. Whereas loki will return
// false if the foo field doesn't exist or is null. This ensures that
// loki queries behave like sift
function fixNeTrue(flattenedFields) {
  return _.transform(flattenedFields, (result, v, k) => {
    if (v[`$ne`] === true) {
      const s = k.split(`.`)
      if (s.length > 1) {
        result[s[0]] = {
          $or: [
            {
              $exists: false,
            },
            {
              $where: obj => obj === null || obj[s[1]] !== true,
            },
          ],
        }
        return result
      }
    }
    result[k] = v
    return result
  })
}

// Converts graphQL args to a loki filter
function convertArgs(gqlArgs, gqlType) {
  const dottedFields = {}
  dotNestedFields(dottedFields, toMongoArgs(gqlArgs.filter, gqlType))
  return fixNeTrue(dottedFields)
}

// Converts graphql Sort args into the form expected by loki, which is
// a vector where the first value is a field name, and the second is a
// boolean `isDesc`. Nested fields delimited by `___` are replaced by
// periods. E.g
//
// {
//   fields: [ `frontmatter___date`, `id` ],
//   order: `desc`
// }
//
// would return
//
// [ [ `frontmatter.date`, true ], [ `id`, true ] ]
//
// Note that the GraphQL Sort API provided by Gatsby doesn't allow the
// order to be specified per field. So we must apply the order to all
// fields.
function toSortFields(sortArgs) {
  const { fields, order } = sortArgs
  return _.map(fields, field => [
    field.replace(/___/g, `.`),
    _.lowerCase(order) === `desc`,
  ])
}

/**
 * Runs the graphql query over the loki nodes db.
 *
 * @param {Object} args. Object with:
 *
 * {Object} gqlType: built during `./build-node-types.js`
 *
 * {Object} queryArgs: The raw graphql query as a js object. E.g `{
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
async function runQuery({ gqlType, queryArgs, context = {}, firstOnly }) {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const gqlArgs = JSON.parse(JSON.stringify(queryArgs))
  const lokiArgs = convertArgs(gqlArgs, gqlType)
  const coll = getNodeTypeCollection(gqlType.name)
  let chain = coll.chain().find(lokiArgs, firstOnly)

  const { sort } = gqlArgs
  if (sort) {
    const sortFields = toSortFields(sort)
    chain = chain.compoundsort(sortFields)
  }

  return chain.data()
}

module.exports = runQuery
