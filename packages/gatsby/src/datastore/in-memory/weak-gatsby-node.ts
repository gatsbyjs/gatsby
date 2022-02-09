import { getNode } from "..";
import { IGatsbyNode } from "../../internal";
import { IGatsbyNodePartial } from "./indexing";

export class WeakGatsbyNode {
  private nodeId: string;
  private weakNode: WeakRef<IGatsbyNode | IGatsbyNodePartial>;

  constructor(node: IGatsbyNode | IGatsbyNodePartial) {
    this.nodeId = node.id;
    this.weakNode = new WeakRef<IGatsbyNode | IGatsbyNodePartial>(node)
    return new Proxy(this, {get: (_, key) => this.getNodeProperty(key as string)})
  }

  private getNodeProperty(key: string) {
    let derefNode = this.weakNode.deref()

    // first, check if the node is still in memory
    if (derefNode) {
      if (key in derefNode) {
        // if we have the key already return it
        return derefNode[key]
      } else if (derefNode.isGatsbyNodePartial) {
        // if we don't have the key and the current ref is a partial, get the full node
        derefNode = getNode(this.nodeId)!
        this.weakNode = new WeakRef<IGatsbyNode | IGatsbyNodePartial>(derefNode)
      }
    } else {
      // if we aren't in memory, just outright fetch the node
      derefNode = getNode(this.nodeId)!
      this.weakNode = new WeakRef<IGatsbyNode | IGatsbyNodePartial>(derefNode)
    }

    return derefNode[key]
  }
}
