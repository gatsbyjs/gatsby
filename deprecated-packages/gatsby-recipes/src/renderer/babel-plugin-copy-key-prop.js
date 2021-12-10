export default function babelPluginCopyKeyProp(api) {
  const { types: t } = api

  return {
    visitor: {
      JSXIdentifier(path) {
        if (path.node.name === `key`) {
          const clonePath = t.cloneNode(path.node)
          const cloneParent = t.cloneNode(path.parent)
          clonePath.name = `_key`
          cloneParent.name = clonePath
          path.parentPath.container.push(cloneParent)
        }
      },
    },
  }
}
