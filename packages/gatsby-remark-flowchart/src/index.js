const visit = require(`unist-util-visit`)
console.log(___dirname)
const flowchart = require(`flowchart.js/index.js`)
const _ = require(`lodash`)

module.exports = ({ markdownAST }, pluginOptions = {}) =>
  visit(markdownAST, `code`, node => {
    if (node.lang === `flowchart`) {
      console.log('flowchart', node)
      let diagram = flowchart.parse(node.value)
      node.value = diagram.drawSVG('diagram')
    }
    // const processedText = String(
    //   retext().use(smartypants, pluginOptions).process(node.value)
    // )
    // node.value = processedText
  })
