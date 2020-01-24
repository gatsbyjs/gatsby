import onPreBootstrap from "./gatsby-node/on-pre-bootstrap"
import sourceNodes from "./gatsby-node/source-nodes"
import createSchemaCustomization from "./gatsby-node/create-schema-customization"
import onPostBuild from "./gatsby-node/on-post-build/on-post-build"
import onCreateDevServer from "./gatsby-node/on-post-build/on-create-dev-server"

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

  // in production, cache the image nodes we've collected up into our redux store
  // so we can touch them on the next build
  onPostBuild,

  // 1. in development, cache the image nodes we've collected up into our redux store
  // so we can touch them on the next build
  // 2. start the interval refetcher in development mode for long polling data updates
  onCreateDevServer,
}
