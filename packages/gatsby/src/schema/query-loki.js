const _ = require(`lodash`)
const { db } = require(`../db`)

const exampleGqlFilter = {
  internal: {
    type: {
      eq: "TestNode",
    },
    content: {
      glob: "et",
    },
  },
  id: {
    glob: "12*",
  },
}

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

// Converts a nested mongo args object into a dotted notation. E.g
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
// Would return
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
function dotNestedFields(o, path = ``) {
  if (_.isPlainObject(o)) {
    if (_.isPlainObject(_.sample(o))) {
      return _.flatMap(o, (v, k) => {
        return dotNestedFields(v, path + `.` + k)
      })
    } else {
      return { [_.trimStart(path, `.`)]: o }
    }
  }
}

const exampleRawGqlArgs = {
  filter: {
    internal: {
      type: {
        eq: "TestNode",
      },
      content: {
        glob: "et",
      },
    },
    id: {
      glob: "12*",
    },
  },
}

// Converts graphQL args to a loki query
function convertArgs(gqlArgs) {
  // TODO: Might have to omit `skip`, `limit` and `sort` keys from
  // inside gqlArgs.filter first
  return dotNestedFields(toMongoArgs(gqlArgs.filter))
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
module.exports = ({ type, rawGqlArgs }) => {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const gqlArgs = JSON.parse(JSON.stringify(rawGqlArgs))

  const lokiArgs = convertArgs(gqlArgs)

  const coll = db.getCollection(type.name)

  const lokiResult = execLokiQuery(coll, lokiArgs, gqlArgs)

  return lokiResult
}
