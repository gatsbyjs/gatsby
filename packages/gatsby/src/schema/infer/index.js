const report = require(`gatsby-cli/lib/reporter`)
const { getExampleValue } = require(`./example-value`)
const {
  addNodeInterface,
  getNodeInterface,
  hasNodeInterface,
} = require(`../types/NodeInterface`)
const { addInferredFields } = require(`./add-inferred-fields`)
const getInferConfig = require(`./get-infer-config`)

const addInferredType = ({
  schemaComposer,
  nodeStore,
  typeName,
  typeConflictReporter,
  parentSpan,
}) => {
  const exampleValue = getExampleValue({
    nodes: nodeStore.getNodesByType(typeName),
    typeName,
    typeConflictReporter,
    ignoreFields: [
      ...getNodeInterface({ schemaComposer }).getFieldNames(),
      `$loki`,
    ],
  })

  let typeComposer
  let inferConfig
  const noNodeInterfaceTypes = []
  if (schemaComposer.has(typeName)) {
    typeComposer = schemaComposer.get(typeName)
    inferConfig = getInferConfig(typeComposer)
    if (inferConfig.infer) {
      if (!hasNodeInterface({ schemaComposer, typeComposer })) {
        noNodeInterfaceTypes.push(typeComposer.getType())
      }
    }
  } else {
    typeComposer = schemaComposer.createTC(typeName)
    addNodeInterface({ schemaComposer, typeComposer })
    inferConfig = getInferConfig(typeComposer)
  }

  if (noNodeInterfaceTypes.length > 0) {
    noNodeInterfaceTypes.forEach(type => {
      report.warn(`Type \`${type}\` declared in typeDefs looks like a node, but doesn't implement a \`Node\` interface. It's likely that you should add the \`Node\` interface to you type def:

type ${type} implements Node {

If you know that you don't want it to be a node (which would mean no root queries to retrieve it), you can explicitly disable inferrence for it:

type ${type} @dontInfer {
 `)
    })
    report.panic(`Building schema failed`)
  }

  addInferredFields({
    schemaComposer,
    typeComposer,
    nodeStore,
    exampleValue,
    inferConfig,
  })
  return typeComposer
}

const addInferredTypes = ({
  schemaComposer,
  nodeStore,
  typeConflictReporter,
  parentSpan,
}) => {
  const typeNames = nodeStore.getTypes()

  // Infer File first so all the links to it would work
  if (typeNames.includes(`File`)) {
    addInferredType({
      schemaComposer,
      nodeStore,
      typeName: `File`,
      typeConflictReporter,
      parentSpan,
    })
  }

  // TODO: Filter out ignoreType
  typeNames.forEach(typeName => {
    if (typeName !== `File`) {
      addInferredType({
        schemaComposer,
        nodeStore,
        typeConflictReporter,
        typeName,
        parentSpan,
      })
    }
  })
}

module.exports = {
  addInferredType,
  addInferredTypes,
}
