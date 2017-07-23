const visit = require(`unist-util-visit`)
const raphael = require(`raphael`)
const flowchart = require(`./flowchart.js`)
const _ = require(`lodash`)

module.exports = ({ markdownAST }, pluginOptions = {}) =>
  visit(markdownAST, `code`, node => {
    if (node.lang === `flowchart`) {
      console.log('flowchart', node)
      let diagram = flowchart.parse(node.value)
      node.value = diagram.drawSVG('diagram')
    }
  })
