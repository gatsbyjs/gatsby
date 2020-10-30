import * as Joi2GQL from "./joi-to-graphql"
import * as Joi from "@hapi/joi"
import { GraphQLString, GraphQLObjectType, GraphQLList } from "graphql"
import _ from "lodash"
import { ObjectTypeComposer, schemaComposer } from "graphql-compose"

import * as resources from "./resources"

const typeNameToHumanName = name => {
  if (name.endsWith(`Connection`)) {
    return `all` + name.replace(/Connection$/, ``)
  } else {
    return _.camelCase(name)
  }
}

export default function createTypes() {
  const resourceTypes = Object.entries(resources).map(
    ([resourceName, resource]) => {
      if (!resource.schema) {
        return undefined
      }

      const queryTypes = []
      const mutationTypes = {}

      const joiSchema = Joi.object().keys({
        ...resource.schema,
        _typeName: Joi.string(),
      })

      const type = Joi2GQL.transmuteType(joiSchema, {
        name: resourceName,
      })

      // Query
      const queryType = {
        type,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (_root, args, context) => {
          const value = await resource.read(context, args.id)
          return { ...value, _typeName: resourceName }
        },
      }

      queryTypes.push(queryType)

      // Query connection
      if (resource.all) {
        const connectionTypeName = resourceName + `Connection`

        const ConnectionType = new GraphQLObjectType({
          name: connectionTypeName,
          fields: {
            nodes: { type: new GraphQLList(type) },
          },
        })

        const connectionType = {
          type: ConnectionType,
          resolve: async (_root, _args, context) => {
            const nodes = await resource.all(context)
            return { nodes }
          },
        }

        queryTypes.push(connectionType)
      }

      // Destroy mutation
      const camelCasedResourceName = _.camelCase(resourceName)
      const inputType = ObjectTypeComposer.create(
        type,
        schemaComposer
      ).getInputType()

      const destroyMutation = {
        type,
        args: {
          [camelCasedResourceName]: { type: inputType },
        },
        resolve: async (_root, args, context) => {
          const value = await resource.destroy(
            context,
            args[camelCasedResourceName]
          )
          return { ...value, _typeName: resourceName }
        },
      }

      mutationTypes[`destroy${resourceName}`] = destroyMutation

      // Create mutation
      const createMutation = {
        type,
        args: {
          [camelCasedResourceName]: { type: inputType },
        },
        resolve: (_root, args, context) =>
          resource.create(context, args[camelCasedResourceName]),
      }

      mutationTypes[`create${resourceName}`] = createMutation

      // Update mutation
      const updateMutation = {
        type,
        args: {
          [camelCasedResourceName]: { type: inputType },
        },
        resolve: (_root, args, context) =>
          resource.update(context, args[camelCasedResourceName]),
      }

      mutationTypes[`update${resourceName}`] = updateMutation

      return {
        query: queryTypes,
        mutation: mutationTypes,
      }
    }
  )

  const queryTypes = _.flatten(
    resourceTypes.filter(Boolean).map(r => r.query)
  ).reduce((acc, curr) => {
    const typeName = typeNameToHumanName(curr.type.toString())
    acc[typeName] = curr
    return acc
  }, {})

  const mutationTypes = _.flatten(
    resourceTypes.filter(Boolean).map(r => r.mutation)
  ).reduce((acc, curr) => {
    Object.keys(curr).forEach(key => {
      acc[typeNameToHumanName(key)] = curr[key]
    })
    return acc
  }, {})

  return {
    queryTypes,
    mutationTypes,
  }
}
