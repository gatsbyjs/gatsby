// @flow

const {
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
} = require(`graphql`)

import type { GraphQLInputType, GraphQLType } from "graphql"

const { oneLine } = require(`common-tags`)
const _ = require(`lodash`)
const invariant = require(`invariant`)
const typeOf = require(`type-of`)
const createTypeName = require(`./create-type-name`)
const createKey = require(`./create-key`)
const {
  extractFieldExamples,
  buildFieldEnumValues,
  isEmptyObjectOrArray,
} = require(`./data-tree-utils`)

import type {
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
} from "graphql/type/definition"

type GraphQLNullableInputType<T> =
  | GraphQLScalarType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLList<T>

function makeNullable(type: GraphQLInputType): GraphQLNullableInputType<any> {
  if (type instanceof GraphQLNonNull) {
    return type.ofType
  }
  return type
}

function convertToInputType(type: GraphQLType): GraphQLInputType {
  if (type instanceof GraphQLScalarType || type instanceof GraphQLEnumType) {
    return type
  } else if (type instanceof GraphQLObjectType) {
    return new GraphQLInputObjectType({
      name: createTypeName(`${type.name}InputObject`),
      fields: _.transform(type.getFields(), (out, fieldConfig, key) => {
        try {
          const type = convertToInputType(fieldConfig.type)
          out[key] = { type }
        } catch (e) {
          console.log(e)
        }
      }),
    })
  } else if (type instanceof GraphQLList) {
    return new GraphQLList(makeNullable(convertToInputType(type.ofType)))
  } else if (type instanceof GraphQLNonNull) {
    return new GraphQLNonNull(makeNullable(convertToInputType(type.ofType)))
  } else if (type instanceof GraphQLInterfaceType) {
    throw new Error(`GraphQLInterfaceType not yet implemented`)
  } else if (type instanceof GraphQLUnionType) {
    throw new Error(`GraphQLUnionType not yet implemented`)
  } else {
    throw new Error(
      `Invalid input type ${type && type.constructor && type.constructor.name}`
    )
  }
}

const scalarFilterMap = {
  Int: {
    eq: { type: GraphQLInt },
    ne: { type: GraphQLInt },
  },
  Float: {
    eq: { type: GraphQLFloat },
    ne: { type: GraphQLFloat },
  },
  String: {
    eq: { type: GraphQLString },
    ne: { type: GraphQLString },
    regex: { type: GraphQLString },
    glob: { type: GraphQLString },
  },
  Boolean: {
    eq: { type: GraphQLBoolean },
    ne: { type: GraphQLBoolean },
  },
}

function convertToInputFilter(
  prefix: string,
  type: GraphQLInputType
): GraphQLInputObjectType {
  if (type instanceof GraphQLScalarType) {
    const name = type.name
    const fields = scalarFilterMap[name]

    if (fields == null) {
      throw new Error(`Unknown scalar type for input filter`)
    }

    return new GraphQLInputObjectType({
      name: createTypeName(`${prefix}Query${name}`),
      fields: fields,
    })
  } else if (type instanceof GraphQLInputObjectType) {
    return new GraphQLInputObjectType({
      name: createTypeName(`${prefix}{type.name}`),
      fields: _.transform(type.getFields(), (out, fieldConfig, key) => {
        try {
          const type = convertToInputFilter(
            `${prefix}${_.upperFirst(key)}`,
            fieldConfig.type
          )
          out[key] = { type }
        } catch (e) {
          console.log(e)
        }
      }),
    })
  } else if (type instanceof GraphQLList) {
    const innerType = type.ofType
    let innerFields = {}
    try {
      innerFields = convertToInputFilter(
        `${prefix}ListElem`,
        innerType
      ).getFields()
    } catch (e) {
      console.log(e)
    }

    return new GraphQLInputObjectType({
      name: createTypeName(`${prefix}QueryList`),
      fields: {
        ...innerFields,
        in: { type: new GraphQLList(innerType) },
      },
    })
  } else if (type instanceof GraphQLNonNull) {
    return convertToInputFilter(prefix, type.ofType)
  }

  throw new Error(`Unknown input field type`)
}

function extractFieldNamesFromInputField(
  prefix: string,
  type: GraphQLInputType,
  accu: string[]
) {
  if (type instanceof GraphQLScalarType || type instanceof GraphQLList) {
    accu.push(prefix)
  } else if (type instanceof GraphQLInputObjectType) {
    _.each(type.getFields(), (fieldConfig, key) => {
      extractFieldNamesFromInputField(
        `${prefix}___${key}`,
        fieldConfig.type,
        accu
      )
    })
  } else if (type instanceof GraphQLNonNull) {
    extractFieldNamesFromInputField(prefix, type.ofType, accu)
  } else {
    throw new Error(`Unknown input field type`)
  }
}

// convert output fields to output fields and a list of fields to sort on
export function inferInputObjectStructureFromFields({
  fields,
  typeName = ``,
}: any) {
  const inferredFields = {}
  const sort = []

  _.each(fields, (fieldConfig, key) => {
    try {
      const inputType = convertToInputType(fieldConfig.type)
      const filterType = convertToInputFilter(_.upperFirst(key), inputType)

      inferredFields[createKey(key)] = {
        type: filterType,
      }

      // Add sorting (but only to the top level).
      if (typeName) {
        extractFieldNamesFromInputField(key, inputType, sort)
      }
    } catch (e) {
      console.log(key, fieldConfig, e)
    }
  })

  return { inferredFields, sort }
}

// builds an input field for sorting, given an array of names to sort on
export function createSortField(typeName: string, fieldNames: string[]) {
  const enumValues = {}
  fieldNames.forEach(field => {
    enumValues[createKey(field)] = { value: field }
  })

  const SortByType = new GraphQLEnumType({
    name: `${typeName}SortByFieldsEnum`,
    values: enumValues,
  })

  return {
    type: new GraphQLInputObjectType({
      name: _.camelCase(`${typeName} sort`),
      fields: {
        fields: {
          name: _.camelCase(`${typeName} sortFields`),
          type: new GraphQLNonNull(new GraphQLList(SortByType)),
        },
        order: {
          name: _.camelCase(`${typeName} sortOrder`),
          defaultValue: `asc`,
          type: new GraphQLEnumType({
            name: _.camelCase(`${typeName} sortOrderValues`),
            values: {
              ASC: { value: `asc` },
              DESC: { value: `desc` },
            },
          }),
        },
      },
    }),
  }
}
