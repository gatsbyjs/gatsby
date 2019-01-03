const {
  schemaComposer,
  InterfaceTypeComposer,
  TypeComposer,
} = require(`graphql-compose`)

const { findById, findByIds } = require(`../resolvers`)

// TODO: why is `mediaType` on Internal? Applies only to File!?
// What about `content`?
const InternalTC = TypeComposer.create({
  name: `Internal`,
  fields: {
    contentDigest: `String`,
    description: `String`,
    ignoreType: `Boolean`,
    mediaType: `String`,
    owner: `String`,
    type: `String!`,
  },
})

const NodeInterfaceTC = InterfaceTypeComposer.create({
  name: `Node`,
  description: `Node Interface`,
  fields: {
    id: `ID!`,
    parent: {
      type: `Node`,
      // resolve: async ({ parent: id }) => findById({ args: { id } }),
      resolve: async (source, args, context, info) =>
        findById()({ source, args: { id: source.parent }, context, info }),
    },
    children: {
      type: `[Node]!`,
      // resolve: async ({ children: ids }) => findByIds({ args: { ids } }),
      resolve: async (source, args, context, info) =>
        findByIds()({ source, args: { ids: source.children }, context, info }),
    },
    internal: `Internal`,
  },
  resolveType: node => node.internal.type,
})

InternalTC.getITC()
NodeInterfaceTC.getITC()

const addNodeInterface = tc => {
  tc.addInterface(NodeInterfaceTC.getType())
  addNodeInterfaceFields(tc)
}

const addNodeInterfaceFields = tc => {
  tc.addFields(NodeInterfaceTC.getFields())
  // FIXME: UPSTREAM: addSchemaMustHaveType adds to an array,
  // should be Set/Map to avoid duplicates?
  schemaComposer.addSchemaMustHaveType(tc)
}

const getNodeInterfaceFields = () => NodeInterfaceTC.getFieldNames()

const hasNodeInterface = tc => tc.hasInterface(NodeInterfaceTC.getType())

module.exports = {
  addNodeInterface,
  addNodeInterfaceFields,
  getNodeInterfaceFields,
  hasNodeInterface,
}
