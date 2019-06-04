const isIterable = obj =>
  obj !== null && typeof obj[Symbol.iterator] === `function`

module.exports = (plugin, state) => {
  const plugins = [].concat(plugin)
  let newState = new Map()

  for (let [type, nodeOrNodes] of state) {
    if (isIterable(nodeOrNodes)) {
      const updates = new Map()
      for (let [id, node] of nodeOrNodes) {
        if (!plugins.includes(node.internal.owner)) {
          updates.set(id, node)
        }
      }

      newState.set(type, updates)
    } else {
      if (!plugins.includes(nodeOrNodes.internal.owner)) {
        newState.set(type, nodeOrNodes)
      }
    }
  }
  return newState
}
