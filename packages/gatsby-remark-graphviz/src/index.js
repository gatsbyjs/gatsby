const visit = require(`unist-util-visit`)
const Viz = require(`viz.js`)
const { Module, render } = require(`viz.js/full.render.js`)

const validLanguages = [`dot`, `circo`]

module.exports = async ({ markdownAST }, pluginOptions = {}) =>
  new Promise((resolve, reject) => {
    visit(markdownAST, `code`, node => {
      const { lang, value } = node

      // If this codeblock is not a known graphviz format, bail.
      if (!validLanguages.includes(lang)) {
        return node
      }

      const viz = new Viz({ Module, render })

      viz
        .renderString(value, { engine: lang })
        .then(svgString => {
          node.type = `html`
          node.value = svgString
          resolve(markdownAST)
        })
        .catch(error => {
          console.log(error)
          reject()
        })

      return null
    })
  })
