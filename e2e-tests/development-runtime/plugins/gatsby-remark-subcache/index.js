const visit = require(`unist-util-visit`)
const { id } = require(`./constants`)

module.exports = function remarkPlugin({ cache, markdownAST }) {
  visit(markdownAST, `html`, async node => {
    if (node.value.match(id)) {
      const value = await cache.get(id)
      node.value = node.value.replace(/%SUBCACHE_VALUE%/, value)
    }
  })
}
