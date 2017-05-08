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
const _ = require(`lodash`)
const typeOf = require(`type-of`)
const createTypeName = require(`./create-type-name`)

const {
  extractFieldExamples,
  buildFieldEnumValues,
} = require(`./data-tree-utils`)

const typeFields = type => {
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
}

const inferGraphQLInputFields = ({ value, nodes, prefix }) => {
  if (value == null || (Array.isArray(value) && !value.length)) return null

  switch (typeOf(value)) {
    case `array`: {
      const headValue = value[0]
      let headType = typeOf(headValue)
      // Check if headType is a number.
      if (headType === `number`) {
        headType = _.isInteger(headValue) ? `int` : `float`
      }

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
        case `object`:
          inType = inferGraphQLInputFields({ value: headValue, prefix, nodes })
            .type
          break
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
          fields: {
            ...typeFields(`boolean`),
          },
        }),
      }
    }
    case `string`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}QueryString`),
          fields: {
            ...typeFields(`string`),
          },
        }),
      }
    }
    case `object`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}InputObject`),
          fields: inferInputObjectStructureFromNodes(nodes, prefix, ``, value),
        }),
      }
    }
    case `number`: {
      if (value % 1 === 0) {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${prefix}QueryNumber`),
            fields: {
              ...typeFields(`int`),
            },
          }),
        }
      } else {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${prefix}QueryFloat`),
            fields: {
              ...typeFields(`float`),
            },
          }),
        }
      }
    }
    default:
      return null
  }
}

const inferInputObjectStructureFromNodes = (exports.inferInputObjectStructureFromNodes = (
  nodes,
  selector = typeName,
  typeName,
  fieldExamples = extractFieldExamples({ nodes })
) => {
  const inferredFields = _.mapValues(fieldExamples, (value, key) => {
    if (_.includes(key, `___NODE`)) key = key.split(`___`)[0]

    return inferGraphQLInputFields({
      nodes,
      value,
      prefix: `${selector}${_.upperFirst(key)}`,
    })
  })

  // Add sorting (but only to the top level).
  if (typeName) {
    const enumValues = buildFieldEnumValues(nodes)

    const SortByType = new GraphQLEnumType({
      name: `${typeName}SortByFieldsEnum`,
      values: enumValues,
    })

    inferredFields.sortBy = {
      type: new GraphQLInputObjectType({
        name: _.camelCase(`${typeName} sortBy`),
        fields: {
          fields: {
            name: _.camelCase(`${typeName} sortByFields`),
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

  return inferredFields
})
