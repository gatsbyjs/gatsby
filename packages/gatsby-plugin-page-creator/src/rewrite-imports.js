// This changes relative imports for collection pages since we put the built
// code into ./cache/collection-components
const path = require(`path`)

// absolutePath is something like `/Users/user/gatsby-site/src/pages/products/[id].js`
// an example of a relative import path inside of these files to a component might be something like:
// `../../components/product.js`
//
// Since our collection pages are placed in `gatsby-site/.cache/collection-components`, this changes the imports
// to be `../../src/components/product.js`
exports.rewriteImports = function rewriteImports(
  root,
  absolutePath,
  importDeclaration
) {
  const importPath = importDeclaration.node.source.value

  if (importPath.startsWith(`.`)) {
    const pathInsideSrc = path
      .relative(absolutePath, importPath)
      .replace(/\.+\//g, ``)

    const prefix = absolutePath.split(root)[1].split(`src/pages`)[0]

    importDeclaration.node.source.value = path.join(
      `../../`,
      prefix,
      `src`,
      pathInsideSrc
    )
  }
}
