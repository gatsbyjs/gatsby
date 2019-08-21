module.exports = function removeExportKeywords() {
  return {
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration

        // Ignore "export { Foo as default }" syntax
        if (declaration) {
          path.replaceWith(declaration)
        }
      },
    },
  }
}
