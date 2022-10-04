import {
  GraphQLEnumType,
  isSpecifiedScalarType,
  GraphQLScalarType,
} from "graphql"
import {
  InputTypeComposer,
  GraphQLJSON,
  SchemaComposer,
  ObjectTypeComposer,
  InterfaceTypeComposer,
  UnionTypeComposer,
  ScalarTypeComposer,
} from "graphql-compose"
import { GraphQLDate } from "./date"
import { convertToNestedInputType, IVisitContext } from "./utils"

type Context = any

export const SEARCHABLE_ENUM = {
  SEARCHABLE: `SEARCHABLE`,
  NOT_SEARCHABLE: `NON_SEARCHABLE`,
  DEPRECATED_SEARCHABLE: `DERPECATED_SEARCHABLE`,
} as const

const getQueryOperatorListInput = ({
  schemaComposer,
  inputTypeComposer,
}: {
  schemaComposer: SchemaComposer<any>
  inputTypeComposer: InputTypeComposer
}): InputTypeComposer => {
  const typeName = inputTypeComposer.getTypeName().replace(/Input/, `ListInput`)
  return schemaComposer.getOrCreateITC(typeName, itc => {
    itc.addFields({
      elemMatch: inputTypeComposer,
    })
  })
}

const EQ = `eq`
const NE = `ne`
const GT = `gt`
const GTE = `gte`
const LT = `lt`
const LTE = `lte`
const IN = `in`
const NIN = `nin`
const REGEX = `regex`
const GLOB = `glob`

const ALLOWED_OPERATORS = {
  Boolean: [EQ, NE, IN, NIN],
  Date: [EQ, NE, GT, GTE, LT, LTE, IN, NIN],
  Float: [EQ, NE, GT, GTE, LT, LTE, IN, NIN],
  ID: [EQ, NE, IN, NIN],
  Int: [EQ, NE, GT, GTE, LT, LTE, IN, NIN],
  JSON: [EQ, NE, IN, NIN, REGEX, GLOB],
  String: [EQ, NE, IN, NIN, REGEX, GLOB],
  Enum: [EQ, NE, IN, NIN],
  CustomScalar: [EQ, NE, IN, NIN],
}

type TypeName = keyof typeof ALLOWED_OPERATORS

const ARRAY_OPERATORS = [IN, NIN]

const getOperatorFields = (
  fieldType: string,
  operators: Array<string>
): Record<string, string | Array<string>> => {
  const result = {}
  operators.forEach(op => {
    if (ARRAY_OPERATORS.includes(op)) {
      result[op] = [fieldType]
    } else {
      result[op] = fieldType
    }
  })
  return result
}

const isBuiltInScalarType = (type: any): type is GraphQLScalarType =>
  isSpecifiedScalarType(type) || type === GraphQLDate || type === GraphQLJSON

const getQueryOperatorInput = ({
  schemaComposer,
  type,
}: {
  schemaComposer: SchemaComposer<Context>
  type: any
}): InputTypeComposer => {
  let typeName: TypeName
  if (type instanceof GraphQLEnumType) {
    typeName = `Enum`
  } else if (isBuiltInScalarType(type)) {
    typeName = type.name as Exclude<TypeName, "Enum" | "CustomScalar">
  } else {
    typeName = `CustomScalar`
  }
  const operators = ALLOWED_OPERATORS[typeName]
  return schemaComposer.getOrCreateITC(type.name + `QueryOperatorInput`, itc =>
    itc.addFields(getOperatorFields(type, operators))
  )
}

export const getFilterInput = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<Context>
  typeComposer: ObjectTypeComposer<Context> | InterfaceTypeComposer<Context>
}): InputTypeComposer =>
  convertToNestedInputType({
    schemaComposer,
    typeComposer,
    postfix: `FilterInput`,
    onEnter: ({ fieldName, typeComposer }): IVisitContext => {
      const searchable =
        typeComposer instanceof UnionTypeComposer ||
        typeComposer instanceof ScalarTypeComposer
          ? undefined
          : typeComposer.getFieldExtension(fieldName, `searchable`)

      if (searchable === SEARCHABLE_ENUM.NOT_SEARCHABLE) {
        // stop traversing
        return null
      } else if (searchable === SEARCHABLE_ENUM.DEPRECATED_SEARCHABLE) {
        // mark this and all nested fields as deprecated
        return {
          deprecationReason: `Filtering on fields that need arguments to resolve is deprecated.`,
        }
      }

      // continue
      return undefined
    },
    leafInputComposer: getQueryOperatorInput,
    // elemMatch operator
    listInputComposer: getQueryOperatorListInput,
  })
