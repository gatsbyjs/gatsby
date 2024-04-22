import * as fs from "fs-extra"
import {
  EnumTypeComposer,
  InputTypeComposer,
  InterfaceTypeComposer,
  ObjectTypeComposer,
  ScalarTypeComposer,
  UnionTypeComposer,
  SchemaComposer,
  type NamedTypeComposer,
  type ObjectTypeComposerFieldConfigMap,
  type ObjectTypeComposerFieldConfig,
  type ObjectTypeComposerArgumentConfigMap,
  type ObjectTypeComposerArgumentConfig,
  type Extensions,
  isNamedTypeComposer,
  type EnumTypeComposerValueConfig,
} from "graphql-compose"
import report from "gatsby-cli/lib/reporter"
import {
  GraphQLDirective,
  astFromValue,
  print,
  GraphQLString,
  DEFAULT_DEPRECATION_REASON,
} from "graphql"
import { printBlockString } from "graphql/language/blockString"
import { internalExtensionNames } from "./extensions"
// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash"
import { internalTypeNames } from "./types/built-in-types"

export type ISchemaPrintConfig = {
  path?: string | undefined
  include?:
    | {
        types: Array<string>
        plugins: Array<string>
      }
    | undefined
  exclude?:
    | {
        types: Array<string>
        plugins: Array<string>
      }
    | undefined
  withFieldTypes?: boolean | undefined
  rewrite?: boolean | undefined
}

function breakLine(line: string, maxLen: number): Array<string> {
  const parts = line.split(new RegExp(`((?: |^).{15,${maxLen - 40}}(?= |$))`))
  if (parts.length < 4) {
    return [line]
  }
  const sublines = [parts[0] + parts[1] + parts[2]]
  for (let i = 3; i < parts.length; i += 2) {
    sublines.push(parts[i].slice(1) + parts[i + 1])
  }
  return sublines
}

function descriptionLines(description: string, maxLen: number): Array<string> {
  const rawLines = description.split(`\n`)
  return _.flatMap(rawLines, (line) => {
    if (line.length < maxLen + 5) {
      return line
    }
    // For > 120 character long lines, cut at space boundaries into sublines
    // of ~80 chars.
    return breakLine(line, maxLen)
  })
}

function printBlock(items: Array<string>): string {
  return items.length !== 0 ? ` {\n` + items.join(`\n`) + `\n}` : ``
}

function printDeprecated(
  fieldOrEnumVal:
    | ObjectTypeComposerFieldConfig<unknown, unknown>
    | EnumTypeComposerValueConfig,
): string {
  const reason = fieldOrEnumVal.deprecationReason
  if (!reason) {
    return ``
  }
  const reasonAST = astFromValue(reason, GraphQLString)
  if (reasonAST && reason !== `` && reason !== DEFAULT_DEPRECATION_REASON) {
    return ` @deprecated(reason: ` + print(reasonAST) + `)`
  }
  return ` @deprecated`
}

function printDescription(
  def:
    | ObjectTypeComposerFieldConfig<unknown, unknown>
    | NamedTypeComposer<unknown>
    | ObjectTypeComposerArgumentConfig
    | EnumTypeComposerValueConfig,
  indentation = ``,
  firstInBlock = true,
): string {
  const description = isNamedTypeComposer(def)
    ? def.getDescription()
    : def.description
  if (!description) {
    return ``
  }

  const lines = descriptionLines(description, 120 - indentation.length)

  const text = lines.join(`\n`)
  const isMultiline = text.length > 70
  const blockString = printBlockString(text, { minimize: !isMultiline })
  const prefix = indentation && !firstInBlock ? `\n` + indentation : indentation

  return prefix + blockString.replace(/\n/g, `\n` + indentation) + `\n`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function printDirectiveArgs(args: any, directive: GraphQLDirective): string {
  if (!args || !directive) {
    return ``
  }

  const directiveArgs = Object.entries(args)
  if (directiveArgs.length === 0) {
    return ``
  }

  return (
    `(` +
    directiveArgs
      .map(([name, value]) => {
        const arg =
          directive.args && directive.args.find((arg) => arg.name === name)

        return arg && `${name}: ${print(astFromValue(value, arg.type)!)}`
      })
      .join(`, `) +
    `)`
  )
}

export function printDirectives(
  extensions: Extensions,
  directives: Array<GraphQLDirective>,
): string {
  return Object.entries(extensions)
    .map(([name, args]) => {
      if ([...internalExtensionNames, `deprecated`].includes(name)) return ``
      return (
        ` @${name}` +
        printDirectiveArgs(
          args,
          directives.find((directive) => directive.name === name)!,
        )
      )
    })
    .join(``)
}

function printInputValue([name, inputTC]: [
  string,
  ObjectTypeComposerArgumentConfig,
]): string {
  let argDecl = name + `: ` + inputTC.type.getTypeName()
  if (inputTC.defaultValue) {
    const defaultAST = astFromValue(
      inputTC.defaultValue,
      inputTC.type.getType(),
    )
    if (defaultAST) {
      argDecl += ` = ${print(defaultAST)}`
    }
  }
  return argDecl
}

function printArgs(
  args: ObjectTypeComposerArgumentConfigMap | undefined,
  indentation = ``,
): string {
  if (!args) {
    return ``
  }
  const argsArray = Object.entries(args)
  if (argsArray.length === 0) {
    return ``
  }

  // If all args have no description, print them on one line
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (argsArray.every(([_name, argTC]) => !argTC.description)) {
    return `(` + argsArray.map(printInputValue).join(`, `) + `)`
  }

  return (
    `(\n` +
    argsArray
      .map(
        ([_name, argTC], i) =>
          printDescription(argTC, `  ` + indentation, !i) +
          `  ` +
          indentation +
          printInputValue([_name, argTC]),
      )
      .join(`\n`) +
    `\n` +
    indentation +
    `)`
  )
}

function printFields(
  fields: ObjectTypeComposerFieldConfigMap<unknown, unknown>,
  directives: Array<GraphQLDirective>,
): string {
  const printedFields = Object.entries(fields).map(
    ([fieldName, fieldTC], i) =>
      printDescription(fieldTC, `  `, !i) +
      `  ` +
      fieldName +
      printArgs(fieldTC.args, `  `) +
      `: ` +
      String(fieldTC.type.getTypeName()) +
      printDirectives(fieldTC.extensions || {}, directives) +
      printDeprecated(fieldTC),
  )
  return printBlock(printedFields)
}

function printScalarType(tc: ScalarTypeComposer): string {
  return printDescription(tc) + `scalar ${tc.getTypeName()}`
}

function printObjectType(tc: ObjectTypeComposer<unknown>): string {
  const interfaces = tc.getInterfaces()
  const implementedInterfaces = interfaces.length
    ? ` implements ` + interfaces.map((i) => i.getTypeName()).join(` & `)
    : ``
  const extensions = tc.getExtensions()
  let fields = tc.getFields()
  if (tc.hasInterface(`Node`)) {
    extensions.dontInfer = null
    fields = _.omit(fields, [`id`, `parent`, `children`, `internal`])
  }
  const directives = tc.schemaComposer.getDirectives()
  const printedDirectives = printDirectives(extensions, directives)

  return (
    printDescription(tc) +
    `type ${tc.getTypeName()}${implementedInterfaces}${printedDirectives}` +
    printFields(fields, directives)
  )
}

function printInterfaceType(tc: InterfaceTypeComposer<unknown>): string {
  const interfaces = tc.getInterfaces()
  const implementedInterfaces = interfaces.length
    ? ` implements ` + interfaces.map((i) => i.getTypeName()).join(` & `)
    : ``
  const extensions = tc.getExtensions()
  const directives = tc.schemaComposer.getDirectives()
  const printedDirectives = printDirectives(extensions, directives)
  return (
    printDescription(tc) +
    `interface ${tc.getTypeName()}${implementedInterfaces}${printedDirectives}` +
    printFields(tc.getFields(), directives)
  )
}

function printUnionType(tc: UnionTypeComposer): string {
  const types = tc.getTypeNames()
  const possibleTypes = types.length ? ` = ` + types.join(` | `) : ``
  return printDescription(tc) + `union ` + tc.getTypeName() + possibleTypes
}

function printEnumType(tc: EnumTypeComposer): string {
  const values = Object.entries(tc.getFields()).map(
    ([name, valueTC], i) =>
      printDescription(valueTC, `  `, !i) +
      `  ` +
      name +
      printDeprecated(valueTC),
  )

  return printDescription(tc) + `enum ${tc.getTypeName()}` + printBlock(values)
}

function printInputObjectType(tc: InputTypeComposer): string {
  const fields = Object.entries(tc.getFields()).map(
    ([fieldName, fieldTC], i) =>
      printDescription(fieldTC, `  `, !i) +
      `  ` +
      printInputValue([fieldName, fieldTC]),
  )

  return printDescription(tc) + `input ${tc.getTypeName()}` + printBlock(fields)
}

function printType(tc: NamedTypeComposer<unknown>): string {
  if (tc instanceof ObjectTypeComposer) {
    return printObjectType(tc)
  } else if (tc instanceof InterfaceTypeComposer) {
    return printInterfaceType(tc)
  } else if (tc instanceof UnionTypeComposer) {
    return printUnionType(tc)
  } else if (tc instanceof EnumTypeComposer) {
    return printEnumType(tc)
  } else if (tc instanceof ScalarTypeComposer) {
    return printScalarType(tc)
  } else if (tc instanceof InputTypeComposer) {
    return printInputObjectType(tc)
  }

  return ``
}

export function printTypeDefinitions({
  config,
  schemaComposer,
}: {
  config: ISchemaPrintConfig
  schemaComposer: SchemaComposer
}): Promise<void> {
  if (!config) return Promise.resolve()

  const {
    path,
    include,
    exclude,
    withFieldTypes,
    rewrite = false,
  } = config || {}

  if (!path) {
    report.error(
      `Printing type definitions aborted. Please provide a file path.`,
    )
    return Promise.resolve()
  }

  if (!rewrite && fs.existsSync(path)) {
    report.error(
      `Printing type definitions aborted. The file \`${path}\` already exists.`,
    )
    return Promise.resolve()
  }
  const internalPlugins = [`internal-data-bridge`]

  const typesToExclude = exclude?.types || []
  const pluginsToExclude = exclude?.plugins || []

  function getName(tc: NamedTypeComposer<unknown>): string {
    return tc.getTypeName()
  }

  function isInternalType(tc: NamedTypeComposer<unknown>): boolean {
    const typeName = getName(tc)
    if (internalTypeNames.includes(typeName)) {
      return true
    }

    const plugin = tc.getExtension(`plugin`)
    if (typeof plugin === `string` && internalPlugins.includes(plugin)) {
      return true
    }

    return false
  }

  function shouldIncludeType(tc: NamedTypeComposer<unknown>): boolean {
    const typeName = getName(tc)
    if (typesToExclude.includes(typeName)) {
      return false
    }
    if (include?.types && !include.types.includes(typeName)) {
      return false
    }

    const plugin = tc.getExtension(`plugin`)
    if (typeof plugin === `string` && pluginsToExclude.includes(plugin)) {
      return false
    }
    if (
      include?.plugins &&
      (!plugin ||
        (typeof plugin === `string` && !include.plugins.includes(plugin)))
    ) {
      return false
    }

    return true
  }

  // Save processed type names, not references to the type composers,
  // because of how graphql-compose, at least in v6, processes
  // inline types
  const processedTypes = new Set<string>()
  const typeDefs = new Set<NamedTypeComposer<unknown>>()

  function addType(
    tc: NamedTypeComposer<unknown>,
  ): null | Set<NamedTypeComposer<unknown>> {
    const typeName = getName(tc)
    if (!processedTypes.has(typeName) && !isInternalType(tc)) {
      processedTypes.add(typeName)
      return typeDefs.add(tc)
    }
    processedTypes.add(typeName)
    return null
  }

  function addWithFieldTypes(tc: NamedTypeComposer<unknown>): void {
    if (
      addType(tc) &&
      (tc instanceof ObjectTypeComposer ||
        tc instanceof InterfaceTypeComposer ||
        tc instanceof InputTypeComposer)
    ) {
      if (tc instanceof ObjectTypeComposer) {
        const interfaces = tc.getInterfaces()
        interfaces.forEach((iface) => {
          const ifaceName = iface.getTypeName()
          if (ifaceName !== `Node`) {
            addWithFieldTypes(schemaComposer.getAnyTC(ifaceName))
          }
        })
      }

      tc.getFieldNames().forEach((fieldName) => {
        const fieldType = tc.getFieldTC(fieldName)
        addWithFieldTypes(fieldType)

        if (!(tc instanceof InputTypeComposer)) {
          const fieldArgs = tc.getFieldArgs(fieldName)
          Object.keys(fieldArgs).forEach((argName) => {
            try {
              addWithFieldTypes(tc.getFieldArgTC(fieldName, argName))
            } catch {
              // this type might not exist yet. If it won't be created by the end
              // of schema creation then building schema will fail and fact that we
              // skip it here won't matter
            }
          })
        }
      })
    }
  }

  schemaComposer.forEach((tc) => {
    if (!isInternalType(tc) && shouldIncludeType(tc)) {
      if (withFieldTypes) {
        addWithFieldTypes(tc)
      } else {
        addType(tc)
      }
    }
  })

  const printedTypeDefs = [
    `### Type definitions saved at ${new Date().toISOString()} ###`,
  ]

  try {
    typeDefs.forEach((tc) => printedTypeDefs.push(printType(tc)))
    report.info(`Writing GraphQL type definitions to ${path}`)
    return fs.writeFile(path, printedTypeDefs.join(`\n\n`))
  } catch (error) {
    report.error(`Failed writing type definitions to \`${path}\`.`, error)
    return Promise.resolve()
  }
}
