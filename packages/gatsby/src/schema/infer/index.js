const { schemaComposer } = require(`graphql-compose`)

const { getTypes, getNodesByType } = require(`../db`)
const { getExampleValue } = require(`./example-value`)
const { addNodeInterface, getNodeInterfaceFields } = require(`../interfaces`)
const { addInferredFields } = require(`./infer`)

const addInferredType = typeName => {
  const exampleValue = getExampleValue({
    nodes: getNodesByType(typeName),
    typeName,
    ignoreFields: getNodeInterfaceFields(),
  })

  const tc = schemaComposer.getOrCreateTC(typeName, tc => {
    addNodeInterface(tc)
  })
  addInferredFields(tc, exampleValue, typeName)
  return tc
}

const addInferredTypes = () => {
  const typeNames = getTypes()
  // TODO: Filter out ignoreType
  typeNames.forEach(addInferredType)
}

module.exports = {
  addInferredType,
  addInferredTypes,
}
