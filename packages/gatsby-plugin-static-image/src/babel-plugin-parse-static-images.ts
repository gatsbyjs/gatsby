import * as types from "@babel/types"
import { PluginObj } from "@babel/core"
import { hashOptions, evaluateImageAttributes } from "./utils"
import fs from "fs-extra"
import path from "path"
import {
  StringLiteral,
  NumericLiteral,
  BooleanLiteral,
  ArrayExpression,
  TemplateLiteral,
  ObjectProperty,
} from "@babel/types"

type AttrType =
  | StringLiteral
  | NumericLiteral
  | BooleanLiteral
  | ArrayExpression
  | TemplateLiteral

export default function attrs({
  types: t,
}: {
  types: typeof types
}): PluginObj {
  function generateLiterals(val: Array<unknown>): Array<AttrType> {
    return val.map(generateLiteral).filter(Boolean) as Array<AttrType>
  }

  function generateLiteral(
    val
  ):
    | StringLiteral
    | NumericLiteral
    | BooleanLiteral
    | ArrayExpression
    | TemplateLiteral {
    switch (typeof val) {
      case `string`:
        return t.stringLiteral(val)

      case `number`:
        return t.numericLiteral(val)

      case `boolean`:
        return t.booleanLiteral(val)

      case `object`:
        if (Array.isArray(val)) {
          return t.arrayExpression(generateLiterals(val))
        }
    }
    return t.templateLiteral(
      [t.templateElement({ raw: JSON.stringify(val) })],
      []
    )
  }

  function generateProperties([key, val]): ObjectProperty {
    return t.objectProperty(t.stringLiteral(key), generateLiteral(val))
  }

  return {
    visitor: {
      JSXOpeningElement(nodePath): void {
        if (
          !nodePath
            .get(`name`)
            .referencesImport(`gatsby-plugin-static-image`, `StaticImage`)
        ) {
          return
        }

        const errors: Array<string> = []

        const props = evaluateImageAttributes(nodePath, prop => {
          errors.push(prop)
        })

        let error

        if (errors.length) {
          error = `Could not find values for the following props at build time: ${errors.join()}`
          console.warn(error)
        }

        const hash = hashOptions(props)

        const cacheDir = (this.opts as Record<string, string>)?.cacheDir

        if (!cacheDir || !hash) {
          console.warn(`Couldn't find cache file for some reason`)
        }

        const filename = path.join(cacheDir, `${hash}.json`)
        let data: Record<string, unknown> | undefined
        try {
          data = fs.readJSONSync(filename)
        } catch (e) {
          console.warn(`Could not read file ${filename}`, e)
        }

        if (!data) {
          console.warn(`No image data found for file ${props.src}`, error)
          const newProp = t.jsxAttribute(
            t.jsxIdentifier(`__error`),

            t.jsxExpressionContainer(
              t.stringLiteral(`No image data found for file "${props.src}"
              ${error || ``}`)
            )
          )
          nodePath.node.attributes.push(newProp)
          return
        }
        if (error) {
          const newProp = t.jsxAttribute(
            t.jsxIdentifier(`__error`),
            t.stringLiteral(error)
          )
          nodePath.node.attributes.push(newProp)
        }

        const expressions = Object.entries(data).map(generateProperties)

        const newProp = t.jsxAttribute(
          t.jsxIdentifier(`parsedValues`),

          t.jsxExpressionContainer(t.objectExpression(expressions))
        )

        nodePath.node.attributes.push(newProp)
      },
    },
  }
}
