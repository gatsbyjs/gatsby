const getOrCreateNodeInterface = schemaComposer => {
  // TODO: why is `mediaType` on Internal? Applies only to File!?
  // `fieldOwners` is an object
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
        resolve: (source, args, context, info) => {
          const { path } = context
          return context.nodeModel.getNode(source.parent, { path })
        },
      },
      children: {
        type: `[Node]!`,
        resolve: (source, args, context, info) => {
          const { path } = context
          return source.children.map(id =>
            context.nodeModel.getNode(id, { path })
          )
        },
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
  addNodeInterfaceFields({ schemaComposer, typeComposer })
}

const addNodeInterfaceFields = ({ schemaComposer, typeComposer }) => {
  const NodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  typeComposer.addFields(NodeInterfaceTC.getFields())
  NodeInterfaceTC.setResolveType(node => node.internal.type)
  schemaComposer.addSchemaMustHaveType(typeComposer)
}

const getNodeInterface = ({ schemaComposer }) =>
  getOrCreateNodeInterface(schemaComposer)

module.exports = {
  addNodeInterface,
  addNodeInterfaceFields,
  getNodeInterface,
}
