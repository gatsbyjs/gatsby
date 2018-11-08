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
const {
  getNodes,
  getNode,
  getNodeAndSavePathDependency,
} = require(`../db/nodes`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const { setFileNodeRootType } = require(`./types/type-file`)
const { clearTypeExampleValues } = require(`./data-tree-utils`)
const { runQuery } = require(`../db/nodes`)

import type { ProcessedNodeType } from "./infer-graphql-type"

type TypeMap = {
  [typeName: string]: ProcessedNodeType,
}

const defaultNodeFields = {
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: `The id of this node.`,
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
      return node.children.map(id => getNodeAndSavePathDependency(id, path))
    },
  },
}

function groupChildNodesByType(nodes) {
  return _(nodes)
    .flatMap(node => node.children.map(getNode))
    .groupBy(node =>
      node.internal ? _.camelCase(node.internal.type) : undefined
    )
    .value()
}

function nodeIsOfType(typeName) {
  return node => _.camelCase(node.internal.type) === typeName
}

function makeChildrenResolver(typeName) {
  return (node, a, { path }) => {
    const childNodes = node.children.map(getNode)
    const filteredNodes = childNodes.filter(nodeIsOfType(typeName))

    // Add dependencies for the path
    filteredNodes.forEach(n =>
      createPageDependency({
        path,
        nodeId: n.id,
      })
    )
    return filteredNodes
  }
}

function buildChildrenFieldConfigMap(typeName, nodeObjectType) {
  const fieldName = _.camelCase(`children ${typeName}`)
  const fieldConfig = {
    type: new GraphQLList(nodeObjectType),
    description: `The children of this node of type ${typeName}`,
    resolve: makeChildrenResolver(typeName),
  }
  return { [fieldName]: fieldConfig }
}

function makeChildResolver(typeName) {
  return (node, a, { path }) => {
    const childNodes = node.children.map(getNode)
    const childNode = childNodes.find(nodeIsOfType(typeName))

    if (childNode) {
      // Add dependencies for the path
      createPageDependency({
        path,
        nodeId: childNode.id,
      })
      return childNode
    }
    return null
  }
}

function buildChildFieldConfigMap(typeName, nodeObjectType) {
  const fieldName = _.camelCase(`child ${typeName}`)
  const fieldConfig = {
    type: nodeObjectType,
    description: `The child of this node of type ${typeName}`,
    resolve: makeChildResolver(typeName),
  }
  return { [fieldName]: fieldConfig }
}

function inferChildFieldConfigMap(type, typeName, processedTypes) {
  const { nodeObjectType } = processedTypes[typeName]
  // Does this child type have one child per parent or multiple?
  const maxChildCount = _.maxBy(
    _.values(_.groupBy(type, c => c.parent)),
    g => g.length
  ).length

  if (maxChildCount > 1) {
    return buildChildrenFieldConfigMap(typeName, nodeObjectType)
  } else {
    return buildChildFieldConfigMap(typeName, nodeObjectType)
  }
}

function inferChildFields(nodes, processedTypes) {
  // Create children fields for each type of children e.g.
  // "childrenMarkdownRemark".
  const childNodesByType = groupChildNodesByType(nodes)

  const configMaps = _.map(childNodesByType, (type, typeName) =>
    inferChildFieldConfigMap(type, typeName, processedTypes)
  )
  return _.assign.apply(null, [{}, ...configMaps])
}

function createNodeFields(type: ProcessedNodeType, { processedTypes }) {
  // Create children fields for each type of children e.g.
  // "childrenMarkdownRemark".
  const childFieldsMap = inferChildFields(type.nodes, processedTypes)

  const inferredFields = inferObjectStructureFromNodes({
    nodes: type.nodes,
    types: _.values(processedTypes),
    ignoreFields: Object.keys(type.fieldsFromPlugins),
  })

  return {
    ...defaultNodeFields,
    ...childFieldsMap,
    ...inferredFields,
    ...type.fieldsFromPlugins,
  }
}

async function createType(nodes, typeName, processedTypes, span) {
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
    fields: () => createNodeFields(processedType, { processedTypes }),
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

  const processedType: ProcessedNodeType = {
    ...intermediateType,
    fieldsFromPlugins: mergedFieldsFromPlugins,
    nodeObjectType: gqlType,
    node: {
      name: typeName,
      type: gqlType,
      args: filterFields,
      async resolve(a, queryArgs, context) {
        const path = context.path ? context.path : ``
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
          const result = results[0]
          const nodeId = result.id
          createPageDependency({ path, nodeId })
          return result
        } else {
          return null
        }
      },
    },
  }

  processedTypes[_.camelCase(typeName)] = processedType

  // Special case to construct linked file type used by type inferring
  if (typeName === `File`) {
    setFileNodeRootType(gqlType)
  }
}

function groupNodesByType(nodes) {
  return _.groupBy(
    nodes.filter(node => node.internal && !node.internal.ignoreType),
    node => node.internal.type
  )
}

module.exports = async ({ parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  const types = groupNodesByType(getNodes())
  const processedTypes: TypeMap = {}

  clearTypeExampleValues()

  // Reset stored File type to not point to outdated type definition
  setFileNodeRootType(null)

  // Create node types and node fields for nodes that have a resolve function.
  await Promise.all(
    _.map(types, (nodes, typeName) =>
      createType(nodes, typeName, processedTypes, span)
    )
  )

  span.finish()

  return processedTypes
}
