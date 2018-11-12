const { schemaComposer } = require(`graphql-compose`)

const { getNodes, getNodesByType } = require(`../db`)
const { getExampleValue } = require(`./example-value`)
const { addNodeInterface, getNodeInterfaceFields } = require(`../interfaces`)
const { getInferredType } = require(`./infer`)
const { getUniqueValues } = require(`../utils`)

const addInferredType = typeName => {
  const exampleValue = getExampleValue({
    nodes: getNodesByType(typeName),
    typeName,
  })
  const tc = schemaComposer.getOrCreateTC(typeName, tc => {
    addNodeInterface(tc)
  })
  // FIXME: This only cares about the top level. Should we deepmerge instead?
  tc.getFieldNames().forEach(fieldName => delete exampleValue[fieldName])
  getNodeInterfaceFields().forEach(fieldName => delete exampleValue[fieldName])
  const inferredType = getInferredType(exampleValue, typeName)
  tc.addFields(inferredType.getFields())
}

const addInferredTypes = () => {
  const typeNames = getUniqueValues(getNodes().map(node => node.internal.type))
  typeNames.forEach(addInferredType)
}

module.exports = {
  addInferredType,
  addInferredTypes,
}
