const visit = require(`unist-util-visit`)
const flowchart = require(`mermaid/src/diagrams/flowchart/flowRenderer`)
const _ = require(`lodash`)

module.exports = ({ markdownAST }, pluginOptions = {}) =>
  visit(markdownAST, `code`, node => {
    if (node.lang === `flowchart`) {
      // this doesn't work as it is expecting "document" and running within the context of the DOM
      let diagram = flowchart.draw(node.value, 'flowchart', true)
      console.log(diagram)
      // node.value = diagram
    }
  })
