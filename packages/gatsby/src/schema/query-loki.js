const _ = require(`lodash`)
const Promise = require(`bluebird`)
const { db } = require(`../db`)

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
      if (k === `glob`) {
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
// must be a reference to an empty object. The converted fields will
// be added to tit. E.g
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
  // TODO: Might have to omit `skip`, `limit` and `sort` keys from
  // inside gqlArgs.filter first
  const dottedFields = {}
  dotNestedFields(dottedFields, toMongoArgs(gqlArgs.filter))
  return dottedFields
}

// Converts graphql Sort args into the form expected by loki, which
// expects a vector where the first value is a field, and the second
// is a boolean `isDesc`. Nested fields delimited by `___` are
// replaced by periods. E.g
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
    sortArgs === `desc`,
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

// Runs the graphql query through the loki nodes db.
// rawGqlArgs - The raw graphql query object as a js object. E.g
//   { filter: { fields { slug: { eq: "/somepath" } } } }
// type: the gqlType we're querying for
// TODO: It might need filter: added
function runQuery({ type, rawGqlArgs }) {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const gqlArgs = JSON.parse(JSON.stringify(rawGqlArgs))

  const lokiArgs = convertArgs(gqlArgs)

  const coll = db.getCollection(type.name)

  ensureIndexes(coll, lokiArgs)

  const result = execLokiQuery(coll, lokiArgs, gqlArgs)

  return Promise.resolve(result)
}

module.exports = {
  // exported for testing purposes only
  convertArgs,
  runQuery,
}
