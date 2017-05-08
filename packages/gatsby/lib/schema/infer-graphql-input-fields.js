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

const inferGraphQLInputFields = (exports.inferGraphQLInputFields = (
  value,
  key,
  nodes,
  selector = ``,
  namespace = ``
) => {
  switch (typeOf(value)) {
    case `array`: {
      const headValue = value[0]
      let headType = typeOf(headValue)
      // Check if headType is a number.
      if (headType === `number`) {
        if (headValue % 1 === 0) {
          headType = `int`
        } else {
          headType = `float`
        }
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
        case `object`:
          inType = inferGraphQLInputFields(headValue, key, nodes).type
          break
        case `array`:
          inType = inferGraphQLInputFields(headValue, key, nodes).type
          break
      }

      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${namespace} ${selector} ${key}QueryList`),
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
          name: createTypeName(`${namespace} ${selector} ${key}QueryBoolean`),
          fields: {
            ...typeFields(`boolean`),
          },
        }),
      }
    }
    case `string`: {
      let cleanedKey = key
      if (_.includes(key, `___NODE`)) {
        cleanedKey = key.split(`___`)[0]
      }

      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(
            `${namespace} ${selector} ${cleanedKey}QueryString`
          ),
          fields: {
            ...typeFields(`string`),
          },
        }),
      }
    }
    case `object`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${namespace} ${selector} ${key}InputObject`),
          fields: inferInputObjectStructureFromNodes(nodes, key, namespace),
        }),
      }
    }
    case `number`: {
      if (value % 1 === 0) {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${namespace} ${selector} ${key}QueryNumber`),
            fields: {
              ...typeFields(`int`),
            },
          }),
        }
      } else {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${namespace} ${selector} ${key}QueryFloat`),
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
})

const inferInputObjectStructureFromNodes = (exports.inferInputObjectStructureFromNodes = (
  nodes: any,
  selector: string,
  namespace: string
) => {
  let fieldExamples
  if (selector && selector !== ``) {
    // Don't delete node fields if we're not at the root of the node.
    fieldExamples = extractFieldExamples({
      nodes,
      selector,
      deleteNodeFields: false,
    })
  } else {
    fieldExamples = extractFieldExamples({
      nodes,
      selector,
      deleteNodeFields: true,
    })
  }

  const inferredFields = {}
  _.each(fieldExamples, (v, k) => {
    inferredFields[k] = inferGraphQLInputFields(
      v,
      k,
      nodes,
      selector,
      namespace
    )
  })

  // Add sorting (but only to the top level).
  if (!selector || selector === ``) {
    const enumValues = buildFieldEnumValues(nodes)

    const SortByType = new GraphQLEnumType({
      name: `${namespace}SortByFieldsEnum`,
      values: enumValues,
    })

    inferredFields.sortBy = {
      type: new GraphQLInputObjectType({
        name: _.camelCase(`${namespace} sortBy`),
        fields: {
          fields: {
            name: _.camelCase(`${namespace} sortByFields`),
            type: new GraphQLNonNull(new GraphQLList(SortByType)),
          },
          order: {
            name: _.camelCase(`${namespace} sortOrder`),
            defaultValue: `asc`,
            type: new GraphQLEnumType({
              name: _.camelCase(`${namespace} sortOrderValues`),
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
