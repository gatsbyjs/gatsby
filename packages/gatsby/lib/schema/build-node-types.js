const _ = require(`lodash`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const select = require('unist-util-select')
const path = require(`path`)

const { inferObjectStructureFromNodes } = require(`./infer-graphql-type`)
const { inferInputObjectStructureFromNodes } = require(`./infer-graphql-input-fields`)
const nodeInterface = require(`./node-interface`)

module.exports = (types, ast) => {
    // TOOO
    // Loop through nodes getting instances — always take the first instance
    // and then based on 10/total size of nodes odds get another 5 instances.
    // then take majority decision of infer-graphql-types based on these
    // five instances.

  const createNodeFields = (type) => {
    const defaultNodeFields = {
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

    const inferredFields = inferObjectStructureFromNodes({
      nodes: type.nodes,
      types,
    })

    return {
      ...defaultNodeFields,
      ...inferredFields,
      ...type.fields,
    }
  }

  // Create node types and node fields for nodes that have a resolve function.
  return types.map((type) => {
    const inputArgs = inferInputObjectStructureFromNodes(
      type.nodes,
      ``,
      type.name
    )
    const nodeObjectType = new GraphQLObjectType({
      name: type.name,
      description: `Node of type ${type.name}`,
      fields: () => createNodeFields(type),
      interfaces: [nodeInterface],
      isTypeOf: (value) => value.type === type.type,
    })

    const nodeType = {
      name: type.name,
      type: nodeObjectType,
      args: {
        ...inputArgs,
      },
      resolve (a, args) {
        const runSift = require(`./run-sift`)
        return runSift({
          args,
          nodes: type.nodes,
        })[0]
      },
    }

    type.field = {
      name: _.camelCase(`${type.name} field`),
      type: nodeObjectType,
      resolve: (node, a, b, { fieldName }) => {
        const linkedType = _.capitalize(fieldName.split(`___`)[1])
        if (node[fieldName]) {
          const fileNode = select(ast, `File[id="${node._sourceNodeId}"]`)[0]

          // First assume the user is linking using the desired node's ID.
          // This is a temp hack but then assume the link is a relative path
          // and try to resolve it. Probably a better way is that each typegen
          // plugin can define a custom resolve function which handles special
          // logic for alternative ways of adding links between nodes.
          let linkedFileNode
          linkedFileNode = select(ast, `${linkedType}[id="${node[fieldName]}"]`)[0]
          if (linkedFileNode) {
            return linkedFileNode
          } else if (linkedType === `File`) {
            const fileLinkPath = path.resolve(fileNode.dirname, node[fieldName])
            linkedFileNode = select(ast, `${linkedType}[id="${fileLinkPath}"]`)[0]
            if (linkedFileNode) {
              return linkedFileNode
            } else {
              console.error(`Unable to load the linked ${linkedType} for`, node)
              return null
            }
          } else {
            console.error(`Unable to load the linked ${linkedType} for`, node)
            return null
          }
        } else {
          return null
        }
      },
    }

    return { [_.camelCase(type.name)]: nodeType }
  })
}
