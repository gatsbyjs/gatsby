export const categoryBeforeChangeNode = async ({
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
    // no need to update children if we're not updating an existing category
    // if we're creating a new category it will be empty initially.
    // so we run this function when updating nodes or when initially
    // creating all nodes
    return null
  }

  if (!remoteNode?.wpChildren?.nodes?.length) {
    // if we don't have any child category items to fetch, skip out
    return null
  }

  const {
    selectionSet,
  } = wpStore.getState().remoteSchema.nodeQueries.categories

  const query = `
        fragment CATEGORY_FIELDS on Category {
          ${selectionSet}
        }

        query {
            ${remoteNode.wpChildren.nodes
              .map(
                ({ id }, index) =>
                  `id__${index}: category(id: "${id}") { ...CATEGORY_FIELDS }`
              )
              .join(` `)}
          }`

  const { data } = await fetchGraphql({
    query,
  })

  const remoteChildCategoryNodes = Object.values(data)

  const additionalNodeIds = remoteChildCategoryNodes.map(({ id } = {}) => id)

  await Promise.all(
    remoteChildCategoryNodes.map(async remoteCategoryNode => {
      if (remoteCategoryNode?.wpChildren?.nodes?.length) {
        // recursively fetch child category items
        const {
          additionalNodeIds: childNodeIds,
        } = await categoryBeforeChangeNode({
          remoteNode: remoteCategoryNode,
          actionType: `CREATE`,
          wpStore,
          fetchGraphql,
          helpers,
          actions,
          buildTypeName,
        })

        childNodeIds.forEach(id => additionalNodeIds.push(id))
      }

      const type = buildTypeName(`Category`)

      await actions.createNode({
        ...remoteCategoryNode,
        nodeType: `Category`,
        type: `Category`,
        parent: null,
        internal: {
          contentDigest: helpers.createContentDigest(remoteCategoryNode),
          type,
        },
      })
    })
  )

  return { additionalNodeIds }
}
