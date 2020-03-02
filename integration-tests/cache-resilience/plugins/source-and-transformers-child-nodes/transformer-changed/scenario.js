const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/transformer-changed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/transformer-changed/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Both plugins in both runs. Transformer is changing between first and second run.
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

    // we expect both parent and child node to change
    expect(diff.dirtyIds).toEqual([
      `parent_childChangeForTransformer`,
      `parent_childChangeForTransformer >>> Child`,
    ])

    // we expect child node to be removed
    expect(
      diff.deletions[`parent_childChangeForTransformer >>> Child`]
    ).toBeTruthy()

    // we expect parent node to no longer have child node
    expect(diff.changes[`parent_childChangeForTransformer`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
      -   \\"children\\": Array [
      -     \\"parent_childChangeForTransformer >>> Child\\",
      -   ],
      +   \\"children\\": Array [],
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childChangeForTransformer\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"80e2ed37e11de736be839404c5f373f9\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-changed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildChangeForTransformer\\",
          },
          \\"parent\\": null,
        }"
    `)
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    // we expect just transformed node to change
    expect(diff.dirtyIds).toEqual([
      `parent_childChangeForTransformer >>> Child`,
    ])

    // we expect following changes to transformed node
    expect(diff.changes[`parent_childChangeForTransformer >>> Child`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      -   \\"foo\\": \\"bar\\",
      +   \\"foo\\": \\"baz\\",
          \\"id\\": \\"parent_childChangeForTransformer >>> Child\\",
          \\"internal\\": Object {
      -     \\"contentDigest\\": \\"bd4478bada76e1f5a45a3b326eaec443\\",
      +     \\"contentDigest\\": \\"70f659e959d7d3fb752f811e8b0eb8ad\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-changed/gatsby-transformer\\",
            \\"type\\": \\"ChildOfParent_ChildChangeForTransformer\\",
          },
          \\"parent\\": \\"parent_childChangeForTransformer\\",
        }"
    `)
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
