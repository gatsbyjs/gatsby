const visit = require(`unist-util-visit`)
const Viz = require(`viz.js`)
const { Module, render } = require(`viz.js/full.render.js`)

const viz = new Viz({ Module, render })

const validLanguages = [`dot`, `circo`]

module.exports = async ({ markdownAST }, pluginOptions = {}) => {
  let codeNodes = []

  visit(markdownAST, `code`, node => {
    // Only act on languages supported by graphviz
    if (validLanguages.includes(node.lang)) {
      codeNodes.push(node)
    }
    return node
  })

  await Promise.all(
    codeNodes.map(async node => {
      const { value, lang } = node

      try {
        // Perform actual render
        const svgString = await viz.renderString(value, { engine: lang })

        // Mutate the current node. Converting from a code block to
        // HTML (with svg content)
        node.type = `html`
        node.value = svgString
      } catch (error) {
        console.log(
          `Error during viz.js execution. Leaving code block unchanged`
        )
        console.log(error)
      }

      return node
    })
  )
}
