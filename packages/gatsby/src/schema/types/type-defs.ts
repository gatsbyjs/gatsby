import { parse, Kind as GraphQLASTNodeKind, DocumentNode } from "graphql"
import { isGatsbyType } from "./type-builders"
const { inferExtensionName, dontInferExtensionName } = require(`../extensions`)
const report = require(`gatsby-cli/lib/reporter`)

export const isASTDocument = (typeOrTypeDef): boolean =>
  typeof typeOrTypeDef === `object` &&
  typeOrTypeDef.kind &&
  GraphQLASTNodeKind.DOCUMENT === typeOrTypeDef.kind

export const reportParsingError = (error): void => {
  const { message, source, locations } = error

  if (source && locations && locations.length) {
    const { codeFrameColumns } = require(`@babel/code-frame`)

    const frame = codeFrameColumns(
      source.body,
      { start: locations[0] },
      { linesAbove: 5, linesBelow: 5 }
    )
    report.panic(
      `Encountered an error parsing the provided GraphQL type definitions:\n` +
        message +
        `\n\n` +
        frame +
        `\n`
    )
  } else {
    throw error
  }
}

/**
 * Parses type definition represented as an SDL string into an AST Document.
 * Type definitions of other formats (other than SDL) are returned as is
 */
export const parseTypeDef = <T>(typeOrTypeDef: T): DocumentNode | T => {
  if (typeof typeOrTypeDef === `string`) {
    try {
      return parse(typeOrTypeDef)
    } catch (error) {
      reportParsingError(error)
    }
  }
  return typeOrTypeDef
}

/**
 * Given a type definition, collects type names that should skip the inference process
 */
export const typesWithoutInference = <T>(
  typeNames: Array<T> = [],
  typeOrTypeDef: DocumentNode
): Array<T> => {
  if (typeof typeOrTypeDef === `string`) {
    typeOrTypeDef = parseTypeDef(typeOrTypeDef)
  }
  if (isASTDocument(typeOrTypeDef)) {
    typeOrTypeDef.definitions.forEach(def => {
      if (!(`directives` in def)) return
      if (`directives` in def && def.directives) {
        def.directives.forEach(directive => {
          if (directive.name.value === dontInferExtensionName) {
            const noDefaultResolversArg = (directive.arguments || []).find(
              arg => arg.name.value === `noDefaultResolvers`
            )
            const shouldAddDefaultResolver =
              noDefaultResolversArg &&
              noDefaultResolversArg.value &&
              noDefaultResolversArg.value[`value`] === false

            if (!shouldAddDefaultResolver && def[`name`].value) {
              typeNames.push(def[`name`].value)
            }
          }
        })
      }
    })
    return typeNames
  }
  if (isGatsbyType(typeOrTypeDef) && typeOrTypeDef[`config`]) {
    const { extensions = {}, name } = typeOrTypeDef[`config`]
    if (
      name &&
      (extensions[dontInferExtensionName] ||
        extensions[inferExtensionName] === false)
    ) {
      if (!extensions.addDefaultResolvers) {
        typeNames.push(name)
      }
    }
  }
  return typeNames
}
