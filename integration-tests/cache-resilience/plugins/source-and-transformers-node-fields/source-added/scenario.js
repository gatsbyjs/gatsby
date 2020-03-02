const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/source-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/source-added/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Transformer plugin in first run. Both plugins in second run.
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
    // there was no nodes, so nothing changed
    expect(diff.dirtyIds).toEqual([])
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )
    // expect new node to be created
    expect(diff.dirtyIds).toEqual([`parent_parentAdditionForFields`])
    // expect node to have field set by transformer
    expect(diff.additions[`parent_parentAdditionForFields`]).toHaveProperty(
      `fields.foo`,
      `bar`
    )
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
