const { schemaComposer, TypeComposer } = require(`graphql-compose`)

const apiRunner = require(`../../utils/api-runner-node`)
const { hasNodeInterface } = require(`../interfaces`)

const addFieldsFromNodeAPI = () =>
  Promise.all(
    Array.from(schemaComposer.types).map(async ([typeName, tc]) => {
      if (tc instanceof TypeComposer && hasNodeInterface(tc)) {
        const [fields] = await apiRunner(`setFieldsOnGraphQLNodeType`, {
          // FIXME: Currently, nodes are passed as well, but that seems
          // unnecessary since we pass down `getNodesByType()` anyway:
          // type { name: typeName, nodes: getNodesByType(typeName)},
          type: { name: typeName },
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
