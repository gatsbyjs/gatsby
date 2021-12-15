/**
 * @todo this file isn't used anywhere
 */
import { defineSourceEvent } from "./define-event"
import { createNodeId as namespacedCreateNodeId } from "../../utils/create-node-id"
interface ICreateNodeArgs {
  id: string
  type: string
  contentDigest: string
  fields: Record<string, unknown>
}

const createNode = defineSourceEvent({
  type: `CREATE_NODE`,
  description: `Creates a Gatsby node.`,
  handler: (args: ICreateNodeArgs) => {
    console.log(`createNode`, args)
  },
})

export function createNodeId(
  plugin: string,
  id: string
): ReturnType<typeof namespacedCreateNodeId> {
  return namespacedCreateNodeId(id, plugin)
}

export { createNode }
