const db = require(`../../db`)

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      db.deleteAllCollections()
      return new Map()
    case `CREATE_NODE`: {
      if (action.oldNode) {
        db.updateNode(action.payload, action.oldNode)
      } else {
        db.createNode(action.payload)
      }
      return new Map()
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      db.updateNode(action.payload)
      return new Map()

    case `DELETE_NODE`: {
      db.deleteNode(action.payload)
      return new Map()
    }

    case `DELETE_NODES`: {
      return new Map()
    }

    default:
      return new Map()
  }
}
