const url = require(`url`)
const { dd } = require(`dumper.js`)
const createGatsbyNodesFromWPGQLContentNodes = async (
  { wpgqlNodesByContentType },
  { actions, createNodeId, createContentDigest }
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
          type: `Wp${node.type}`,
        },
      })

      await actions.createNode({
        content___NODE: nodeId,
        id: createNodeId(`wp-content-${node.id}`),
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

module.exports = { createGatsbyNodesFromWPGQLContentNodes }
