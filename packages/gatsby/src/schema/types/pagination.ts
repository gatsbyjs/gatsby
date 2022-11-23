import {
  SchemaComposer,
  ObjectTypeComposer,
  InputTypeComposer,
  InterfaceTypeComposer,
  ObjectTypeComposerFieldConfigMapDefinition,
  UnionTypeComposer,
  ScalarTypeComposer,
  AnyTypeComposer,
} from "graphql-compose"
import { getFieldsEnum } from "./sort"
import { addDerivedType } from "./derived-types"
import {
  createDistinctResolver,
  createGroupResolver,
  createMaxResolver,
  createMinResolver,
  createSumResolver,
} from "../resolvers"
import { convertToNestedInputType, IVisitContext } from "./utils"
import { SORTABLE_ENUM } from "./sort"

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

function getFieldSelectorTC({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  typeComposer: ObjectTypeComposer | InterfaceTypeComposer
}): AnyTypeComposer<any> {
  if (_CFLAGS_.GATSBY_MAJOR === `5`) {
    return convertToNestedInputType({
      schemaComposer,
      typeComposer,
      onEnter: ({ fieldName, typeComposer }): IVisitContext => {
        const sortable =
          typeComposer instanceof UnionTypeComposer ||
          typeComposer instanceof ScalarTypeComposer
            ? undefined
            : typeComposer.getFieldExtension(fieldName, `sortable`)
        if (sortable === SORTABLE_ENUM.NOT_SORTABLE) {
          // stop traversing
          return null
        } else if (sortable === SORTABLE_ENUM.DEPRECATED_SORTABLE) {
          // mark this and all nested fields as deprecated
          return {
            deprecationReason: `Sorting on fields that need arguments to resolve is deprecated.`,
          }
        }

        // continue
        return undefined
      },
      leafInputComposer: schemaComposer.getOrCreateETC(
        `FieldSelectorEnum`,
        etc => {
          etc.setFields({
            // GraphQL spec doesn't allow using "true" (or "false" or "null") as enum values
            // so we "SELECT"
            SELECT: { value: `SELECT` },
          })
        }
      ),
      postfix: `FieldSelector`,
    }).getTypeNonNull()
  } else {
    const inputTypeComposer: InputTypeComposer =
      typeComposer.getInputTypeComposer()

    const fieldsEnumTC = getFieldsEnum({
      schemaComposer,
      typeComposer,
      inputTypeComposer,
    })
    return fieldsEnumTC.getTypeNonNull()
  }
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
  const fieldTC = getFieldSelectorTC({ schemaComposer, typeComposer })

  const paginationTypeComposer: ObjectTypeComposer =
    schemaComposer.getOrCreateOTC(typeName, tc => {
      // getGroup() will create a recursive call to pagination,
      // so only add it and other aggregate functions on onCreate.
      // Cast into their own category to avoid Typescript conflicts.
      const aggregationFields: { [key: string]: any } = {
        distinct: {
          type: [`String!`],
          args: {
            field: fieldTC,
          },
          resolve: createDistinctResolver(typeComposer.getTypeName()),
        },
        max: {
          type: `Float`,
          args: {
            field: fieldTC,
          },
          resolve: createMaxResolver(typeComposer.getTypeName()),
        },
        min: {
          type: `Float`,
          args: {
            field: fieldTC,
          },
          resolve: createMinResolver(typeComposer.getTypeName()),
        },
        sum: {
          type: `Float`,
          args: {
            field: fieldTC,
          },
          resolve: createSumResolver(typeComposer.getTypeName()),
        },
        group: {
          type: [getGroup({ schemaComposer, typeComposer }).getTypeNonNull()],
          args: {
            skip: `Int`,
            limit: `Int`,
            field: fieldTC,
          },
          resolve: createGroupResolver(typeComposer.getTypeName()),
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
