const declare = require(`@babel/helper-plugin-utils`).declare
const syspath = require(`path`)

module.exports = class Plugin {
  constructor() {
    const importSpecs = []
    const imports = []
    const identifiers = []
    this.state = { imports: imports, identifiers: identifiers, importSpecs }
    this.plugin = declare((api, options) => {
      api.assertVersion(7)

      return {
        visitor: {
          ImportDeclaration(path) {
            path.traverse({
              Identifier(path) {
                // only take local bindings
                if (path.key === `local`) {
                  identifiers.push(path.node.name)
                }
              },
            })

            if (process.env.GATSBY_EXPERIMENTAL_QUERY_MODULES) {
              let source = path.node.source.value
              if (options.mdxFileDirectory) {
                if (source.startsWith(`.`)) {
                  // convert relative path to absolute one
                  source = syspath.resolve(options.mdxFileDirectory, source)
                }
              }

              // handle relative paths ideally here to avoid extra babel parsing and traversal later
              path.node.specifiers.forEach(specifier => {
                if (specifier.type === `ImportDefaultSpecifier`) {
                  importSpecs.push({
                    source,
                    type: `default`,
                    local: specifier.local.name,
                  })
                } else if (specifier.type === `ImportNamespaceSpecifier`) {
                  importSpecs.push({
                    source,
                    type: `namespace`,
                    local: specifier.local.name,
                  })
                } else if (specifier.type === `ImportSpecifier`) {
                  importSpecs.push({
                    source,
                    type: `named`,
                    importName: specifier.imported.name,
                    local: specifier.local.name,
                  })
                }
              })
            }

            //            const name = path.get("declaration.declarations.0").node.id.name;

            const importString = path.hub.file.code.slice(
              path.node.start,
              path.node.end
            )
            imports.push(importString)
            path.remove()
          },
        },
      }
    })
  }
}
