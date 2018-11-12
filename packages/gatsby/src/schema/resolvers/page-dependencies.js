const createPageDependency = require(`../../redux/actions/add-page-dependency`)

const withPageDependencies = resolve => type => async (rp, firstResultOnly) => {
  const result = await resolve(type)(rp, firstResultOnly)
  const { path } = rp.context
  if (!path || result == null) return result

  // FIXME: result._items
  const items = result.pageInfo ? result.items : result
  if (Array.isArray(items)) {
    const isConnection = rp.info.parentType === `Query`
    if (isConnection) {
      createPageDependency({ path, connection: type })
    } else {
      items.map(node => createPageDependency({ path, nodeId: node.id }))
    }
  } else {
    createPageDependency({ path, nodeId: items.id })
  }

  return result
}

module.exports = withPageDependencies
