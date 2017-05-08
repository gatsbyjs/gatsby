// @flow
const _ = require(`lodash`)
const flatten = require(`flat`)

const mergeNodes = (...args) => {
  // $FlowFixMe
  return _.mergeWith({}, ...args, (obj, next) => {
    if (!_.isArray(obj || next)) return
    let array = [].concat(obj, next).filter(v => v != null)

    if (!array.length) return null

    // primitive values don't get merged further, just take the first item
    if (!_.isObject(array[0])) {
      return array.slice(0, 1)
    }

    return [mergeNodes(...array)]
  })
}

const extractFieldExamples = (exports.extractFieldExamples = ({
  nodes,
  deleteNodeFields = false,
}: {
  nodes: any[],
  deleteNodeFields: boolean,
}) => {
  let examples = mergeNodes({}, ...nodes)

  if (deleteNodeFields) {
    // Remove fields for traversing through nodes as we want to control
    // setting traversing up not try to automatically infer them.
    delete examples.children
    delete examples.parent
  }

  return examples
})

exports.buildFieldEnumValues = (nodes: any[]) => {
  const enumValues = {}
  const values = flatten(
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
  Object.keys(values).forEach(field => {
    if (values[field] == null) return
    enumValues[field.replace(/\./g, `___`)] = { field }
  })

  return enumValues
}
