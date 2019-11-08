import recursivelyTransformFields from "./recursively-transform-fields"
import { buildNodesQueryOnFieldName } from "./build-query-on-field-name"
import { dd } from "dumper.js"
// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/
import { getAvailablePostTypesQuery } from "../graphql-queries"
import fetchGraphql from "../../../utils/fetch-graphql"

const gql = ([string]) => string

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
    query: gql`
      query {
        __schema {
          types {
            kind
            name
            fields {
              name
              description
              type {
                ofType {
                  kind
                  name
                }
                kind
                name
                description
              }
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
                    ofType {
                      # null
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

        __type(name: "Node") {
          name
          kind
          possibleTypes {
            name
            description
            fields {
              name
              description
              type {
                ofType {
                  kind
                  name
                }
                kind
                name
                description
                fields {
                  name
                  description
                  type {
                    name
                    description
                  }
                }
              }
            }
          }
        }
      }
    `,
  })

  if (introspection.errors) {
    introspection.errors.forEach(error => {
      console.error(error)
    })
    process.exit()
  }

  let typeDefs = []

  introspection.data.__schema.types
    .filter(type => type.name !== `RootQuery` && type.kind === `OBJECT`)
    .forEach(type => {
      // create type definition
      typeDefs.push(
        helpers.schema.buildObjectType({
          name: `Wp${type.name}`,
          interfaces: [`Node`],
          fields: type.fields.reduce((acc, { name, ...curr }) => {
            // non null scalar types
            if (
              curr.type.kind === `NON_NULL` &&
              curr.type.ofType.kind === `SCALAR`
            ) {
              acc[name] = `${curr.type.ofType.name}!`
            }

            // scalar types
            if (curr.type.kind === `SCALAR`) {
              acc[name] = curr.type.name
            }

            // object types should be top level Gatsby nodes
            // so we link them by id
            if (curr.type.kind === `OBJECT`) {
              acc[name] = {
                type: `Wp${curr.type.name}`,
                resolve: (source, args, context, info) => {
                  if (!source[name] || !source[name].id) {
                    return null
                  }

                  return context.nodeModel.getNodeById({
                    id: source[name].id,
                    type: `Wp${curr.type.name}`,
                  })
                },
              }
            }

            return acc
          }, {}),
          extensions: {
            infer: false,
          },
        })
      )

      // create gql query string
    })

  helpers.actions.createTypes(typeDefs)

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
