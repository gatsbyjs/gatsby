const _ = require(`lodash`)
const Promise = require(`bluebird`)
const { getDb } = require(`../db`)
const prepareRegex = require(`./prepare-regex`)

// Takes a raw graphql filter and converts it into a mongo-like args
// object. E.g `eq` becomes `$eq`. gqlFilter should be the raw graphql
// filter returned from graphql-js. e.g:
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
function toMongoArgs(gqlFilter) {
  const mongoArgs = {}
  _.each(gqlFilter, (v, k) => {
    if (_.isPlainObject(v)) {
      if (k === `elemMatch`) {
        k = `$elemMatch`
      }
      mongoArgs[k] = toMongoArgs(v)
    } else {
      // Compile regex first.
      if (k === `regex`) {
        mongoArgs[`$regex`] = prepareRegex(v)
      } else if (k === `glob`) {
        const Minimatch = require(`minimatch`).Minimatch
        const mm = new Minimatch(v)
        mongoArgs[`$regex`] = mm.makeRe()
      } else if (k === `in`) {
        mongoArgs[`$contains`] = v
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

// Converts graphQL args to a loki query
function convertArgs(gqlArgs) {
  const dottedFields = {}
  dotNestedFields(dottedFields, toMongoArgs(gqlArgs.filter))
  return dottedFields
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
function toSortFields(sortArgs) {
  const { fields, order } = sortArgs
  return _.map(fields, field => [
    field.replace(/___/g, `.`),
    _.lowerCase(order) === `desc`,
  ])
}

// Ensure there is an index for each query field. If the index already
// exists, this is a noop (handled by lokijs).
function ensureIndexes(coll, findArgs) {
  _.forEach(findArgs, (v, fieldName) => {
    coll.ensureIndex(fieldName)
  })
}

function execLokiQuery(coll, findArgs, gqlArgs) {
  let chain = coll.chain().find(findArgs)
  const { sort } = gqlArgs

  if (sort) {
    chain = chain.compoundsort(toSortFields(sort))
  }

  return chain.data()
}

/**
 * Runs the graphql query over the loki nodes db.
 *
 * @param {Object} args. Object with:
 *
 * {Object} gqlType: built during `./build-node-types.js`
 *
 * {Object} rawGqlArgs: The raw graphql query as a js object. E.g `{
 * filter: { fields { slug: { eq: "/somepath" } } } }`
 *
 * {Object} context: The context from the QueryJob
 */
function runQuery({ gqlType, rawGqlArgs, context = {}, firstOnly }) {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const gqlArgs = JSON.parse(JSON.stringify(rawGqlArgs))

  const lokiArgs = convertArgs(gqlArgs)

  const coll = getDb().getCollection(gqlType.name)

  // Allow page creators to specify that they want indexes
  // automatically created for their pages.
  if (context.useQueryIndex) {
    ensureIndexes(coll, lokiArgs)
  }

  let chain = coll.chain().find(lokiArgs, firstOnly)

  const { sort } = gqlArgs
  if (sort) {
    const sortFields = toSortFields(sort)
    _.forEach(sortFields, ([fieldName]) => {
      coll.ensureIndex(fieldName)
    })
    chain = chain.compoundsort(sortFields)
  }

  return Promise.resolve(chain.data())
}

module.exports = {
  convertArgs,
  runQuery,
}
