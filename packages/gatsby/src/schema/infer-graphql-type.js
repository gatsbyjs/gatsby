// @flow
const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLUnionType,
} = require(`graphql`)
const _ = require(`lodash`)
const invariant = require(`invariant`)
const { oneLine } = require(`common-tags`)

const { store } = require(`../redux`)
const { getNode, getNodes, getNodesByType } = require(`../db/nodes`)
const pageDependencyResolver = require(`./page-dependency-resolver`)
const createTypeName = require(`./create-type-name`)
const createKey = require(`./create-key`)
const {
  getExampleValues,
  isEmptyObjectOrArray,
  INVALID_VALUE,
} = require(`./data-tree-utils`)
const DateType = require(`./types/type-date`)
const FileType = require(`./types/type-file`)
const is32BitInteger = require(`../utils/is-32-bit-integer`)
const unionTypes = new Map()
const lazyFields = require(`./lazy-fields`)

import type { GraphQLOutputType } from "graphql"
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
} from "graphql/type/definition"

export type ProcessedNodeType = {
  name: string,
  nodes: any[],
  node: GraphQLFieldConfig<*, *>,
  fieldsFromPlugins: any,
  nodeObjectType: GraphQLOutputType,
}

function inferGraphQLType({
  exampleValue,
  selector,
  nodes,
  types,
  ...otherArgs
}): ?GraphQLFieldConfig<*, *> {
  if (exampleValue == null || isEmptyObjectOrArray(exampleValue)) return null
  let fieldName = selector.split(`.`).pop()

  // Check this before checking for array as FileType has
  // builtin support for inferring array of files and inferred
  // array type will have faster resolver than resolving array
  // of files separately.
  if (FileType.shouldInfer(nodes, selector, exampleValue)) {
    return _.isArray(exampleValue) ? FileType.getListType() : FileType.getType()
  }

  if (Array.isArray(exampleValue)) {
    exampleValue = exampleValue[0]

    if (exampleValue == null) return null

    let inferredType = inferGraphQLType({
      ...otherArgs,
      exampleValue,
      selector,
      nodes,
      types,
    })
    invariant(
      inferredType,
      `Could not infer graphQL type for value: ${exampleValue}`
    )

    const { type, args = null, resolve = null } = inferredType

    const listType = { type: new GraphQLList(type), args }

    if (resolve) {
      // If inferredType has resolve function wrap it with Array.map
      listType.resolve = (object, args, context, resolveInfo) => {
        const fieldValue = object[fieldName]
        if (!fieldValue) {
          return null
        }

        // Field resolver expects first parameter to be plain object
        // containing key with name of field we want to resolve.
        return fieldValue.map(value =>
          resolve({ [fieldName]: value }, args, context, resolveInfo)
        )
      }
    }

    return listType
  }

  if (
    // momentjs crashes when it encounters a Symbol,
    // so check against that
    typeof exampleValue !== `symbol` &&
    DateType.shouldInfer(exampleValue)
  ) {
    return DateType.getType()
  }

  switch (typeof exampleValue) {
    case `boolean`:
      return { type: GraphQLBoolean }
    case `string`:
      return { type: GraphQLString }
    case `object`: {
      const typeName = createTypeName(fieldName)
      return {
        type: new GraphQLObjectType({
          name: typeName,
          fields: _inferObjectStructureFromNodes(
            {
              ...otherArgs,
              selector,
              nodes,
              types,
              typeName,
            },
            exampleValue
          ),
        }),
      }
    }
    case `number`:
      return is32BitInteger(exampleValue)
        ? { type: GraphQLInt }
        : { type: GraphQLFloat }
    default:
      return null
  }
}

function inferFromMapping(
  value,
  mapping,
  fieldSelector,
  types
): ?GraphQLFieldConfig<*, *> {
  const linkedType = mapping[fieldSelector].split(`.`)[0]
  const linkedField =
    mapping[fieldSelector].slice(linkedType.length + 1) || `id`

  const matchedTypes = types.filter(type => type.name === linkedType)
  if (_.isEmpty(matchedTypes)) {
    console.log(`Couldn't find a matching node type for "${fieldSelector}"`)
    return null
  }

  const findNode = fieldValue =>
    getNodesByType(linkedType).find(n => _.get(n, linkedField) === fieldValue)

  if (_.isArray(value)) {
    return {
      type: new GraphQLList(matchedTypes[0].nodeObjectType),
      resolve: pageDependencyResolver((node, a, b, { fieldName }) => {
        const fieldValue = node[fieldName]
        if (fieldValue) {
          return fieldValue.map(findNode)
        } else {
          return null
        }
      }),
    }
  }

  return {
    type: matchedTypes[0].nodeObjectType,
    resolve: (node, a, b, { fieldName }) => {
      const fieldValue = node[fieldName]

      if (fieldValue) {
        return findNode(fieldValue, b.path)
      } else {
        return null
      }
    },
  }
}

function findLinkedNodeByField(linkedField, value) {
  getNodes().find(n => n[linkedField] === value)
}

export function findLinkedNode(value, linkedField, path) {
  let linkedNode
  // If the field doesn't link to the id, use that for searching.
  if (linkedField) {
    linkedNode = findLinkedNodeByField(linkedField, value)
    // Else the field is linking to the node's id, the default.
  } else {
    linkedNode = getNode(value)
  }
  return linkedNode
}

function inferFromFieldName(value, selector, types): GraphQLFieldConfig<*, *> {
  let isArray = false
  if (_.isArray(value)) {
    isArray = true
    // Reduce values to nodes with unique types.
    value = _.uniqBy(value, v => getNode(v).internal.type)
  }

  const key = selector.split(`.`).pop()
  const [, , linkedField] = key.split(`___`)

  const validateLinkedNode = linkedNode => {
    invariant(
      linkedNode,
      oneLine`
        Encountered an error trying to infer a GraphQL type for: "${selector}".
        There is no corresponding node with the ${linkedField || `id`}
        field matching: "${value}"
      `
    )
  }
  const validateField = (linkedNode, field) => {
    invariant(
      field,
      oneLine`
        Encountered an error trying to infer a GraphQL type for: "${selector}".
        There is no corresponding GraphQL type "${
          linkedNode.internal.type
        }" available
        to link to this node.
      `
    )
  }

  const findNodeType = node =>
    types.find(type => type.name === node.internal.type)

  if (isArray) {
    const linkedNodes = value.map(getNode)
    linkedNodes.forEach(node => validateLinkedNode(node))
    const fields = linkedNodes.map(node => findNodeType(node))
    fields.forEach((field, i) => validateField(linkedNodes[i], field))

    let type
    // If there's more than one type, we'll create a union type.
    if (fields.length > 1) {
      const typeName = `Union_${key}_${fields
        .map(f => f.name)
        .sort()
        .join(`__`)}`

      if (unionTypes.has(typeName)) {
        type = unionTypes.get(typeName)
      }

      if (!type) {
        type = new GraphQLUnionType({
          name: createTypeName(`Union_${key}`),
          description: `Union interface for the field "${key}" for types [${fields
            .map(f => f.name)
            .sort()
            .join(`, `)}]`,
          types: fields.map(f => f.nodeObjectType),
          resolveType: data =>
            fields.find(f => f.name == data.internal.type).nodeObjectType,
        })
        unionTypes.set(typeName, type)
      }
    } else {
      type = fields[0].nodeObjectType
    }

    return {
      type: new GraphQLList(type),
      resolve: (node, a, b = {}) => {
        let fieldValue = node[key]
        if (fieldValue) {
          return fieldValue.map(value =>
            findLinkedNode(value, linkedField, b.path)
          )
        } else {
          return null
        }
      },
    }
  }

  const linkedNode = findLinkedNode(value, linkedField)
  validateLinkedNode(linkedNode)
  const field = findNodeType(linkedNode)
  validateField(linkedNode, field)
  return {
    type: field.nodeObjectType,
    resolve: pageDependencyResolver(node =>
      findLinkedNode(node[key], linkedField)
    ),
  }
}

type inferTypeOptions = {
  nodes: Object[],
  types: ProcessedNodeType[],
  ignoreFields?: string[],
  selector?: string,
  typeName?: string,
}

const EXCLUDE_KEYS = {
  id: 1,
  parent: 1,
  children: 1,
  $loki: 1,
}

// Call this for the top level node + recursively for each sub-object.
// E.g. This gets called for Markdown and then for its frontmatter subobject.
function _inferObjectStructureFromNodes(
  { nodes, types, selector, ignoreFields, typeName }: inferTypeOptions,
  exampleValue: ?Object
): GraphQLFieldConfigMap<*, *> {
  const config = store.getState().config
  const isRoot = !selector
  const mapping = config && config.mapping

  // Ensure nodes have internal key with object.
  nodes = nodes.map(n => (n.internal ? n : { ...n, internal: {} }))

  const rootTypeName: string = nodes[0].internal.type
  if (!typeName) {
    typeName = rootTypeName
  }

  let resolvedExample: Object =
    exampleValue != null
      ? exampleValue
      : getExampleValues({ nodes, typeName: rootTypeName, ignoreFields })

  const inferredFields = {}
  _.each(resolvedExample, (value, key) => {
    // Remove fields common to the top-level of all nodes.  We add these
    // elsewhere so don't need to infer their type.
    if (value === INVALID_VALUE || (isRoot && EXCLUDE_KEYS[key])) return

    // Several checks to see if a field is pointing to custom type
    // before we try automatic inference.
    const nextSelector = selector ? `${selector}.${key}` : key
    const fieldSelector = `${rootTypeName}.${nextSelector}`

    let fieldName = key
    let inferredField

    // First check for manual field => type mappings in the site's
    // gatsby-config.js
    if (mapping && _.includes(Object.keys(mapping), fieldSelector)) {
      inferredField = inferFromMapping(value, mapping, fieldSelector, types)

      // Second if the field has a suffix of ___node. We use then the value
      // (a node id) to find the node and use that node's type as the field
    } else if (key.includes(`___NODE`)) {
      ;[fieldName] = key.split(`___`)
      inferredField = inferFromFieldName(value, nextSelector, types)
      lazyFields.add(typeName, fieldName)
    }

    // Replace unsupported values
    const sanitizedFieldName = createKey(fieldName)

    // If a pluging has already provided a type for this, don't infer it.
    if (ignoreFields && ignoreFields.includes(sanitizedFieldName)) {
      return
    }

    // Finally our automatic inference of field value type.
    if (!inferredField) {
      inferredField = inferGraphQLType({
        nodes,
        types,
        exampleValue: value,
        selector: nextSelector,
      })
    }

    if (!inferredField) return

    // If sanitized field name is different from original field name
    // add resolve passthrough to reach value using original field name
    if (sanitizedFieldName !== fieldName) {
      const {
        resolve: fieldResolve,
        ...inferredFieldWithoutResolve
      } = inferredField

      // Using copy if field as we sometimes have predefined frozen
      // field definitions and we can't mutate them.
      inferredField = inferredFieldWithoutResolve

      if (fieldResolve) {
        // If field has resolver, call it with adjusted resolveInfo
        // that points to original field name
        inferredField.resolve = (source, args, context, resolveInfo) =>
          fieldResolve(source, args, context, {
            ...resolveInfo,
            fieldName: fieldName,
          })
      } else {
        inferredField.resolve = source => source[fieldName]
      }
    }

    inferredFields[sanitizedFieldName] = inferredField
  })

  return inferredFields
}

export function inferObjectStructureFromNodes(options: inferTypeOptions) {
  return _inferObjectStructureFromNodes(options, null)
}

export function clearUnionTypes() {
  unionTypes.clear()
}
