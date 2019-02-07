const getOrCreateNodeInterface = schemaComposer => {
  // TODO: why is `mediaType` on Internal? Applies only to File!?
  // Is `fieldOwners` actually set anywhere? And is it supposed to be an array,
  // as the Joi schema claims, or an object, which is the default in `redux/actions.js`
  const InternalTC = schemaComposer.getOrCreateTC(`Internal`, tc => {
    tc.addFields({
      content: `String`,
      contentDigest: `String`,
      description: `String`,
      fieldOwners: [`String`],
      ignoreType: `Boolean`,
      mediaType: `String`,
      owner: `String`,
      type: `String!`,
    })
  })
  InternalTC.getITC()

  const NodeInterfaceTC = schemaComposer.getOrCreateIFTC(`Node`, tc => {
    tc.setDescription(`Node Interface`)
    tc.addFields({
      id: `String!`,
      parent: {
        type: `Node`,
        resolve: async (source, args, context, info) =>
          context.nodeModel.getNode(source.parent),
      },
      children: {
        type: `[Node]!`,
        resolve: async (source, args, context, info) =>
          source.children.map(context.nodeModel.getNode),
      },
      internal: `Internal`,
    })
  })
  NodeInterfaceTC.getITC()

  return NodeInterfaceTC
}

const addNodeInterface = ({ schemaComposer, typeComposer }) => {
  const NodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  typeComposer.addInterface(NodeInterfaceTC)
  NodeInterfaceTC.addTypeResolver(
    typeComposer,
    node => node.internal.type === typeComposer.getTypeName()
  )
  addNodeInterfaceFields({ schemaComposer, typeComposer })
}

const addNodeInterfaceFields = ({ schemaComposer, typeComposer }) => {
  const NodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  typeComposer.addFields(NodeInterfaceTC.getFields())
  NodeInterfaceTC.addTypeResolver(
    typeComposer,
    node => node.internal.type === typeComposer.getTypeName()
  )
  // FIXME: UPSTREAM: addSchemaMustHaveType adds to an array,
  // should be Set/Map to avoid duplicates?
  schemaComposer.addSchemaMustHaveType(typeComposer)
}

const getNodeInterface = ({ schemaComposer }) =>
  getOrCreateNodeInterface(schemaComposer)

const hasNodeInterface = ({ schemaComposer, typeComposer }) => {
  const NodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  return (
    typeComposer.hasInterface(NodeInterfaceTC) ||
    typeComposer.hasInterface(NodeInterfaceTC.getType())
  )
}

module.exports = {
  addNodeInterface,
  addNodeInterfaceFields,
  getNodeInterface,
  hasNodeInterface,
}
