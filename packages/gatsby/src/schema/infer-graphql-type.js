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
const moment = require(`moment`)
const mime = require(`mime`)
const isRelative = require(`is-relative`)
const isRelativeUrl = require(`is-relative-url`)
const normalize = require(`normalize-path`)
const systemPath = require(`path`)
const { oneLine } = require(`common-tags`)

const { store, getNode, getNodes, getRootNodeId } = require(`../redux`)
const { joinPath } = require(`../utils/path`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const createTypeName = require(`./create-type-name`)
const createKey = require(`./create-key`)
const {
  extractFieldExamples,
  isEmptyObjectOrArray,
} = require(`./data-tree-utils`)

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

const ISO_8601_FORMAT = [
  `YYYY`,
  `YYYY-MM`,
  `YYYY-MM-DD`,
  `YYYYMMDD`,
  `YYYY-MM-DDTHHZ`,
  `YYYY-MM-DDTHH:mmZ`,
  `YYYY-MM-DDTHHmmZ`,
  `YYYY-MM-DDTHH:mm:ssZ`,
  `YYYY-MM-DDTHHmmssZ`,
  `YYYY-MM-DDTHH:mm:ss.SSSZ`,
  `YYYY-MM-DDTHHmmss.SSSZ`,
  `YYYY-[W]WW`,
  `YYYY[W]WW`,
  `YYYY-[W]WW-E`,
  `YYYY[W]WWE`,
  `YYYY-DDDD`,
  `YYYYDDDD`,
]

function inferGraphQLType({
  exampleValue,
  selector,
  ...otherArgs
}): ?GraphQLFieldConfig<*, *> {
  if (exampleValue == null || isEmptyObjectOrArray(exampleValue)) return null
  let fieldName = selector.split(`.`).pop()

  if (Array.isArray(exampleValue)) {
    exampleValue = exampleValue[0]

    if (exampleValue == null) return null

    let headType
    // If the array contains non-array objects, than treat them as "nodes"
    // and create an object type.
    if (_.isObject(exampleValue) && !_.isArray(exampleValue)) {
      headType = new GraphQLObjectType({
        name: createTypeName(fieldName),
        fields: inferObjectStructureFromNodes({
          ...otherArgs,
          exampleValue,
          selector,
        }),
      })
      // Else if the values are simple values or arrays, just infer their type.
    } else {
      let inferredType = inferGraphQLType({
        ...otherArgs,
        exampleValue,
        selector,
      })
      invariant(
        inferredType,
        `Could not infer graphQL type for value: ${exampleValue}`
      )

      headType = inferredType.type
    }
    return { type: new GraphQLList(headType) }
  }

  // Check if this is a date.
  // All the allowed ISO 8601 date-time formats used.
  const momentDate = moment.utc(exampleValue, ISO_8601_FORMAT, true)
  if (momentDate.isValid() && typeof exampleValue !== `number`) {
    return {
      type: GraphQLString,
      args: {
        formatString: {
          type: GraphQLString,
          description: oneLine`
            Format the date using Moment.js' date tokens e.g.
          "date(formatString: "YYYY MMMM DD)"
          See https://momentjs.com/docs/#/displaying/format/
          for documentation for different tokens`,
        },
        fromNow: {
          type: GraphQLBoolean,
          description: oneLine`
            Returns a string generated with Moment.js' fromNow function`,
        },
        difference: {
          type: GraphQLString,
          description: oneLine`
            Returns the difference between this date and the current time.
            Defaults to miliseconds but you can also pass in as the
            measurement years, months, weeks, days, hours, minutes,
            and seconds.`,
        },
        locale: {
          type: GraphQLString,
          description: oneLine`
            Configures the locale Moment.js will use to format the date.
          `,
        },
      },
      resolve(object, args) {
        let date
        if (object[fieldName]) {
          date = JSON.parse(JSON.stringify(object[fieldName]))
        } else {
          return null
        }
        if (_.isPlainObject(args)) {
          const { fromNow, difference, formatString, locale = `en` } = args
          if (formatString) {
            return moment
              .utc(date, ISO_8601_FORMAT, true)
              .locale(locale)
              .format(formatString)
          } else if (fromNow) {
            return moment
              .utc(date, ISO_8601_FORMAT, true)
              .locale(locale)
              .fromNow()
          } else if (difference) {
            return moment().diff(
              moment.utc(date, ISO_8601_FORMAT, true).locale(locale),
              difference
            )
          }
        }

        return date
      },
    }
  }

  switch (typeof exampleValue) {
    case `boolean`:
      return { type: GraphQLBoolean }
    case `string`:
      return { type: GraphQLString }
    case `object`:
      return {
        type: new GraphQLObjectType({
          name: createTypeName(fieldName),
          fields: inferObjectStructureFromNodes({
            ...otherArgs,
            exampleValue,
            selector,
          }),
        }),
      }
    case `number`:
      return _.isInteger(exampleValue)
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
  const matchedTypes = types.filter(
    type => type.name === mapping[fieldSelector]
  )
  if (_.isEmpty(matchedTypes)) {
    console.log(`Couldn't find a matching node type for "${fieldSelector}"`)
    return null
  }

  const findNode = (fieldValue, path) => {
    const linkedType = mapping[fieldSelector]
    const linkedNode = _.find(
      getNodes(),
      n => n.internal.type === linkedType && n.id === fieldValue
    )
    if (linkedNode) {
      createPageDependency({ path, nodeId: linkedNode.id })
      return linkedNode
    }
    return null
  }

  if (_.isArray(value)) {
    return {
      type: new GraphQLList(matchedTypes[0].nodeObjectType),
      resolve: (node, a, b, { fieldName }) => {
        const fieldValue = node[fieldName]

        if (fieldValue) {
          return fieldValue.map(value => findNode(value, b.path))
        } else {
          return null
        }
      },
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

function findLinkedNode(value, linkedField, path) {
  let linkedNode
  // If the field doesn't link to the id, use that for searching.
  if (linkedField) {
    linkedNode = getNodes().find(n => n[linkedField] === value)
    // Else the field is linking to the node's id, the default.
  } else {
    linkedNode = getNode(value)
  }

  if (linkedNode) {
    if (path) createPageDependency({ path, nodeId: linkedNode.id })
    return linkedNode
  }
  return null
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
    const linkedNodes = value.map(v => findLinkedNode(v))
    linkedNodes.forEach(node => validateLinkedNode(node))
    const fields = linkedNodes.map(node => findNodeType(node))
    fields.forEach((field, i) => validateField(linkedNodes[i], field))

    let type
    // If there's more than one type, we'll create a union type.
    if (fields.length > 1) {
      type = new GraphQLUnionType({
        name: `Union_${key}_${fields.map(f => f.name).join(`__`)}`,
        description: `Union interface for the field "${key}" for types [${fields
          .map(f => f.name)
          .join(`, `)}]`,
        types: fields.map(f => f.nodeObjectType),
        resolveType: data =>
          fields.find(f => f.name == data.internal.type).nodeObjectType,
      })
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
    resolve: (node, a, b = {}) => {
      let fieldValue = node[key]
      if (fieldValue) {
        const result = findLinkedNode(fieldValue, linkedField, b.path)
        return result
      } else {
        return null
      }
    },
  }
}

function findRootNode(node) {
  // Find the root node.
  let rootNode = node
  let whileCount = 0
  let rootNodeId
  while (
    (rootNodeId = getRootNodeId(rootNode) || rootNode.parent) &&
    (getNode(rootNode.parent) !== undefined || getNode(rootNodeId)) &&
    whileCount < 101
  ) {
    if (rootNodeId) {
      rootNode = getNode(rootNodeId)
    } else {
      rootNode = getNode(rootNode.parent)
    }
    whileCount += 1
    if (whileCount > 100) {
      console.log(
        `It looks like you have a node that's set its parent as itself`,
        rootNode
      )
    }
  }

  return rootNode
}

function shouldInferFile(nodes, key, value) {
  const looksLikeFile =
    _.isString(value) &&
    mime.lookup(value) !== `application/octet-stream` &&
    // domains ending with .com
    mime.lookup(value) !== `application/x-msdownload` &&
    isRelative(value) &&
    isRelativeUrl(value)

  if (!looksLikeFile) {
    return false
  }

  // Find the node used for this example.
  let node = nodes.find(n => _.get(n, key) === value)

  if (!node) {
    // Try another search as our "key" isn't always correct e.g.
    // it doesn't support arrays so the right key could be "a.b[0].c" but
    // this function will get "a.b.c".
    //
    // We loop through every value of nodes until we find
    // a match.
    const visit = (current, selector = [], fn) => {
      for (let i = 0, keys = Object.keys(current); i < keys.length; i++) {
        const key = keys[i]
        const value = current[key]

        if (value === undefined || value === null) continue

        if (typeof value === `object` || typeof value === `function`) {
          visit(current[key], selector.concat([key]), fn)
          continue
        }

        let proceed = fn(current[key], key, selector, current)

        if (proceed === false) {
          break
        }
      }
    }

    const isNormalInteger = str => /^\+?(0|[1-9]\d*)$/.test(str)

    node = nodes.find(n => {
      let isMatch = false
      visit(n, [], (v, k, selector, parent) => {
        if (v === value) {
          // Remove integers as they're for arrays, which our passed
          // in object path doesn't have.
          const normalizedSelector = selector
            .map(s => (isNormalInteger(s) ? `` : s))
            .filter(s => s !== ``)
          const fullSelector = `${normalizedSelector.join(`.`)}.${k}`
          if (fullSelector === key) {
            isMatch = true
            return false
          }
        }

        // Not a match so we continue
        return true
      })

      return isMatch
    })

    // Still no node.
    if (!node) {
      return false
    }
  }

  const rootNode = findRootNode(node)

  // Only nodes transformed (ultimately) from a File
  // can link to another File.
  if (rootNode.internal.type !== `File`) {
    return false
  }

  const pathToOtherNode = normalize(joinPath(rootNode.dir, value))
  const otherFileExists = getNodes().some(
    n => n.absolutePath === pathToOtherNode
  )
  return otherFileExists
}

// Look for fields that are pointing at a file — if the field has a known
// extension then assume it should be a file field.
function inferFromUri(key, types, isArray) {
  const fileField = types.find(type => type.name === `File`)

  if (!fileField) return null

  return {
    type: isArray
      ? new GraphQLList(fileField.nodeObjectType)
      : fileField.nodeObjectType,
    resolve: (node, a, { path }) => {
      const fieldValue = node[key]

      if (!fieldValue) {
        return null
      }

      const findLinkedFileNode = relativePath => {
        // Use the parent File node to create the absolute path to
        // the linked file.
        const fileLinkPath = normalize(
          systemPath.resolve(parentFileNode.dir, relativePath)
        )

        // Use that path to find the linked File node.
        const linkedFileNode = _.find(
          getNodes(),
          n => n.internal.type === `File` && n.absolutePath === fileLinkPath
        )
        if (linkedFileNode) {
          createPageDependency({
            path,
            nodeId: linkedFileNode.id,
          })
          return linkedFileNode
        } else {
          return null
        }
      }

      // Find the File node for this node (we assume the node is something
      // like markdown which would be a child node of a File node).
      const parentFileNode = findRootNode(node)

      // Find the linked File node(s)
      if (isArray) {
        return fieldValue.map(relativePath => findLinkedFileNode(relativePath))
      } else {
        return findLinkedFileNode(fieldValue)
      }
    },
  }
}

type inferTypeOptions = {
  nodes: Object[],
  types: ProcessedNodeType[],
  selector?: string,
  exampleValue?: Object,
}

const EXCLUDE_KEYS = {
  id: 1,
  parent: 1,
  children: 1,
}

// Call this for the top level node + recursively for each sub-object.
// E.g. This gets called for Markdown and then for its frontmatter subobject.
export function inferObjectStructureFromNodes({
  nodes,
  types,
  selector,
  exampleValue = extractFieldExamples(nodes),
}: inferTypeOptions): GraphQLFieldConfigMap<*, *> {
  const config = store.getState().config
  const isRoot = !selector
  const mapping = config && config.mapping

  // Ensure nodes have internal key with object.
  nodes = nodes.map(n => (n.internal ? n : { ...n, internal: {} }))

  const inferredFields = {}
  _.each(exampleValue, (value, key) => {
    // Remove fields common to the top-level of all nodes.  We add these
    // elsewhere so don't need to infer their type.
    if (isRoot && EXCLUDE_KEYS[key]) return

    // Several checks to see if a field is pointing to custom type
    // before we try automatic inference.
    const nextSelector = selector ? `${selector}.${key}` : key
    const fieldSelector = `${nodes[0].internal.type}.${nextSelector}`

    let fieldName = key
    let inferredField

    // First check for manual field => type mappings in the site's
    // gatsby-config.js
    if (mapping && _.includes(Object.keys(mapping), fieldSelector)) {
      inferredField = inferFromMapping(value, mapping, fieldSelector, types)

      // Second if the field has a suffix of ___node. We use then the value
      // (a node id) to find the node and use that node's type as the field
    } else if (_.includes(key, `___NODE`)) {
      ;[fieldName] = key.split(`___`)
      inferredField = inferFromFieldName(value, nextSelector, types)

      // Third if the field (whether a string or array of string(s)) is
      // pointing to a file (from another file).
    } else if (
      nodes[0].internal.type !== `File` &&
      ((_.isString(value) &&
        !_.isEmpty(value) &&
        shouldInferFile(nodes, nextSelector, value)) ||
        (_.isArray(value) &&
          _.isString(value[0]) &&
          !_.isEmpty(value[0]) &&
          shouldInferFile(nodes, `${nextSelector}[0]`, value[0])))
    ) {
      inferredField = inferFromUri(key, types, _.isArray(value))
    }

    // Finally our automatic inference of field value type.
    if (!inferredField) {
      inferredField = inferGraphQLType({
        nodes,
        types,
        exampleValue: value,
        selector: selector ? `${selector}.${key}` : key,
      })
    }

    if (!inferredField) return

    // Replace unsupported values
    inferredFields[createKey(fieldName)] = inferredField
  })

  return inferredFields
}
