const { dd } = require(`dumper.js`)
const Query = require(`graphql-query-builder`)

// @todo create function to unmap check here for similar function https://www.gatsbyjs.org/packages/gatsby-source-graphql-universal/
const {
  // getActionMonitorQuery,
  getAvailablePostTypesQuery,
} = require(`../graphql-queries`)
const fetchGraphql = require(`../../../utils/fetch-graphql`)

const getAvailableContentTypes = async ({ url }) => {
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

const buildNodeQueriesFromIntrospection = async (helpers, pluginOptions) => {
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

      typeInfo.type.fields = typeInfo.type.fields
        .filter(field => {
          const fieldType = field.type || {}
          const ofType = fieldType.ofType || {}
          // for now remove relational lists
          if (fieldType.kind === `LIST` && ofType.kind !== `SCALAR`) {
            return false
          }

          if (
            field.type &&
            field.type.name &&
            field.type.name.includes(`Connection`)
          ) {
            // and connections
            return false
          }

          return true
        })
        .map(field => {
          if (nodeListTypeNames.includes(field.type.name)) {
            // this is a node from another root node list that we will make a node from
            // let's just turn this into an ID
            // to do that we just pull the WPGQL id for now
            field.type.relationShipField = true
            field.type.fields = field.type.fields.filter(
              innerField => innerField.name === `id`
            )
          }

          // if (
          //   field.type &&
          //   field.type.kind === `LIST` &&
          //   field.type.ofType &&
          //   field.type.ofType.name &&
          //   types.find(type => type.name === field.type.ofType.name)
          // ) {
          //   // this is a type that isn't in a root field node list
          //   // so we need to query it directly instead of creating a node relationship.
          //   // but we need to grab it's possible fields from the type introspection
          //   // and add them here since we don't have them
          //   const type = types.find(type => type.name === field.type.ofType.name)
          //   console.log(`here it is!`)
          //   dd(type)
          // }

          if (field.type.fields) {
            field.type.field = field.type.fields.map(innerField => {
              // recurse once. this should be turned into a recursive function that loops down through and replaces any top level node fields with just an id field as many levels deep as we ask for in our query.
              if (nodeListTypeNames.includes(innerField.type.name)) {
                innerField.type.relationShipField = true
                innerField.type.fields = innerField.type.fields.filter(
                  innerField2 => innerField2.name === `id`
                )
              }
              return field
            })
          }
          return field
        })

      // dd(typeInfo)

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
  nodeListTypeNames.forEach(typeName => {
    const listType = nodeListTypes[typeName]

    // this builds the gql query
    let queryField = new Query(listType.rootFieldName, {
      $variables: true,
    })

    // this adds subfields to our query
    queryField.find([
      {
        pageInfo: [`hasNextPage`, `endCursor`],
      },
      {
        nodes: listType.fields
          .map(field => {
            if (field.type && field.type.kind === `UNION`) {
              return null
            }

            if (field.type && field.type.fields) {
              return {
                [field.name]: field.type.fields
                  .map(innerField => {
                    if (innerField.type.kind === `LIST`) {
                      return null
                    }
                    if (innerField.type.relationShipField) {
                      return {
                        [innerField.name]: [`id`],
                      }
                    }
                    if (innerField.type.fields) {
                      return {
                        [innerField.name]: innerField.type.fields.map(
                          innerField2 => innerField2.name
                        ),
                      }
                    }
                    return innerField.name
                  })
                  .filter(innerField => !!innerField),
              }
            }

            return field.name
          })
          .filter(field => !!field),
      },
    ])

    const queryString = queryField
      .toString()
      // add pagination variables.
      .replace(`$variables:true`, `first: $first, after: $after`)
    // can't figure out how to properly do this ^ in graphql-query-builder.
    // just replacing a placeholder for now.

    queries[listType.rootFieldName] = {
      typeInfo: {
        singleName: listType.fieldName,
        pluralName: listType.rootFieldName,
        nodesTypeName: listType.nodesTypeName,
      },
      queryString,
    }
  })

  return queries
}

module.exports = {
  getAvailableContentTypes,
  buildNodeQueriesFromIntrospection,
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
