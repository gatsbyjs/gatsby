const fs = require(`fs`)
const v8 = require(`v8`)

const db = require(`gatsby/dist/db`)

exports.sourceNodes = ({ actions }) => {
  const { createNode } = actions
  createNode({
    id: `TEST_NODE`,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  })
}

exports.onPreBootstrap = ({ store }) => {
  const state = store.getState()
  fs.writeFileSync(`./on_pre_bootstrap`, v8.serialize(state.nodes))
}

exports.onPostBootstrap = async ({ store }) => {
  const state = store.getState()
  fs.writeFileSync(`./on_post_bootstrap`, v8.serialize(state.nodes))
  await db.saveState()
  process.exit()
}
// Placeholder comment for invalidation// Placeholder comment for invalidation// Placeholder comment for invalidation
// Placeholder comment for invalidation// Placeholder comment for invalidation// Placeholder comment for invalidation// Placeholder comment for invalidation// Placeholder comment for invalidation// Placeholder comment for invalidation
