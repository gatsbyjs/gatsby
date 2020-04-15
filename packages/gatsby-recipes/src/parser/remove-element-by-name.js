const babel = require(`@babel/standalone`)
const jsxSyntax = require(`@babel/plugin-syntax-jsx`)

const BabelPluginRemoveElementByName = (api, { names }) => {
  return {
    visitor: {
      JSXElement(path) {
        if (names.includes(path.node.openingElement.name.name)) {
          path.remove()
        }
      },
    },
  }
}

module.exports = (src, options) => {
  try {
    const { code } = babel.transform(`<>${src}</>`, {
      configFile: false,
      plugins: [[BabelPluginRemoveElementByName, options], jsxSyntax],
    })

    return code.replace(/^<>/, ``).replace(/<\/>;$/, ``)
  } catch (e) {
    console.log(e)
  }

  return null
}

module.exports.BabelPluginRemoveElementByName = BabelPluginRemoveElementByName
