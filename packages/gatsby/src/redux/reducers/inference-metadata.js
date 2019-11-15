// Tracking structure of nodes to utilize this metadata for schema inference
// Type descriptors stay relevant at any point in time making incremental inference trivial
const { omit } = require(`lodash`)
const {
  addNode,
  deleteNode,
  ignore,
} = require(`../../schema/infer/inference-metadata`)
const { NodeInterfaceFields } = require(`../../schema/types/node-interface`)
const { typesWithoutInference } = require(`../../schema/types/type-defs`)

const ignoredFields = new Set([
  ...NodeInterfaceFields,
  `$loki`,
  `__gatsby_resolved`,
])

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}

    case `CREATE_TYPES`: {
      const typeDefs = Array.isArray(action.payload)
        ? action.payload
        : [action.payload]
      const ignoredTypes = typeDefs.reduce(typesWithoutInference, [])
      ignoredTypes.forEach(type => {
        state[type] = ignore(state[type])
      })
      return state
    }

    case `CREATE_NODE`: {
      const { payload: node, oldNode } = action
      const { type } = node.internal
      if (oldNode) {
        state[type] = deleteNode(state[type] || { ignoredFields }, oldNode)
      }
      state[type] = addNode(state[type] || { ignoredFields }, node)
      return state
    }

    case `DELETE_NODE`: {
      const node = action.payload
      if (!node) return state
      const { type } = node.internal
      state[type] = deleteNode(state[type] || { ignoredFields }, node)
      return state
    }

    case `ADD_FIELD_TO_NODE`: {
      const { payload: node, addedField } = action
      const { type } = node.internal

      // Must unregister previous fields first.
      // Can't simply add { fields: { [addedField]: node.fields[addedField] } }
      // because it will count `fields` key twice for the same node
      const previousFields = omit(node.fields, [addedField])
      state[type] = deleteNode(state[type], { fields: previousFields })
      state[type] = addNode(state[type], { fields: node.fields })

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

    // Deprecated, will be removed in Gatsby v3.
    case `DELETE_NODES`: {
      const { fullNodes } = action
      fullNodes.forEach(node => {
        const { type } = node.internal
        state[type] = deleteNode(state[type] || { ignoredFields }, node)
      })
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
