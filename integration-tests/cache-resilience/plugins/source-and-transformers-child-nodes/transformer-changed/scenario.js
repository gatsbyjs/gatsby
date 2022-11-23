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

    // we expect following changes to transformed node:
    //  - change to`foo` value
    //  - removal of `first` field
    //  - addition of `second` field
    //  - change to contentDigest
    expect(diff.changes[`parent_childChangeForTransformer >>> Child`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      -   \\"first\\": \\"run\\",
      -   \\"foo\\": \\"bar\\",
      +   \\"foo\\": \\"baz\\",
          \\"id\\": \\"parent_childChangeForTransformer >>> Child\\",
          \\"internal\\": Object {
      -     \\"contentDigest\\": \\"04b03439f5e1d249d999e6763e23f306\\",
      +     \\"contentDigest\\": \\"66875f4e1170801ce795d9d863a12b2a\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-changed/gatsby-transformer\\",
            \\"type\\": \\"ChildOfParent_ChildChangeForTransformer\\",
          },
          \\"parent\\": \\"parent_childChangeForTransformer\\",
      +   \\"second\\": \\"run\\",
        }"
    `)
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
    type: `data`,
    query: graphql`
      {
        allParentChildChangeForTransformer {
          nodes {
            id
            foo
            childChildOfParentChildChangeForTransformer {
              id
              foo
            }
          }
        }
      }
    `,
  },
  {
    runs: [1, 2],
    type: `types`,
    query: graphql`
      {
        typeinfoParent: __type(name: "Parent_ChildChangeForTransformer") {
          fields {
            name
          }
        }

        typeinfoChild: __type(name: "ChildOfParent_ChildChangeForTransformer") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesDiff, dataDiff }) => {
  // remove `first` field and add `second` field in child type
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"typeinfoChild\\": Object {
          \\"fields\\": Array [
            Object {
              \\"name\\": \\"children\\",
            },
            Object {
    -         \\"name\\": \\"first\\",
    -       },
    -       Object {
              \\"name\\": \\"foo\\",
            },
            Object {
              \\"name\\": \\"id\\",
            },
            Object {
              \\"name\\": \\"internal\\",
            },
            Object {
              \\"name\\": \\"parent\\",
    +       },
    +       Object {
    +         \\"name\\": \\"second\\",
            },
          ],
        },
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
            Object {
              \\"name\\": \\"childChildOfParentChildChangeForTransformer\\",
            },
            Object {
              \\"name\\": \\"children\\",
            },
            Object {
              \\"name\\": \\"childrenChildOfParentChildChangeForTransformer\\",
            },
            Object {
              \\"name\\": \\"foo\\",
            },
            Object {
              \\"name\\": \\"id\\",
            },
            Object {
              \\"name\\": \\"internal\\",
            },
            Object {
              \\"name\\": \\"parent\\",
            },
          ],
        },
      }"
  `)

  // data only change fields for `foo` field in child node
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentChildChangeForTransformer\\": Object {
          \\"nodes\\": Array [
            Object {
              \\"childChildOfParentChildChangeForTransformer\\": Object {
    -           \\"foo\\": \\"bar\\",
    +           \\"foo\\": \\"baz\\",
                \\"id\\": \\"parent_childChangeForTransformer >>> Child\\",
              },
              \\"foo\\": \\"run-1\\",
              \\"id\\": \\"parent_childChangeForTransformer\\",
            },
          ],
        },
      }"
  `)
}

module.exports = {
  config,
  queriesFixtures,
  queriesTest,
  plugins,
  nodesTest,
}
