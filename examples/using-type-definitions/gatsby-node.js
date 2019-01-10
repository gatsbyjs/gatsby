/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

exports.addTypeDefs = ({ addTypeDefs }) => {
  const typeDefs = `
    type BlogJson implements Node {
      title: String!
      author: String
      text: String
      picture: File @link(by: "relativePath")
    }
  `
  addTypeDefs(typeDefs)
}
