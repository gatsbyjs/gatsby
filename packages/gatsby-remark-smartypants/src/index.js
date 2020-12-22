const visit = require(`unist-util-visit`)
const { runTask } = require(`gatsby/dist/worker-api`)

module.exports = async ({ markdownAST }, pluginOptions = {}) => {
  const nodes = []
  // Collect nodes.
  visit(markdownAST, `text`, async node => {
    nodes.push(node)
  })

  // Process in workers.
  const timeLabel = `runTask — nodes count ${nodes.length} ${Math.random()}`
  console.time(timeLabel)
  await Promise.all(
    nodes.map(async node => {
      const result = await runTask(
        ({ pluginOptions, value }) => {
          const retext = require(`retext`)
          const smartypants = require(`retext-smartypants`)
          return retext().use(smartypants, pluginOptions).processSync(value)
        },
        { pluginOptions, value: node.value }
      )
      node.value = String(result.contents)
    })
  )
  console.timeEnd(timeLabel)

  return markdownAST
}
