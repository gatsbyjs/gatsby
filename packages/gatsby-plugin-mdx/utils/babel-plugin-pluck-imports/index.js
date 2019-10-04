const declare = require(`@babel/helper-plugin-utils`).declare

module.exports = class Plugin {
  constructor() {
    const imports = []
    const identifiers = []
    this.state = { imports: imports, identifiers: identifiers }
    this.plugin = declare(api => {
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
