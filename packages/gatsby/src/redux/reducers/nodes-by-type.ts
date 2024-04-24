import type { IGatsbyNode, IGatsbyState, ActionsUnion } from "../types";

const errorMessage =
  "An error occurred finding a node by it's type. This is likely a bug in gatsby. If you experience this error please open an issue.";

function getNodesOfType(
  node: IGatsbyNode,
  state: IGatsbyState["nodesByType"],
): Map<string, IGatsbyNode> {
  const { type } = node.internal;
  if (!type) {
    throw new Error(errorMessage);
  }

  if (!state.has(type)) {
    state.set(type, new Map());
  }
  const nodeByType = state.get(type);

  if (!nodeByType) {
    throw new Error(errorMessage);
  }

  return nodeByType;
}

export function nodesByTypeReducer(
  state: IGatsbyState["nodesByType"] | undefined = new Map(),
  action: ActionsUnion,
): IGatsbyState["nodesByType"] {
  switch (action.type) {
    case "DELETE_CACHE":
      return new Map();

    case "CREATE_NODE": {
      const node = action.payload;
      const nodesOfType = getNodesOfType(node, state);
      nodesOfType.set(node.id, node);
      return state;
    }

    case "ADD_FIELD_TO_NODE":
    case "ADD_CHILD_NODE_TO_PARENT_NODE": {
      const node = action.payload;
      const nodesOfType = getNodesOfType(node, state);
      nodesOfType.set(node.id, node);
      return state;
    }

    case "DELETE_NODE": {
      const node = action.payload;
      if (!node) return state;
      const nodesOfType = getNodesOfType(node, state);
      nodesOfType.delete(node.id);
      if (!nodesOfType.size && node.internal.type) {
        state.delete(node.internal.type);
      }
      return state;
    }

    default:
      return state;
  }
}
