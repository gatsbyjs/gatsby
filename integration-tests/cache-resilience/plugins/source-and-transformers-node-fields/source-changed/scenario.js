const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/source-changed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/source-changed/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Both plugins in both runs. Source plugin changes after first run.
const config = [
  {
    runs: [1, 2],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  if (process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION) {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`parent_parentChangeForFields`])

    expect(diff.deletions[`parent_parentChangeForFields`]).toBeTruthy()
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`parent_parentChangeForFields`])

    expect(diff.changes[`parent_parentChangeForFields`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
      +   \\"bar\\": \\"run-2\\",
          \\"children\\": Array [],
          \\"fields\\": Object {
      -     \\"bar\\": undefined,
      -     \\"foo\\": \\"run-1\\",
      +     \\"bar\\": \\"run-2\\",
      +     \\"foo\\": undefined,
          },
      -   \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_parentChangeForFields\\",
          \\"internal\\": Object {
      -     \\"contentDigest\\": \\"e88540d53597617cf99d612601037013\\",
      +     \\"contentDigest\\": \\"3b78e62e87d3f1d8e92d274aa8dbe548\\",
            \\"fieldOwners\\": Object {
              \\"bar\\": \\"source-and-transformers-node-fields/source-changed/gatsby-transformer\\",
              \\"foo\\": \\"source-and-transformers-node-fields/source-changed/gatsby-transformer\\",
            },
            \\"owner\\": \\"source-and-transformers-node-fields/source-changed/gatsby-source\\",
            \\"type\\": \\"Parent_ParentChangeForFields\\",
          },
          \\"parent\\": null,
        }"
    `)
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
