import {
  getNamedType,
  getNullableType,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLList,
  isSpecifiedScalarType,
  GraphQLScalarType,
} from "graphql"
import { addDerivedType } from "./derived-types"
import {
  InputTypeComposer,
  GraphQLJSON,
  SchemaComposer,
  ObjectTypeComposer,
  EnumTypeComposer,
  InterfaceTypeComposer,
  UnionTypeComposer,
  ScalarTypeComposer,
} from "graphql-compose"
import { GraphQLDate } from "./date"

type Context = any

type AnyComposeType<TContext> =
  | ObjectTypeComposer<any, TContext>
  | InputTypeComposer<TContext>
  | EnumTypeComposer<TContext>
  | InterfaceTypeComposer<any, TContext>
  | UnionTypeComposer<any, TContext>
  | ScalarTypeComposer<TContext>

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

const removeEmptyFields = (
  { inputTypeComposer }: { inputTypeComposer: InputTypeComposer },
  cache = new Set()
): InputTypeComposer => {
  const convert = (itc: InputTypeComposer): InputTypeComposer => {
    if (cache.has(itc)) {
      return itc
    }
    cache.add(itc)
    const fields = itc.getFields()
    const nonEmptyFields = {}
    Object.keys(fields).forEach(fieldName => {
      const fieldITC = fields[fieldName].type
      if (fieldITC instanceof InputTypeComposer) {
        const convertedITC = convert(fieldITC)
        if (convertedITC.getFieldNames().length) {
          nonEmptyFields[fieldName] = convertedITC
        }
      } else {
        nonEmptyFields[fieldName] = fieldITC
      }
    })
    itc.setFields(nonEmptyFields)
    return itc
  }
  return convert(inputTypeComposer)
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

const convert = ({
  schemaComposer,
  typeComposer,
  inputTypeComposer,
  filterInputComposer,
  deprecationReason,
}: {
  schemaComposer: SchemaComposer<Context>
  typeComposer: AnyComposeType<Context>
  inputTypeComposer: InputTypeComposer<Context>
  filterInputComposer?: InputTypeComposer<Context>
  deprecationReason?: any
}): InputTypeComposer<Context> => {
  const inputTypeName = inputTypeComposer
    .getTypeName()
    .replace(/Input$/, `FilterInput`)

  addDerivedType({ typeComposer, derivedTypeName: inputTypeName })

  let convertedITC
  if (filterInputComposer) {
    convertedITC = filterInputComposer
  } else if (schemaComposer.has(inputTypeName)) {
    return schemaComposer.getITC(inputTypeName)
  } else {
    convertedITC = new InputTypeComposer(
      new GraphQLInputObjectType({
        name: inputTypeName,
        fields: {},
      }),
      schemaComposer
    )
  }

  schemaComposer.add(convertedITC)

  const fieldNames = inputTypeComposer.getFieldNames()
  const convertedFields = {}
  fieldNames.forEach(fieldName => {
    const fieldConfig = inputTypeComposer.getFieldConfig(fieldName)
    const type = getNamedType(fieldConfig.type)
    const searchable =
      typeComposer instanceof UnionTypeComposer ||
      typeComposer instanceof ScalarTypeComposer
        ? undefined
        : typeComposer.getFieldExtension(fieldName, `searchable`)

    if (searchable === SEARCHABLE_ENUM.NOT_SEARCHABLE) {
      return
    } else if (searchable === SEARCHABLE_ENUM.DEPRECATED_SEARCHABLE) {
      deprecationReason = `Filtering on fields that need arguments to resolve is deprecated.`
    }

    if (type instanceof GraphQLInputObjectType) {
      // Input type composers has names `FooInput`, get the type associated
      // with it
      const typeComposer = schemaComposer.getAnyTC(
        type.name.replace(/Input$/, ``)
      )
      const itc = new InputTypeComposer(type, schemaComposer)

      const operatorsInputTC = convert({
        schemaComposer,
        typeComposer,
        inputTypeComposer: itc,
        deprecationReason,
      })

      // TODO: array of arrays?
      const isListType =
        getNullableType(fieldConfig.type) instanceof GraphQLList

      // elemMatch operator
      convertedFields[fieldName] = isListType
        ? getQueryOperatorListInput({
            schemaComposer,
            inputTypeComposer: operatorsInputTC,
          })
        : operatorsInputTC
    } else {
      // GraphQLScalarType || GraphQLEnumType
      const operatorFields = getQueryOperatorInput({ schemaComposer, type })
      if (operatorFields) {
        convertedFields[fieldName] = operatorFields
      }
    }

    if (convertedFields[fieldName]) {
      convertedFields[fieldName].deprecationReason = deprecationReason
    }
  })

  convertedITC.addFields(convertedFields)
  return convertedITC
}

export const getFilterInput = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<Context>
  typeComposer: ObjectTypeComposer<Context> | InterfaceTypeComposer<Context>
}): InputTypeComposer => {
  const typeName = typeComposer.getTypeName()
  const filterInputComposer = schemaComposer.getOrCreateITC(
    `${typeName}FilterInput`
  )
  const inputTypeComposer = typeComposer.getInputTypeComposer()

  if (
    inputTypeComposer?.hasField(`id`) &&
    getNamedType(inputTypeComposer.getFieldType(`id`)).name === `ID`
  ) {
    inputTypeComposer.extendField(`id`, { type: `String` })
  }

  const filterInputTC = convert({
    schemaComposer,
    typeComposer,
    inputTypeComposer,
    filterInputComposer,
  })

  return removeEmptyFields({ inputTypeComposer: filterInputTC })
}
