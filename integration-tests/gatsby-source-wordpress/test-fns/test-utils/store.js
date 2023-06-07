const {
  createStore,
  asyncLocalStorage,
} = require("gatsby-source-wordpress/dist/store")

const store = { store: createStore(), key: `test` }

exports.withGlobalStore = fn => () => asyncLocalStorage.run(store, fn)
