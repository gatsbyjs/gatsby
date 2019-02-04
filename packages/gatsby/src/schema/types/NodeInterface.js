const { findById, findByIds } = require(`../resolvers`)

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
          findById({ source, args: { id: source.parent }, context, info }),
      },
      children: {
        type: `[Node]!`,
        resolve: async (source, args, context, info) =>
          findByIds({ source, args: { ids: source.children }, context, info }),
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
    node => node.internal.type === typeComposer.name
  )
  addNodeInterfaceFields({ schemaComposer, typeComposer })
}

const addNodeInterfaceFields = ({ schemaComposer, typeComposer }) => {
  const NodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  typeComposer.addFields(NodeInterfaceTC.getFields())
  // FIXME: UPSTREAM: addSchemaMustHaveType adds to an array,
  // should be Set/Map to avoid duplicates?
  schemaComposer.addSchemaMustHaveType(typeComposer)
}

const getNodeInterface = ({ schemaComposer }) =>
  getOrCreateNodeInterface(schemaComposer)

const hasNodeInterface = ({ schemaComposer, typeComposer }) => {
  const NodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  return typeComposer.hasInterface(NodeInterfaceTC)
}

module.exports = {
  addNodeInterface,
  addNodeInterfaceFields,
  getNodeInterface,
  hasNodeInterface,
}
