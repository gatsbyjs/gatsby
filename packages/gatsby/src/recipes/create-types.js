const Joi2GQL = require(`joi2gql`)
const Joi = require(`@hapi/joi`)
const { GraphQLString } = require(`graphql`)
const _ = require(`lodash`)

const resources = require(`./resources`)

module.exports = () => {
  const types = Object.entries(resources)
    .map(([resourceName, resource]) => {
      if (!resource.validate) {
        return undefined
      }

      const joiSchema = Joi.object().keys(resource.validate())

      const config = {
        name: resourceName,
      }

      const type = Joi2GQL.transmuteType(joiSchema, config)

      return {
        type,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (_root, args, context) =>
          await resource.read(context, args.id),
      }
    })
    .filter(Boolean)
    .reduce((acc, curr) => {
      acc[_.camelCase(curr.type.toString())] = curr
      return acc
    }, {})

  return types
}
