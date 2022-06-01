import Batcher from "../../utils/batcher"
import { store } from "../"
const { getNode } = require(`../../datastore`)

const isTestEnv = process.env.NODE_ENV === `test`
const batchCount = isTestEnv ? 1 : 1000
export const createParentChildLinkBatcher = new Batcher(batchCount)

createParentChildLinkBatcher.bulkCall(createCalls => {
  const nodesMap = new Map()
  // Add children to parent node(s) and dispatch.
  createCalls.forEach(call => {
    const { parent, child } = call[0]

    let parentNode
    if (nodesMap.has(parent)) {
      parentNode = nodesMap.get(parent)
    } else {
      parentNode = getNode(parent)
      nodesMap.set(parent, parentNode)
    }

    if (!parentNode.children.includes(child.id)) {
      parentNode.children.push(child.id)
    }
  })

  nodesMap.forEach(parentNode => {
    store.dispatch({
      type: `ADD_CHILD_NODE_TO_PARENT_NODE`,
      payload: parentNode,
    })
  })
})
