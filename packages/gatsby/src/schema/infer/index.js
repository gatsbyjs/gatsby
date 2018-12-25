const { schemaComposer } = require(`graphql-compose`)

const { getNodes, getNodesByType } = require(`../db`)
const { getExampleValue } = require(`./example-value`)
const { addNodeInterface, getNodeInterfaceFields } = require(`../interfaces`)
const { addInferredFields } = require(`./infer`)
const { getUniqueValues } = require(`../utils`)

const addInferredType = typeName => {
  const exampleValue = getExampleValue({
    nodes: getNodesByType(typeName),
    typeName,
    ignoreFields: getNodeInterfaceFields(),
  })
  const tc = schemaComposer.getOrCreateTC(typeName, tc => {
    addNodeInterface(tc)
  })
  // getNodeInterfaceFields().forEach(fieldName => delete exampleValue[fieldName])
  addInferredFields(tc, exampleValue, typeName)
  return tc
}

const addInferredTypes = () => {
  const typeNames = getUniqueValues(getNodes().map(node => node.internal.type))
  typeNames.forEach(addInferredType)
}

module.exports = {
  addInferredType,
  addInferredTypes,
}
