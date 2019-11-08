import { parse } from "url"

import { getAvailableContentTypes } from "./generate-queries-from-introspection/index"

export const createGatsbyNodesFromWPGQLContentNodes = async (
  { wpgqlNodesByContentType },
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  // we use this to get all content types in order to make a union of all post types
  // it's helpful for templating so that the same template can be
  // used across multiple post types
  const contentTypes = (await getAvailableContentTypes({
    url: pluginOptions.url,
  }))
    // flatten to object to check against properties
    .reduce((accumulator, type) => {
      accumulator[type.singular] = true
      return accumulator
    }, {})

  const createdNodeIds = []

  for (const wpgqlNodesGroup of wpgqlNodesByContentType) {
    const wpgqlNodes = wpgqlNodesGroup.allNodesOfContentType
    for (const [index, node] of wpgqlNodes.entries()) {
      //
      // create a pathname for the node using the WP permalink
      if (node.link) {
        node.path = parse(node.link).pathname
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
        previousNode && previousNode.id !== node.id ? previousNode.id : null
      const nextNodeId =
        nextNode && nextNode.id !== node.id ? nextNode.id : null

      // create connections to adjacent nodes for pagination
      // @todo move pagination to create-pages.js
      node.pagination = {
        previous___NODE: previousNodeId,
        next___NODE: nextNodeId,
        pageNumber: index + 1,
        isFirst: index === indexOfFirstNode,
        isLast: index === indexOfLastNode,
      }

      // @todo also namespace the id's here
      const nodeId = node.id

      // @todo allow namespacing types with a plugin option. Default to `Wp`
      const nodeType = `Wp${node.type}`
      // // @todo allow namespacing types with a plugin option. Default to `Wp`
      // const nodeType = contentTypes[node.contentType]
      //   ? // if this is a post, page or CPT, we want to group it into
      //     // the WpContent node type to make sharing templates across post types easy
      //     `WpContent`
      //   : // otherwise we can namespace the existing type
      //     `Wp${node.type}`

      await actions.createNode({
        ...node,
        id: nodeId,
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          type: nodeType,
        },
      })

      createdNodeIds.push(nodeId)
    }
  }

  return createdNodeIds
}
