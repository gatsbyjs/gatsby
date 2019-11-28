import onPreBootstrap from "./gatsby-node/on-pre-bootstrap"
import sourceNodes from "./gatsby-node/source-nodes"
import createSchemaCustomization from "./gatsby-node/create-schema-customization"
import createResolvers from "./gatsby-node/create-resolvers"
import onCreateDevServer from "./gatsby-node/on-create-dev-server"

module.exports = {
  // 1. check plugin requirements
  // 2. do introspection on the WPGQL schema
  // 3. build gql queries and add to rematch/redux store
  onPreBootstrap,

  // 1. pull queries from redux store
  // 2. fetch all data from WPGQL or just fetch changed data since the last build
  sourceNodes,

  // 1. introspect WPGQL types
  // 2. normalize the WPGQL schema and add to the Gatsby schema
  createSchemaCustomization,

  // fetch and create image file nodes when they're queried for
  createResolvers,

  // start the interval refetcher in development mode for real-time data updates
  onCreateDevServer,
}
