import { defineSourceEvent } from "./index"
import { createNodeId as namespacedCreateNodeId } from "../../utils/create-node-id"
interface ICreateNodeArgs {
  id: string
  type: string
  contentDigest: string
  fields: Record<string, unknown>
}

const createNode = defineSourceEvent({
  type: `CREATE_NODE`,
  handler: (args: ICreateNodeArgs) => {
    console.log(`createNode`, args)
  },
})
createNode.plugin = {
  id: `gatsby`,
  name: `gatsby`,
}

export function createNodeId(
  plugin: string,
  id: string
): ReturnType<typeof namespacedCreateNodeId> {
  return namespacedCreateNodeId(id, plugin)
}

export { createContentDigest } from "gatsby-core-utils"
export { createNode }
