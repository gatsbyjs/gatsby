const isIterable = obj =>
  obj !== null && typeof obj[Symbol.iterator] === `function`

const getLookup = state => {
  let lookup = new Map()
  for (let [typeOrId, nodeOrNodes] of state) {
    if (isIterable(nodeOrNodes)) {
      for (let [id, node] of nodeOrNodes) {
        lookup.set(id, node)
      }
    } else {
      lookup.set(typeOrId, nodeOrNodes)
    }
  }
  return lookup
}

const getDirtyNodes = (plugins, state) => {
  let dirty = new Map()
  for (let [id, node] of state) {
    if (node && node.internal && plugins.includes(node.internal.owner)) {
      dirty.set(id, true)
      let parent = state[node.parent]
      while (parent) {
        dirty.set(parent.id, true)
        parent = state[parent.parent]
      }
    }
  }
  return dirty
}

/*
 * This invalidates nodes (in one loop!) and their parent node(s)
 * that match a plugin name (e.g. node.internal.owner)
 * when a plugin version changes
 */
module.exports = (plugin, state, storeByType = true) => {
  const plugins = [].concat(plugin)
  let newState = new Map()

  const nodes = getLookup(state)
  const dirty = getDirtyNodes(plugins, state)

  for (let [id, node] of nodes) {
    if (!dirty.has(id)) {
      if (storeByType) {
        const nodes = newState.has(node.internal.type)
          ? newState.get(node.internal.type)
          : new Map()
        newState.set(node.internal.type, nodes.set(id, node))
      } else {
        newState.set(id, node)
      }
    }
  }
  return newState
}
