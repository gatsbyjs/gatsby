const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-changed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-changed/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Both plugins in both runs. Transformer plugin changes after first run.
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

    expect(diff.dirtyIds).toEqual([`parent_childChangeForFields`])

    expect(diff.changes[`parent_childChangeForFields`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      -   \\"fields\\": Object {
      -     \\"foo1\\": \\"bar\\",
      -   },
      +   \\"fields\\": Object {},
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childChangeForFields\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"fb9e9b9c26522bceaa1f51c537b2aff2\\",
      -     \\"fieldOwners\\": Object {
      -       \\"foo1\\": \\"source-and-transformers-node-fields/transformer-changed/gatsby-transformer\\",
      -     },
      +     \\"fieldOwners\\": Object {},
            \\"owner\\": \\"source-and-transformers-node-fields/transformer-changed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildChangeForFields\\",
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

    expect(diff.dirtyIds).toEqual([`parent_childChangeForFields`])

    expect(diff.changes[`parent_childChangeForFields`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
          \\"fields\\": Object {
      -     \\"foo1\\": \\"bar\\",
      +     \\"foo2\\": \\"baz\\",
          },
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childChangeForFields\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"fb9e9b9c26522bceaa1f51c537b2aff2\\",
            \\"fieldOwners\\": Object {
      -       \\"foo1\\": \\"source-and-transformers-node-fields/transformer-changed/gatsby-transformer\\",
      +       \\"foo2\\": \\"source-and-transformers-node-fields/transformer-changed/gatsby-transformer\\",
            },
            \\"owner\\": \\"source-and-transformers-node-fields/transformer-changed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildChangeForFields\\",
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
