const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require(`graphql`)
const { InputTypeComposer, EnumTypeComposer } = require(`graphql-compose`)

const { createSelector, createSortKey } = require(`../utils`)

const MAX_SORT_DEPTH = 3
const SORT_FIELD_DELIMITER = `___`

// const SortOrderEnum = new GraphQLEnumType({
const SortOrderEnum = EnumTypeComposer.create({
  name: `SortOrderEnum`,
  values: {
    ASC: { value: `ASC` },
    DESC: { value: `DESC` },
  },
})

const convert = (fields, prefix = ``, depth = 0) => {
  const sortFields = Object.entries(fields).reduce(
    (acc, [fieldName, fieldConfig]) => {
      let { type } = fieldConfig
      const sortKey = createSelector(prefix, fieldName)

      // TODO: getNamedType()
      while (type instanceof GraphQLList || type instanceof GraphQLNonNull) {
        type = type.ofType
      }
      if (type instanceof GraphQLInputObjectType) {
        if (depth < MAX_SORT_DEPTH) {
          Object.assign(acc, convert(type.getFields(), sortKey, depth + 1))
        }
      } else {
        // GraphQLScalarType || GraphQLEnumType
        acc[createSortKey(sortKey, SORT_FIELD_DELIMITER)] = {
          value: sortKey,
        }
      }
      return acc
    },
    {}
  )
  return sortFields
}

const getSortInput = itc => {
  const fields = itc.getFields()
  const sortFields = convert(fields)

  const typeName = itc.getTypeName().replace(/Input$/, ``)

  // const SortFieldsEnum = new GraphQLEnumType({
  const SortFieldsEnum = EnumTypeComposer.create({
    name: typeName + `SortFieldsEnum`,
    values: sortFields,
  })

  // const SortInput = new GraphQLInputObjectType({
  const SortInput = InputTypeComposer.create({
    name: typeName + `SortInput`,
    fields: {
      fields: [SortFieldsEnum],
      order: { type: SortOrderEnum, defaultValue: `ASC` },
    },
  })

  return SortInput
}

module.exports = getSortInput
