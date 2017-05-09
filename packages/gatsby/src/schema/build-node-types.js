// @flow
import _ from 'lodash'
import Promise from 'bluebird'
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} from 'graphql'

import apiRunner from '../utils/api-runner-node'
import { inferObjectStructureFromNodes } from './infer-graphql-type'
import {
  inferInputObjectStructureFromNodes,
} from './infer-graphql-input-fields'
import { nodeInterface } from './node-interface'
import { getNodes, getNode, getNodeAndSavePathDependency } from '../redux'
import { addPageDependency } from '../redux/actions/add-page-dependency'

import type { ProcessedNodeType } from './infer-graphql-type'

type TypeMap = { [typeName: string]: ProcessedNodeType }

module.exports = async () =>
  new Promise(resolve => {
    // Identify node types in the data.
    const types = _.groupBy(getNodes(), node => node.type)

    const processedTypes: TypeMap = {}

    function createNodeFields(type: ProcessedNodeType) {
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
      const groupedChildren = _(type.nodes)
        .flatMap(`children`)
        .groupBy(id => _.camelCase(getNode(id).type))
        .value()

      Object.keys(groupedChildren).forEach(groupChildrenKey => {
        // Does this child type have one child per parent or multiple?
        const maxChildCount = _.maxBy(
          _.values(_.groupBy(groupedChildren[groupChildrenKey], c => c.parent)),
          g => g.length
        ).length

        if (maxChildCount > 1) {
          defaultNodeFields[_.camelCase(`children ${groupChildrenKey}`)] = {
            type: new GraphQLList(
              processedTypes[groupChildrenKey].nodeObjectType
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
            type: processedTypes[groupChildrenKey].nodeObjectType,
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
            const nodeType: ProcessedNodeType = {
              name: typeName,
              nodes,
            }

            apiRunner(`extendNodeType`, {
              type: nodeType,
              allNodes: getNodes(),
            }).then(fieldsFromPlugins => {
              const mergedFieldsFromPlugins = _.merge(...fieldsFromPlugins)
              nodeType.fieldsFromPlugins = mergedFieldsFromPlugins

              const inputArgs = inferInputObjectStructureFromNodes({
                nodes,
                typeName,
              })

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
