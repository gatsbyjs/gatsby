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
} = require(`graphql`)
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

function typeFields(type): GraphQLInputFieldConfigMap {
  switch (type) {
    case `boolean`:
      return {
        eq: { type: GraphQLBoolean },
        ne: { type: GraphQLBoolean },
      }
    case `string`:
      return {
        eq: { type: GraphQLString },
        ne: { type: GraphQLString },
        regex: { type: GraphQLString },
        glob: { type: GraphQLString },
      }
    case `int`:
      return {
        eq: { type: GraphQLInt },
        ne: { type: GraphQLInt },
      }
    case `float`:
      return {
        eq: { type: GraphQLFloat },
        ne: { type: GraphQLFloat },
      }
  }
  return {}
}

function inferGraphQLInputFields({
  value,
  nodes,
  prefix,
}): ?GraphQLInputFieldConfig {
  if (value == null || isEmptyObjectOrArray(value)) return null

  switch (typeOf(value)) {
    case `array`: {
      const headValue = value[0]
      let headType = typeOf(headValue)

      if (headType === `number`)
        headType = _.isInteger(headValue) ? `int` : `float`

      // Determine type for in operator.
      let inType
      switch (headType) {
        case `int`:
          inType = GraphQLInt
          break
        case `float`:
          inType = GraphQLFloat
          break
        case `string`:
          inType = GraphQLString
          break
        case `boolean`:
          inType = GraphQLBoolean
          break
        case `array`:
        case `object`: {
          let inferredField = inferGraphQLInputFields({
            value: headValue,
            prefix,
            nodes,
          })
          invariant(
            inferredField,
            `Could not infer graphQL type for value: ${headValue}`
          )
          inType = inferredField.type
          break
        }
        default:
          invariant(
            false,
            oneLine`
              Could not infer an appropriate GraphQL input type
              for value: ${headValue} of type ${headType} along path: ${prefix}
            `
          )
      }

      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}QueryList`),
          fields: {
            ...typeFields(headType),
            in: { type: new GraphQLList(inType) },
          },
        }),
      }
    }
    case `boolean`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}QueryBoolean`),
          fields: typeFields(`boolean`),
        }),
      }
    }
    case `string`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}QueryString`),
          fields: typeFields(`string`),
        }),
      }
    }
    case `object`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}InputObject`),
          fields: inferInputObjectStructureFromNodes({
            nodes,
            prefix,
            exampleValue: value,
          }).inferredFields,
        }),
      }
    }
    case `number`: {
      if (value % 1 === 0) {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${prefix}QueryInteger`),
            fields: typeFields(`int`),
          }),
        }
      } else {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${prefix}QueryFloat`),
            fields: typeFields(`float`),
          }),
        }
      }
    }
    default:
      return null
  }
}

const EXCLUDE_KEYS = {
  parent: 1,
  children: 1,
}

type InferInputOptions = {
  nodes: Object[],
  typeName?: string,
  prefix?: string,
  exampleValue?: Object,
}

export function inferInputObjectStructureFromNodes({
  nodes,
  typeName = ``,
  prefix = ``,
  exampleValue = extractFieldExamples(nodes),
}: InferInputOptions): GraphQLInputFieldConfigMap {
  const inferredFields = {}
  const isRoot = !prefix

  prefix = isRoot ? typeName : prefix

  _.each(exampleValue, (value, key) => {
    // Remove fields for traversing through nodes as we want to control
    // setting traversing up not try to automatically infer them.
    if (isRoot && EXCLUDE_KEYS[key]) return

    // Input arguments on linked fields aren't currently supported
    if (_.includes(key, `___NODE`)) return

    let field = inferGraphQLInputFields({
      nodes,
      value,
      prefix: `${prefix}${_.upperFirst(key)}`,
    })
 
    if (field == null) return
    // check if your key is really a string
    if (typeof key !== 'string') {
      console.log('You have dirty data ...');
      console.log('This key is not a string -> ' + key + ' and field is ' + JSON.stringify(field));
    }
    inferredFields[createKey(key)] = field
  })

  // Add sorting (but only to the top level).
  let sort
  if (typeName) {
    const enumValues = buildFieldEnumValues(nodes)

    const SortByType = new GraphQLEnumType({
      name: `${typeName}SortByFieldsEnum`,
      values: enumValues,
    })

    sort = {
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

  return { inferredFields, sort }
}
