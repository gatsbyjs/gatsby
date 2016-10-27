import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
} from 'graphql'

const inferGraphQLType = (key, value) => {
  if (Array.isArray(value)) {
    const headType = inferGraphQLType(``, value[0])
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

module.exports = inferGraphQLType
