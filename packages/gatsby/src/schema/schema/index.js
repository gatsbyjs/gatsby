const { schemaComposer, TypeComposer } = require(`graphql-compose`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)

const { directives, visitors } = require(`../directives`)
const { addNodeInterfaceFields, hasNodeInterface } = require(`../interfaces`)
const { addInferredType, addInferredTypes } = require(`../infer`)

const addConvenienceChildrenFields = require(`./add-convenience-children-fields`)
const addFieldsFromNodeAPI = require(`./add-fields-from-node-api`)
const addResolvers = require(`./add-resolvers`)

const addTypeDefs = typeDefs => {
  const types = schemaComposer.addTypeDefs(typeDefs)
  types.forEach(type => {
    const tc = schemaComposer.getTC(type.name)
    if (hasNodeInterface(tc)) {
      addNodeInterfaceFields(tc)
    }
  })
}

const addTypes = async () => {
  const apiRunner = require(`../../utils/api-runner-node`)
  await apiRunner(`addTypeDefs`, { addTypeDefs })
}

const addTypeToRootQuery = tc => {
  const typeName = tc.getTypeName()
  const queryName = typeName.charAt(0).toLowerCase() + typeName.slice(1)
  const queryNamePlural = `all` + typeName
  const queryNamePageination = `page` + typeName
  schemaComposer.Query.addFields({
    [queryName]: tc.getResolver(`findOne`),
    [queryNamePlural]: tc.getResolver(`findMany`),
    [queryNamePageination]: tc.getResolver(`pagination`),
  })
}

const getSchema = () => {
  const schema = schemaComposer.buildSchema({ directives })
  SchemaDirectiveVisitor.visitSchemaDirectives(schema, visitors)
  return schema
}

const buildSchema = async () => {
  await addTypes()
  addInferredTypes()
  await addFieldsFromNodeAPI()
  schemaComposer.forEach(tc => {
    if (tc instanceof TypeComposer && hasNodeInterface(tc)) {
      addResolvers(tc)
      addConvenienceChildrenFields(tc)
      addTypeToRootQuery(tc)
    }
  })
  return getSchema()
}

const updateSchema = async () => {
  // Schema is updated during bootstrap for SitePage.
  // @see https://github.com/gatsbyjs/gatsby/issues/2685#issuecomment-340645874
  // Avoid regenerating everything.
  // FIXME: What else must be updated?
  addInferredType(`SitePage`)
  return getSchema()
}

module.exports = {
  addTypeDefs,
  buildSchema,
  updateSchema,
}
