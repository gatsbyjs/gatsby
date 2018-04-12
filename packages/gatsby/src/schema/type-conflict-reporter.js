// @flow
const _ = require(`lodash`)
const report = require(`gatsby-cli/lib/reporter`)
const typeOf = require(`type-of`)
const util = require(`util`)
const { findRootNodeAncestor } = require(`./node-tracking`)

const isNodeWithDescription = node =>
  node && node.internal && node.internal.description

const findNodeDescription = obj => {
  if (obj) {
    const node = findRootNodeAncestor(obj, isNodeWithDescription)
    if (isNodeWithDescription(node)) {
      return node.internal.description
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
      description: findNodeDescription(parent),
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
          ([typeName, { value, description }]) =>
            `\n - type: ${typeName}\n   value: ${formatValue(
              value
            )}${description && `\n   source: ${description}`}`
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

  addConflict(selector, examples) {
    if (selector.substring(0, 11) === `SitePlugin.`) {
      // Don't store and print out type conflicts in plugins.
      // This is out of user control so he can't do anything
      // to hide those.
      return
    }

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

module.exports = { typeConflictReporter, printConflicts, TypeConflictEntry }
