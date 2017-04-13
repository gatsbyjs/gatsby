// @flow
const _ = require("lodash")
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} = require("graphql")
const select = require("unist-util-select")
const path = require("path")
const Promise = require("bluebird")
const mime = require("mime")
const slash = require("slash")

const apiRunner = require("../utils/api-runner-node")
const { inferObjectStructureFromNodes } = require("./infer-graphql-type")
const {
  inferInputObjectStructureFromNodes,
} = require(`./infer-graphql-input-fields`)
const nodeInterface = require("./node-interface")
const {
  store,
  getNodes,
  getNode,
  getNodeAndSavePathDependency,
} = require("../redux")

const { boundActionCreators } = require("../redux/actions")
const { addPageDependency } = boundActionCreators

module.exports = async () =>
  new Promise(resolve => {
    const processedTypes = {}

    // Identify node types in the data.
    const types = _.groupBy(getNodes(), node => node.type)

    const createNodeFields = type => {
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
          resolve(node, a, context) {
            return getNodeAndSavePathDependency(node.parent, context.path)
          },
        },
        children: {
          type: new GraphQLList(nodeInterface),
          description: `The children of this node.`,
          resolve(node, a, context) {
            return node.children.map(id =>
              getNodeAndSavePathDependency(id, context.path)
            )
          },
        },
      }

      const inferredFields = inferObjectStructureFromNodes({
        nodes: type.nodes,
        types: _.values(processedTypes),
        allNodes: getNodes(),
      })

      return {
        ...defaultNodeFields,
        ...inferredFields,
        ...type.fieldsFromPlugins,
      }
    }

    // Create node types and node fields for nodes that have a resolve function.
    Promise.all(
      _.map(
        types,
        (nodes, typeName) =>
          new Promise(typeResolve => {
            const nodeType = {
              name: typeName,
              nodes,
            }
            apiRunner(`extendNodeType`, {
              type: nodeType,
              allNodes: getNodes(),
            }).then(fieldsFromPlugins => {
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
                isTypeOf: value => value.type === typeName,
              })

              nodeType.node = {
                name: typeName,
                type: nodeType.nodeObjectType,
                args: {
                  ...inputArgs,
                },
                resolve(a, args, context) {
                  const runSift = require("./run-sift")
                  const latestNodes = _.filter(
                    getNodes(),
                    n => n.type === typeName
                  )
                  return runSift({
                    args,
                    nodes: latestNodes,
                    path: context.path,
                  })
                },
              }

              nodeType.field = {
                name: _.camelCase(`${typeName} field`),
                type: nodeType.nodeObjectType,
                resolve: (node, a, context, { fieldName }) => {
                  const mapping = store.getState().config.mapping
                  const fieldSelector = `${node.___path}.${fieldName}`
                  let fieldValue = node[fieldName]
                  const sourceFileNode = _.find(
                    getNodes(),
                    n => n.type === `File` && n.id === node._sourceNodeId
                  )

                  // Then test if the field is linking to a file.
                  if (
                    _.isString(fieldValue) &&
                    mime.lookup(fieldValue) !== `application/octet-stream`
                  ) {
                    const fileLinkPath = slash(
                      path.resolve(sourceFileNode.dir, fieldValue)
                    )
                    const linkedFileNode = _.find(
                      getNodes(),
                      n => n.type === `File` && n.id === fileLinkPath
                    )
                    if (linkedFileNode) {
                      addPageDependency({
                        path: context.path,
                        nodeId: linkedFileNode.id,
                      })
                      return linkedFileNode
                    }
                  }

                  // Next assume the field is using the ___TYPE notation.
                  const linkedType = _.capitalize(fieldName.split(`___`)[1])
                  if (fieldValue) {
                    // First assume the user is linking using the desired node's ID.
                    // This is a temp hack but then assume the link is a relative path
                    // and try to resolve it. Probably a better way is that each typegen
                    // plugin can define a custom resolve function which handles special
                    // logic for alternative ways of adding links between nodes.
                    let linkedFileNode
                    //linkedFileNode = select(dataTree, `${linkedType}[id="${node[fieldName]}"]`)[0]
                    linkedFileNode = _.find(
                      getNodes(),
                      n => n.type === linkedType && n.id === node[fieldName]
                    )

                    if (linkedFileNode) {
                      addPageDependency({
                        path: context.path,
                        nodeId: linkedFileNode.id,
                      })
                      return linkedFileNode
                    } else if (linkedType === `File`) {
                      const fileLinkPath = slash(
                        path.resolve(sourceFileNode.dir, node[fieldName])
                      )
                      linkedFileNode = _.find(
                        getNodes(),
                        n => n.type === `File` && n.id === fileLinkPath
                      )

                      if (linkedFileNode) {
                        addPageDependency({
                          path: context.path,
                          nodeId: linkedFileNode.id,
                        })
                        return linkedFileNode
                      } else {
                        console.error(
                          `Unable to load the linked ${linkedType} for`,
                          node
                        )
                        return null
                      }
                    } else {
                      console.error(
                        `Unable to load the linked ${linkedType} for`,
                        node
                      )
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
      )
    ).then(() => resolve(processedTypes))
  })
