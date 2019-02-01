const { getExampleValue } = require(`./example-value`)
const { addNodeInterface, getNodeInterface } = require(`../types/NodeInterface`)
const { addInferredFields } = require(`./infer`)

const addInferredType = ({
  schemaComposer,
  nodeStore,
  typeName,
  parentSpan,
}) => {
  const exampleValue = getExampleValue({
    nodes: nodeStore.getNodesByType(typeName),
    typeName,
    ignoreFields: [
      ...getNodeInterface({ schemaComposer }).getFieldNames(),
      `$loki`,
    ],
  })

  const typeComposer = schemaComposer.getOrCreateTC(typeName, tc => {
    addNodeInterface({ schemaComposer, typeComposer: tc })
  })

  addInferredFields({ schemaComposer, typeComposer, nodeStore, exampleValue })
  return typeComposer
}

const addInferredTypes = ({ schemaComposer, nodeStore, parentSpan }) => {
  const typeNames = nodeStore.getTypes()
  // TODO: Filter out ignoreType
  typeNames.forEach(typeName => {
    addInferredType({
      schemaComposer,
      nodeStore,
      typeName,
      parentSpan,
    })
  })
}

module.exports = {
  addInferredType,
  addInferredTypes,
}
