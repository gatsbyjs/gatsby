import { relative } from "path"
import type { PluginObj, types as BabelTypes, PluginPass } from "@babel/core"
import { ObjectProperty } from "@babel/types"
import { store } from "../../redux"

/**
 * This is a plugin that finds StaticImage components and injects the image props into the component.
 * These props contain the image URLs etc, and were created earlier in the build process
 */

export default function addSlicePlaceholderLocation(
  this: PluginPass,
  {
    types: t,
  }: {
    types: typeof BabelTypes
  }
): PluginObj {
  return {
    name: `babel-plugin-add-slice-placeholder-location`,
    visitor: {
      JSXOpeningElement(nodePath): void {
        if (!nodePath.get(`name`).referencesImport(`gatsby`, `Slice`)) {
          return
        }

        if (this.file.opts.filename) {
          const __renderedBylocationProperties: Array<ObjectProperty> = [
            t.objectProperty(
              t.identifier(`fileName`),
              t.stringLiteral(
                relative(
                  store.getState().program.directory,
                  this.file.opts.filename
                )
              )
            ),
          ]

          if (nodePath.node.loc?.start.line) {
            __renderedBylocationProperties.push(
              t.objectProperty(
                t.identifier(`lineNumber`),
                t.numericLiteral(nodePath.node.loc.start.line)
              )
            )

            if (nodePath.node.loc?.start.column) {
              __renderedBylocationProperties.push(
                t.objectProperty(
                  t.identifier(`columnNumber`),
                  t.numericLiteral(nodePath.node.loc.start.column + 1)
                )
              )
            }

            if (nodePath.node.loc?.end.line) {
              __renderedBylocationProperties.push(
                t.objectProperty(
                  t.identifier(`endLineNumber`),
                  t.numericLiteral(nodePath.node.loc.end.line)
                )
              )

              if (nodePath.node.loc?.end.column) {
                __renderedBylocationProperties.push(
                  t.objectProperty(
                    t.identifier(`endColumnNumber`),
                    t.numericLiteral(nodePath.node.loc.end.column + 1)
                  )
                )
              }
            }
          }

          const newProp = t.jsxAttribute(
            t.jsxIdentifier(`__renderedBylocation`),
            t.jsxExpressionContainer(
              t.objectExpression(__renderedBylocationProperties)
            )
          )

          nodePath.node.attributes.push(newProp)
        }
      },
    },
  }
}
