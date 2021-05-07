exports.sourceNodes = ({ actions }) => {
  const ids = [1, 2, 3, 4]

  for (const id of ids) {
    const node = {
      id: `${id}`,
      internal: {
        type: `TestNode`,
        contentDigest: `${id}`,
      },
    }

    actions.createNode(node)

    const commandName =
      process.env.NODE_ENV === `development` ? `develop` : `build`

    actions.unstable_createNodeManifest({
      manifestId: `${commandName}-${id}`,
      node,
    })
  }
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
}
