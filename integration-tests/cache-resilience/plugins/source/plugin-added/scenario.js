const SOURCE_PLUGIN_NAME = `source/plugin-added/gatsby-source`
const plugins = [SOURCE_PLUGIN_NAME]

const config = [
  {
    runs: [2],
    plugins,
  },
]

const nodesTest = ({
  preBootstrapStateFromFirstRun,
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // no node were created after first run
  // node is created after first run
  {
    const diff = compareState(
      preBootstrapStateFromFirstRun,
      postBuildStateFromFirstRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // node existed after cache invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  // node was created after second data sourcing
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`ADDITION_NODE_1`])
    expect(diff.additions.ADDITION_NODE_1).toBeTruthy()
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
