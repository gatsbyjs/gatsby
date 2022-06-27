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
            \\"contentDigest\\": \\"c6c5c686a949351323ba4a04b585840a\\",
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

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1],
    type: `data`,
    query: graphql`
      {
        allParentChildChangeForFields {
          nodes {
            id
            foo
            fields {
              foo1
            }
          }
        }
      }
    `,
  },
  {
    runs: [2],
    type: `data`,
    query: graphql`
      {
        allParentChildChangeForFields {
          nodes {
            id
            foo
            fields {
              foo2
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
        typeinfoParent: __type(name: "Parent_ChildChangeForFields") {
          fields {
            name
          }
        }

        typeinfoChild: __type(name: "Parent_ChildChangeForFieldsFields") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesDiff, dataDiff }) => {
  // `foo1` fields are replaced with `foo2` fields
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"typeinfoChild\\": Object {
          \\"fields\\": Array [
            Object {
    -         \\"name\\": \\"foo1\\",
    +         \\"name\\": \\"foo2\\",
            },
          ],
        },
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
            Object {
              \\"name\\": \\"children\\",
            },
            Object {
              \\"name\\": \\"fields\\",
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

  // data only change fields from `foo1` to `foo2`
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentChildChangeForFields\\": Object {
          \\"nodes\\": Array [
            Object {
              \\"fields\\": Object {
    -           \\"foo1\\": \\"bar\\",
    +           \\"foo2\\": \\"baz\\",
              },
              \\"foo\\": \\"run-1\\",
              \\"id\\": \\"parent_childChangeForFields\\",
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
