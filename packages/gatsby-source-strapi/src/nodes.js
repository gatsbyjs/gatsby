import createNodeHelpers from "gatsby-node-helpers"

const { createNodeFactory } = createNodeHelpers({
  typePrefix: `Strapi`,
})

/**
 * Node factory with `type` option based on
 * original `createNodeFactory`.
 *
 * @param {string} type - Node type
 * @param {object} node - Node
 * @constructor
 */
export const Node = (type, node) =>
  createNodeFactory(type, node => {
    node.id = node.strapiId
    return node
  })(node)
