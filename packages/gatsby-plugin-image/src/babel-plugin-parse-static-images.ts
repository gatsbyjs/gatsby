import * as types from "@babel/types"
import { PluginObj } from "@babel/core"
import { hashOptions, evaluateImageAttributes } from "./babel-helpers"
import fs from "fs-extra"
import path from "path"
import { slash } from "gatsby-core-utils"

import template from "@babel/template"

/**
 * This is a plugin that finds StaticImage components and injects the image props into the component.
 * These props contain the image URLs etc, and were created earlier in the build process
 */

export default function attrs({
  types: t,
}: {
  types: typeof types
}): PluginObj {
  return {
    visitor: {
      JSXOpeningElement(nodePath): void {
        if (
          !nodePath
            .get(`name`)
            .referencesImport(`gatsby-plugin-image`, `StaticImage`)
        ) {
          return
        }

        const unresolvedProps: Array<string> = []

        const props = evaluateImageAttributes(nodePath, prop => {
          unresolvedProps.push(prop)
        })

        let error

        if (unresolvedProps.length) {
          // TODO: Add a shortlink to docs on the plugin
          error = `Could not find values for the following props at build time: ${unresolvedProps.join(
            `, `
          )}`
          console.warn(`[gatsby-plugin-image] ${error}`)
        }

        const hash = hashOptions(props)

        const cacheDir = (this.opts as Record<string, string>)?.cacheDir

        if (!cacheDir) {
          console.warn(
            `[gatsby-plugin-image] Couldn't find image data cache file`
          )
        }

        const filename = path.join(cacheDir, `${hash}.json`)
        let data: Record<string, unknown> | undefined

        // If there's no src prop there's no point in checking if it exists
        if (!unresolvedProps.includes(`src`)) {
          try {
            data = fs.readJSONSync(filename)
          } catch (e) {
            // TODO add info about minimum Gatsby version once this is merged
            console.warn(
              `[gatsby-plugin-image] Could not read image data file "${filename}". This may mean that the images in "${this.filename}" were not processed.`
            )
          }
        }

        if (!data) {
          console.warn(
            `[gatsby-plugin-image] No data found for image "${props.src}"`
          )

          // Add the error message to the component so we can show it in the browser
          const newProp = t.jsxAttribute(
            t.jsxIdentifier(`__error`),

            t.jsxExpressionContainer(
              t.stringLiteral(`No data found for image "${props.src}"
              ${error || ``}`)
            )
          )
          nodePath.node.attributes.push(newProp)
          return
        }
        if (error) {
          // Add the error message to the component so we can show it in the browser

          const newProp = t.jsxAttribute(
            t.jsxIdentifier(`__error`),
            t.stringLiteral(error)
          )
          nodePath.node.attributes.push(newProp)
        }

        //  `require()` the image data into a component prop
        const makeRequire = template.expression(`require("${slash(filename)}")`)

        const newProp = t.jsxAttribute(
          t.jsxIdentifier(`__imageData`),

          t.jsxExpressionContainer(makeRequire())
        )

        nodePath.node.attributes.push(newProp)
      },
    },
  }
}
