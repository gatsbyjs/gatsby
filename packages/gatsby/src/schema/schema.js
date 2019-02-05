const _ = require(`lodash`)
const { toInputObjectType } = require(`graphql-compose`)
const apiRunner = require(`../utils/api-runner-node`)
const GraphQLDate = require(`./types/Date`)
const {
  addNodeInterfaceFields,
  hasNodeInterface,
} = require(`./types/NodeInterface`)
const { addInferredType, addInferredTypes } = require(`./infer`)
const { findOne, findMany, findManyPaginated } = require(`./resolvers`)
const { getPagination } = require(`./types/pagination`)
const { getSortInput } = require(`./types/sort`)
const { getFilterInput } = require(`./types/filter`)

const buildSchema = async ({
  schemaComposer,
  nodeStore,
  typeDefs,
  resolvers,
  thirdPartySchemas,
  directives,
  parentSpan,
}) => {
  await updateSchemaComposer({
    schemaComposer,
    nodeStore,
    typeDefs,
    resolvers,
    thirdPartySchemas,
    parentSpan,
  })
  const { printSchema } = require(`graphql`)
  const schema = schemaComposer.buildSchema({
    directives,
  })
  console.log(printSchema(schema))
  return schema
}

const rebuildSchemaWithSitePage = ({
  schemaComposer,
  nodeStore,
  directives,
  parentSpan,
}) => {
  const typeComposer = addInferredType({
    schemaComposer,
    nodeStore,
    typeName: `SitePage`,
  })
  processTypeComposer({ schemaComposer, typeComposer, nodeStore, parentSpan })
  return schemaComposer.buildSchema({
    directives,
  })
}

module.exports = {
  buildSchema,
  rebuildSchemaWithSitePage,
}

const updateSchemaComposer = async ({
  schemaComposer,
  nodeStore,
  typeDefs,
  resolvers,
  thirdPartySchemas,
  parentSpan,
}) => {
  schemaComposer.add(GraphQLDate)
  // await addTypeDefs({ schemaComposer, parentSpan, typeDefs })
  await addInferredTypes({ schemaComposer, nodeStore, parentSpan })
  await addSetFieldsOnGraphQLNodeTypeFields({
    schemaComposer,
    nodeStore,
    parentSpan,
  })
  await Promise.all(
    Array.from(schemaComposer.values()).map(typeComposer =>
      processTypeComposer({
        schemaComposer,
        typeComposer,
        nodeStore,
        parentSpan,
      })
    )
  )
  await addThirdPartySchemas({ schemaComposer, thirdPartySchemas, parentSpan })
  // await addCustomResolveFunctions({ schemaComposer, parentSpan, resolvers })
}

const processTypeComposer = async ({
  schemaComposer,
  typeComposer,
  nodeStore,
  parentSpan,
}) => {
  if (
    typeComposer instanceof schemaComposer.TypeComposer &&
    hasNodeInterface({ schemaComposer, typeComposer })
  ) {
    await addNodeInterfaceFields({ schemaComposer, typeComposer, parentSpan })
    await addResolvers({ schemaComposer, typeComposer, parentSpan })
    await addConvenienceChildrenFields({
      schemaComposer,
      typeComposer,
      nodeStore,
      parentSpan,
    })
    await addTypeToRootQuery({ schemaComposer, typeComposer, parentSpan })
  }
}

// const addTypeDefs = ({ schemaComposer, typeDefs, parentSpan }) => {
//   typeDefs.forEach(typeDef => {
//     schemaComposer.addTypeDefs(typeDef)
//   })
// }

const addSetFieldsOnGraphQLNodeTypeFields = ({
  schemaComposer,
  nodeStore,
  parentSpan,
}) =>
  Promise.all(
    Array.from(schemaComposer.values()).map(async tc => {
      if (
        tc instanceof schemaComposer.TypeComposer &&
        hasNodeInterface({ schemaComposer, typeComposer: tc })
      ) {
        const typeName = tc.getTypeName()
        const [fields] = await apiRunner(`setFieldsOnGraphQLNodeType`, {
          type: {
            name: typeName,
            nodes: nodeStore.getNodesByType(typeName),
          },
          traceId: `initial-setFieldsOnGraphQLNodeType`,
          parentSpan: parentSpan,
        })
        if (fields) {
          // NOTE: `setFieldsOnGraphQLNodeType` only allows setting
          // nested fields with a path as property name, i.e.
          // `{ 'frontmatter.published': 'Boolean' }`, but not in the form
          // `{ frontmatter: { published: 'Boolean' }}`
          tc.addNestedFields(fields)
        }
      }
    })
  )

const addThirdPartySchemas = ({
  schemaComposer,
  thirdPartySchemas,
  parentSpan,
}) => {
  thirdPartySchemas.forEach(schema => {
    const QueryTC = schemaComposer.TypeComposer.createTemp(
      schema.getQueryType()
    )
    const fields = QueryTC.getFields()
    // TODO: Wrap field resolvers to include projected fields in the
    // selection set.
    schemaComposer.Query.addFields(fields)

    // Explicitly add the third-party schema's types, so they can be targeted
    // in `addResolvers` API.
    const rootTypeName = Object.values(fields)[0].type.name
    const types = schema.getTypeMap()
    Object.entries(types).forEach(
      ([typeName, type]) =>
        typeName.startsWith(rootTypeName) && schemaComposer.add(type)
    )
  })
}

// const addCustomResolveFunctions = ({
//   schemaComposer,
//   resolvers,
//   parentSpan,
// }) => {
//   Object.entries(resolvers).forEach(([typeName, fields]) => {
//     if (schemaComposer.has(typeName)) {
//       const tc = schemaComposer.getTC(typeName)
//       Object.entries(fields).forEach(([fieldName, resolve]) => {
//         if (tc.hasField(fieldName)) {
//           const resolver = tc.getField(fieldName).resolve
//           tc.extendField(fieldName, {
//             resolve,
//           })
//         } else {
//           const fieldConfig = resolve
//           tc.addFields({ [fieldName]: fieldConfig })
//         }
//       })
//     }
//   })
// }

const addResolvers = ({ schemaComposer, typeComposer }) => {
  const typeName = typeComposer.getTypeName()
  const inputTypeComposer = toInputObjectType(
    typeComposer,
    {
      postfix: `FilterInput`,
    },
    new Map()
  )
  const SortInputTC = getSortInput({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  const FilterInputTC = getFilterInput({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  const PaginationTC = getPagination({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  typeComposer.addResolver({
    name: `findOne`,
    type: typeComposer,
    args: {
      ...FilterInputTC.getFields(),
    },
    resolve: findOne(typeName),
  })
  typeComposer.addResolver({
    name: `findMany`,
    type: [typeComposer],
    args: {
      filter: FilterInputTC,
      sort: SortInputTC,
      skip: `Int`,
      limit: `Int`,
    },
    resolve: findMany(typeName),
  })
  typeComposer.addResolver({
    name: `findManyPaginated`,
    type: PaginationTC,
    args: {
      filter: FilterInputTC,
      sort: SortInputTC,
      skip: `Int`,
      limit: `Int`,
      // page: `Int`,
      // perPage: { type: `Int`, defaultValue: 20 },
    },
    resolve: findManyPaginated(typeName),
  })
}

const addConvenienceChildrenFields = ({
  schemaComposer,
  typeComposer,
  nodeStore,
}) => {
  const nodes = nodeStore.getNodesByType(typeComposer.getTypeName())

  const childNodesByType = groupChildNodesByType({ nodeStore, nodes })

  Object.keys(childNodesByType).forEach(typeName => {
    const typeChildren = childNodesByType[typeName]
    const maxChildCount = _.maxBy(
      _.values(_.groupBy(typeChildren, c => c.parent)),
      g => g.length
    ).length

    if (maxChildCount > 1) {
      typeComposer.addFields(createChildrenField(typeName))
    } else {
      typeComposer.addFields(createChildField(typeName))
    }
  })
}

function createChildrenField(typeName) {
  return {
    [_.camelCase(`children ${typeName}`)]: {
      type: () => [typeName],
      resolve(source, args, context) {
        return source.children
          .map(context.nodeModel.getNode)
          .filter(nodeIsOfType(typeName))
      },
    },
  }
}

function createChildField(typeName) {
  return {
    [_.camelCase(`child ${typeName}`)]: {
      type: () => typeName,
      resolve(source, args, context) {
        return source.children
          .map(context.nodeModel.getNode)
          .find(nodeIsOfType(typeName))
      },
    },
  }
}

function groupChildNodesByType({ nodeStore, nodes }) {
  return _(nodes)
    .flatMap(node => node.children.map(nodeStore.getNode))
    .groupBy(node => (node.internal ? node.internal.type : undefined))
    .value()
}

function nodeIsOfType(typeName) {
  return node => node.internal.type === typeName
}

const addTypeToRootQuery = ({ schemaComposer, typeComposer }) => {
  const typeName = typeComposer.getTypeName()
  // not strictly correctly, result is `npmPackage` and `allNpmPackage` from type `NPMPackage`
  const queryName = _.camelCase(typeName)
  const queryNamePlural = _.camelCase(`all` + typeName)
  schemaComposer.Query.addFields({
    [queryName]: typeComposer.getResolver(`findOne`),
    [queryNamePlural]: typeComposer.getResolver(`findManyPaginated`),
  })
}
