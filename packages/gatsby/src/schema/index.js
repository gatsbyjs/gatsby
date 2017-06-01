/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)

const apiRunner = require(`../utils/api-runner-node`)
const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store, emitter, getNode } = require(`../redux`)
const { boundActionCreators } = require(`../redux/actions`)
const { deleteNodes } = boundActionCreators

async function buildSchema() {
  console.time(`building schema`)
  const typesGQL = await buildNodeTypes()
  const connections = buildNodeConnections(_.values(typesGQL))

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => {
        return {
          // Pull off just the graphql node from each type object.
          ..._.mapValues(typesGQL, `node`),
          ...connections,
        }
      },
    }),
  })

  console.timeEnd(`building schema`)
  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })

  return
}

// Store types that we're building so can check
// later if need to rebuild the schema.
// let typesBuilt
// let builtSchemaOnce = false
// const rebuildSchema = _.debounce(() => {
// if (!builtSchemaOnce) return

// const state = store.getState()

// if (!typesBuilt) {
// typesBuilt = _.map(
// _.uniqBy(_.values(state.nodes), n => n.internal.type),
// t => t.internal.type
// )
// }

// // If we've already built the schema before already, check if
// // there's been any new node types added.
// const newTypesBuilt = _.map(
// _.uniqBy(_.values(state.nodes), n => n.internal.type),
// t => t.internal.type
// )

// if (typesBuilt !== newTypesBuilt) {
// buildSchema()
// }
// }, 4000)

// emitter.on("CREATE_NODE", () => {
// rebuildSchema()
// })

module.exports = () =>
  new Promise(resolve => {
    console.time(`initial sourcing and transforming nodes`)
    apiRunner(`sourceNodes`, {
      traceId: `initial-sourceNodes`,
      waitForCascadingActions: true,
    }).then(() => {
      console.timeEnd(`initial sourcing and transforming nodes`)
      const state = store.getState()

      // Garbage collect stale data nodes before creating the
      // schema.
      const touchedNodes = Object.keys(state.nodesTouched)
      const staleNodes = _.values(state.nodes).filter(node => {
        // Find the root node.
        let rootNode = node
        let whileCount = 0
        while (
          rootNode.parent &&
          getNode(rootNode.parent) !== undefined &&
          whileCount < 101
        ) {
          rootNode = getNode(rootNode.parent)
          whileCount += 1
          if (whileCount > 100) {
            console.log(
              `It looks like you have a node that's set its parent as itself`,
              rootNode
            )
          }
        }

        return !_.includes(touchedNodes, rootNode.id)
      })

      if (staleNodes.length > 0) {
        deleteNodes(staleNodes.map(n => n.id))
      }

      // Resolve promise once the schema is built.
      buildSchema().then(() => {
        resolve()
      })
    })
  })
