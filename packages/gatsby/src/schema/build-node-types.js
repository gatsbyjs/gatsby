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
const {
  getExampleValues,
  clearTypeExampleValues,
} = require(`./data-tree-utils`)
const { run: runQuery } = require(`../db/nodes-query`)
const lazyFields = require(`./lazy-fields`)

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
    resolve: pageDependencyResolver(node => getNode(node.parent)),
  },
  children: {
    type: new GraphQLList(nodeInterface),
    description: `The children of this node.`,
    resolve: pageDependencyResolver(node => node.children.map(getNode)),
  },
}

function groupChildNodesByType(nodes) {
  return _(nodes)
    .flatMap(node => node.children.map(getNode))
    .groupBy(
      node => (node.internal ? _.camelCase(node.internal.type) : undefined)
    )
    .value()
}

function nodeIsOfType(typeName) {
  return node => _.camelCase(node.internal.type) === typeName
}

function makeChildrenResolver(typeName) {
  return node => node.children.map(getNode).filter(nodeIsOfType(typeName))
}

function buildChildrenFieldConfigMap(typeName, nodeObjectType) {
  const fieldName = _.camelCase(`children ${typeName}`)
  const fieldConfig = {
    type: new GraphQLList(nodeObjectType),
    description: `The children of this node of type ${typeName}`,
    resolve: pageDependencyResolver(makeChildrenResolver(typeName)),
  }
  return { [fieldName]: fieldConfig }
}

function makeChildResolver(typeName) {
  return node => node.children.map(getNode).find(nodeIsOfType(typeName))
}

function buildChildFieldConfigMap(typeName, nodeObjectType) {
  const fieldName = _.camelCase(`child ${typeName}`)
  const fieldConfig = {
    type: nodeObjectType,
    description: `The child of this node of type ${typeName}`,
    resolve: pageDependencyResolver(makeChildResolver(typeName)),
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

function inferFields({ nodes, pluginFields, processedTypes }) {
  // Create children fields for each type of children e.g.
  // "childrenMarkdownRemark".
  const childFields = inferChildFields(nodes, processedTypes)

  const inferredFields = inferObjectStructureFromNodes({
    nodes,
    types: _.values(processedTypes),
    ignoreFields: Object.keys(pluginFields),
  })

  return {
    ...defaultNodeFields,
    ...childFields,
    ...inferredFields,
    ...pluginFields,
  }
}

function buildResolver(gqlType) {
  return async (a, queryArgs) => {
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
  }
}

function buildNodeObjectType({
  typeName,
  nodes,
  pluginFields,
  processedTypes,
}) {
  return new GraphQLObjectType({
    name: typeName,
    description: `Node of type ${typeName}`,
    interfaces: [nodeInterface],
    fields: () => inferFields({ nodes, pluginFields, processedTypes }),
    isTypeOf: value => value.internal.type === typeName,
  })
}

async function buildProcessedType({ nodes, typeName, processedTypes, span }) {
  const intermediateType = {}

  intermediateType.name = typeName
  intermediateType.nodes = nodes

  const pluginFields = await apiRunner(`setFieldsOnGraphQLNodeType`, {
    type: intermediateType,
    traceId: `initial-setFieldsOnGraphQLNodeType`,
    parentSpan: span,
  })

  const mergedFieldsFromPlugins = _.merge(...pluginFields)

  const pluginInputFields = inferInputObjectStructureFromFields({
    fields: mergedFieldsFromPlugins,
  })
  _.each(pluginInputFields.inferredFields, (fieldConfig, fieldName) => {
    lazyFields.add(typeName, fieldName)
  })

  const gqlType = buildNodeObjectType({
    typeName,
    nodes,
    pluginFields: mergedFieldsFromPlugins,
    processedTypes,
  })

  const exampleValue = getExampleValues({
    nodes,
    typeName,
    ignoreFields: Object.keys(mergedFieldsFromPlugins),
  })

  const nodeInputFields = inferInputObjectStructureFromNodes({
    nodes,
    typeName,
    exampleValue,
  })

  const filterFields = _.merge(
    {},
    nodeInputFields.inferredFields,
    pluginInputFields.inferredFields
  )

  return {
    ...intermediateType,
    fieldsFromPlugins: mergedFieldsFromPlugins,
    nodeObjectType: gqlType,
    node: {
      name: typeName,
      type: gqlType,
      args: filterFields,
      resolve: pageDependencyResolver(buildResolver(gqlType)),
    },
  }
}

function groupNodesByType(nodes) {
  return _.groupBy(
    nodes.filter(node => node.internal && !node.internal.ignoreType),
    node => node.internal.type
  )
}

async function buildAll({ parentSpan }) {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  const types = groupNodesByType(getNodes())
  const processedTypes: TypeMap = {}

  clearTypeExampleValues()

  // Reset stored File type to not point to outdated type definition
  setFileNodeRootType(null)

  // Create node types and node fields for nodes that have a resolve function.
  await Promise.all(
    _.map(types, async (nodes, typeName) => {
      const fieldName = _.camelCase(typeName)
      const processedType = await buildProcessedType({
        nodes,
        typeName,
        processedTypes,
        span,
      })
      processedTypes[fieldName] = processedType
      // Special case to construct linked file type used by type inferring
      if (typeName === `File`) {
        setFileNodeRootType(processedType.nodeObjectType)
      }
      return
    })
  )

  span.finish()

  return processedTypes
}

module.exports = {
  buildProcessedType,
  buildNodeObjectType,
  buildAll,
}
