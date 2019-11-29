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

/*
 * Traverse downwards through children
 * to get all dirty nodes of a plugin
 */
const getDirtyNodes = (plugins, state) => {
  let dirty = new Map()
  for (let [id, node] of state) {
    if (node && node.internal && plugins.includes(node.internal.owner)) {
      dirty.set(id, true)
      let children = (node.children || []).slice(0)
      while (children.length > 0) {
        const id = children.shift()
        dirty.set(id, true)

        const child = state.get(id)

        children = children.concat(child.children || [])
      }

      const parent = state.get(node.parent)
      if (parent && parent.children && parent.children.length > 0) {
        parent.children = parent.children.filter(childId => childId !== id)
        state.set(parent.id, parent)
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
module.exports = (plugin, state) => {
  const plugins = [].concat(plugin).filter(Boolean)
  let newState = new Map()

  if (plugins.length === 0) {
    return new Map()
  }

  const nodes = getLookup(state)
  const dirty = getDirtyNodes(plugins, nodes)

  for (let [id, node] of nodes) {
    if (!dirty.has(id)) {
      if (node.internal.fieldOwners) {
        // if node itself is not dirty, it can contain dirty node fields
        Object.entries(node.internal.fieldOwners).forEach(
          ([fieldName, owner]) => {
            if (plugins.includes(owner)) {
              // field owner is dirty, we should remove this field
              delete node.fields[fieldName]
              delete node.internal.fieldOwners[fieldName]
            }
          }
        )
      }

      newState.set(id, node)
    }
  }
  return newState
}
