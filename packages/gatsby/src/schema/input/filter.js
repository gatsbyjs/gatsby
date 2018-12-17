const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require(`graphql`)
const { InputTypeComposer } = require(`graphql-compose`)

const { getQueryOperators } = require(`../query`)

const cache = new Map()

const convert = itc => {
  const type = itc.getType()
  if (cache.has(type)) {
    return cache.get(type)
  }

  const convertedItc = new InputTypeComposer(
    new GraphQLInputObjectType({
      name: itc.getTypeName(),
      fields: {},
    })
  )
  cache.set(type, convertedItc)

  const fields = itc.getFields()
  const convertedFields = Object.entries(fields).reduce(
    (acc, [fieldName, fieldConfig]) => {
      let { type } = fieldConfig

      // TODO: getNamedType()
      while (type instanceof GraphQLList || type instanceof GraphQLNonNull) {
        type = type.ofType
      }
      if (type instanceof GraphQLInputObjectType) {
        acc[fieldName] = convert(new InputTypeComposer(type))
      } else {
        // GraphQLScalarType || GraphQLEnumType
        const operatorFields = getQueryOperators(type)
        if (operatorFields) {
          acc[fieldName] = operatorFields
        }
      }
      return acc
    },
    {}
  )

  convertedItc.addFields(convertedFields)
  return convertedItc
}

const getFilterInput = itc => convert(itc)

module.exports = getFilterInput
