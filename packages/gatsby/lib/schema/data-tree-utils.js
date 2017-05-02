// @flow
const _ = require(`lodash`)
const flatten = require(`flat`)

const extractFieldExamples = (exports.extractFieldExamples = ({
  nodes,
  selector,
  deleteNodeFields = false,
}) => {
  let examples = nodes.reduce((mem, node) => {
    let subNode = selector ? _.get(node, selector) : node

    const reduceSubNode = (m, sn) => {
      // Ignore undefined/null/empty array subnodes.
      sn = _.omitBy(flatten(sn || {}, { safe: true }), v => {
        return _.isNil(v) || (_.isArray(v) && _.isEmpty(v))
      })

      return Object.assign({}, m, sn)
    }

    // If the subnode is an array of things, run those individually instead
    // of the whole array.
    if (_.isArray(subNode) && !_.isEmpty(subNode)) {
      const result = subNode.reduce((m, n) => {
        return reduceSubNode(m, n)
      })
      return result
    } else {
      return reduceSubNode(mem, subNode)
    }
  }, {})

  examples = flatten.unflatten(examples)

  if (deleteNodeFields) {
    // Remove fields for traversing through nodes as we want to control
    // setting traversing up not try to automatically infer them.
    delete examples.children
    delete examples.parent
  }

  return examples
})
const buildFieldEnumValues = (exports.buildFieldEnumValues = nodes => {
  const enumValues = {}
  const fieldExamples = _.keys(
    flatten(
      extractFieldExamples({
        nodes,
        selector: ``,
        deleteNodeFields: true,
      }),
      {
        maxDepth: 3,
        safe: true, // don't flatten arrays.
      }
    )
  )
  fieldExamples.forEach(field => {
    enumValues[field.replace(/\./g, `___`)] = { field }
  })

  return enumValues
})
