import * as types from "@babel/types"
import { PluginObj } from "@babel/core"
import { hashOptions, parseAttributes } from "./utils"
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
  const componentImport = `StaticImage`
  let localName = componentImport

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
      ImportSpecifier(nodePath): void {
        if (nodePath.node.imported.name === componentImport) {
          localName = nodePath.node.local.name
        }
      },
      JSXOpeningElement(nodePath): void {
        const { name } = nodePath.node
        if (name.type === `JSXMemberExpression` || name.name !== localName) {
          return
        }

        const props = parseAttributes(nodePath.node.attributes)

        const hash = hashOptions(props)

        const cacheDir = (this.opts as any)?.cacheDir

        if (!cacheDir || !hash) {
          console.warn(`Couldn't file cache file for some reason`)
        }

        const filename = path.join(cacheDir, `${hash}.json`)

        const data = fs.readJSONSync(filename)

        if (!data) {
          console.warn(`No image data found for file ${props.src}`)
        }

        const expressions = Object.entries(data).map(generateProperties)

        const newProp = t.jsxAttribute(
          t.jsxIdentifier(`parsedValues`),

          t.jsxExpressionContainer(t.objectExpression(expressions))
        )

        nodePath.node.attributes.push(newProp)

        console.log(nodePath.node.attributes)
      },
    },
  }
}
