import PQueue from "p-queue"

const menuItemFetchQueue = new PQueue({
  concurrency: Number(process.env.GATSBY_CONCURRENT_DOWNLOAD ?? 200),
  carryoverConcurrencyCount: true,
})

const fetchChildMenuItems = api => async () => {
  const {
    remoteNode,
    wpStore,
    fetchGraphql,
    helpers,
    actions,
    buildTypeName,
    additionalNodeIds,
  } = api

  if (
    !remoteNode?.menuItems?.nodes?.length &&
    !remoteNode?.childItems?.nodes?.length
  ) {
    // if we don't have any child menu items to fetch, skip out
    return
  }

  const selectionSet = wpStore.getState().remoteSchema.nodeQueries.menuItems
    .selectionSet

  const query = /* GraphQL */ `
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

  remoteChildMenuItemNodes.forEach(
    ({ id } = {}) => id && additionalNodeIds.push(id)
  )

  await Promise.all(
    remoteChildMenuItemNodes.map(async remoteMenuItemNode => {
      // recursively fetch child menu items
      menuItemFetchQueue.add(
        fetchChildMenuItems({
          ...api,
          remoteNode: remoteMenuItemNode,
        })
      )

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
}

export const menuBeforeChangeNode = async api => {
  if (
    api.actionType !== `UPDATE` &&
    api.actionType !== `CREATE_ALL` &&
    api.actionType !== `CREATE`
  ) {
    // no need to update child MenuItems if we're not updating an existing menu
    // if we're creating a new menu it will be empty initially.
    // so we run this function when updating nodes or when initially
    // creating all nodes
    return null
  }

  let additionalNodeIds = []

  menuItemFetchQueue.add(fetchChildMenuItems({ ...api, additionalNodeIds }))

  await menuItemFetchQueue.onIdle()

  return { additionalNodeIds }
}
