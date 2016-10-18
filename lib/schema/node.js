import {
  nodeDefinitions,
} from 'graphql-relay'

//const { nodeInterface, nodeField } = nodeDefinitions(
module.exports = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId)
    return null
  },
  (obj) => {
    return obj.ships ? factionType : shipType
  }
)
