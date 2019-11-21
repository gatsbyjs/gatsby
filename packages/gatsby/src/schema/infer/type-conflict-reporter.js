// @flow
const _ = require(`lodash`)
const report = require(`gatsby-cli/lib/reporter`)
const typeOf = require(`type-of`)
const util = require(`util`)

export type TypeConflictExample = {
  value: mixed,
  parent: {},
  type: string,
  arrayTypes: string[],
}

type TypeConflict = {
  value: mixed,
  description: string,
}

const isNodeWithDescription = node =>
  node && node.internal && node.internal.description

const findNodeDescription = obj => {
  if (obj) {
    // TODO: Maybe get this back
    // const node = findRootNodeAncestor(obj, isNodeWithDescription)
    if (isNodeWithDescription(obj)) {
      return obj.internal.description
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

  const output = []

  if (value.length === 1) {
    // For arrays usually a single conflicting item is exposed vs. the whole array
    output.push(`...`)
    output.push(formatValue(value[0]))
    output.push(`...`)
  } else {
    let wasElipsisLast = false
    const usedTypes = []
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
  }

  return `[ ${output.join(`, `)} ]`
}

class TypeConflictEntry {
  selector: string
  types: Map<string, TypeConflict>

  constructor(selector: string) {
    this.selector = selector
    this.types = new Map()
  }

  addExample({ value, type, parent }: TypeConflictExample) {
    this.types.set(type, {
      value,
      description: findNodeDescription(parent),
    })
  }

  printEntry() {
    const sortedByTypeName = _.sortBy(
      Array.from(this.types.entries()),
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
  entries: Map<string, TypeConflictEntry>

  constructor() {
    this.entries = new Map()
  }

  clearConflicts() {
    this.entries.clear()
  }

  getEntryFromSelector(selector: string): TypeConflictEntry {
    let dataEntry = this.entries.get(selector)

    if (!dataEntry) {
      dataEntry = new TypeConflictEntry(selector)
      this.entries.set(selector, dataEntry)
    }

    return dataEntry
  }

  addConflict(selector: string, examples: TypeConflictExample[]) {
    if (selector.substring(0, 11) === `SitePlugin.`) {
      // Don't store and print out type conflicts in plugins.
      // This is out of user control so he/she can't do anything
      // to hide those.
      return
    }

    const entry = this.getEntryFromSelector(selector)
    examples
      .filter(example => example.value != null)
      .forEach(example => entry.addExample(example))
  }

  printConflicts() {
    if (this.entries.size > 0) {
      report.warn(
        `There are conflicting field types in your data.\n\n` +
          `If you have explicitly defined a type for those fields, you can ` +
          `safely ignore this warning message.\n` +
          `Otherwise, Gatsby will omit those fields from the GraphQL schema.\n\n` +
          `If you know all field types in advance, the best strategy is to ` +
          `explicitly define them with the \`createTypes\` action, and skip ` +
          `inference with the \`@dontInfer\` directive.\n` +
          `See https://www.gatsbyjs.org/docs/actions/#createTypes`
      )
      this.entries.forEach(entry => entry.printEntry())
    }
  }

  getConflicts() {
    return Array.from(this.entries.values())
  }
}

module.exports = { TypeConflictReporter, TypeConflictEntry }
