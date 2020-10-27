import { GraphQLObjectType, GraphQLSchema } from "graphql"
import Hoek from "@hapi/hoek"
import * as Joi from "@hapi/joi"
import { typeDictionary } from "../helpers"
const internals = {}

internals.inputSchema = Joi.object().keys({
  query: Joi.object(),
  mutation: Joi.object(),
  subscription: Joi.object(),
})

export default function composeSchema(schema = {}) {
  schema = Joi.attempt(schema, internals.inputSchema)

  Hoek.assert(Object.keys(schema).length > 0, `Must provide a schema`)

  const attrs = {}

  if (schema.query) {
    attrs.query = new GraphQLObjectType({
      name: `Query`,
      fields: internals.buildFields(schema.query),
    })
  }

  if (schema.mutation) {
    attrs.query = new GraphQLObjectType({
      name: `Mutation`,
      fields: internals.buildFields(schema.mutation),
    })
  }

  if (schema.subscription) {
    attrs.query = new GraphQLObjectType({
      name: `Subscription`,
      fields: internals.buildFields(schema.subscription),
    })
  }

  return new GraphQLSchema(attrs)
}

internals.buildFields = obj => {
  const attrs = {}

  for (const key in obj) {
    if (obj[key].isJoi) {
      attrs[key] = {
        type: typeDictionary[obj[key]._type],
        resolve: obj[key]._meta.find(item => item.resolve instanceof Function)
          .resolve,
      }
    } else {
      attrs[key] = {
        type: obj[key],
        args: obj[key]._typeConfig.args,
        resolve: obj[key]._typeConfig.resolve,
      }
    }
  }

  return attrs
}
