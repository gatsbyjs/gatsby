const _ = require(`lodash`)
const flatten = require(`flat`)

const extractFieldExamples = exports.extractFieldExamples = ({ nodes, selector, deleteNodeFields=false }) => {
  let examples = {}
  _.each(nodes, (node) => {
    let subNode
    if (selector) {
      subNode = _.get(node, selector)
    } else {
      subNode = node
    }
    // Ignore undefined/null subnodes
    if (subNode) {
      const flattened = flatten(subNode, { maxDepth: 3, flatten: true })
      // Remove non-truthy values
      const truthyExamples = {}
      _.each(flattened, (v, k) => {
        if (v) {
          truthyExamples[k] = v
        }
      })
      examples = _.merge(examples, truthyExamples)
    }
  })

  examples = flatten.unflatten(examples, { safe: true })

  if (deleteNodeFields) {
    // Remove fields common to all nodes.
    delete examples.type
    delete examples.id
    delete examples.children
    delete examples.parent
  }

  return examples
}
const buildFieldEnumValues = exports.buildFieldEnumValues = (nodes) => {
  const enumValues = {}
  const fieldExamples = _.keys(
    flatten(
      extractFieldExamples(
        {
          nodes,
          selector: ``,
          deleteNodeFields: true,
        }
      ),
      {
        maxDepth: 3,
        safe: true, // don't flatten arrays.
      }
    )
  )
  fieldExamples.forEach((field) => {
    enumValues[field.replace(`.`, `___`)] = { field }
  })

  return enumValues
}
