const _ = require(`lodash`)

const isMDXLayout = element => element.name && element.name.name === `MDXLayout`
const isLayoutProps = declaration => declaration.id.name === `layoutProps`
const shouldRemoveDeclaration = declaration =>
  isLayoutProps(declaration) || isMDXLayout(declaration)

module.exports = api => {
  const { types: t } = api
  let exportsToMove = []
  return {
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration

        // Ignore "export { Foo as default }" syntax
        if (declaration) {
          path.replaceWith(declaration)
          exportsToMove.push(t.cloneNode(path.node))
          path.remove()
        }
      },
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0]
        if (!declaration) {
          return
        }

        if (shouldRemoveDeclaration(declaration)) {
          path.remove()
        }
      },
      FunctionDeclaration(path) {
        if (path.node.id.name == `MDXContent`) {
          exportsToMove = _.uniqBy(
            exportsToMove,
            e => e.declarations[0].id.name
          )
          exportsToMove.forEach(node =>
            path.get(`body`).unshiftContainer(`body`, node)
          )
        }
      },
      // MDXLayout => div
      JSXElement(path) {
        const { openingElement, closingElement } = path.node

        if (isMDXLayout(openingElement)) {
          openingElement.name = t.JSXIdentifier(`div`)
          openingElement.attributes = []
          closingElement.name = t.JSXIdentifier(`div`)
        }
      },
    },
  }
}
