import { CreateNodeArgs } from "gatsby"
import { extractModel } from "../path-utils"

export function onDeleteNode({
  node,
  store,
  actions,
  reporter,
}: CreateNodeArgs): void {
  try {
    for (const [urlPath, pageNode] of store.getState().pages) {
      let pageNodeModel
      try {
        pageNodeModel = extractModel(pageNode.component)
      } catch (e) {
        continue
      }

      if (
        pageNode.context.id === node.id &&
        pageNodeModel === node.internal.type
      ) {
        actions.deletePage({
          path: urlPath,
          component: pageNode.component,
        })
        return
      }
    }
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
  }
}
