const { addNode, buildExampleObject } = require(`./node-descriptor`)

const getExampleValue = ({
  nodes,
  typeName,
  typeConflictReporter,
  typeInferenceMetadata,
  ignoreFields,
}) => {
  // TODO: remove branch with .reduce() after all tests
  //  are converted to the syntax with metadata
  const metadata =
    typeInferenceMetadata ||
    nodes.reduce(addNode, { ignoredFields: new Set(ignoreFields) })

  metadata.typeName = typeName
  metadata.typeConflictReporter = typeConflictReporter

  return buildExampleObject(metadata)
}

module.exports = {
  getExampleValue,
}
