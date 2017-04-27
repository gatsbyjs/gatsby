// @flow
const _ = require("lodash")
const flatten = require("flat")

const extractFieldExamples = (exports.extractFieldExamples = ({
  nodes,
  selector,
  deleteNodeFields = false,
}) => {
  let examples = nodes.reduce((mem, node) => {
    let subNode = selector ? _.get(node, selector) : node

    // Ignore undefined/null subnodes
    subNode = _.omitBy(flatten(subNode || {}), _.isNil)

    return Object.assign({}, mem, subNode)
  }, {})

  examples = flatten.unflatten(examples, { safe: true })

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
