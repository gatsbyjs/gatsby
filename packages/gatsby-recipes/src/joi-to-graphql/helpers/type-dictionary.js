"use strict"

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLEnumType,
} = require(`graphql`)

module.exports = {
  object: GraphQLObjectType,
  string: GraphQLString,
  guid: GraphQLID,
  integer: GraphQLInt,
  number: GraphQLFloat,
  array: GraphQLList,
  boolean: GraphQLBoolean,
  required: GraphQLNonNull,
  enum: GraphQLEnumType,
}
