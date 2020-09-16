import traverse from "@babel/traverse"
import { parseAttributes, hashOptions } from "./utils"

export const extractStaticImageProps = (
  ast: babel.types.File
): Map<string, Record<string, unknown>> => {
  const componentImport = `StaticImage`
  let localName = componentImport

  const images: Map<string, Record<string, unknown>> = new Map()

  traverse(ast, {
    ImportSpecifier(path) {
      if (path.node.imported.name === componentImport) {
        localName = path.node.local.name
      }
    },
    JSXOpeningElement(path) {
      const { name } = path.node
      if (name.type === `JSXMemberExpression` || name.name !== localName) {
        return
      }
      const image = parseAttributes(path.node.attributes)
      images.set(hashOptions(image), image)
    },
  })
  return images
}
