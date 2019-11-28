import onPreBootstrap from "./gatsby-node/on-pre-bootstrap"
import sourceNodes from "./gatsby-node/source-nodes"
import createSchemaCustomization from "./gatsby-node/create-schema-customization"
import createResolvers from "./gatsby-node/create-resolvers"
import onPostBootstrap from "./gatsby-node/on-post-bootstrap"

module.exports = {
  // check plugin requirements
  // do introspection on the WPGQL schema
  // build gql queries and add to rematch/redux store
  onPreBootstrap,

  // pull queries from redux store and use to fetch all data from WPGQL
  // or just fetch changed data since the last build
  sourceNodes,

  // use introspection to normalize the WPGQL schema and add to the Gatsby schema
  createSchemaCustomization,

  // fetch and create image file nodes when they're queried for
  createResolvers,

  // start the interval refetcher in development mode for real-time data updates
  onPostBootstrap,
}
