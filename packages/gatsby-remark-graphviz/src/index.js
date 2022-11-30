const visit = require(`unist-util-visit`)
const Viz = require(`viz.js`)
const { Module, render } = require(`viz.js/full.render.js`)
const cheerio = require(`cheerio`)

const viz = new Viz({ Module, render })

const validLanguages = [`dot`, `circo`]

module.exports = async ({ markdownAST }, pluginOptions = {}) => {
  const codeNodes = []

  visit(markdownAST, `code`, node => {
    console.log({ lang: node.lang, meta: node.meta })
    // Only act on languages supported by graphviz
    if (validLanguages.includes(node.lang)) {
      codeNodes.push({ node, attrString: node.meta })
    }
    return node
  })

  await Promise.all(
    codeNodes.map(async ({ node, attrString }) => {
      const { value, lang } = node

      try {
        // Perform actual render
        const svgString = await viz.renderString(value, { engine: lang })

        // Add default inline styling
        const $ = cheerio.load(svgString)
        $(`svg`).attr(`style`, `max-width: 100%; height: auto;`)

        // Merge custom attributes if provided by user (adds and overwrites)
        if (attrString) {
          const attrElement = cheerio.load(`<element ${attrString}></element>`)
          $(`svg`).attr(attrElement(`element`).attr())
        }

        // Mutate the current node. Converting from a code block to
        // HTML (with svg content)
        node.type = `html`
        node.value = $.html(`svg`)
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
