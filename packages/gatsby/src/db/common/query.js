const _ = require(`lodash`)

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

// Like above, but doesn't handle $elemMatch
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

const liftResolvedFields = (args, resolvedFields) => {
  const dottedFields = objectToDottedField(resolvedFields)
  const dottedFieldKeys = Object.keys(dottedFields)
  const finalArgs = {}
  Object.keys(args).forEach(key => {
    const value = args[key]
    if (dottedFields[key]) {
      finalArgs[`__gatsby_resolved.${key}`] = value
    } else if (
      dottedFieldKeys.some(dottedKey => dottedKey.startsWith(key)) &&
      value.$elemMatch
    ) {
      finalArgs[`__gatsby_resolved.${key}`] = value
    } else if (dottedFieldKeys.some(dottedKey => key.startsWith(dottedKey))) {
      finalArgs[`__gatsby_resolved.${key}`] = value
    } else {
      finalArgs[key] = value
    }
  })
  return finalArgs
}

module.exports = {
  toDottedFields,
  objectToDottedField,
  liftResolvedFields,
}
