import { getContentTypeQueryInfos } from "./fetch-nodes"
import { findReferencedNodeIdsByTypeName } from "../create-nodes/process-node"

const findReferencedFutureGatsbyNodeIds = ({
  node,
  nodeString,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
  nodeString: string
}): { [type: string]: Array<string> } => {
  const referencedNodeIdsByType = {}

  // for each future gatsby node type
  const nodeQueryInfos = getContentTypeQueryInfos()

  for (const nodeQueryInfo of nodeQueryInfos) {
    // getTypeSettingsByType and check for typename.fetchNodesWhenReferenced
    // if nodes of this type should be fetched as references

    // run findReferencedNodeIdsByTypeName to find referenced id's of that node type
    const { nodesTypeName } = nodeQueryInfo
    const referencedNodeIdsOfType = findReferencedNodeIdsByTypeName({
      typeName: nodesTypeName,
      nodeString,
      node,
    })

    // and store them to be fetched later
    if (!referencedNodeIdsByType[nodesTypeName]) {
      referencedNodeIdsByType[nodesTypeName] = []
    }

    referencedNodeIdsByType[nodesTypeName] = [
      ...referencedNodeIdsByType[nodesTypeName],
      ...referencedNodeIdsOfType,
    ]
  }

  return referencedNodeIdsByType
}

export const fetchReferencedNodesOnNode = ({
  node,
  nodeString,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
  nodeString: string
}): void => {
  const nodeIdsByType = findReferencedFutureGatsbyNodeIds({ node, nodeString })
}
