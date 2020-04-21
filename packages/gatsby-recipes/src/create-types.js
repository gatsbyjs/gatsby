const Joi2GQL = require(`./joi-to-graphql`)
const Joi = require(`@hapi/joi`)
const { GraphQLString, GraphQLObjectType, GraphQLList } = require(`graphql`)
const _ = require(`lodash`)
const { ObjectTypeComposer, schemaComposer } = require(`graphql-compose`)

const resources = require(`./resources`)

const typeNameToHumanName = name => {
  if (name.endsWith(`Connection`)) {
    return `all` + name.replace(/Connection$/, ``)
  } else {
    return _.camelCase(name)
  }
}

module.exports = () => {
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

      const destroyMutation = {
        type,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (_root, args, context) => {
          const value = await resource.destroy(context, args)
          return { ...value, _typeName: resourceName }
        },
      }

      mutationTypes[`destroy${resourceName}`] = destroyMutation

      // const inputType = ObjectTypeComposer.create(
      //   type,
      //   schemaComposer
      // ).getInputType()

      // const mutationType = {
      //   type,
      //   args: {
      //     [resourceName]: inputType,
      //   },
      //   resolve: async (_root, _args, context) => {
      //     return await resource.
      //   }
      // }

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
      acc[key] = curr[key]
    })
    return acc
  }, {})

  console.log(mutationTypes)

  return {
    queryTypes,
    mutationTypes,
  }
}
