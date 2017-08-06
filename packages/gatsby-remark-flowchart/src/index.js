const visit = require(`unist-util-visit`)
// const mermaid = require(`mermaid`)
const _ = require(`lodash`)

module.exports = ({ markdownAST }, pluginOptions = {}) =>
  visit(markdownAST, `code`, node => {
    if (node.lang === `flowchart`) {
      console.log('flowchart', node)
      // let diagram = mermaidAPI.render('graphDiv', node.value, (svgCode, bindFunctions) => {
      //   node.value = svgCode
      // })
    }
  })
