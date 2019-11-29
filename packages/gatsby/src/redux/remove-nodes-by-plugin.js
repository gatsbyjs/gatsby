/*
 * Traverse downwards through children
 * to get all dirty nodes of a plugin
 */
const getDirtyNodes = (plugins, state) => {
  const dirty = new Map()
  for (const [id, node] of state) {
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
module.exports = (plugin, nodes) => {
  const plugins = [].concat(plugin).filter(Boolean)
  const newState = new Map()

  if (plugins.length === 0) {
    return new Map()
  }

  const dirty = getDirtyNodes(plugins, nodes)

  for (const [id, node] of nodes) {
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
