export const menuBeforeChangeNode = async ({
  remoteNode,
  actionType,
  wpStore,
  fetchGraphql,
  helpers,
  actions,
  buildTypeName,
}) => {
  if (
    actionType !== `UPDATE` &&
    actionType !== `CREATE_ALL` &&
    actionType !== `CREATE`
  ) {
    // no need to update child MenuItems if we're not updating an existing menu
    // if we're creating a new menu it will be empty initially.
    // so we run this function when updating nodes or when initially
    // creating all nodes
    return null
  }

  if (
    (!remoteNode.menuItems ||
      !remoteNode.menuItems.nodes ||
      !remoteNode.menuItems.nodes.length) &&
    (!remoteNode.childItems ||
      !remoteNode.childItems.nodes ||
      !remoteNode.childItems.nodes.length)
  ) {
    // if we don't have any child menu items to fetch, skip out
    return null
  }

  const selectionSet = wpStore.getState().remoteSchema.nodeQueries.menuItems
    .selectionSet

  const query = `
        fragment MENU_ITEM_FIELDS on MenuItem {
          ${selectionSet}
        }

        query {
            ${(remoteNode.menuItems || remoteNode.childItems).nodes
              .map(
                ({ id }, index) =>
                  `id__${index}: menuItem(id: "${id}") { ...MENU_ITEM_FIELDS }`
              )
              .join(` `)}
          }`

  const { data } = await fetchGraphql({
    query,
  })

  const remoteChildMenuItemNodes = Object.values(data)

  const additionalNodeIds = remoteChildMenuItemNodes.map(({ id } = {}) => id)

  await Promise.all(
    remoteChildMenuItemNodes.map(async remoteMenuItemNode => {
      if (
        remoteMenuItemNode.childItems &&
        remoteMenuItemNode.childItems.nodes &&
        remoteMenuItemNode.childItems.nodes.length
      ) {
        // recursively fetch child menu items
        const childNodeIds = await menuBeforeChangeNode({
          remoteNode: remoteMenuItemNode,
          actionType: `CREATE`,
          wpStore,
          fetchGraphql,
          helpers,
          actions,
          buildTypeName,
        })

        childNodeIds.forEach(id => additionalNodeIds.push(id))
      }

      const type = buildTypeName(`MenuItem`)

      await actions.createNode({
        ...remoteMenuItemNode,
        nodeType: `MenuItem`,
        type: `MenuItem`,
        parent: null,
        internal: {
          contentDigest: helpers.createContentDigest(remoteMenuItemNode),
          type,
        },
      })
    })
  )

  return additionalNodeIds
}
