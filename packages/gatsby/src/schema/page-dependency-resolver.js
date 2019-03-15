const _ = require(`lodash`)
const createPageDependency = require(`../redux/actions/add-page-dependency`)

/**
 * A Graphql resolver middleware that runs `resolver` and creates a
 * page dependency with the returned node.
 *
 * @param resolver A graphql resolver. A function that take arguments
 * (node, args, context, info) and return a node
 * @returns A new graphql resolver
 */
function pageDependencyResolver(resolver) {
  return async (node, args, context = {}, info = {}) => {
    const { path } = context
    const result = await resolver(node, args, context, info)

    // Call createPageDependency on each result
    if (path) {
      const asArray = _.isArray(result) ? result : [result]
      for (const node of asArray) {
        if (node) {
          // using module.exports here so it can be mocked
          createPageDependency({
            path,
            nodeId: node.id,
          })
        }
      }
    }

    // Finally return the found node
    return result
  }
}

module.exports = pageDependencyResolver
