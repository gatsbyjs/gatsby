const PLUGIN_NAME = `key-value-cache/no-changes/gatsby-cache`
const plugins = [PLUGIN_NAME]

const config = [
  {
    runs: [1, 2],
    plugins,
  },
]

const persistedKeyValueStoreTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
}) => {
  // plugin had something in disk cache after first run
  expect(postBuildStateFromFirstRun[PLUGIN_NAME].length).toEqual(1)

  if (process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION) {
    // cache was preserved as plugin didn't change
    expect(postBuildStateFromFirstRun).toEqual(preBootstrapStateFromSecondRun)
  }

  // finally, end result is the same
  expect(postBuildStateFromFirstRun).toEqual(postBuildStateFromSecondRun)
}

module.exports = {
  config,
  plugins,
  persistedKeyValueStoreTest,
}
