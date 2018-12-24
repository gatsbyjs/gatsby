const { schemaComposer, TypeComposer } = require(`graphql-compose`)
const { hasNodeInterface } = require(`../interfaces`)

const addFieldsFromNodeAPI = () => {
  const apiRunner = require(`../../utils/api-runner-node`)
  const types = Array.from(schemaComposer.types).filter(
    ([typeName, tc]) => tc instanceof TypeComposer && hasNodeInterface(tc)
  )
  return Promise.all(
    types.map(async ([typeName, tc]) => {
      const fields = await apiRunner(`setFieldsOnGraphQLNodeType`, {
        // FIXME: Currently, nodes are passed as well, but that seems
        // unnecessary since we pass down `getNodesByType()` anyway
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
    })
  )
}

module.exports = addFieldsFromNodeAPI
