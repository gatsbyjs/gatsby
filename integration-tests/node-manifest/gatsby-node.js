const commandName = process.env.NODE_ENV === `development` ? `develop` : `build`
const DEFAULT_MAX_DAYS_OLD = 30
const createManifestId = nodeId => `${commandName}-${nodeId}`

const DUMMY_NODE_MANIFEST_COUNT = process.env.DUMMY_NODE_MANIFEST_COUNT || 0
const ONE_DAY = 1000 * 60 * 60 * 24
const THIRTY_DAYS = ONE_DAY * 30
const YESTERDAY = new Date() - ONE_DAY
const LOWER_CREATED_AT_TIME_LIMIT = YESTERDAY - THIRTY_DAYS
const UPPER_CREATED_AT_TIME_LIMIT = YESTERDAY

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

exports.sourceNodes = ({ actions }) => {
  // template nodes
  for (let id = 1; id < 6; id++) {
    const node = {
      id: `${id}`,
      internal: {
        type: `TestNode`,
        contentDigest: `${id}`,
      },
    }

    if (id === 5) {
      node.slug = `test-slug`
    }

    actions.createNode(node)

    actions.unstable_createNodeManifest({
      manifestId: createManifestId(id),
      node,
    })
  }

  // These nodes are intended to be added when running tests for the node manifest creation limit logic
  for (let i = 0; i < DUMMY_NODE_MANIFEST_COUNT; i++) {
    const id = `dummy-${i}`
    const node = {
      id,
      internal: {
        type: `TestNode`,
        contentDigest: id,
      },
    }

    const updatedAtUTC = new Date(
      randomIntFromInterval(
        LOWER_CREATED_AT_TIME_LIMIT,
        UPPER_CREATED_AT_TIME_LIMIT
      )
    ).toUTCString()

    actions.createNode(node)

    actions.unstable_createNodeManifest({
      manifestId: createManifestId(id),
      node,
      updatedAtUTC,
    })
  }

  // filesystem route api node
  const node = {
    id: `filesystem-1`,
    internal: {
      type: `TestFSRouteType`,
      contentDigest: `1`,
    },
  }

  actions.createNode(node)
  actions.unstable_createNodeManifest({
    manifestId: createManifestId(node.id),
    node,
  })
  const today = new Date()
  const nodeTooOldToGetManifestCreated = new Date(
    new Date().setDate(today.getDate() - (DEFAULT_MAX_DAYS_OLD + 1))
  ).toISOString()

  const nodeUpdated1 = {
    id: `updatedAt-1`,
    internal: {
      type: `TestUpdatedAtType`,
      contentDigest: `1`,
    },
    updatedAt: today.toISOString(),
  }

  const nodeUpdated2 = {
    id: `updatedAt-2`,
    internal: {
      type: `TestUpdatedAtType`,
      contentDigest: `1`,
    },
    updatedAt: nodeTooOldToGetManifestCreated,
  }

  actions.createNode(nodeUpdated1)
  actions.createNode(nodeUpdated2)
  actions.unstable_createNodeManifest({
    manifestId: createManifestId(nodeUpdated1.id),
    node: nodeUpdated1,
    updatedAtUTC: nodeUpdated1.updatedAt,
  })

  actions.unstable_createNodeManifest({
    manifestId: createManifestId(nodeUpdated2.id),
    node: nodeUpdated2,
    updatedAtUTC: nodeUpdated2.updatedAt,
  })

  const nodeForConnectionListQuery1 = {
    id: `connection-list-query-node`,
    title: `First connection list query node`,
    internal: {
      type: `TestConnectionListQueryType`,
      contentDigest: `1`,
    },
  }
  const nodeForConnectionListQuery2 = {
    id: `connection-list-query-node-2`,
    title: `Second connection list query node`,
    internal: {
      type: `TestConnectionListQueryType`,
      contentDigest: `2`,
    },
  }

  actions.createNode(nodeForConnectionListQuery1)
  actions.unstable_createNodeManifest({
    manifestId: createManifestId(nodeForConnectionListQuery1.id),
    node: nodeForConnectionListQuery1,
  })

  actions.createNode(nodeForConnectionListQuery2)
  actions.unstable_createNodeManifest({
    manifestId: createManifestId(nodeForConnectionListQuery2.id),
    node: nodeForConnectionListQuery2,
  })

  const nodeForStaticQueryList1 = {
    id: `static-query-list-query-node`,
    title: `First static query list query node`,
    internal: {
      type: `TestConnectionStaticQueryListQueryType`,
      contentDigest: `1`,
    },
  }
  const nodeForStaticQueryList2 = {
    id: `static-query-list-query-node-2`,
    title: `Second static query list query node`,
    internal: {
      type: `TestConnectionStaticQueryListQueryType`,
      contentDigest: `2`,
    },
  }

  actions.createNode(nodeForStaticQueryList1)
  actions.unstable_createNodeManifest({
    manifestId: createManifestId(nodeForStaticQueryList1.id),
    node: nodeForStaticQueryList1,
  })

  actions.createNode(nodeForStaticQueryList2)
  actions.unstable_createNodeManifest({
    manifestId: createManifestId(nodeForStaticQueryList2.id),
    node: nodeForStaticQueryList2,
  })
}

/**
 * The main way node manifests are mapped to pages is via the ownerNodeId argument to createPage.
 * If it doesn't exist we either grab the first page with `id` in pageContext that matches to our nodeManifest's node id, or if that doesn't exist, the first page query where our nodeManifest's node id is queried. Node 2 and 3 are used to test this behaviour (in that order).
 *
 * Note that there's no page created for our node with an id of `4`. The Node Manifest API should account for the situation where the user didn't create a page for a node that a manifest was created for by a source plugin.
 */
exports.createPages = ({ actions }) => {
  actions.createPage({
    path: `one`,
    ownerNodeId: `1`,
    component: require.resolve(`./src/templates/one.js`),
  })

  actions.createPage({
    path: `two`,
    component: require.resolve(`./src/templates/two.js`),
    context: {
      id: `2`,
    },
  })

  actions.createPage({
    path: `two-alternative`,
    component: require.resolve(`./src/templates/two.js`),
  })

  actions.createPage({
    path: `three`,
    component: require.resolve(`./src/templates/three.js`),
  })

  actions.createPage({
    path: `three-alternative`,
    component: require.resolve(`./src/templates/three.js`),
  })

  actions.createPage({
    path: `slug-test-path`,
    context: {
      slug: `test-slug`,
    },
    component: require.resolve(`./src/templates/four.js`),
  })
}
