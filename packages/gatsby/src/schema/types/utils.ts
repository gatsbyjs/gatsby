import {
  getNamedType,
  getNullableType,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLList,
  GraphQLScalarType,
} from "graphql"
import { addDerivedType } from "./derived-types"
import {
  InputTypeComposer,
  SchemaComposer,
  ObjectTypeComposer,
  EnumTypeComposer,
  InterfaceTypeComposer,
  UnionTypeComposer,
  ScalarTypeComposer,
  NonNullComposer,
} from "graphql-compose"

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

export type IVisitContext =
  | {
      deprecationReason?: string
    }
  | undefined
  | null

export type OnEnter = (visitorContext: {
  fieldName: string
  typeComposer: AnyComposeType<Context>
}) => IVisitContext

export type LeafInput =
  | InputTypeComposer<Context>
  | NonNullComposer<InputTypeComposer<Context>>
  | ((arg: {
      type: GraphQLScalarType | GraphQLEnumType
      schemaComposer: SchemaComposer<Context>
    }) => InputTypeComposer<Context>)
  | EnumTypeComposer<Context>
  | NonNullComposer<EnumTypeComposer<Context>>

export type ListInput = (arg: {
  inputTypeComposer: InputTypeComposer
  schemaComposer: SchemaComposer<Context>
}) => InputTypeComposer<Context>

const convert = ({
  schemaComposer,
  typeComposer,
  inputTypeComposer,
  preCreatedInputComposer,
  deprecationReason,
  postfix,
  onEnter,
  leafInputComposer,
  listInputComposer,
}: {
  schemaComposer: SchemaComposer<Context>
  typeComposer: AnyComposeType<Context>
  inputTypeComposer: InputTypeComposer<Context>
  preCreatedInputComposer?: InputTypeComposer<Context>
  deprecationReason?: any
  postfix: string
  onEnter: OnEnter
  leafInputComposer: LeafInput
  listInputComposer?: ListInput
}): InputTypeComposer<Context> => {
  const inputTypeName = inputTypeComposer
    .getTypeName()
    .replace(/Input$/, postfix)

  addDerivedType({ typeComposer, derivedTypeName: inputTypeName })

  let convertedITC
  if (preCreatedInputComposer) {
    convertedITC = preCreatedInputComposer
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
    const maybeContext = onEnter({
      fieldName,
      typeComposer,
    })

    if (maybeContext === null) {
      return
    }

    const fieldConfig = inputTypeComposer.getFieldConfig(fieldName)
    const type = getNamedType(fieldConfig.type)

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
        deprecationReason: maybeContext?.deprecationReason ?? deprecationReason,
        postfix,
        onEnter,
        leafInputComposer,
        listInputComposer,
      })

      // TODO: array of arrays?
      const isListType =
        getNullableType(fieldConfig.type) instanceof GraphQLList

      convertedFields[fieldName] = isListType
        ? typeof listInputComposer === `function`
          ? listInputComposer({
              schemaComposer,
              inputTypeComposer: operatorsInputTC,
            })
          : operatorsInputTC
        : operatorsInputTC
    } else {
      // GraphQLScalarType || GraphQLEnumType
      const operatorFields =
        typeof leafInputComposer === `function`
          ? leafInputComposer({ schemaComposer, type })
          : leafInputComposer
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

export const convertToNestedInputType = ({
  schemaComposer,
  typeComposer,
  postfix,
  onEnter,
  leafInputComposer,
  listInputComposer,
}: {
  schemaComposer: SchemaComposer<Context>
  typeComposer: ObjectTypeComposer<Context> | InterfaceTypeComposer<Context>
  postfix: string
  onEnter: OnEnter
  leafInputComposer: LeafInput
  listInputComposer?: ListInput
}): InputTypeComposer => {
  const typeName = typeComposer.getTypeName()
  const preCreatedInputComposer = schemaComposer.getOrCreateITC(
    `${typeName}${postfix}`
  )
  const inputTypeComposer = typeComposer.getInputTypeComposer({
    fallbackType: null,
  })

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
    preCreatedInputComposer,
    postfix,
    onEnter,
    leafInputComposer,
    listInputComposer,
  })

  return removeEmptyFields({ inputTypeComposer: filterInputTC })
}
