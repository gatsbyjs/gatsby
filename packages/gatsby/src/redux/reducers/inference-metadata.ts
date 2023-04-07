// Tracking structure of nodes to utilize this metadata for schema inference
// Type descriptors stay relevant at any point in time making incremental inference trivial
import { omit } from "lodash"
import {
  addNode,
  addNodes,
  deleteNode,
  ignore,
  disable,
} from "../../schema/infer/inference-metadata"
import { NodeInterfaceFields } from "../../schema/types/node-interface"
import { typesWithoutInference } from "../../schema/types/type-defs"

import { IGatsbyState, ActionsUnion } from "../types"

const ignoredFields: Set<string> = new Set(NodeInterfaceFields)

const initialTypeMetadata = (): { ignoredFields: Set<string> } => {
  return { ignoredFields }
}

const incrementalReducer = (
  state: IGatsbyState["inferenceMetadata"]["typeMap"] = {},
  action: ActionsUnion
): IGatsbyState["inferenceMetadata"]["typeMap"] => {
  switch (action.type) {
    case `CREATE_TYPES`: {
      const typeDefs = Array.isArray(action.payload)
        ? action.payload
        : [action.payload]
      const ignoredTypes = typeDefs.reduce(typesWithoutInference, [])
      ignoredTypes.forEach(type => {
        state[type] = ignore(state[type] || initialTypeMetadata())
      })
      return state
    }

    case `BUILD_TYPE_METADATA`: {
      // Overwrites existing metadata
      const { nodes, typeName, clearExistingMetadata } = action.payload
      if (!state[typeName]?.ignored) {
        const initialMetadata =
          clearExistingMetadata || !state[typeName]
            ? initialTypeMetadata()
            : state[typeName]

        state[typeName] = addNodes(initialMetadata, nodes)
      }
      return state
    }

    case `DISABLE_TYPE_INFERENCE`: {
      // Note: types disabled here will be re-enabled after BUILD_TYPE_METADATA
      const types = action.payload
      types.forEach(type => {
        state[type] = disable(state[type] || initialTypeMetadata())
      })
      return state
    }

    case `CREATE_NODE`: {
      const { payload: node, oldNode } = action
      const { type } = node.internal
      if (oldNode) {
        state[type] = deleteNode(state[type] || initialTypeMetadata(), oldNode)
      }
      state[type] = addNode(state[type] || initialTypeMetadata(), node)
      return state
    }

    case `DELETE_NODE`: {
      const node = action.payload
      if (!node) return state
      const { type } = node.internal
      state[type] = deleteNode(state[type] || initialTypeMetadata(), node)
      return state
    }

    case `ADD_FIELD_TO_NODE`: {
      const { payload: node, addedField } = action
      const { type } = node.internal

      // Must unregister previous fields first.
      // Can't simply add { fields: { [addedField]: node.fields[addedField] } }
      // because it will count `fields` key twice for the same node
      const previousFields = omit(node.fields, [addedField])
      state[type] = deleteNode(state[type], { ...node, fields: previousFields })
      state[type] = addNode(state[type], { ...node, fields: node.fields })

      // TODO: there might be an edge case when the same field is "added" twice.
      //   Then we'll count it twice in metadata. The only way to avoid it as I see it
      //   is to pass original node before modifications along with a new node
      //   in action payload and utilize original `node.fields` in deleteNode call above
      return state
    }

    case `ADD_CHILD_NODE_TO_PARENT_NODE`: {
      // Marking parent type as dirty so that it rebuilds
      const { type } = action.payload.internal
      state[type].dirty = true
      return state
    }

    case `SET_SCHEMA`: {
      Object.keys(state).forEach(type => {
        state[type].dirty = false
      })
      return state
    }

    default:
      return state
  }
}

enum StepsEnum {
  initialBuild = `initialBuild`,
  incrementalBuild = `incrementalBuild`,
}

const initialState = (): IGatsbyState["inferenceMetadata"] => {
  return {
    step: StepsEnum.initialBuild, // `initialBuild` | `incrementalBuild`
    typeMap: {},
  }
}

export const inferenceMetadataReducer = (
  state: IGatsbyState["inferenceMetadata"] = initialState(),
  action: ActionsUnion
): IGatsbyState["inferenceMetadata"] => {
  switch (action.type) {
    case `CREATE_NODE`:
    case `DELETE_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
    case `ADD_FIELD_TO_NODE`: {
      // Perf: disable incremental inference until the first schema build.
      // There are plugins which create and delete lots of nodes during bootstrap,
      // which makes this reducer to do a lot of unnecessary work.
      // Instead we defer the initial metadata creation until the first schema build
      // and then enable incremental updates explicitly
      if (state.step === StepsEnum.initialBuild) {
        return state
      }
      state.typeMap = incrementalReducer(state.typeMap, action)
      return state
    }

    case `START_INCREMENTAL_INFERENCE`: {
      return {
        ...state,
        step: StepsEnum.incrementalBuild,
      }
    }

    case `DELETE_CACHE`: {
      return initialState()
    }

    default: {
      state.typeMap = incrementalReducer(state.typeMap, action)
      return state
    }
  }
}
