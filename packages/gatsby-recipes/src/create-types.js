const Joi2GQL = require(`./joi-to-graphql`)
const Joi = require(`@hapi/joi`)
const { GraphQLString, GraphQLObjectType, GraphQLList } = require(`graphql`)
const _ = require(`lodash`)

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

      const types = []

      const joiSchema = Joi.object().keys({
        ...resource.schema,
        _typeName: Joi.string(),
      })

      const type = Joi2GQL.transmuteType(joiSchema, {
        name: resourceName,
      })

      const resourceType = {
        type,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (_root, args, context) => {
          const value = await resource.read(context, args.id)
          return { ...value, _typeName: resourceName }
        },
      }

      types.push(resourceType)

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

        types.push(connectionType)
      }

      return types
    }
  )

  const types = _.flatten(resourceTypes)
    .filter(Boolean)
    .reduce((acc, curr) => {
      const typeName = typeNameToHumanName(curr.type.toString())
      acc[typeName] = curr
      return acc
    }, {})

  return types
}
