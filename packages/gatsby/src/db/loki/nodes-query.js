const _ = require(`lodash`)
const {
  GraphQLUnionType,
  GraphQLInterfaceType,
  GraphQLList,
  getNullableType,
  getNamedType,
  isCompositeType,
} = require(`graphql`)
const prepareRegex = require(`../../utils/prepare-regex`)
const { getNodeTypeCollection, ensureFieldIndexes } = require(`./nodes`)
const { getValueAt } = require(`../../utils/get-value-at`)

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
  lastFieldType = getNullableType(lastFieldType)
  const mongoArgs = {}
  _.each(gqlFilter, (v, k) => {
    if (_.isPlainObject(v)) {
      if (k === `elemMatch`) {
        mongoArgs[`$elemMatch`] = toMongoArgs(v, getNamedType(lastFieldType))
      } else if (lastFieldType instanceof GraphQLList) {
        mongoArgs[`$elemMatch`] = {
          [k]: toMongoArgs(v, getNamedType(lastFieldType)),
        }
      } else {
        const gqlFieldType = lastFieldType.getFields()[k].type
        mongoArgs[k] = toMongoArgs(v, gqlFieldType)
      }
    } else {
      if (k === `regex`) {
        const re = prepareRegex(v)
        // To ensure that false is returned if a field doesn't
        // exist. E.g `{nested.field: {$regex: /.*/}}`
        mongoArgs[`$where`] = obj => !_.isUndefined(obj) && re.test(obj)
      } else if (k === `glob`) {
        const Minimatch = require(`minimatch`).Minimatch
        const mm = new Minimatch(v)
        mongoArgs[`$regex`] = mm.makeRe()
      } else if (k === `eq` && v === null) {
        mongoArgs[`$in`] = [null, undefined]
      } else if (
        k === `eq` &&
        lastFieldType &&
        lastFieldType instanceof GraphQLList
      ) {
        mongoArgs[`$contains`] = v
      } else if (
        k === `ne` &&
        lastFieldType &&
        lastFieldType instanceof GraphQLList
      ) {
        mongoArgs[`$containsNone`] = v
      } else if (
        k === `in` &&
        lastFieldType &&
        lastFieldType instanceof GraphQLList
      ) {
        mongoArgs[`$containsAny`] = v
      } else if (
        k === `nin` &&
        lastFieldType &&
        lastFieldType instanceof GraphQLList
      ) {
        mongoArgs[`$containsNone`] = v
      } else if (k === `ne` && v === null) {
        mongoArgs[`$ne`] = undefined
      } else if (k === `nin` && lastFieldType.name === `Boolean`) {
        mongoArgs[`$nin`] = v.concat([undefined])
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
const toDottedFields = (filter, acc = {}, path = []) => {
  Object.keys(filter).forEach(key => {
    const value = filter[key]
    const nextValue = _.isPlainObject(value) && value[Object.keys(value)[0]]
    if (key === `$elemMatch`) {
      acc[path.join(`.`)] = { [`$elemMatch`]: toDottedFields(value) }
    } else if (_.isPlainObject(nextValue)) {
      toDottedFields(value, acc, path.concat(key))
    } else {
      acc[path.concat(key).join(`.`)] = value
    }
  })
  return acc
}

const objectToDottedField = (obj, path = []) => {
  let result = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (_.isPlainObject(value)) {
      const pathResult = objectToDottedField(value, path.concat(key))
      result = {
        ...result,
        ...pathResult,
      }
    } else {
      result[path.concat(key).join(`.`)] = value
    }
  })
  return result
}

// The query language that Gatsby has used since day 1 is `sift`. Both
// sift and loki are mongo-like query languages, but they have some
// subtle differences. One is that in sift, a nested filter such as
// `{foo: {bar: {ne: true} } }` will return true if the foo field
// doesn't exist, is null, or bar is null. Whereas loki will return
// false if the foo field doesn't exist or is null. This ensures that
// loki queries behave like sift
const isNeTrue = (obj, path) => {
  if (path.length) {
    const [first, ...rest] = path
    return obj == null || obj[first] == null || isNeTrue(obj[first], rest)
  } else {
    return obj !== true
  }
}

const fixNeTrue = filter =>
  Object.keys(filter).reduce((acc, key) => {
    const value = filter[key]
    if (value[`$ne`] === true) {
      const [first, ...path] = key.split(`.`)
      acc[first] = { [`$where`]: obj => isNeTrue(obj, path) }
    } else {
      acc[key] = value
    }
    return acc
  }, {})

const liftResolvedFields = (args, gqlType, resolvedFields) => {
  const dottedFields = objectToDottedField(resolvedFields)
  const dottedFieldKeys = Object.keys(dottedFields)
  const finalArgs = {}
  Object.keys(args).forEach(key => {
    const value = args[key]
    if (dottedFields[key]) {
      finalArgs[`$resolved.${key}`] = value
    } else if (
      dottedFieldKeys.some(dottedKey => dottedKey.startsWith(key)) &&
      value.$elemMatch
    ) {
      finalArgs[`$resolved.${key}`] = value
    } else if (dottedFieldKeys.some(dottedKey => key.startsWith(dottedKey))) {
      finalArgs[`$resolved.${key}`] = value
    } else {
      finalArgs[key] = value
    }
  })
  return finalArgs
}

// Converts graphQL args to a loki filter
const convertArgs = (gqlArgs, gqlType, resolvedFields) =>
  liftResolvedFields(
    fixNeTrue(toDottedFields(toMongoArgs(gqlArgs.filter, gqlType))),
    gqlType,
    resolvedFields
  )

// Converts graphql Sort args into the form expected by loki, which is
// a vector where the first value is a field name, and the second is a
// boolean `isDesc`. E.g
//
// {
//   fields: [ `frontmatter___date`, `id` ],
//   order: [`desc`]
// }
//
// would return
//
// [ [ `frontmatter.date`, true ], [ `id`, false ] ]
//
function toSortFields(sortArgs) {
  const { fields, order } = sortArgs
  const lokiSortFields = []
  for (let i = 0; i < fields.length; i++) {
    const dottedField = fields[i]
    const isDesc = order[i] && order[i].toLowerCase() === `desc`
    lokiSortFields.push([dottedField, isDesc])
  }
  return lokiSortFields
}

function doesSortFieldsHaveArray(type, sortArgs) {
  return sortArgs.some(([fields, _]) => {
    const [field, ...rest] = fields.split(`.`)
    const gqlField = type.getFields()[field]
    if (gqlField) {
      const type = getNullableType(gqlField.type)
      if (type instanceof GraphQLList) {
        return true
      } else {
        const namedType = getNamedType(type)
        if (isCompositeType(namedType) && rest.length > 0) {
          return doesSortFieldsHaveArray(namedType, [[rest.join(`.`), false]])
        }
      }
    }
    return false
  })
}

/**
 * Runs the graphql query over the loki nodes db.
 *
 * @param {Object} args. Object with:
 *
 * {Object} gqlType: A GraphQL type
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
async function runQuery(
  { gqlSchema, gqlType, queryArgs, firstOnly },
  resolvedFields = {}
) {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const gqlArgs = JSON.parse(JSON.stringify(queryArgs))
  const lokiArgs = convertArgs(gqlArgs, gqlType, resolvedFields)

  let possibleTypeNames
  if (
    gqlType instanceof GraphQLUnionType ||
    gqlType instanceof GraphQLInterfaceType
  ) {
    possibleTypeNames = gqlSchema
      .getPossibleTypes(gqlType)
      .map(type => type.name)
  } else {
    possibleTypeNames = [gqlType.name]
  }

  let chain
  let sortFields
  if (queryArgs.sort) {
    sortFields = toSortFields(queryArgs.sort)
  }
  const view = getNodeTypeCollection(possibleTypeNames)
  chain = view.branchResultset()
  // Somehow the simplesort in dynamic view can get reset, so we are doing it
  // here again
  chain.simplesort(`internal.$counter`)
  ensureFieldIndexes(lokiArgs, sortFields || [])

  chain.find(lokiArgs, firstOnly)

  if (sortFields) {
    // Loki is unable to sort arrays, so we fall back to lodash for that
    const sortFieldsHaveArray = doesSortFieldsHaveArray(gqlType, sortFields)
    const dottedFields = objectToDottedField(resolvedFields)
    const dottedFieldKeys = Object.keys(dottedFields)
    sortFields = sortFields.map(([field, order]) => {
      if (
        dottedFields[field] ||
        dottedFieldKeys.some(key => field.startsWith(key))
      ) {
        return [`$resolved.${field}`, order]
      } else {
        return [field, order]
      }
    })

    if (sortFieldsHaveArray) {
      const sortFieldAccessors = sortFields.map(([field, _]) => v =>
        getValueAt(v, field)
      )
      const sortFieldOrder = sortFields.map(([_, order]) =>
        order ? `desc` : `asc`
      )
      return _.orderBy(chain.data(), sortFieldAccessors, sortFieldOrder)
    } else {
      return chain.compoundsort(sortFields).data()
    }
  } else {
    return chain.data()
  }
}

module.exports = runQuery
