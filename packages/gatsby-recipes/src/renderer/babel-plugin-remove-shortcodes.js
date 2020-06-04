const isShortcode = declaration =>
  declaration.init.callee && declaration.init.callee.name === `makeShortcode`

const isMDXWrapper = declaration => declaration.id.name === `MDXLayout`

export default () => {
  return {
    visitor: {
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0]
        if (!declaration) {
          return
        }

        if (isShortcode(declaration)) {
          path.remove()
        } else if (isMDXWrapper(declaration)) {
          path.remove()
        }
      },
    },
  }
}
