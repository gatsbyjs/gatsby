const { schemaComposer, TypeComposer } = require(`graphql-compose`)
const { hasNodeInterface } = require(`../interfaces`)

const addFieldsFromNodeAPI = () => {
  const apiRunner = require(`../../utils/api-runner-node`)
  const types = Array.from(schemaComposer.types).filter(
    ([typeName, tc]) => tc instanceof TypeComposer && hasNodeInterface(tc)
  )
  return Promise.all(
    types.map(async ([typeName, tc]) => {
      const [fields] = await apiRunner(`setFieldsOnGraphQLNodeType`, {
        type: { name: typeName },
        // FIXME: Dont' pass schemaComposer
        schemaComposer,
        // traceId: `initial-setFieldsOnGraphQLNodeType`,
        // parentSpan: span,
      })
      if (fields) {
        tc.addFields(fields)
      }
    })
  )
}

module.exports = addFieldsFromNodeAPI
