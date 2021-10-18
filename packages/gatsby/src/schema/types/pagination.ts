import {
  SchemaComposer,
  ObjectTypeComposer,
  InputTypeComposer,
  InterfaceTypeComposer,
  ObjectTypeComposerFieldConfigMapDefinition,
} from "graphql-compose"
import { getFieldsEnum } from "./sort"
import { addDerivedType } from "./derived-types"
import { distinct, group, max, min, sum } from "../resolvers"

export const getPageInfo = <TContext = any>({
  schemaComposer,
}: {
  schemaComposer: SchemaComposer<TContext>
}): ObjectTypeComposer =>
  schemaComposer.getOrCreateOTC(`PageInfo`, tc => {
    tc.addFields({
      currentPage: `Int!`,
      hasPreviousPage: `Boolean!`,
      hasNextPage: `Boolean!`,
      itemCount: `Int!`,
      pageCount: `Int!`,
      perPage: `Int`,
      totalCount: `Int!`,
    })
  })

export const getEdge = <TContext = any>({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<TContext>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): ObjectTypeComposer => {
  const typeName = `${typeComposer.getTypeName()}Edge`
  addDerivedType({ typeComposer, derivedTypeName: typeName })
  return schemaComposer.getOrCreateOTC(typeName, tc => {
    tc.addFields({
      next: typeComposer,
      node: typeComposer.getTypeNonNull(),
      previous: typeComposer,
    })
  })
}

export const getGroup = <TContext = any>({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<TContext>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): ObjectTypeComposer => {
  const typeName = `${typeComposer.getTypeName()}GroupConnection`
  const fields = {
    field: `String!`,
    fieldValue: `String`,
  }
  return createPagination({ schemaComposer, typeComposer, typeName, fields })
}

export const getPagination = <TContext = any>({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<TContext>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): ObjectTypeComposer => {
  const typeName = `${typeComposer.getTypeName()}Connection`
  return createPagination({ schemaComposer, typeComposer, typeName })
}

function createPagination<TSource = any, TContext = any>({
  schemaComposer,
  typeComposer,
  fields,
  typeName,
}: {
  schemaComposer: SchemaComposer<TContext>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
  typeName: string
  fields?: ObjectTypeComposerFieldConfigMapDefinition<TSource, TContext>
}): ObjectTypeComposer {
  const inputTypeComposer: InputTypeComposer =
    typeComposer.getInputTypeComposer()
  const fieldsEnumTC = getFieldsEnum({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
  })
  const paginationTypeComposer: ObjectTypeComposer =
    schemaComposer.getOrCreateOTC(typeName, tc => {
      // getGroup() will create a recursive call to pagination,
      // so only add it and other aggregate functions on onCreate.
      // Cast into their own category to avoid Typescript conflicts.
      const aggregationFields: { [key: string]: any } = {
        distinct: {
          type: [`String!`],
          args: {
            field: fieldsEnumTC.getTypeNonNull(),
          },
          resolve: distinct,
        },
        max: {
          type: `Float`,
          args: {
            field: fieldsEnumTC.getTypeNonNull(),
          },
          resolve: max,
        },
        min: {
          type: `Float`,
          args: {
            field: fieldsEnumTC.getTypeNonNull(),
          },
          resolve: min,
        },
        sum: {
          type: `Float`,
          args: {
            field: fieldsEnumTC.getTypeNonNull(),
          },
          resolve: sum,
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

      tc.addFields({
        totalCount: `Int!`,
        edges: [getEdge({ schemaComposer, typeComposer }).getTypeNonNull()],
        nodes: [typeComposer.getTypeNonNull()],
        pageInfo: getPageInfo({ schemaComposer }).getTypeNonNull(),
        ...aggregationFields,
        ...fields,
      })
    })
  paginationTypeComposer.makeFieldNonNull(`edges`)
  paginationTypeComposer.makeFieldNonNull(`nodes`)
  paginationTypeComposer.makeFieldNonNull(`distinct`)
  paginationTypeComposer.makeFieldNonNull(`group`)
  addDerivedType({ typeComposer, derivedTypeName: typeName })
  return paginationTypeComposer
}
