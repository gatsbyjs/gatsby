// @flow
const _ = require(`lodash`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const Promise = require(`bluebird`)

const apiRunner = require(`../utils/api-runner-node`)
const { inferObjectStructureFromNodes } = require(`./infer-graphql-type`)
const {
  inferInputObjectStructureFromNodes,
} = require(`./infer-graphql-input-fields`)
const nodeInterface = require(`./node-interface`)
const { getNodes, getNode, getNodeAndSavePathDependency } = require(`../redux`)
const { addPageDependency } = require(`../redux/actions/add-page-dependency`)

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
          resolve(node, a, { path }) {
            return node.children.map(id =>
              getNodeAndSavePathDependency(id, path)
            )
          },
        },
      }

      // Create children fields for each type of children e.g.
      // "childrenMarkdownRemark".
      const typeChildrenNodes = _.flatten(
        type.nodes.map(n => n.children)
      ).map(id => getNode(id))
      const groupedChildren = _.groupBy(typeChildrenNodes, child => child.type)
      Object.keys(groupedChildren).forEach(groupChildrenKey => {
        // Does this child type have one child per parent or multiple?
        const maxChildCount = _.maxBy(
          _.values(_.groupBy(groupedChildren[groupChildrenKey], c => c.parent)),
          g => g.length
        ).length
        if (maxChildCount > 1) {
          defaultNodeFields[_.camelCase(`children ${groupChildrenKey}`)] = {
            type: new GraphQLList(
              _.values(processedTypes).find(t => t.name === groupChildrenKey)
                .nodeObjectType
            ),
            description: `The children of this node of type
            ${groupChildrenKey}`,
            resolve(node, a, { path }) {
              const filteredNodes = node.children
                .map(id => getNode(id))
                .filter(n => n.type === groupChildrenKey)
              // Add dependencies for the path
              filteredNodes.forEach(n =>
                addPageDependency({ path, nodeId: n.id })
              )
              return filteredNodes
            },
          }
        } else {
          defaultNodeFields[_.camelCase(`child ${groupChildrenKey}`)] = {
            type: _.values(processedTypes).find(
              t => t.name === groupChildrenKey
            ).nodeObjectType,
            description: `The child of this node of type ${groupChildrenKey}`,
            resolve(node, a, { path }) {
              const childNode = node.children
                .map(id => getNode(id))
                .find(n => n.type === groupChildrenKey)
              if (childNode) {
                // Add dependencies for the path
                addPageDependency({ path, nodeId: childNode.id })
                return childNode
              }
              return null
            },
          }
        }
      })

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
                  const runSift = require(`./run-sift`)
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

              processedTypes[_.camelCase(typeName)] = nodeType
              typeResolve()
            })
          })
      )
    ).then(() => resolve(processedTypes))
  })
