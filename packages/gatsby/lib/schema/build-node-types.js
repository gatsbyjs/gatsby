const _ = require(`lodash`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)

const { inferObjectStructureFromNodes } = require(`./infer-graphql-type`)
const nodeInterface = require(`./node-interface`)

module.exports = (types) => {
  return types.map((type) => {
    // Loop through nodes getting instances — always take the first instance
    // and then based on 10/total size of nodes odds get another 5 instances.
    // then take majority decision of infer-graphql-types based on these
    // five instances.

    const inferredFields = inferObjectStructureFromNodes(type.nodes)

    const nodeFields = {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: `The id of this node.`,
      },
      type: {
        type: GraphQLString,
        description: `The type of this node`,
      },
      parent: {
        type: nodeInterface,
        description: `The parent of this node.`,
      },
      children: {
        type: new GraphQLList(nodeInterface),
        description: `The children of this node.`,
      },
    }

    return {
      [_.camelCase(type.name)]: {
        name: type.name,
        type: new GraphQLObjectType({
          name: type.name,
          description: `Node of type ${type.name}`,
          fields: {
            ...inferredFields,
            ...nodeFields,
            ...type.fields,
          },
          interfaces: [nodeInterface],
          isTypeOf: (value) => value.type === type.type,
        }),
        args: {
          path: {
            type: GraphQLString,
          },
        },
        // TODO add arg filters for fields to nodes + connections.
        // sub-objects searches like (frontmatter: { title: { eq: "ab*" }})
        // eventually can do simple string match or more complex stuff
        // like regex, partial string matches, glob, etc.
        resolve (a, args) {
          if (args.path) {
            return _.find(type.nodes, (node) => node.path === args.path)
          } else {
            return type.nodes[0]
          }
        },
      },
    }
  })
}
