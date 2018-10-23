const _ = require(`lodash`)
const invariant = require(`invariant`)
const db = require(`../../db`)

function createNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let coll = db.getDb().getCollection(type)
  if (!coll) {
    coll = db.getDb().addCollection(type, { unique: [`id`], indices: [`id`] })
  }

  return coll.insert(node)
}

function deleteNode(node) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let coll = db.getDb().getCollection(type)
  if (!coll) {
    invariant(coll, `${type} collection doesn't exist. When trying to delete?`)
  }

  if (coll.by(`id`, node.id)) {
    coll.remove(node)
  } else {
    console.log(
      `WARN: deletion of node failed because it wasn't in coll. Node = [${node}]`
    )
  }
}

function updateNode(node, oldNode) {
  invariant(node.internal, `node has no "internal" field`)
  invariant(node.internal.type, `node has no "internal.type" field`)
  invariant(node.id, `node has no "id" field`)

  const type = node.internal.type

  let coll = db.getDb().getCollection(type)
  if (!coll) {
    invariant(coll, `${type} collection doesn't exist. When trying to update?`)
  }

  if (!oldNode) {
    oldNode = db.getNode(node.id)
  }
  const updateNode = _.merge(oldNode, node)

  coll.update(updateNode)
}

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      db.deleteAllCollections()
      return new Map()
    case `CREATE_NODE`: {
      if (action.oldNode) {
        updateNode(action.payload, action.oldNode)
      } else {
        createNode(action.payload)
      }
      return new Map()
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      updateNode(action.payload)
      return new Map()

    case `DELETE_NODE`: {
      deleteNode(action.payload)
      return new Map()
    }

    case `DELETE_NODES`: {
      return new Map()
    }

    default:
      return new Map()
  }
}
