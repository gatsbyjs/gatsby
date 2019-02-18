const report = require(`gatsby-cli/lib/reporter`)
const { getExampleValue } = require(`./example-value`)
const {
  addNodeInterface,
  getNodeInterface,
} = require(`../types/node-interface`)
const { addInferredFields } = require(`./add-inferred-fields`)
const getInferConfig = require(`./get-infer-config`)

const addInferredType = ({
  schemaComposer,
  typeComposer,
  nodeStore,
  typeConflictReporter,
  typeMapping,
  parentSpan,
}) => {
  const typeName = typeComposer.getTypeName()
  const exampleValue = getExampleValue({
    nodes: nodeStore.getNodesByType(typeName),
    typeName,
    typeConflictReporter,
    ignoreFields: [
      ...getNodeInterface({ schemaComposer }).getFieldNames(),
      `$loki`,
    ],
  })

  addInferredFields({
    schemaComposer,
    typeComposer,
    nodeStore,
    exampleValue,
    inferConfig: getInferConfig(typeComposer),
    typeMapping,
    parentSpan,
  })
  return typeComposer
}

const addInferredTypes = ({
  schemaComposer,
  nodeStore,
  typeConflictReporter,
  typeMapping,
  parentSpan,
}) => {
  // XXX(freiksenet): Won't be needed after plugins set typedefs
  // Infer File first so all the links to it would work
  const typeNames = putFileFirst(nodeStore.getTypes())
  const noNodeInterfaceTypes = []

  typeNames.forEach(typeName => {
    let typeComposer
    let inferConfig
    if (schemaComposer.has(typeName)) {
      typeComposer = schemaComposer.getTC(typeName)
      inferConfig = getInferConfig(typeComposer)
      if (inferConfig.infer) {
        if (!typeComposer.hasInterface(`Node`)) {
          noNodeInterfaceTypes.push(typeComposer.getType())
        }
      }
    } else {
      typeComposer = schemaComposer.createTC(typeName)
      addNodeInterface({ schemaComposer, typeComposer })
    }
  })

  // XXX(freiksenet): We iterate twice to pre-create all types
  const typeComposers = typeNames.map(typeName => {
    addInferredType({
      schemaComposer,
      nodeStore,
      typeConflictReporter,
      typeComposer: schemaComposer.getTC(typeName),
      typeMapping,
      parentSpan,
    })
  })

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

  return typeComposers
}

const putFileFirst = typeNames => {
  const index = typeNames.indexOf(`File`)
  if (index !== -1) {
    return [`File`, ...typeNames.slice(0, index), ...typeNames.slice(index + 1)]
  } else {
    return typeNames
  }
}

module.exports = {
  addInferredType,
  addInferredTypes,
}
