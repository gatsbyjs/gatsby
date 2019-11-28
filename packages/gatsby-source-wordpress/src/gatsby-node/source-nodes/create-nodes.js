import { parse } from "url"

export const createGatsbyNodesFromWPGQLContentNodes = async (
  { wpgqlNodesByContentType },
  { actions, createContentDigest }
) => {
  const createdNodeIds = []

  for (const wpgqlNodesGroup of wpgqlNodesByContentType) {
    const wpgqlNodes = wpgqlNodesGroup.allNodesOfContentType
    for (const node of wpgqlNodes.values()) {
      if (node.link) {
        // create a pathname for the node using the WP permalink
        node.path = parse(node.link).pathname
      }

      await actions.createNode({
        ...node,
        id: node.id,
        parent: null,
        internal: {
          contentDigest: createContentDigest(node),
          // @todo allow namespacing types with a plugin option. Default to `Wp`
          type: `Wp${node.type}`,
        },
      })

      createdNodeIds.push(node.id)
    }
  }

  return createdNodeIds
}
