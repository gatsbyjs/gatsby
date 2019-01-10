const { GraphQLList, getNullableType, getNamedType } = require(`graphql`)

const { equals, oneOf } = require(`../query`)
const { isObject } = require(`../utils`)

// FIXME: Handle array of arrays
// Maybe TODO: should we check fieldValue *and* info.returnType?
const link = ({ by }) => (source, args, context, info) => {
  const fieldValue = source[info.fieldName]

  if (fieldValue == null || isObject(fieldValue)) return fieldValue
  if (
    Array.isArray(fieldValue) &&
    // TODO: Do we have to look with fieldValue.some(v => isObject(v))?
    (fieldValue[0] == null || isObject(fieldValue[0]))
  ) {
    return fieldValue
  }

  const { findById, findByIds, findMany, findOne } = require(`../resolvers`)

  if (by === `id`) {
    const [resolve, key] = Array.isArray(fieldValue)
      ? [findByIds, `ids`]
      : [findById, `id`]
    return resolve({
      source,
      args: { [key]: fieldValue },
      context,
      info,
    })
  }

  const operator = Array.isArray(fieldValue) ? oneOf : equals
  args.filter = by.split(`.`).reduceRight(
    (acc, key, i, { length }) => ({
      [key]: i === length - 1 ? operator(acc) : acc,
    }),
    fieldValue
  )

  const returnType = getNullableType(info.returnType)
  const typeName = getNamedType(returnType).name
  return returnType instanceof GraphQLList
    ? findMany(typeName)({ source, args, context, info })
    : findOne(typeName)({ source, args: args.filter, context, info })
}

module.exports = link
