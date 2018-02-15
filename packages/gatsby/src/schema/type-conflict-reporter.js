// @flow
const _ = require(`lodash`)
const report = require(`gatsby-cli/lib/reporter`)
const typeOf = require(`type-of`)
const util = require(`util`)
const { findRootNodeAncestor } = require(`./node-tracking`)

const isNodeWithNodeDescription = node =>
  node && node.internal && node.internal.nodeDescription

const findNodeDescription = obj => {
  if (obj) {
    const node = findRootNodeAncestor(obj, isNodeWithNodeDescription)
    if (isNodeWithNodeDescription(node)) {
      return node.internal.nodeDescription
    }
  }
  return ``
}

const formatValue = value => {
  if (!_.isArray(value)) {
    return util.inspect(value, {
      colors: true,
      depth: 0,
      breakLength: Infinity,
    })
  }

  let wasElipsisLast = false
  const usedTypes = []
  const output = []

  value.forEach(item => {
    const type = typeOf(item)
    if (usedTypes.indexOf(type) !== -1) {
      if (!wasElipsisLast) {
        output.push(`...`)
        wasElipsisLast = true
      }
    } else {
      output.push(formatValue(item))
      wasElipsisLast = false
      usedTypes.push(type)
    }
  })

  return `[ ${output.join(`, `)} ]`
}

class TypeConflictEntry {
  constructor(selector) {
    this.selector = selector
    this.types = {}
  }

  addExample({ value, type, parent }) {
    this.types[type] = {
      value,
      nodeDescription: findNodeDescription(parent),
    }
  }

  printEntry() {
    const sortedByTypeName = _.sortBy(
      _.entries(this.types),
      ([typeName, value]) => typeName
    )

    report.log(
      `${this.selector}:${sortedByTypeName
        .map(
          ([typeName, { value, nodeDescription }]) =>
            `\n - ${typeName}: ${formatValue(value)}${nodeDescription &&
              ` (${nodeDescription})`}`
        )
        .join(``)}`
    )
  }
}

class TypeConflictReporter {
  constructor() {
    this.clearConflicts()
  }

  clearConflicts() {
    this.entries = {}
  }

  getFromSelector(selector) {
    if (this.entries[selector]) {
      return this.entries[selector]
    }

    const dataEntry = new TypeConflictEntry(selector)
    this.entries[selector] = dataEntry
    return dataEntry
  }

  addConflict(selector, ...examples) {
    const entry = this.getFromSelector(selector)
    examples
      .filter(example => example.value != null)
      .forEach(example => entry.addExample(example))
  }

  printConflicts() {
    const entries = _.values(this.entries)
    if (entries.length > 0) {
      report.warn(
        `There are conflicting field types in your data. GraphQL schema will omit those fields.`
      )
      entries.forEach(entry => entry.printEntry())
    }
  }
}

const typeConflictReporter = new TypeConflictReporter()

const printConflicts = () => {
  typeConflictReporter.printConflicts()
}

module.exports = { typeConflictReporter, printConflicts }
