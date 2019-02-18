const _ = require(`lodash`)
const { isSpecifiedScalarType, isIntrospectionType } = require(`graphql`)
const apiRunner = require(`../utils/api-runner-node`)
const report = require(`gatsby-cli/lib/reporter`)
const { addNodeInterfaceFields } = require(`./types/node-interface`)
const { addInferredType, addInferredTypes } = require(`./infer`)
const { findOne, findManyPaginated } = require(`./resolvers`)
const { getPagination } = require(`./types/pagination`)
const { getSortInput } = require(`./types/sort`)
const { getFilterInput } = require(`./types/filter`)

const buildSchema = async ({
  schemaComposer,
  nodeStore,
  types,
  thirdPartySchemas,
  typeMapping,
  typeConflictReporter,
  parentSpan,
}) => {
  await updateSchemaComposer({
    schemaComposer,
    nodeStore,
    types,
    thirdPartySchemas,
    typeMapping,
    typeConflictReporter,
    parentSpan,
  })
  // const { printSchema } = require(`graphql`)
  const schema = schemaComposer.buildSchema()
  // console.log(printSchema(schema))
  return schema
}

const rebuildSchemaWithSitePage = ({
  schemaComposer,
  nodeStore,
  typeMapping,
  typeConflictReporter,
  parentSpan,
}) => {
  const typeComposer = addInferredType({
    schemaComposer,
    typeComposer: schemaComposer.getTC(`SitePage`),
    nodeStore,
    typeConflictReporter,
    typeMapping,
    parentSpan,
  })
  processTypeComposer({ schemaComposer, typeComposer, nodeStore, parentSpan })
  return schemaComposer.buildSchema()
}

module.exports = {
  buildSchema,
  rebuildSchemaWithSitePage,
}

const updateSchemaComposer = async ({
  schemaComposer,
  nodeStore,
  types,
  typeMapping,
  thirdPartySchemas,
  typeConflictReporter,
  parentSpan,
}) => {
  await addTypes({ schemaComposer, parentSpan, types })
  await addInferredTypes({
    schemaComposer,
    nodeStore,
    typeConflictReporter,
    typeMapping,
    parentSpan,
  })
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
  await addCustomResolveFunctions({ schemaComposer, parentSpan })
}

const processTypeComposer = async ({
  schemaComposer,
  typeComposer,
  nodeStore,
  parentSpan,
}) => {
  if (
    typeComposer instanceof schemaComposer.TypeComposer &&
    typeComposer.hasInterface(`Node`)
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

const addTypes = ({ schemaComposer, types, parentSpan }) => {
  types.forEach(typeOrTypeDef => {
    console.log(typeOrTypeDef)
    if (typeof typeOrTypeDef === `string`) {
      schemaComposer.addTypeDefs(typeOrTypeDef)
    } else {
      schemaComposer.add(typeOrTypeDef)
    }
  })
}

const addSetFieldsOnGraphQLNodeTypeFields = ({
  schemaComposer,
  nodeStore,
  parentSpan,
}) =>
  Promise.all(
    Array.from(schemaComposer.values()).map(async tc => {
      if (
        tc instanceof schemaComposer.TypeComposer &&
        tc.hasInterface(`Node`)
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
    schemaComposer.Query.addFields(fields)

    // Explicitly add the third-party schema's types, so they can be targeted
    // in `addResolvers` API.
    const types = schema.getTypeMap()
    Object.keys(types).forEach(typeName => {
      const type = types[typeName]
      if (
        type !== schema.getQueryType() &&
        !isSpecifiedScalarType(type) &&
        !isIntrospectionType(type)
      ) {
        schemaComposer.add(type)
      }
    })
  })
}

const addCustomResolveFunctions = async ({ schemaComposer, parentSpan }) => {
  const intermediateSchema = schemaComposer.buildSchema()
  const createResolvers = resolvers => {
    Object.keys(resolvers).forEach(typeName => {
      const fields = resolvers[typeName]
      if (schemaComposer.has(typeName)) {
        const tc = schemaComposer.getTC(typeName)
        Object.keys(fields).forEach(fieldName => {
          const fieldConfig = fields[fieldName]
          if (tc.hasField(fieldName)) {
            const originalTypeName = tc.getFieldType(fieldName).toString()
            const fieldTypeName =
              fieldConfig.type && fieldConfig.type.toString()
            if (
              !fieldTypeName ||
              tc.getFieldType(fieldName) === fieldConfig.type.toString()
            ) {
              const newConfig = {}
              if (fieldConfig.args) {
                newConfig.args = fieldConfig.args
              }
              if (fieldConfig.resolve) {
                newConfig.resolve = fieldConfig.resolve
              }
              tc.extendField(fieldName, newConfig)
            } else if (fieldTypeName) {
              report.warn(
                `\`addResolvers\` passed resolvers for field \`${typeName}.${fieldName}\` with type ${fieldTypeName}. Such field with type ${originalTypeName} already exists on the type. Use \`addTypeDefs\` to override type fields.`
              )
            }
          } else {
            tc.addFields({ [fieldName]: fieldConfig })
          }
        })
      } else {
        report.warn(
          `\`addResolvers\` passed resolvers for type \`${typeName}\` that doesn't exist in the schema. Use \`addTypeDefs\` to add the type before adding resolvers.`
        )
      }
    })
  }
  await apiRunner(`createResolvers`, {
    schema: intermediateSchema,
    createResolvers,
    traceId: `initial-addResolvers`,
    parentSpan: parentSpan,
  })
}

const addResolvers = ({ schemaComposer, typeComposer }) => {
  const typeName = typeComposer.getTypeName()
  typeComposer.removeInputTypeComposer()
  const SortInputTC = getSortInput({
    schemaComposer,
    typeComposer,
  })
  const FilterInputTC = getFilterInput({
    schemaComposer,
    typeComposer,
  })
  const PaginationTC = getPagination({
    schemaComposer,
    typeComposer,
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
        const { path } = context
        return context.nodeModel.getNodesByIds(
          { ids: source.children, type: typeName },
          { path }
        )
      },
    },
  }
}

function createChildField(typeName) {
  return {
    [_.camelCase(`child ${typeName}`)]: {
      type: () => typeName,
      async resolve(source, args, context) {
        const { path } = context
        const result = await context.nodeModel.getNodesByIds(
          { ids: source.children, type: typeName },
          { path }
        )
        if (result && result.length > 0) {
          return result[0]
        } else {
          return null
        }
      },
    },
  }
}

function groupChildNodesByType({ nodeStore, nodes }) {
  return _(nodes)
    .flatMap(node => (node.children || []).map(nodeStore.getNode))
    .groupBy(node => (node.internal ? node.internal.type : undefined))
    .value()
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
