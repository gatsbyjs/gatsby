import {
  graphql,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} from 'graphql'

const getGraphQLType = (key, value) => {
  if (Array.isArray(value)) {
    const headType = getGraphQLType(``, value[0])
    return new GraphQLList(headType)
  }

  if (value === null) {
    return null
  }

  // Check if date object.
  if (typeof value.getMonth === `function`) {
    return `DATE`
  }

  switch (typeof value) {
    case `boolean`:
      return GraphQLBoolean
    case `string`:
      return GraphQLString
    case `object`:
      return GraphQLObjectType
    case `number`:
      return value % 1 == 0
        ? GraphQLInt
        : GraphQLFloat
  }
  return null
}

module.exports = getGraphQLType
