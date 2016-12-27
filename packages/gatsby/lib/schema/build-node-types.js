const _ = require(`lodash`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const select = require(`unist-util-select`)
const path = require(`path`)
const Promise = require(`bluebird`)

const apiRunner = require(`../utils/api-runner-node`)
const { inferObjectStructureFromNodes } = require(`./infer-graphql-type`)
const { inferInputObjectStructureFromNodes } = require(`./infer-graphql-input-fields`)
const nodeInterface = require(`./node-interface`)

module.exports = async (ast) => (
  new Promise((resolve) => {
    const allNodes = select(ast, `*`)
    const processedTypes = {}

    // Identify node types in the AST.
    const types = _.groupBy(allNodes, (node) => node.type)
    // Delete root and rootDirectory.
    delete types.root
    delete types.rootDirectory


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
        types: _.values(processedTypes),
      })

      return {
        ...defaultNodeFields,
        ...inferredFields,
        ...type.fieldsFromPlugins,
      }
    }

    // Create node types and node fields for nodes that have a resolve function.
    Promise.all(_.map(types, (nodes, typeName) => {
      return new Promise((typeResolve) => {
        const nodeType = {
          name: typeName,
          nodes,
        }
        apiRunner(`extendNodeType`, { type: nodeType, ast })
        .then((fieldsFromPlugins) => {
          const mergedFieldsFromPlugins = _.merge(...fieldsFromPlugins)
          nodeType.fieldsFromPlugins = mergedFieldsFromPlugins

          const inputArgs = inferInputObjectStructureFromNodes(
            nodes,
            ``,
            typeName
          )

          nodeType.nodeObjectType = new GraphQLObjectType({
            name: typeName,
            description: `Node of type ${typeName}`,
            fields: () => createNodeFields(nodeType),
            interfaces: [nodeInterface],
            isTypeOf: (value) => value.type === typeName,
          })

          nodeType.node = {
            name: typeName,
            type: nodeType.nodeObjectType,
            args: {
              ...inputArgs,
            },
            resolve (a, args) {
              const runSift = require(`./run-sift`)
              return runSift({
                args,
                nodes,
              })[0]
            },
          }

          nodeType.field = {
            name: _.camelCase(`${typeName} field`),
            type: nodeType.nodeObjectType,
            resolve: (node, a, b, { fieldName }) => {
              const linkedType = _.capitalize(fieldName.split(`___`)[1])
              if (node[fieldName]) {
                const sourceFileNode = _.find(allNodes, (n) => (
                  n.type === `File` && n.id === node._sourceNodeId
                ))

                // First assume the user is linking using the desired node's ID.
                // This is a temp hack but then assume the link is a relative path
                // and try to resolve it. Probably a better way is that each typegen
                // plugin can define a custom resolve function which handles special
                // logic for alternative ways of adding links between nodes.
                let linkedFileNode
                //linkedFileNode = select(ast, `${linkedType}[id="${node[fieldName]}"]`)[0]
                linkedFileNode = _.find(allNodes, (n) => (
                  n.type === linkedType && n.id === node[fieldName]
                ))
                if (linkedFileNode) {
                  return linkedFileNode
                } else if (linkedType === `File`) {
                  const fileLinkPath = path.resolve(sourceFileNode.dirname, node[fieldName])
                  linkedFileNode = _.find(allNodes, (n) => (
                    n.type === `File` && n.id === fileLinkPath
                  ))
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

          processedTypes[_.camelCase(typeName)] = nodeType
          typeResolve()
        })
      })
    }))
    .then(() => {
      return resolve(processedTypes)
    })
  })
)
