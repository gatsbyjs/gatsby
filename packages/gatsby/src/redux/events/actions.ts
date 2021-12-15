import { defineSourceEvent } from "./index"
import { createNodeId as namespacedCreateNodeId } from "../../utils/create-node-id"
import { store } from "../../redux/index"
import { actions } from "../../redux/actions"

export interface ICreateNodeArgs {
  id: string
  type: string
  contentDigest: string
  fields: Record<string, unknown>
}

const createNode = defineSourceEvent({
  type: `CREATE_NODE`,
  description: `Create a node`,
  handler: async ({
    plugin,
    id,
    fields,
    type,
    contentDigest,
  }: ICreateNodeArgs & { plugin: { id: string; name: string } }) => {
    await actions.createNode(
      {
        id,
        ...fields,
        internal: {
          type,
          contentDigest,
        },
      },
      plugin
    )(store.dispatch)
  },
})
createNode.plugin = {
  id: `gatsby`,
  name: `gatsby`,
  pluginOptions: { plugins: [] },
}

export function createNodeId(
  plugin: string,
  id: string
): ReturnType<typeof namespacedCreateNodeId> {
  return namespacedCreateNodeId(id, plugin)
}

export { createContentDigest } from "gatsby-core-utils"
export { createNode }
