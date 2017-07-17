/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
const forEachObject = require(`lodash`).forEach
const invariant = require(`invariant`)

const DEFAULT_HANDLE_KEY = ``
const {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} = require(`graphql`)

import type {
  Argument,
  ArgumentDefinition,
  ArgumentValue,
  Directive,
  Field,
  Fragment,
  LocalArgumentDefinition,
  Node,
  Root,
  Selection,
} from "relay-compiler/lib/RelayIR"
import type { GraphQLInputType } from "graphql"

const INDENT = `  `

/**
 * Converts a Relay IR node into a GraphQL string. Custom Relay
 * extensions (directives) are not supported; to print fragments with
 * variables or fragment spreads with arguments, transform the node
 * prior to printing.
 */
function print(node: Root | Fragment): string {
  if (node.kind === `Fragment`) {
    return (
      `fragment ${node.name} on ${String(node.type)}` +
      printFragmentArgumentDefinitions(node.argumentDefinitions) +
      printDirectives(node.directives) +
      printSelections(node, ``) +
      `\n`
    )
  } else if (node.kind === `Root`) {
    return (
      `${node.operation} ${node.name}` +
      printArgumentDefinitions(node.argumentDefinitions) +
      printDirectives(node.directives) +
      printSelections(node, ``) +
      `\n`
    )
  } else {
    invariant(false, `RelayPrinter: Unsupported IR node \`%s\`.`, node.kind)
  }
}

function printSelections(
  node: Node,
  indent: string,
  parentCondition?: string
): string {
  const selections = node.selections
  if (selections == null) {
    return ``
  }
  const printed = selections.map(selection =>
    printSelection(selection, indent, parentCondition)
  )
  let selection = printed.join(`\n` + indent + INDENT)
  return printed.length ? ` {\n${indent + INDENT}${selection}\n${indent}}` : ``
}

function printSelection(
  selection: Selection,
  indent: string,
  parentCondition?: string
): string {
  parentCondition = parentCondition || ``
  let str = ``
  if (selection.kind === `LinkedField`) {
    if (selection.alias != null) {
      str += selection.alias + `: `
    }
    str += selection.name
    str += printArguments(selection.args)
    str += parentCondition
    str += printDirectives(selection.directives)
    str += printHandles(selection)
    str += printSelections(selection, indent + INDENT)
  } else if (selection.kind === `ScalarField`) {
    if (selection.alias != null) {
      str += selection.alias + `: `
    }
    str += selection.name
    str += printArguments(selection.args)
    str += parentCondition
    str += printDirectives(selection.directives)
    str += printHandles(selection)
  } else if (selection.kind === `InlineFragment`) {
    str += `... on ` + selection.typeCondition.toString()
    str += parentCondition
    str += printDirectives(selection.directives)
    str += printSelections(selection, indent + INDENT)
  } else if (selection.kind === `FragmentSpread`) {
    str += `...` + selection.name
    str += parentCondition
    str += printFragmentArguments(selection.args)
    str += printDirectives(selection.directives)
  } else if (selection.kind === `Condition`) {
    const value = printValue(selection.condition)
    // For Flow
    invariant(
      value != null,
      `RelayPrinter: Expected a variable for condition, got a literal \`null\`.`
    )
    let condStr = selection.passingValue ? ` @include` : ` @skip`
    condStr += `(if: ` + value + `)`
    condStr += parentCondition
    // For multi-selection conditions, pushes the condition down to each
    const subSelections = selection.selections.map(sel =>
      printSelection(sel, indent, condStr)
    )
    str += subSelections.join(`\n` + INDENT)
  } else {
    invariant(
      false,
      `RelayPrinter: Unknown selection kind \`%s\`.`,
      selection.kind
    )
  }
  return str
}

function printArgumentDefinitions(
  argumentDefinitions: Array<LocalArgumentDefinition>
): string {
  const printed = argumentDefinitions.map(def => {
    let str = `$${def.name}: ${def.type.toString()}`
    if (def.defaultValue != null) {
      str += ` = ` + printLiteral(def.defaultValue, def.type)
    }
    return str
  })
  return printed.length ? `(\n${INDENT}${printed.join(`\n` + INDENT)}\n)` : ``
}

function printFragmentArgumentDefinitions(
  argumentDefinitions: Array<ArgumentDefinition>
): string {
  let printed
  argumentDefinitions.forEach(def => {
    if (def.kind !== `LocalArgumentDefinition`) {
      return
    }
    printed = printed || []
    let str = `${def.name}: {type: "${def.type.toString()}"`
    if (def.defaultValue != null) {
      str += `, defaultValue: ${printLiteral(def.defaultValue, def.type)}`
    }
    str += `}`
    printed.push(str)
  })
  return printed && printed.length
    ? ` @argumentDefinitions(\n${INDENT}${printed.join(`\n` + INDENT)}\n)`
    : ``
}

function printHandles(field: Field): string {
  if (!field.handles) {
    return ``
  }
  const printed = field.handles.map(handle => {
    // For backward compatibility and also because this module is
    // shared by ComponentScript.
    const key =
      handle.key === DEFAULT_HANDLE_KEY ? `` : `, key: "${handle.key}"`
    const filters =
      handle.filters == null
        ? ``
        : `, filters: ${JSON.stringify(handle.filters.sort())}`
    return `@__clientField(handle: "${handle.name}"${key}${filters})`
  })
  return printed.length ? ` ` + printed.join(` `) : ``
}

function printDirectives(directives: Array<Directive>): string {
  const printed = directives.map(
    directive => `@` + directive.name + printArguments(directive.args)
  )
  return printed.length ? ` ` + printed.join(` `) : ``
}

function printFragmentArguments(args: Array<Argument>) {
  const printedArgs = printArguments(args)
  if (!printedArgs.length) {
    return ``
  }
  return ` @arguments${printedArgs}`
}

function printArguments(args: Array<Argument>): string {
  const printed = []
  args.forEach(arg => {
    const printedValue = printValue(arg.value, arg.type)
    if (printedValue != null) {
      printed.push(arg.name + `: ` + printedValue)
    }
  })
  return printed.length ? `(` + printed.join(`, `) + `)` : ``
}

function printValue(value: ArgumentValue, type: ?GraphQLInputType): ?string {
  if (value.kind === `Variable`) {
    return `$${value.variableName}`
  } else if (value.kind === `ObjectValue`) {
    invariant(
      type instanceof GraphQLInputObjectType,
      `RelayPrinter: Need an InputObject type to print objects.`
    )
    const pairs = value.fields
      .map(field => {
        const typeFields = type.getFields()
        const innerValue = printValue(field.value, typeFields[field.name].type)
        return innerValue == null ? null : field.name + `: ` + innerValue
      })
      .filter(Boolean)

    return `{${pairs.join(`, `)}}`
  } else if (value.kind === `ListValue`) {
    invariant(
      type instanceof GraphQLList,
      `RelayPrinter: Need a type in order to print arrays.`
    )
    const innerType = type.ofType
    return `[${value.items.map(i => printValue(i, innerType)).join(`, `)}]`
  } else if (value.value != null) {
    return printLiteral(value.value, type)
  } else {
    return null
  }
}

function printLiteral(value: mixed, type: ?GraphQLInputType): string {
  if (type instanceof GraphQLNonNull) {
    type = type.ofType
  }
  if (type instanceof GraphQLEnumType) {
    invariant(
      typeof value === `string`,
      `RelayPrinter: Expected value of type %s to be a string, got \`%s\`.`,
      type.name,
      value
    )
    return value
  }
  if (Array.isArray(value)) {
    invariant(
      type instanceof GraphQLList,
      `RelayPrinter: Need a type in order to print arrays.`
    )
    const itemType = type.ofType
    return (
      `[` + value.map(item => printLiteral(item, itemType)).join(`, `) + `]`
    )
  } else if (typeof value === `object` && value) {
    const fields = []
    invariant(
      type instanceof GraphQLInputObjectType,
      `RelayPrinter: Need an InputObject type to print objects.`
    )
    const typeFields = type.getFields()
    forEachObject(value, (val, key) => {
      fields.push(key + `: ` + printLiteral(val, typeFields[key].type))
    })
    return `{` + fields.join(`, `) + `}`
  } else {
    return JSON.stringify(value)
  }
}

module.exports = { print }
