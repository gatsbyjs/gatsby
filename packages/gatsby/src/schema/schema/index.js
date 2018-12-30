const { schemaComposer, TypeComposer } = require(`graphql-compose`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)

const { directives, visitors } = require(`../directives`)
const { addNodeInterfaceFields, hasNodeInterface } = require(`../interfaces`)
const { addInferredType, addInferredTypes } = require(`../infer`)
const apiRunner = require(`../../utils/api-runner-node`)

const addConvenienceChildrenFields = require(`./add-convenience-children-fields`)
const addCustomResolveFunctions = require(`./add-custom-resolve-functions`)
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

const addTypes = () => apiRunner(`addTypeDefs`, { addTypeDefs })

const addTypeToRootQuery = tc => {
  const typeName = tc.getTypeName()
  const queryName = typeName.charAt(0).toLowerCase() + typeName.slice(1)
  const queryNamePlural = `all` + typeName
  const queryNamePagination = `page` + typeName
  schemaComposer.Query.addFields({
    [queryName]: tc.getResolver(`findOne`),
    [queryNamePlural]: tc.getResolver(`findMany`),
    [queryNamePagination]: tc.getResolver(`pagination`),
  })
}

const buildSchema = async () => {
  await addTypes()
  addInferredTypes()
  await addFieldsFromNodeAPI()
  // TODO: Sanitize fieldNames on every type
  // @see https://github.com/gatsbyjs/gatsby/blob/76e358c10b104b9c610234f8940e59937db4b005/packages/gatsby/src/schema/infer-graphql-type.js#L393
  schemaComposer.forEach(tc => {
    if (tc instanceof TypeComposer && hasNodeInterface(tc)) {
      addResolvers(tc)
      addConvenienceChildrenFields(tc)
      addTypeToRootQuery(tc)
    }
  })
  // TODO: Move this to updateSchema()?
  await addCustomResolveFunctions()
  const schema = schemaComposer.buildSchema({ directives })
  // NOTE: Beware that `visitSchemaDirectives` mutates the schema handled by schemaComposer!
  // So don't call it twice!
  SchemaDirectiveVisitor.visitSchemaDirectives(schema, visitors)
  return schema
}

const updateSchema = async () => {
  // Schema is updated during bootstrap for SitePage.
  // @see https://github.com/gatsbyjs/gatsby/issues/2685#issuecomment-340645874
  // Avoid regenerating everything.
  // FIXME: This step is probably not needed -- the only thing added is being able
  // to query SitePage.context fields and fields added with
  // createNodeField. Do we actually need this?
  const tc = addInferredType(`SitePage`)
  addResolvers(tc)
  addTypeToRootQuery(tc)
  return schemaComposer.buildSchema({ directives })
}

module.exports = {
  addTypeDefs,
  buildSchema,
  updateSchema,
}
