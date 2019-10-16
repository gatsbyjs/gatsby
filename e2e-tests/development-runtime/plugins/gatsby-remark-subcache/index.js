const visit = require(`unist-util-visit`)
const { id } = require(`./constants`)

module.exports = function remarkPlugin({ cache, markdownAST }) {
  const promises = []

  visit(markdownAST, `html`, node => {
    promises.push(
      (async () => {
        if (node.value.match(id)) {
          const value = await cache.get(id)
          node.value = node.value.replace(/%SUBCACHE_VALUE%/, value)
        }
      })()
    )
  })

  return Promise.all(promises)
}
