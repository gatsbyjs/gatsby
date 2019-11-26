const fs = require(`fs`)
const v8 = require(`v8`)

const db = require(`gatsby/dist/db`)

exports.onPreBootstrap = ({ store }) => {
  const state = store.getState()
  fs.writeFileSync(`./on_pre_bootstrap.state`, v8.serialize(state.nodes))
}

exports.onPostBootstrap = async ({ store }) => {
  const state = store.getState()
  fs.writeFileSync(`./on_post_bootstrap.state`, v8.serialize(state.nodes))

  await db.saveState()

  if (process.env.EXIT_ON_POST_BOOTSTRAP) {
    process.exit()
  }
}
