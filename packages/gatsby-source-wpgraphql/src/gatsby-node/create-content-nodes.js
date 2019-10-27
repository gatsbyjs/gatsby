const fetch = require(`isomorphic-fetch`)
const url = require(`url`)
const { dd } = require(`dumper.js`)
const Query = require(`graphql-query-builder`)

const fetchGraphql = async ({ url, query, variables = {} }) =>
  (await fetch(url, {
    method: `POST`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({ query, variables }),
  })).json()

const pageFields = `
  content
  title
  link
  date
  id
`

// const getPagesQuery = contentTypePlural => `
//   # Define our query variables
//   query GET_GATSBY_PAGES($first:Int $after:String) {
//     ${contentTypePlural}(
//         first: $first
//         after: $after
//       ) {
//           pageInfo {
//             hasNextPage
//             endCursor
//           }
//           nodes {
//             ${pageFields}
//           }
//       }
//   }
// `

const getPageQuery = singleName => `
  query GET_GATSBY_PAGE($id: ID!) {
    wpContent: ${singleName}(id: $id) {
      ${pageFields}
    }
  }
`

const getPaginatedQuery = query =>
  `query GENERIC_QUERY ($first: Int!, $after: String) {${query}}`

// const getContentTypeIntrospection = singleName => ``

const fetchContentTypeNodes = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
  query,
  allContentNodes = [],
  ...variables
}) => {
  // const query = getPagesQuery(contentTypePlural)

  if (contentTypePlural === `mediaItems`) {
    return allContentNodes
  }

  const paginatedQuery = getPaginatedQuery(query)

  const response = await fetchGraphql({
    url,
    query: paginatedQuery,
    variables,
  })

  // console.log(`​response`, response)

  const { data } = response

  // console.log(contentTypePlural)
  if (!data[contentTypePlural] || !data[contentTypePlural].nodes) {
    return allContentNodes
  }

  const {
    [contentTypePlural]: {
      nodes,
      pageInfo: { hasNextPage, endCursor },
    },
  } = data

  if (nodes) {
    nodes.forEach(node => {
      node.contentType = contentTypeSingular
      node.wpId = node.id
      allContentNodes.push(node)
    })
  }

  if (hasNextPage) {
    await fetchContentTypeNodes({
      first: 100,
      after: endCursor,
      url,
      contentTypePlural,
      contentTypeSingular,
      query,
      allContentNodes,
    })
  }

  return allContentNodes
}

const getAvailableContentTypes = async ({ url }) => {
  const query = `
  {
    postTypes {
      fieldNames {
        plural
        singular
      }
    }
  }
`
  const { data } = await fetchGraphql({ url, query })

  const contentTypes = data.postTypes.map(postTypeObj => {
    return {
      plural: postTypeObj.fieldNames.plural.toLowerCase(),
      singular: postTypeObj.fieldNames.singular.toLowerCase(),
    }
  })

  return contentTypes
}

const fetchWPGQLContentNodes = async ({ url }, queryStrings) => {
  const contentTypes = await getAvailableContentTypes({ url })

  if (!contentTypes) {
    return false
  }

  const contentNodeGroups = []

  for (const [fieldName, query] of Object.entries(queryStrings)) {
    const allNodesOfContentType = await fetchContentTypeNodes({
      first: 100,
      after: null,
      contentTypePlural: fieldName,
      contentTypeSingular: fieldName,
      url,
      query,
    })

    if (allNodesOfContentType && allNodesOfContentType.length) {
      contentNodeGroups.push({
        singular: fieldName,
        plural: fieldName,
        allNodesOfContentType,
      })
    }
  }

  // this fetches multiple endpoints at once
  // await Promise.all(
  //   Object.entries(queryStrings).map(
  //     ([fieldName, query]) =>
  //       new Promise(async resolve => {
  //         const allNodesOfContentType = await fetchContentTypeNodes({
  //           first: 10,
  //           after: null,
  //           contentTypePlural: fieldName,
  //           contentTypeSingular: fieldName,
  //           url,
  //           query,
  //         })

  //         if (allNodesOfContentType && allNodesOfContentType.length) {
  //           contentNodeGroups.push({
  //             singular: fieldName,
  //             plural: fieldName,
  //             allNodesOfContentType,
  //           })
  //         }

  //         return resolve()
  //       })
  //   )
  // )

  // this just get's post types
  // await Promise.all(
  //   contentTypes.map(async ({ plural, singular }) => {
  //     const allNodesOfContentType = await fetchContentTypeNodes({
  //       first: 10,
  //       after: null,
  //       contentTypePlural: plural,
  //       contentTypeSingular: singular,
  //       url,
  //     })

  //     contentNodeGroups.push({
  //       singular,
  //       plural,
  //       allNodesOfContentType,
  //     })
  //   })
  // )

  return contentNodeGroups
}

const createGatsbyNodesFromWPGQLContentNodes = async (
  { actions, createNodeId, createContentDigest },
  { wpgqlNodesByContentType }
) => {
  const createdNodeIds = []

  for (const wpgqlNodesGroup of wpgqlNodesByContentType) {
    const wpgqlNodes = wpgqlNodesGroup.allNodesOfContentType
    for (const [index, node] of wpgqlNodes.entries()) {
      //
      // create a pathname for the node using the WP permalink
      if (node.link) {
        node.path = url.parse(node.link).pathname
      }

      const indexOfLastNode = wpgqlNodes.length - 1
      const indexOfFirstNode = 0

      const previousNodeIndex =
        // if this is the first node
        index === indexOfFirstNode
          ? // use the last node of this post type as the previous
            indexOfLastNode
          : // otherwise use the previous node
            index - 1
      const previousNode = wpgqlNodes[previousNodeIndex]

      const nextNodeIndex =
        // if this is the last node in the content type
        index === indexOfLastNode
          ? // use the first node in the same post type as the next
            indexOfFirstNode
          : // otherwise use the next
            index + 1
      const nextNode = wpgqlNodes[nextNodeIndex]

      // create Gatsby ID's from WPGQL ID's
      const previousNodeId =
        previousNode && previousNode.id !== node.id
          ? createNodeId(previousNode.id)
          : null
      const nextNodeId =
        nextNode && nextNode.id !== node.id ? createNodeId(nextNode.id) : null

      // create connections to adjacent nodes for pagination
      // @todo move pagination to create-pages.js
      node.pagination = {
        previous___NODE: previousNodeId,
        next___NODE: nextNodeId,
        pageNumber: index + 1,
        isFirst: index === indexOfFirstNode,
        isLast: index === indexOfLastNode,
      }

      const nodeId = createNodeId(node.id)

      await actions.createNode({
        ...node,
        id: nodeId,
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          type: `WpContent`,
        },
      })

      createdNodeIds.push(nodeId)
    }
  }

  return createdNodeIds
}

const getWpActions = async (__, { url }, variables) => {
  const query = `
    query GET_ACTION_MONITOR_ACTIONS($since: Float!) {
      actionMonitorActions(where: {sinceTimestamp: $since}) {
        nodes {
          referencedPostID
          referencedPostStatus
          referencedPostGlobalRelayID
          referencedPostSingleName
          referencedPostPluralName
          actionType
        }
      }
    }
  `

  const { data } = await fetchGraphql({ url, query, variables })

  // we only want to use the latest action on each post ID in case multiple
  // actions were recorded for the same post
  // for example: if a post was deleted and then immediately published again.
  // if we kept both actions we would download the node and then delete it
  // Since we receive the actions in order from newest to oldest, we
  // can prefer actions at the top of the list.
  const actionabledIds = []
  const actions = data.actionMonitorActions.nodes.filter(action => {
    const id = action.referencedPostGlobalRelayID

    // check if an action with the same id exists
    const actionExists = actionabledIds.find(
      actionableId => actionableId === id
    )

    // if there isn't one, record the id of this one to filter
    // out further actions with the same id
    if (!actionExists) {
      actionabledIds.push(id)
    }

    // just keep the action if one doesn't already exist
    return !actionExists
  })

  return actions
}

const wpActionDELETE = async ({ helpers, cachedNodeIds, wpAction }) => {
  const { createNodeId } = helpers

  // get the node ID from the WPGQL id
  const nodeId = createNodeId(wpAction.referencedPostGlobalRelayID)

  // Remove this from cached node id's so we don't try to touch it
  // we don't need to explicitly delete the node since it will
  // be deleted if we don't touch it
  return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
}

const wpActionUPDATE = async ({
  helpers,
  wpAction,
  cachedNodeIds,
  pluginOptions,
}) => {
  const { createNodeId } = helpers
  const nodeId = createNodeId(wpAction.referencedPostGlobalRelayID)

  if (wpAction.referencedPostStatus !== `publish`) {
    // if the post status isn't publish anymore, we need to remove the node
    // by removing it from cached nodes so it's garbage collected by Gatsby
    return cachedNodeIds.filter(cachedId => cachedId !== nodeId)
  }

  // otherwise we need to refetch the post
  const { url } = pluginOptions
  const query = getPageQuery(wpAction.referencedPostSingleName)
  const { data } = await fetchGraphql({
    url,
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

  // then delete the posts node
  const { actions, getNode } = helpers
  const node = await getNode(nodeId)
  // touch the node so we own it
  await actions.touchNode({ nodeId })
  // then we can delete it
  await actions.deleteNode({ node })

  // Now recreate the deleted node but with updated data
  const { createContentDigest } = helpers
  await actions.createNode({
    ...node,
    ...data.wpContent,
    id: nodeId,
    parent: null,
    internal: {
      contentDigest: createContentDigest(node),
      type: `WpContent`,
    },
  })

  // we can leave cachedNodeIds as-is since the ID of the edited
  // node will be the same
  return cachedNodeIds
}

const wpActionCREATE = async ({
  helpers,
  pluginOptions,
  cachedNodeIds,
  wpAction,
}) => {
  // if this post isn't published, we don't want it.
  if (wpAction.referencedPostStatus !== `publish`) {
    return cachedNodeIds
  }

  // fetch the new post
  const { url: wpUrl } = pluginOptions
  const query = getPageQuery(wpAction.referencedPostSingleName)
  const { data } = await fetchGraphql({
    url: wpUrl,
    query,
    variables: {
      id: wpAction.referencedPostGlobalRelayID,
    },
  })

  // create a node from it
  const { actions, createContentDigest, createNodeId } = helpers
  const nodeId = createNodeId(wpAction.referencedPostGlobalRelayID)

  const node = {
    ...data.wpContent,
    id: nodeId,
    contentType: wpAction.referencedPostSingleName,
    // @todo move pagination to create-pages.js using pageContext
    // we can't add anything here since we don't know what the next/prev nodes are.
    pagination: {
      previous___NODE: null,
      next___NODE: null,
      pageNumber: null,
      isFirst: null,
      isLast: null,
    },
    path: url.parse(data.wpContent.link).pathname,
  }

  await actions.createNode({
    ...node,
    parent: null,
    internal: {
      contentDigest: createContentDigest(node),
      type: `WpContent`,
    },
  })

  // add our node id to the list of cached node id's
  return [...cachedNodeIds, nodeId]
}

const handleWpActions = async helpers => {
  let cachedNodeIds
  switch (helpers.wpAction.actionType) {
    case `DELETE`:
      cachedNodeIds = await wpActionDELETE(helpers)
      break
    case `UPDATE`:
      cachedNodeIds = await wpActionUPDATE(helpers)
      break
    case `CREATE`:
      cachedNodeIds = await wpActionCREATE(helpers)
  }

  return cachedNodeIds
}

module.exports = async (helpers, pluginOptions) => {
  const { cache, actions } = helpers

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

  let queryStrings = {}

  nodeListTypeNames.forEach(typeName => {
    const listType = nodeListTypes[typeName]

    let queryField = new Query(listType.rootFieldName, {
      $variables: true,
    })

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

    queryStrings[listType.rootFieldName] = queryField
      .toString()
      .replace(`$variables:true`, `first: $first, after: $after`)
  })

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

  const response = await fetchGraphql({
    url: pluginOptions.url,
    query: `
      {
        isWpGatsby
      }
    `,
  })

  if (!response.data || !response.data.isWpGatsby) {
    console.error(
      `[gatsby-source-wpgraphql] - Couldn't connect to your WordPress site. Make sure your URL is correct and WP-GraphQL and WP-Gatsby are active.`
    )
    process.exit()
  }

  const CREATED_NODE_ID_CACHE_KEY = `WPGQL-created-node-ids`
  const LAST_COMPLETED_SOURCE_TIME = `WPGQL-last-completed-source-time`

  let cachedNodeIds = await cache.get(CREATED_NODE_ID_CACHE_KEY)
  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  if (cachedNodeIds && lastCompletedSourceTime) {
    // check for new, edited, or deleted posts in WP
    const wpActions = await getWpActions(helpers, pluginOptions, {
      since: lastCompletedSourceTime,
    })

    for (const wpAction of wpActions) {
      // Create, update, and delete nodes
      cachedNodeIds = await handleWpActions({
        helpers,
        pluginOptions,
        wpAction,
        cachedNodeIds,
      })
    }

    // touch nodes that haven't been deleted
    cachedNodeIds.forEach(nodeId => actions.touchNode({ nodeId }))

    // update cachedNodeIds
    await cache.set(CREATED_NODE_ID_CACHE_KEY, cachedNodeIds)
  }

  if (!cachedNodeIds) {
    const wpgqlNodesByContentType = await fetchWPGQLContentNodes(
      pluginOptions,
      queryStrings
    )

    const createdNodeIds = await createGatsbyNodesFromWPGQLContentNodes(
      helpers,
      {
        wpgqlNodesByContentType,
      }
    )

    // save the node id's so we can touch them on the next build
    // so that we don't have to refetch all nodes
    await cache.set(CREATED_NODE_ID_CACHE_KEY, createdNodeIds)
  }

  await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())
}
