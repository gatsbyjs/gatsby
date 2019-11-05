import recursivelyTransformFields from "./recursively-transform-fields"
import { buildNodesQueryOnFieldName } from "./build-query-on-field-name"

// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/
import { getAvailablePostTypesQuery } from "../graphql-queries"
import fetchGraphql from "../../../utils/fetch-graphql"

export const getAvailableContentTypes = async ({ url }) => {
  const query = getAvailablePostTypesQuery()

  const { data } = await fetchGraphql({ url, query })

  const contentTypes = data.postTypes.map(postTypeObj => {
    return {
      plural: postTypeObj.fieldNames.plural.toLowerCase(),
      singular: postTypeObj.fieldNames.singular.toLowerCase(),
    }
  })

  return contentTypes
}

export const buildNodeQueriesFromIntrospection = async (
  helpers,
  pluginOptions
) => {
  const introspection = await fetchGraphql({
    url: pluginOptions.url,
    query: `
      {
        __schema {
          types {
            name
            possibleTypes {
              kind
              name
            }
          }
          queryType {
            fields {
              name # post
              type {
                kind # OBJECT
                name # Post
                fields {
                  name # editLock
                  type {
                    name # EditLock
                    kind # OBJECT
                    ofType { # null
                      kind
                      name
                    }
                    fields {
                      name #user
                      type {
                        kind # OBJECT
                        name # User
                        fields {
                          name # id
                          type {
                            name # null
                            kind # NON_NULL
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  })

  // we don't need or can't access these
  const rootQueryFieldNameBlacklist = [
    `revisions`,
    `themes`,
    `userRoles`,
    `actionMonitorActions`,
  ]

  const rootFields = introspection.data.__schema.queryType.fields
  // const types = introspection.data.__schema.types

  // first we want to find root query fields that will return lists of nodes
  const rootQueryListConnections = rootFields
    .filter(
      field =>
        field.type.kind === `OBJECT` &&
        field.type.name.includes(`RootQueryTo`) &&
        !rootQueryFieldNameBlacklist.includes(field.name)
    )
    .map(field => {
      return {
        rootFieldName: field.name,
        rootTypeName: field.type.name,
        nodesTypeName: field.type.fields.find(
          innerField => innerField.name === `nodes`
        ).type.ofType.name,
      }
    })

  // get an array of type names for the nodes in our root query node lists
  const nodeListTypeNames = rootQueryListConnections.map(
    field => field.nodesTypeName
  )

  // const relationshipByIdFieldsShape = [
  //   {
  //     name: `id`,
  //     type: {
  //       kind: `NON_NULL`,
  //     },
  //     alias: `relationshipById`,
  //   },
  // ]

  // build an object where the root property names are node list types
  // each of those properties contains an object of info about that types fields
  const nodeListTypes = rootQueryListConnections.reduce(
    (accumulator, connection) => {
      const name = connection.nodesTypeName
      const typeInfo = rootFields.find(field => field.type.name === name)

      typeInfo.type.fields = recursivelyTransformFields({
        fields: typeInfo.type.fields,
        nodeListTypeNames,
      })

      accumulator[name] = {
        fieldName: typeInfo.name,
        ...connection,
        ...typeInfo.type,
      }
      return accumulator
    },
    {}
  )

  let queries = {}

  // for each root field that returns a list of nodes
  // build a query to fetch those nodes
  // nodeListTypeNames.forEach(async typeName => )
  for (const typeName of nodeListTypeNames) {
    const listType = nodeListTypes[typeName]

    await helpers.cache.set(
      `${listType.fieldName}--types-by-single-field-name`,
      listType
    )

    const queryString = buildNodesQueryOnFieldName({
      fields: listType.fields,
      fieldName: listType.rootFieldName,
    })

    queries[listType.rootFieldName] = {
      typeInfo: {
        singleName: listType.fieldName,
        pluralName: listType.rootFieldName,
        nodesTypeName: listType.nodesTypeName,
      },
      queryString,
    }
  }

  return queries
}

// Loop through our rootQueryFieldConnections
// and pass the fieldname into this function in a recursive loop to get
// all nodes of each type.
// const getRootFieldQuery = ({ fieldName, nodeQuery }) => `
//   query GET_ROOT_FIELD_NODES($first: Int, $after: String) {
//     ${fieldName}(
//       first: $first
//       after: $after
//     ) {
//       pageInfo {
//         hasNextPage
//         endCursor
//       }
//       nodes {
//         ${nodeQuery} # <-- build this out of nodeListTypes const
//       }
//     }
//   }
// `
// Once we build all of these up and create nodes out of them,
// loop through all WPGQL nodes we've created thus far
// and make a generic type that holds all WP nodes
// wpNodes? or wpContent/allWpContent ?
// add a field called "node__NODE" which just links to appropriate node
// then add other fields with type information about the node?
