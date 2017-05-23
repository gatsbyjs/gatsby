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

// This seems like the most sensible way to decide when the the initial
// search for nodes is finished. At least for filesystem based nodes. For
// source plugins pulling from remote systems, there'll probably need to be
// an explicit API for them to let Gatsby core know that a sync is complete.
const debounceNodeCreation = cb => {
  // TODO this is terrible. Find a better way to figure
  // out when stuff is finished.
  const updateNode = _.debounce(cb, 1000)
  // Ensure schema is created even if the project hasn't got any source plugins.
  updateNode()
  emitter.onAny(() => {
    const state = store.getState()
    if (
      state.lastAction.type === `CREATE_NODE` ||
      state.lastAction.type === `UPDATE_NODE` ||
      state.lastAction.type === `UPDATE_SOURCE_PLUGIN_STATUS`
    ) {
      updateNode()
    }
  })
}

module.exports = () =>
  new Promise(resolve => {
    console.time(`sourcing and parsing nodes`)
    apiRunner(`sourceNodes`)
    let builtSchema = false
    let typesBuilt = {}
    debounceNodeCreation(() => {
      const state = store.getState()
      // Check if the schema has been built yet and if
      // all source plugins have reported that they're ready.
      if (
        !builtSchema &&
        _.every(_.values(state.status.sourcePlugins), `ready`)
      ) {
        console.timeEnd(`sourcing and parsing nodes`)
        builtSchema = true
        // Resolve promise once the schema is built.
        buildSchema().then(() => resolve())

        // Store types that we're building so can check
        // later if need to rebuild the schema.
        typesBuilt = _.map(
          _.uniqBy(_.values(state.nodes), n => n.internal.type),
          t => t.internal.type
        )

        // Garbage collect stale data nodes.
        //
        // This is a REALLY terrible place to put this but until we have
        // a nice centralized way to trigger events when certain work is
        // done, we'll just put this here.
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
          console.log(`deleting stale nodes`, staleNodes.length)
          deleteNodes(staleNodes.map(n => n.id))
        }
      } else if (builtSchema) {
        // If we've already built the schema before already, check if
        // there's been any new node types added.
        const newTypesBuilt = _.map(
          _.uniqBy(_.values(state.nodes), n => n.internal.type),
          t => t.internal.type
        )

        if (typesBuilt !== newTypesBuilt) {
          console.log(`building schema again`)
          buildSchema()
        }

        typesBuilt = newTypesBuilt
      }
    })
  })
