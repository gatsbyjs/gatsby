const fs = require(`fs`)
const v8 = require(`v8`)

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

exports.onPostBuild = ({ store }) => {
  const state = store.getState()
  fs.writeFileSync(`./on_post_build`, v8.serialize(state.nodes))
}
