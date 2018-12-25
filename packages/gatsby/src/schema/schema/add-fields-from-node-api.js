const { schemaComposer, TypeComposer } = require(`graphql-compose`)

const apiRunner = require(`../../utils/api-runner-node`)
const { hasNodeInterface } = require(`../interfaces`)

// const getTypeComposer = typeName => schemaComposer.getTC(typeName)

// const getType = typeName => schemaComposer.getTC(typeName).getType()

// // getFieldConfig
// const getResolver = (typeName, resolver) =>
//   schemaComposer.getTC(typeName).getResolver(resolver)

// const getResolverFn = (typeName, resolver) =>
//   schemaComposer.getTC(typeName).getResolver(resolver).resolve

// const getResolvers = typeName => ({
//   findOne: schemaComposer.getTC(typeName).getResolver(`findOne`).resolve,
//   findMany: schemaComposer.getTC(typeName).getResolver(`findMany`).resolve,
// })

const addFieldsFromNodeAPI = () =>
  Promise.all(
    Array.from(schemaComposer.types).map(async ([typeName, tc]) => {
      if (tc instanceof TypeComposer && hasNodeInterface(tc)) {
        const fields = await apiRunner(`setFieldsOnGraphQLNodeType`, {
          // FIXME: Currently, nodes are passed as well, but that seems
          // unnecessary since we pass down `getNodesByType()` anyway:
          // type { name: typeName, nodes: getNodesByType(typeName)},
          type: { name: typeName },
          // FIXME: Dont' pass schemaComposer (but one of the above - same in add-custom-resolvers)
          schemaComposer,
          // traceId: `initial-setFieldsOnGraphQLNodeType`,
          // parentSpan: span,
        })
        if (fields) {
          // NOTE: `setFieldsOnGraphQLNodeType` only allows setting
          // nested fields with a path as property name, i.e.
          // `{ 'frontmatter.published': 'Boolean' }`, but not in the form
          // `{ frontmatter: { published: 'Boolean' }}`
          tc.addNestedFields(fields)
        }
      }
    })
  )

module.exports = addFieldsFromNodeAPI
