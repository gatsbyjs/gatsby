const visit = require(`unist-util-visit`)

module.exports = ({ markdownAST }) => {
  let bump = false

  visit(markdownAST, `heading`, node => {
    if (node.depth === 1) {
      bump = true
    }
  })

  if (bump) {
    visit(markdownAST, `heading`, node => {
      if (node.depth < 6) {
        node.depth += 1
      }
    })
  }

  return markdownAST
}
