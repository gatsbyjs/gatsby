import traverse from "@babel/traverse"
import { NodePath } from "@babel/core"
import { JSXOpeningElement } from "@babel/types"
import { parse, ParserOptions } from "@babel/parser"
import babel from "@babel/core"
import { slash } from "gatsby-core-utils"
import { evaluateImageAttributes, hashOptions } from "../babel-helpers"
import { IStaticImageProps } from "../components/static-image.server"

const PARSER_OPTIONS: ParserOptions = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  sourceType: `unambiguous`,
  plugins: [
    `jsx`,
    `flow`,
    `doExpressions`,
    `objectRestSpread`,
    [
      `decorators`,
      {
        decoratorsBeforeExport: true,
      },
    ],
    `classProperties`,
    `classPrivateProperties`,
    `classPrivateMethods`,
    `exportDefaultFrom`,
    `exportNamespaceFrom`,
    `asyncGenerators`,
    `functionBind`,
    `functionSent`,
    `dynamicImport`,
    `numericSeparator`,
    `optionalChaining`,
    `importMeta`,
    `bigInt`,
    `optionalCatchBinding`,
    `throwExpressions`,
    [
      `pipelineOperator`,
      {
        proposal: `minimal`,
      },
    ],
    `nullishCoalescingOperator`,
  ],
}

export function getBabelParserOptions(filePath: string): ParserOptions {
  // Flow and TypeScript plugins can't be enabled simultaneously
  if (/\.tsx?/.test(filePath)) {
    const { plugins } = PARSER_OPTIONS
    return {
      ...PARSER_OPTIONS,
      plugins: (plugins || []).map(plugin =>
        plugin === `flow` ? `typescript` : plugin
      ),
    }
  }
  return PARSER_OPTIONS
}

export function babelParseToAst(
  contents: string,
  filePath: string
): babel.types.File {
  return parse(contents, getBabelParserOptions(filePath))
}

/**
 * Traverses the parsed source, looking for StaticImage components.
 * Extracts and returns the props from any that are found
 */
export const extractStaticImageProps = (
  ast: babel.types.File,
  filename: string,
  onError?: (prop: string, nodePath: NodePath) => void
): Map<string, IStaticImageProps> => {
  const images: Map<string, IStaticImageProps> = new Map()

  traverse(ast, {
    JSXOpeningElement(nodePath) {
      // Is this a StaticImage?
      if (
        !nodePath
          .get(`name`)
          .referencesImport(`gatsby-plugin-image`, `StaticImage`)
      ) {
        return
      }
      const image = evaluateImageAttributes(
        // There's a conflict between the definition of NodePath in @babel/core and @babel/traverse
        nodePath as unknown as NodePath<JSXOpeningElement>,
        onError
      ) as unknown as IStaticImageProps
      // When the image props are the same for multiple StaticImage but they are in different locations
      // the hash will be the same then. We need to make sure that the hash is unique.
      // The filename should already be normalized but better safe than sorry.
      image.filename = slash(filename)

      images.set(hashOptions(image), image)
    },
  })
  return images
}
