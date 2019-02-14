const { getFieldsEnum } = require(`./sort`)
const { distinct, group } = require(`../resolvers`)

const getPageInfo = ({ schemaComposer }) =>
  schemaComposer.getOrCreateTC(`PageInfo`, tc => {
    tc.addFields({
      hasNextPage: `Boolean`,
      // currentPage: `Int`,
      // hasPreviousPage: `Boolean`,
      // itemCount: `Int`,
      // pageCount: `Int`,
      // perPage: `Int`,
    })
  })

const getEdge = ({ schemaComposer, typeComposer }) => {
  const typeName = typeComposer.getTypeName() + `Edge`
  return schemaComposer.getOrCreateTC(typeName, tc => {
    tc.addFields({
      next: typeComposer,
      node: typeComposer,
      previous: typeComposer,
    })
  })
}

const createPagination = ({ schemaComposer, typeComposer, fields, typeName }) =>
  schemaComposer.getOrCreateTC(typeName, tc => {
    tc.addFields({
      totalCount: `Int`,
      edges: [getEdge({ schemaComposer, typeComposer })],
      pageInfo: getPageInfo({ schemaComposer }),
      ...fields,
    })
  })

const getGroup = ({ schemaComposer, typeComposer }) => {
  const typeName = typeComposer.getTypeName() + `GroupConnection`
  const fields = {
    field: `String`,
    fieldValue: `String`,
  }
  return createPagination({ schemaComposer, typeComposer, fields, typeName })
}

const getPagination = ({ schemaComposer, typeComposer }) => {
  const inputTypeComposer = typeComposer.getInputTypeComposer()
  const typeName = typeComposer.getTypeName() + `Connection`
  const FieldsEnumTC = getFieldsEnum({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  const fields = {
    distinct: {
      type: [`String`],
      args: {
        field: FieldsEnumTC.getTypeNonNull(),
      },
      resolve: distinct,
    },
    group: {
      type: [getGroup({ schemaComposer, typeComposer })],
      args: {
        skip: `Int`,
        limit: `Int`,
        field: FieldsEnumTC.getTypeNonNull(),
      },
      resolve: group,
    },
  }
  return createPagination({ schemaComposer, typeComposer, fields, typeName })
}

module.exports = {
  getPageInfo,
  getEdge,
  getGroup,
  getPagination,
}
