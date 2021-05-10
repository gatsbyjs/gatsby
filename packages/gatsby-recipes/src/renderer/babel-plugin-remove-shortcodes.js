const isShortcode = declaration =>
  declaration.init?.callee?.name === `makeShortcode`
const isShortcodeFunction = declaration =>
  declaration.id.name === `makeShortcode`
const isMDXLayout = element => element.name && element.name.name === `MDXLayout`
const isMDXContent = declaration => declaration.id.name === `MDXContent`
const isLayoutProps = declaration => declaration.id.name === `layoutProps`
const isMDXContentStaticProperty = node => {
  if (node.object.name !== `MDXContent`) {
    return false
  }

  return node.property.name === `isMDXComponent`
}

const shouldRemoveDeclaration = declaration =>
  isShortcode(declaration) ||
  isShortcodeFunction(declaration) ||
  isMDXLayout(declaration) ||
  isLayoutProps(declaration)

export default function babelPluginRemoveShortcodes(api) {
  const { types: t } = api

  return {
    visitor: {
      // Remove unneeded variables that MDX outputs but we won't use
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0]
        if (!declaration) {
          return
        }

        if (shouldRemoveDeclaration(declaration)) {
          path.remove()
        }
      },

      // Unwrap the MDXContent component instantiation because we will
      // evaluate the function directly. This ensures that React properly
      // handles rendering by not re-mounting the component every render.
      FunctionDeclaration(path) {
        if (!isMDXContent(path.node)) {
          return
        }

        // path.traverse({
        // ReturnStatement(innerPath) {
        // path.replaceWith(innerPath.node)
        // },
        // })
      },

      // MDXLayout => doc
      JSXElement(path) {
        const { openingElement, closingElement } = path.node

        if (isMDXLayout(openingElement)) {
          openingElement.name = t.JSXIdentifier(`doc`)
          openingElement.attributes = []
          closingElement.name = t.JSXIdentifier(`doc`)
        }
      },

      // Remove the MDXContent.isMDXContent = true declaration since
      // we've removed MDXContent entirely
      MemberExpression(path) {
        if (isMDXContentStaticProperty(path.node)) {
          path.parentPath.remove()
        }
      },
    },
  }
}
