const { transform } = require(`@babel/standalone`)
const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)
const visit = require(`unist-util-visit`)

const { u } = require(`.`)

const validateJsx = () => tree => {
  visit(tree, `jsx`, node => {
    try {
      transform(`<>${node.value}<>`, {
        plugins: [babelPluginTransformReactJsx],
      })
    } catch (e) {
      e.syntaxError = {
        errorType: `parse`,
        errorDescription: `Unable to parse JSX`,
        line: node.position.start.line + e.loc.line - 1,
        trace: e.toString(),
      }

      throw e
    }

    return undefined
  })
}

module.exports = mdx => {
  try {
    u.use(validateJsx).processSync(mdx)
  } catch (e) {
    return e.syntaxError
  }

  return undefined
}
