// @flow
const _ = require(`lodash`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
} = require(`graphql`)
const tracer = require(`opentracing`).globalTracer()

const apiRunner = require(`../utils/api-runner-node`)
const { inferObjectStructureFromNodes } = require(`./infer-graphql-type`)
const {
  inferInputObjectStructureFromFields,
} = require(`./infer-graphql-input-fields-from-fields`)
const {
  inferInputObjectStructureFromNodes,
} = require(`./infer-graphql-input-fields`)
const { nodeInterface } = require(`./node-interface`)
const { getNodes, getNode } = require(`../db/nodes`)
const pageDependencyResolver = require(`./page-dependency-resolver`)
const { setFileNodeRootType } = require(`./types/type-file`)
const { clearTypeExampleValues } = require(`./data-tree-utils`)
const { runQuery } = require(`../db/nodes`)

import type { ProcessedNodeType } from "./infer-graphql-type"

type TypeMap = {
  [typeName: string]: ProcessedNodeType,
}

module.exports = async ({ parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  const types = _.groupBy(
    getNodes().filter(node => node.internal && !node.internal.ignoreType),
    node => node.internal.type
  )
  const processedTypes: TypeMap = {}

  clearTypeExampleValues()

  // Reset stored File type to not point to outdated type definition
  setFileNodeRootType(null)

  function createNodeFields(type: ProcessedNodeType) {
    const defaultNodeFields = {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: `The id of this node.`,
      },
      parent: {
        type: nodeInterface,
        description: `The parent of this node.`,
        resolve: pageDependencyResolver(node => getNode(node.parent)),
      },
      children: {
        type: new GraphQLList(nodeInterface),
        description: `The children of this node.`,
        resolve: pageDependencyResolver(node => node.children.map(getNode)),
      },
    }

    // Create children fields for each type of children e.g.
    // "childrenMarkdownRemark".
    const childNodesByType = _(type.nodes)
      .flatMap(({ children }) => children.map(getNode))
      .groupBy(
        node => (node.internal ? _.camelCase(node.internal.type) : undefined)
      )
      .value()

    Object.keys(childNodesByType).forEach(childNodeType => {
      // Does this child type have one child per parent or multiple?
      const maxChildCount = _.maxBy(
        _.values(_.groupBy(childNodesByType[childNodeType], c => c.parent)),
        g => g.length
      ).length

      if (maxChildCount > 1) {
        defaultNodeFields[_.camelCase(`children ${childNodeType}`)] = {
          type: new GraphQLList(processedTypes[childNodeType].nodeObjectType),
          description: `The children of this node of type ${childNodeType}`,
          resolve: pageDependencyResolver(node =>
            node.children
              .map(getNode)
              .filter(node => _.camelCase(node.internal.type) === childNodeType)
          ),
        }
      } else {
        defaultNodeFields[_.camelCase(`child ${childNodeType}`)] = {
          type: processedTypes[childNodeType].nodeObjectType,
          description: `The child of this node of type ${childNodeType}`,
          resolve: pageDependencyResolver(node =>
            node.children
              .map(getNode)
              .find(node => _.camelCase(node.internal.type) === childNodeType)
          ),
        }
      }
    })

    const inferredFields = inferObjectStructureFromNodes({
      nodes: type.nodes,
      types: _.values(processedTypes),
      ignoreFields: Object.keys(type.fieldsFromPlugins),
    })

    return {
      ...defaultNodeFields,
      ...inferredFields,
      ...type.fieldsFromPlugins,
    }
  }

  async function createType(nodes, typeName) {
    const intermediateType = {}

    intermediateType.name = typeName
    intermediateType.nodes = nodes

    const fieldsFromPlugins = await apiRunner(`setFieldsOnGraphQLNodeType`, {
      type: intermediateType,
      traceId: `initial-setFieldsOnGraphQLNodeType`,
      parentSpan: span,
    })

    const mergedFieldsFromPlugins = _.merge(...fieldsFromPlugins)

    const inferredInputFieldsFromPlugins = inferInputObjectStructureFromFields({
      fields: mergedFieldsFromPlugins,
    })

    const gqlType = new GraphQLObjectType({
      name: typeName,
      description: `Node of type ${typeName}`,
      interfaces: [nodeInterface],
      fields: () => createNodeFields(proccesedType),
      isTypeOf: value => value.internal.type === typeName,
    })

    const inferedInputFields = inferInputObjectStructureFromNodes({
      nodes,
      typeName,
    })

    const filterFields = _.merge(
      {},
      inferedInputFields.inferredFields,
      inferredInputFieldsFromPlugins.inferredFields
    )

    const proccesedType: ProcessedNodeType = {
      ...intermediateType,
      fieldsFromPlugins: mergedFieldsFromPlugins,
      nodeObjectType: gqlType,
      node: {
        name: typeName,
        type: gqlType,
        args: filterFields,
        resolve: pageDependencyResolver(async (a, queryArgs) => {
          if (!_.isObject(queryArgs)) {
            queryArgs = {}
          }

          const results = await runQuery({
            queryArgs: {
              filter: {
                ...queryArgs,
              },
            },
            firstOnly: true,
            gqlType,
          })

          if (results.length > 0) {
            return results[0]
          } else {
            return null
          }
        }),
      },
    }

    processedTypes[_.camelCase(typeName)] = proccesedType

    // Special case to construct linked file type used by type inferring
    if (typeName === `File`) {
      setFileNodeRootType(gqlType)
    }
  }

  // Create node types and node fields for nodes that have a resolve function.
  await Promise.all(_.map(types, createType))

  span.finish()

  return processedTypes
}
