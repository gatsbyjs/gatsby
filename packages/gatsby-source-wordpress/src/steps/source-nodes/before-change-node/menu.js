import { getGatsbyApi } from "~/utils/get-gatsby-api"

const deleteMenuNodeChildMenuItems = node => {
  const {
    pluginOptions,
    helpers: { getNodesByType, actions },
  } = getGatsbyApi()

  const allMenuItems = getNodesByType(
    `${pluginOptions.schema.typePrefix}MenuItem`
  )

  const allMenuItemsNodesWithThisMenuIdAsAParent = allMenuItems.filter(
    menuItemNode => menuItemNode.menu.node.id === node.id
  )

  for (const menuItemNode of allMenuItemsNodesWithThisMenuIdAsAParent) {
    actions.deleteNode(menuItemNode)
  }
}

export const menuBeforeChangeNode = async api => {
  if (api.remoteNode && api.actionType === `DELETE`) {
    // delete child menu items
    return deleteMenuNodeChildMenuItems(api.remoteNode)
  }

  return null
}
