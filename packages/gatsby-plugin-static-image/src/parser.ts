import traverse from "@babel/traverse"
import { hashOptions, evaluateImageAttributes } from "./utils"
import { NodePath } from "@babel/core"
import { JSXOpeningElement } from "@babel/types"

export const extractStaticImageProps = (
  ast: babel.types.File
): Map<string, Record<string, unknown>> => {
  const images: Map<string, Record<string, unknown>> = new Map()

  traverse(ast, {
    JSXOpeningElement(nodePath) {
      if (
        !nodePath
          .get(`name`)
          .referencesImport(`gatsby-plugin-static-image`, `StaticImage`)
      ) {
        return
      }
      const image = evaluateImageAttributes(
        // There's a conflict between the definition of NodePath in @babel/core and @babel/traverse
        (nodePath as unknown) as NodePath<JSXOpeningElement>
      )
      images.set(hashOptions(image), image)
    },
  })
  return images
}
