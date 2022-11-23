import { declare } from "@babel/helper-plugin-utils"
import babel from "@babel/standalone"

class BabelPluginExtractImportNames {
  constructor() {
    const names = {}
    this.state = names

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ImportDeclaration(path) {
            const source = path.node.source.value
            path.traverse({
              Identifier(path) {
                if (path.key === `local`) {
                  names[path.node.name] = source
                }
              },
            })
          },
        },
      }
    })
  }
}

export default function ExtractImport(src) {
  try {
    const plugin = new BabelPluginExtractImportNames()
    babel.transform(src, {
      configFile: false,
      plugins: [plugin.plugin],
    })
    return plugin.state
  } catch (e) {
    console.log(e)
    return {}
  }
}

export { BabelPluginExtractImportNames }
