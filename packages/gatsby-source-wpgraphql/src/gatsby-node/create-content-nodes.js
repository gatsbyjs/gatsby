const fetch = require(`isomorphic-fetch`)
const url = require(`url`)

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

const getPagesQuery = contentTypePlural => `
  # Define our query variables
  query GET_GATSBY_PAGES($first:Int $after:String) {
    ${contentTypePlural}(
        first: $first
        after: $after
      ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ${pageFields}
          }
      }
  }
`

const getPageQuery = singleName => `
  query GET_GATSBY_PAGE($id: ID!) {
    wpContent: ${singleName}(id: $id) {
      ${pageFields}
    }
  }
`

const fetchContentTypeNodes = async ({
  contentTypePlural,
  contentTypeSingular,
  url,
  allContentNodes = [],
  ...variables
}) => {
  const query = getPagesQuery(contentTypePlural)
  const response = await fetchGraphql({ url, query, variables })
  const { data } = response

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
    return fetchContentTypeNodes({
      first: 10,
      after: endCursor,
      url,
      contentTypePlural,
      contentTypeSingular,
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

  if (data.status && data.status !== 200) {
    throw new Error(`???`)
  }

  const contentTypes = data.postTypes.map(postTypeObj => {
    return {
      plural: postTypeObj.fieldNames.plural.toLowerCase(),
      singular: postTypeObj.fieldNames.singular.toLowerCase(),
    }
  })

  return contentTypes
}

const fetchWPGQLContentNodes = async ({ url }) => {
  const contentTypes = await getAvailableContentTypes({ url })

  if (!contentTypes) {
    return false
  }

  const contentNodeGroups = []

  await Promise.all(
    contentTypes.map(async ({ plural, singular }) => {
      const allNodesOfContentType = await fetchContentTypeNodes({
        first: 10,
        after: null,
        contentTypePlural: plural,
        contentTypeSingular: singular,
        url,
      })

      contentNodeGroups.push({
        singular,
        plural,
        allNodesOfContentType,
      })
    })
  )

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
      node.path = url.parse(node.link).pathname

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

const getActionMonitorActions = async (__, { url }, variables) => {
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
    const actionExists = actionabledIds.find(
      actionableId => actionableId === id
    )
    if (!actionExists) {
      actionabledIds.push(id)
    }
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
  await actions.touchNode({ nodeId })
  await actions.deleteNode({ node })

  // then recreate the node with the updated data
  const { createContentDigest } = helpers
  await actions.createNode({
    ...node,
    ...data.page,
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

  const CREATED_NODE_ID_CACHE_KEY = `WPGQL-created-node-ids`
  const LAST_COMPLETED_SOURCE_TIME = `WPGQL-last-completed-source-time`

  let cachedNodeIds = await cache.get(CREATED_NODE_ID_CACHE_KEY)
  // const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  if (cachedNodeIds) {
    // check for new, edited, or deleted nodes
    const wpActions = await getActionMonitorActions(helpers, pluginOptions, {
      since: 0,
      // since: lastCompletedSourceTime,
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

    console.log(`touching cached node ID's`)
    // touch nodes that haven't been deleted
    cachedNodeIds.forEach(nodeId => actions.touchNode({ nodeId }))

    // update cachedNodeIds
    await cache.set(CREATED_NODE_ID_CACHE_KEY, cachedNodeIds)
  }

  if (!cachedNodeIds) {
    console.log(`fetching nodes from WPGQL`)
    const wpgqlNodesByContentType = await fetchWPGQLContentNodes(pluginOptions)

    if (!wpgqlNodesByContentType) {
      throw new Error(
        `Couldn't connect to your WordPress site. Make sure your URL is correct and WP-GraphQL and WP-Gatsby are active.`
      )
    }

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
