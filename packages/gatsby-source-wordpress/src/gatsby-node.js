import onPreBootstrap from "./gatsby-node/on-pre-bootstrap"
import sourceNodes from "./gatsby-node/source-nodes"
import createSchemaCustomization from "./gatsby-node/create-schema-customization"
import createResolvers from "./gatsby-node/create-resolvers"
import onPostBootstrap from "./gatsby-node/on-post-bootstrap"
// import createPages from "./gatsby-node/create-pages"

module.exports = {
  onPreBootstrap,
  sourceNodes,
  createSchemaCustomization,
  createResolvers,
  // createPages,
  onPostBootstrap,
}
