const { addNode, buildExampleObject } = require(`../../utils/node-descriptor`)

const getExampleValue = ({
  nodes,
  typeName,
  typeConflictReporter,
  ignoreFields,
}) => {
  const initialMetadata = {
    fieldMap: {},
    ignoredFields: new Set(ignoreFields),
    typeName,
    typeConflictReporter,
  }
  const aggregatedMetadata = nodes.reduce(addNode, initialMetadata)
  return buildExampleObject(aggregatedMetadata)
}

module.exports = {
  getExampleValue,
}
