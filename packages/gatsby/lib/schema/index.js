/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)

const siteSchema = require(`./site-schema`)
const apiRunner = require(`../utils/api-runner-node`)
const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store, getNode } = require(`../redux`)
const { boundActionCreators } = require(`../redux/actions`)
const { deleteNodes } = boundActionCreators

async function buildSchema() {
  console.time(`building schema`)
  const typesGQL = await buildNodeTypes()
  const connections = buildNodeConnections(_.values(typesGQL))

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        // Pull off just the graphql node from each type object.
        ..._.mapValues(typesGQL, `node`),
        ...connections,
        ...siteSchema(),
      }),
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
  const updateNode = _.debounce(cb, 250)
  // Ensure schema is created even if the project hasn't got any source plugins.
  updateNode()
  store.subscribe(() => {
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

module.exports = () => {
  return new Promise(resolve => {
    console.time(`sourcing and parsing nodes`)
    apiRunner(`sourceNodes`)
    let builtSchema = false
    debounceNodeCreation(() => {
      const state = store.getState()
      // Check if the schema has been built yet and if
      // all source plugins have reported that they're ready.
      if (!builtSchema && _.every(_.values(state.status), `ready`)) {
        console.timeEnd(`sourcing and parsing nodes`)
        builtSchema = true
        // Resolve promise once the schema is built.
        buildSchema().then(() => resolve())

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
      }
    })
  })
}
