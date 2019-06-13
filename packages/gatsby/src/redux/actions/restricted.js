// @flow
const report = require(`gatsby-cli/lib/reporter`)

import type { Plugin } from "./types"

const actions = {}

/**
 * Add a third-party schema to be merged into main schema. Schema has to be a
 * graphql-js GraphQLSchema object.
 *
 * This schema is going to be merged as-is. This can easily break the main
 * Gatsby schema, so it's user's responsibility to make sure it doesn't happen
 * (by eg namespacing the schema).
 *
 * @availableIn [sourceNodes]
 *
 * @param {Object} $0
 * @param {GraphQLSchema} $0.schema GraphQL schema to add
 */
actions.addThirdPartySchema = (
  { schema }: { schema: GraphQLSchema },
  plugin: Plugin,
  traceId?: string
) => {
  return {
    type: `ADD_THIRD_PARTY_SCHEMA`,
    plugin,
    traceId,
    payload: schema,
  }
}

import type GatsbyGraphQLType from "../../schema/types/type-builders"
/**
 * Add type definitions to the GraphQL schema.
 *
 * @availableIn [sourceNodes]
 *
 * @param {string | GraphQLOutputType | GatsbyGraphQLType | string[] | GraphQLOutputType[] | GatsbyGraphQLType[]} types Type definitions
 *
 * Type definitions can be provided either as
 * [`graphql-js` types](https://graphql.org/graphql-js/), in
 * [GraphQL schema definition language (SDL)](https://graphql.org/learn/)
 * or using Gatsby Type Builders available on the `schema` API argument.
 *
 * Things to note:
 * * type definitions targeting node types, i.e. `MarkdownRemark` and others
 *   added in `sourceNodes` or `onCreateNode` APIs, need to implement the
 *   `Node` interface. Interface fields will be added automatically, but it
 *   is mandatory to label those types with `implements Node`.
 * * by default, explicit type definitions from `createTypes` will be merged
 *   with inferred field types, and default field resolvers for `Date` (which
 *   adds formatting options) and `File` (which resolves the field value as
 *   a `relativePath` foreign-key field) are added. This behavior can be
 *   customised with `@infer`, `@dontInfer` directives or extensions. Fields
 *   may be assigned resolver (and other option like args) with additional
 *   directives. Currently `@dateformat`, `@link` and `@fileByRelativePath` are
 *   available.
 *
 *
 * Schema customization controls:
 * * `@infer` - run inference on the type and add fields that don't exist on the
 * defined type to it.
 * * `@dontInfer` - don't run any inference on the type
 *
 * Extensions to add resolver options:
 * * `@dateformat` - add date formatting arguments. Accepts `formatString` and
 *   `locale` options that sets the defaults for this field
 * * `@link` - connect to a different Node. Arguments `by` and `from`, which
 *   define which field to compare to on a remote node and which field to use on
 *   the source node
 * * `@fileByRelativePath` - connect to a File node. Same arguments. The
 *   difference from link is that this normalizes the relative path to be
 *   relative from the path where source node is found.
 * * `proxy` - in case the underlying node data contains field names with
 *   characters that are invalid in GraphQL, `proxy` allows to explicitly
 *   proxy those properties to fields with valid field names. Takes a `from` arg.
 *
 *
 * @example
 * exports.sourceNodes = ({ actions }) => {
 *   const { createTypes } = actions
 *   const typeDefs = `
 *     """
 *     Markdown Node
 *     """
 *     type MarkdownRemark implements Node @infer {
 *       frontmatter: Frontmatter!
 *     }
 *
 *     """
 *     Markdown Frontmatter
 *     """
 *     type Frontmatter @infer {
 *       title: String!
 *       author: AuthorJson! @link
 *       date: Date! @dateformat
 *       published: Boolean!
 *       tags: [String!]!
 *     }
 *
 *     """
 *     Author information
 *     """
 *     # Does not include automatically inferred fields
 *     type AuthorJson implements Node @dontInfer {
 *       name: String!
 *       birthday: Date! @dateformat(locale: "ru")
 *     }
 *   `
 *   createTypes(typeDefs)
 * }
 *
 * // using Gatsby Type Builder API
 * exports.sourceNodes = ({ actions, schema }) => {
 *   const { createTypes } = actions
 *   const typeDefs = [
 *     schema.buildObjectType({
 *       name: 'MarkdownRemark',
 *       fields: {
 *         frontmatter: 'Frontmatter!'
 *       },
 *       interfaces: ['Node'],
 *       extensions: {
 *         infer: true,
 *       },
 *     }),
 *     schema.buildObjectType({
 *       name: 'Frontmatter',
 *       fields: {
 *         title: {
 *           type: 'String!',
 *           resolve(parent) {
 *             return parent.title || '(Untitled)'
 *           }
 *         },
 *         author: {
 *           type: 'AuthorJson'
 *           extensions: {
 *             link: {},
 *           },
 *         }
 *         date: {
 *           type: 'Date!'
 *           extensions: {
 *             dateformat: {},
 *           },
 *         },
 *         published: 'Boolean!',
 *         tags: '[String!]!',
 *       }
 *     }),
 *     schema.buildObjectType({
 *       name: 'AuthorJson',
 *       fields: {
 *         name: 'String!'
 *         birthday: {
 *           type: 'Date!'
 *           extensions: {
 *             dateformat: {
 *               locale: 'ru',
 *             },
 *           },
 *         },
 *       },
 *       interfaces: ['Node'],
 *       extensions: {
 *         infer: false,
 *       },
 *     }),
 *   ]
 *   createTypes(typeDefs)
 * }
 */
actions.createTypes = (
  types:
    | string
    | GraphQLOutputType
    | GatsbyGraphQLType
    | Array<string | GraphQLOutputType | GatsbyGraphQLType>,
  plugin: Plugin,
  traceId?: string
) => {
  return {
    type: `CREATE_TYPES`,
    plugin,
    traceId,
    payload: types,
  }
}

const withDeprecationWarning = (actionName, action, api, allowedIn) => (
  ...args
) => {
  report.warn(
    `Calling \`${actionName}\` in the \`${api}\` API is deprecated. ` +
      `Please use: ${allowedIn.map(a => `\`${a}\``).join(`, `)}.`
  )
  return action(...args)
}

const withErrorMessage = (actionName, api, allowedIn) => () =>
  // return a thunk that does not dispatch anything
  () => {
    report.error(
      `\`${actionName}\` is not available in the \`${api}\` API. ` +
        `Please use: ${allowedIn.map(a => `\`${a}\``).join(`, `)}.`
    )
  }

const nodeAPIs = Object.keys(require(`../../utils/api-node-docs`))

const ALLOWED_IN = `ALLOWED_IN`
const DEPRECATED_IN = `DEPRECATED_IN`

const set = (availableActionsByAPI, api, actionName, action) => {
  availableActionsByAPI[api] = availableActionsByAPI[api] || {}
  availableActionsByAPI[api][actionName] = action
}

const mapAvailableActionsToAPIs = restrictions => {
  const availableActionsByAPI = {}

  const actionNames = Object.keys(restrictions)
  actionNames.forEach(actionName => {
    const action = actions[actionName]

    const allowedIn = restrictions[actionName][ALLOWED_IN]
    allowedIn.forEach(api =>
      set(availableActionsByAPI, api, actionName, action)
    )

    const deprecatedIn = restrictions[actionName][DEPRECATED_IN]
    deprecatedIn.forEach(api =>
      set(
        availableActionsByAPI,
        api,
        actionName,
        withDeprecationWarning(actionName, action, api, allowedIn)
      )
    )

    const forbiddenIn = nodeAPIs.filter(
      api => ![...allowedIn, ...deprecatedIn].includes(api)
    )
    forbiddenIn.forEach(api =>
      set(
        availableActionsByAPI,
        api,
        actionName,
        withErrorMessage(actionName, api, allowedIn)
      )
    )
  })

  return availableActionsByAPI
}

const availableActionsByAPI = mapAvailableActionsToAPIs({
  createTypes: {
    [ALLOWED_IN]: [`sourceNodes`],
    [DEPRECATED_IN]: [`onPreInit`, `onPreBootstrap`],
  },
  addThirdPartySchema: {
    [ALLOWED_IN]: [`sourceNodes`],
    [DEPRECATED_IN]: [`onPreInit`, `onPreBootstrap`],
  },
})

module.exports = { actions, availableActionsByAPI }
