import sourceNodes from "./gatsby-node/source-nodes"
import createPages from "./gatsby-node/create-pages"
import createSchemaCustomization from "./gatsby-node/create-schema-customization"
import createResolvers from './gatsby-node/create-resolvers'

module.exports = {
  createSchemaCustomization,
  createResolvers,
  sourceNodes,
  createPages,
}
