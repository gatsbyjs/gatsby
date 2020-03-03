const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/source-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/source-added/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Only transformer plugin in first run. Both plugins in second run
const config = [
  {
    runs: [1],
    plugins: [TRANSFORMER_PLUGIN_NAME],
  },
  {
    runs: [2],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_parentAdditionForTransformer`,
      `parent_parentAdditionForTransformer >>> Child`,
    ])

    expect(diff.additions[`parent_parentAdditionForTransformer`]).toBeTruthy()
    expect(
      diff.additions[`parent_parentAdditionForTransformer >>> Child`]
    ).toBeTruthy()
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
