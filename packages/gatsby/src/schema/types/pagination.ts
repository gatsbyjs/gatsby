import {
  SchemaComposer,
  ObjectTypeComposer,
  InputTypeComposer,
  InterfaceTypeComposer,
} from "graphql-compose"

import { getFieldsEnum } from "./sort"
import { addDerivedType } from "./derived-types"
import { distinct, group } from "../resolvers"

const getPageInfo = ({
  schemaComposer,
}: {
  schemaComposer: SchemaComposer<any>
}): ObjectTypeComposer =>
  schemaComposer.getOrCreateOTC(`PageInfo`, tc => {
    tc.addFields({
      currentPage: `Int!`,
      hasPreviousPage: `Boolean!`,
      hasNextPage: `Boolean!`,
      itemCount: `Int!`,
      pageCount: `Int!`,
      perPage: `Int`,
    })
  })

const getEdge = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): ObjectTypeComposer => {
  const typeName: string = typeComposer.getTypeName() + `Edge`
  addDerivedType({ typeComposer, derivedTypeName: typeName })
  return schemaComposer.getOrCreateOTC(typeName, tc => {
    tc.addFields({
      next: typeComposer,
      node: typeComposer.getTypeNonNull(),
      previous: typeComposer,
    })
  })
}

const createPagination = ({
  schemaComposer,
  typeComposer,
  fields,
  typeName,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
  // TODO: Define the interface for the 'fields' data structure
  fields: Record<string, any>
  typeName: string
}): ObjectTypeComposer => {
  const paginationTypeComposer: ObjectTypeComposer = schemaComposer.getOrCreateOTC(
    typeName,
    tc => {
      tc.addFields({
        totalCount: `Int!`,
        edges: [getEdge({ schemaComposer, typeComposer }).getTypeNonNull()],
        nodes: [typeComposer.getTypeNonNull()],
        pageInfo: getPageInfo({ schemaComposer }).getTypeNonNull(),
        ...fields,
      })
    }
  )
  paginationTypeComposer.makeFieldNonNull(`edges`)
  paginationTypeComposer.makeFieldNonNull(`nodes`)
  addDerivedType({ typeComposer, derivedTypeName: typeName })
  return paginationTypeComposer
}

const getGroup = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): ObjectTypeComposer => {
  const typeName: string = typeComposer.getTypeName() + `GroupConnection`
  const fields = {
    field: `String!`,
    fieldValue: `String`,
  }
  return createPagination({ schemaComposer, typeComposer, fields, typeName })
}

const getPagination = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): ObjectTypeComposer => {
  const inputTypeComposer: InputTypeComposer = typeComposer.getInputTypeComposer()
  const typeName: string = typeComposer.getTypeName() + `Connection`
  const fieldsEnumTC = getFieldsEnum({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  const fields = {
    distinct: {
      type: [`String!`],
      args: {
        field: fieldsEnumTC.getTypeNonNull(),
      },
      resolve: distinct,
    },
    group: {
      type: [getGroup({ schemaComposer, typeComposer }).getTypeNonNull()],
      args: {
        skip: `Int`,
        limit: `Int`,
        field: fieldsEnumTC.getTypeNonNull(),
      },
      resolve: group,
    },
  }
  const paginationTypeComposer: ObjectTypeComposer = createPagination({
    schemaComposer,
    typeComposer,
    fields,
    typeName,
  })
  paginationTypeComposer.makeFieldNonNull(`distinct`)
  paginationTypeComposer.makeFieldNonNull(`group`)
  return paginationTypeComposer
}

export { getPageInfo, getEdge, getGroup, getPagination }
