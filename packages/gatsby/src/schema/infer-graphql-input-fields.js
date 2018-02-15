// @flow
const {
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
} = require(`graphql`)
const { oneLine } = require(`common-tags`)
const _ = require(`lodash`)
const invariant = require(`invariant`)
const typeOf = require(`type-of`)
const createTypeName = require(`./create-type-name`)
const createKey = require(`./create-key`)
const {
  extractFieldExamples,
  extractFieldNames,
  isEmptyObjectOrArray,
} = require(`./data-tree-utils`)

const { findLinkedNode } = require(`./infer-graphql-type`)
const { getNodes } = require(`../redux`)

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
        case `date`:
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
            `Could not infer graphQL type for value: ${JSON.stringify(
              Object.keys(headValue)
            )}`
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
    case `date`:
    case `string`: {
      return {
        type: new GraphQLInputObjectType({
          name: createTypeName(`${prefix}QueryString`),
          fields: typeFields(`string`),
        }),
      }
    }
    case `object`: {
      const fields = inferInputObjectStructureFromNodes({
        nodes,
        prefix,
        exampleValue: value,
      }).inferredFields
      if (!_.isEmpty(fields)) {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(`${prefix}InputObject`),
            fields,
          }),
        }
      } else {
        return null
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

const linkedNodeCache = {}

export function inferInputObjectStructureFromNodes({
  nodes,
  typeName = ``,
  prefix = ``,
  exampleValue = extractFieldExamples(nodes),
}: InferInputOptions): Object {
  const inferredFields = {}
  const isRoot = !prefix

  prefix = isRoot ? typeName : prefix

  _.each(exampleValue, (v, k) => {
    let value = v
    let key = k
    // Remove fields for traversing through nodes as we want to control
    // setting traversing up not try to automatically infer them.
    if (isRoot && EXCLUDE_KEYS[key]) return

    if (_.includes(key, `___NODE`)) {
      // TODO: Union the objects in array
      const nodeToFind = _.isArray(value) ? value[0] : value
      const linkedNode = findLinkedNode(nodeToFind)

      // Get from cache if found, else store into it
      if (linkedNodeCache[linkedNode.internal.type]) {
        value = linkedNodeCache[linkedNode.internal.type]
      } else {
        const relatedNodes = getNodes().filter(
          node => node.internal.type === linkedNode.internal.type
        )
        value = extractFieldExamples(relatedNodes)
        value = _.omitBy(value, (_v, _k) => _.includes(_k, `___NODE`))
        linkedNodeCache[linkedNode.internal.type] = value
      }

      if (_.isArray(value)) {
        value = [value]
      }

      ;[key] = key.split(`___`)
    }

    let field = inferGraphQLInputFields({
      nodes,
      value,
      prefix: `${prefix}${_.upperFirst(key)}`,
    })

    if (field == null) return
    inferredFields[createKey(key)] = field
  })

  // Add sorting (but only to the top level).
  let sort = []
  if (typeName) {
    sort = extractFieldNames(nodes)
  }

  return { inferredFields, sort }
}
