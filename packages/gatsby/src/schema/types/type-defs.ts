import { codeFrameColumns } from "@babel/code-frame"
import report from "gatsby-cli/lib/reporter"
import {
  DocumentNode,
  GraphQLError,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLUnionType,
  Kind as GraphQLASTNodeKind,
  parse,
} from "graphql"
import { GatsbyGraphQLType } from "../../schema/types/type-builders"
import { dontInferExtensionName, inferExtensionName } from "../extensions"
import { isGatsbyType } from "./type-builders"

export type TypeOrTypeDef =
  | string
  | GraphQLOutputType
  | GatsbyGraphQLType<any, any>

export function isASTDocument(
  typeOrTypeDef: TypeOrTypeDef | DocumentNode
): typeOrTypeDef is DocumentNode {
  return (
    typeof typeOrTypeDef === `object` &&
    !(typeOrTypeDef instanceof GraphQLScalarType) &&
    !(typeOrTypeDef instanceof GraphQLObjectType) &&
    !(typeOrTypeDef instanceof GraphQLInterfaceType) &&
    !(typeOrTypeDef instanceof GraphQLUnionType) &&
    !(typeOrTypeDef instanceof GraphQLEnumType) &&
    !(typeOrTypeDef instanceof GraphQLList) &&
    !(typeOrTypeDef instanceof GraphQLNonNull) &&
    typeOrTypeDef.kind &&
    GraphQLASTNodeKind.DOCUMENT === typeOrTypeDef.kind
  )
}

/**
 * Parses type definition represented as an SDL string into an AST Document.
 * Type definitions of other formats (other than SDL) are returned as is
 */
export function parseTypeDef<T extends TypeOrTypeDef>(
  typeOrTypeDef: T
): DocumentNode | typeof typeOrTypeDef {
  if (typeof typeOrTypeDef === `string`) {
    try {
      return parse(typeOrTypeDef)
    } catch (error) {
      reportParsingError(error)
    }
  }
  return typeOrTypeDef
}

export function reportParsingError(error: GraphQLError): void {
  const { message, source, locations } = error

  if (source && locations && locations.length) {
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
 * Given a type definition, collects type names that should skip the inference process
 */
export function typesWithoutInference(
  typeNames: Array<string> = [],
  typeOrTypeDef: TypeOrTypeDef | DocumentNode
): typeof typeNames {
  if (typeof typeOrTypeDef === `string`) {
    typeOrTypeDef = parseTypeDef(typeOrTypeDef)
  }
  if (isASTDocument(typeOrTypeDef)) {
    typeOrTypeDef.definitions.forEach(def => {
      if (
        GraphQLASTNodeKind.DIRECTIVE_DEFINITION === def.kind ||
        GraphQLASTNodeKind.SCHEMA_DEFINITION === def.kind ||
        GraphQLASTNodeKind.SCHEMA_EXTENSION === def.kind ||
        !def.directives
      ) {
        return
      }

      def.directives.forEach(directive => {
        if (directive.name.value === dontInferExtensionName) {
          const noDefaultResolversArg = (directive.arguments || []).find(
            arg => arg.name.value === `noDefaultResolvers`
          )
          const shouldAddDefaultResolver =
            noDefaultResolversArg &&
            noDefaultResolversArg.value &&
            GraphQLASTNodeKind.VARIABLE !== noDefaultResolversArg.value.kind &&
            GraphQLASTNodeKind.NULL !== noDefaultResolversArg.value.kind &&
            GraphQLASTNodeKind.LIST !== noDefaultResolversArg.value.kind &&
            GraphQLASTNodeKind.OBJECT !== noDefaultResolversArg.value.kind &&
            noDefaultResolversArg.value.value === false

          if (!shouldAddDefaultResolver && def.name?.value) {
            typeNames.push(def.name.value)
          }
        }
      })
    })
    return typeNames
  }
  if (isGatsbyType(typeOrTypeDef) && typeOrTypeDef.config) {
    const { extensions = {}, name } = typeOrTypeDef.config
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
