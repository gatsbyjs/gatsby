// Array of all existing Contentful nodes. Make it global and incrementally update it because it's hella slow to recreate this on every data update for large sites.
const existingNodes = new Map()

// store only the fields we need to compare to reduce memory usage. if a node is updated we'll use getNode to grab the whole node before updating it
function addNodeToExistingNodesCache(node) {
  const cacheNode = {
    id: node.id,
    contentful_id: node.contentful_id,
    sys: {
      type: node.sys.type,
    },
    node_locale: node.node_locale,
    children: node.children,
    internal: {
      owner: node.internal.owner,
    },
    __memcache: true,
  }

  for (const key of Object.keys(node)) {
    if (key.endsWith(`___NODE`)) {
      cacheNode[key] = node[key]
    }
  }

  existingNodes.set(node.id, cacheNode)
}

function removeNodeFromExistingNodesCache(node) {
  existingNodes.delete(node.id)
}
