const isShortcode = declaration =>
  declaration.init.callee && declaration.init.callee.name === `makeShortcode`
const isShortcodeFunction = declaration =>
  (declaration.id.name = `makeShortcode`)
const isMDXLayout = declaration => declaration.id.name === `MDXLayout`
const isLayoutProps = declaration => declaration.id.name === `layoutProps`

const shouldRemoveDeclaration = declaration =>
  isShortcode(declaration) ||
  isShortcodeFunction(declaration) ||
  isMDXLayout(declaration) ||
  isLayoutProps(declaration)

export default api => {
  const { types: t } = api

  return {
    visitor: {
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0]
        if (!declaration) {
          return
        }

        if (shouldRemoveDeclaration(declaration)) {
          path.remove()
        }
      },

      JSXElement(path) {
        const { openingElement, closingElement } = path.node
        if (openingElement.name.name === `MDXLayout`) {
          openingElement.name = t.JSXIdentifier(`doc`)
          openingElement.attributes = []
          closingElement.name = t.JSXIdentifier(`doc`)
        }
      },
    },
  }
}
