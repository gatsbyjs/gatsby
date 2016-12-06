const _ = require(`lodash`)
const flatten = require(`flat`)

const extractFieldExamples = exports.extractFieldExamples = ({ nodes, selector, deleteNodeFields=false }) => {
  const examples = {}
  _.each(nodes, (node) => {
    let subNode
    if (selector) {
      subNode = _.get(node, selector)
    } else {
      subNode = node
    }
    _.each(subNode, (v, k) => {
      if (!examples[k]) {
        examples[k] = v
      }
    })
  })

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
  const fieldExamples = _.keys(flatten(extractFieldExamples({ nodes, selector: ``, deleteNodeFields: true }), { maxDepth: 3 }))
  fieldExamples.forEach((field) => {
    enumValues[field.replace(`.`, `___`)] = { field }
  })

  return enumValues
}
