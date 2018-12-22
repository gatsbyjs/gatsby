const createPageDependency = require(`../../redux/actions/add-page-dependency`)
const { isDefined } = require(`../utils`)

const withPageDependencies = resolve => type => async (rp, firstResultOnly) => {
  const result = await resolve(type)(rp, firstResultOnly)
  const { path } = rp.context || {}
  if (!path || result == null) return result

  // FIXME: result._items
  const items = result.pageInfo ? result.items : result
  if (Array.isArray(items)) {
    const isConnection =
      rp.info.parentType && rp.info.parentType.name === `Query`
    if (isConnection) {
      createPageDependency({ path, connection: type })
    } else {
      items
        .filter(isDefined)
        .map(node => createPageDependency({ path, nodeId: node.id }))
    }
  } else {
    createPageDependency({ path, nodeId: items.id })
  }

  return result
}

module.exports = withPageDependencies
