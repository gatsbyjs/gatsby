const generate = require(`@babel/generator`).default
const declare = require(`@babel/helper-plugin-utils`).declare
const JSON5 = require(`json5`)

module.exports = class Plugin {
  constructor() {
    const exports = {}
    this.state = { exports: exports }
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExportNamedDeclaration(path) {
            const declaration = path.node.declaration

            if (
              declaration &&
              declaration.type === `VariableDeclaration` &&
              declaration.kind === `const`
            ) {
              declaration.declarations.forEach(declarator => {
                try {
                  exports[declarator.id.name] = JSON5.parse(
                    generate(declarator.init).code
                  )
                } catch (e) {
                  // if we can't parse it, don't export it
                }
              })
            }
          },
        },
      }
    })
  }
}
