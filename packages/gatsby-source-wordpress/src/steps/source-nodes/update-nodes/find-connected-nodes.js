import flattenDeep from "lodash/flattenDeep"
import { dump } from "dumper.js"

// After all nodes are created while building the schema, store possible node type relationships. So for example when building the WpPost type, for every gatsby node discovered as a potential connected node type WpPost's fields, record that in redux as WpPost => [...ConnectedTypeNames].

// when creating or updating a Page incrementally, we should find all connected node ids, check the types of each of those id's, if any connected id type has the current node type as a potential connected node type, AND this node is not a connected node of that node, we should refetch that node in case it's now a connected node.

// So we create a new Page, we then check the connected node id's and determine that one of them is a User type. The User type has Page as a potential connected node. So we check if this node is a connected node of that node. If it's not we can't be sure that that User node isn't missing this node as a connected node. So we refetch the connected node of our Page which is a User. Do this for all connected nodes where we can't find a relationship back.

const recursivelySearchForIds = ([key, value]) => {
  if (!key || !value) {
    return null
  }

  if (key === `id`) {
    return value
  } else if (typeof value === `string` || typeof value === `number`) {
    return null
  }

  if (Array.isArray(value)) {
    dump(key)
    // loop through each value of the array. If it's an object recurse on it's fields
    // if it's anything else skip it.
    value.map(innerValue => {
      if (innerValue === null) {
        return null
      }

      if (key === `id` && typeof innerValue === `string`) {
        return innerValue
      }

      if (typeof innerValue === `object`) {
        return Object.values(innerValue).map(recursivelySearchForIds)
      }

      return null
    })
  } else if (typeof value === `object`) {
    dump(key)
    return Object.entries(value).map(recursivelySearchForIds)
  }

  return null
}

export const findConnectedNodeIds = node => {
  const childNodeIds = [
    ...new Set(
      flattenDeep(Object.entries(node).map(recursivelySearchForIds)).filter(
        id => id !== node.id && !!id
      )
    ),
  ]

  if (!childNodeIds.length) {
    return null
  }

  return childNodeIds
}
