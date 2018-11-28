const util = require(`util`)
const report = require(`gatsby-cli/lib/reporter`)

const { findAncestorNode, getParentNode } = require(`../utils`)

const conflicts = new Map()

const reportConflict = (selector, examples) => {
  if (selector.startsWith(`SitePlugin`)) return

  if (!conflicts.has(selector)) {
    conflicts.set(selector, new Map())
  }
  const conflict = conflicts.get(selector)

  examples.forEach(example => {
    const { value, type, parent } = example
    const node = getParentNode(parent)
    const ancestor = findAncestorNode(node, node => node.internal.description)
    const { description } = ancestor ? ancestor.internal : {}
    conflict.set(type, { value, description })
  })
}

const clearConflicts = () => conflicts.clear()

const printConflicts = () => {
  if (conflicts.size) {
    report.warn(
      `There are conflicting field types in your data. GraphQL schema will omit those fields.\n`
    )
    conflicts.forEach((conflict, selector) => {
      report.log(`${selector}:\n`)
      conflict.forEach(({ value, description }, type) => {
        report.log(
          [
            ` - type: ${type}\n`,
            `   value: ${format(value)}\n`,
            description && `   source: ${description}\n`,
          ].join(``)
        )
      })
    })
  }
}

const format = value =>
  util.inspect(value, {
    breakLength: Infinity,
    colors: true,
    depth: 0,
    maxArrayLength: 1,
  })

module.exports = {
  clearConflicts,
  printConflicts,
  reportConflict,
}
