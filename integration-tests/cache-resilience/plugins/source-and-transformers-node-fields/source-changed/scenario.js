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
      -     \\"contentDigest\\": \\"bde8140cd815ea2bb9e7ae2b45330d08\\",
      +     \\"contentDigest\\": \\"76dc03ca64a18a99d1581b9e7dd224ef\\",
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

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1],
    type: `data`,
    query: graphql`
      {
        allParentParentChangeForFields {
          nodes {
            id
            foo
            fields {
              foo
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
        allParentParentChangeForFields {
          nodes {
            id
            bar
            fields {
              bar
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
        typeinfoParent: __type(name: "Parent_ParentChangeForFields") {
          fields {
            name
          }
        }

        typeinfoChild: __type(name: "Parent_ParentChangeForFieldsFields") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesDiff, dataDiff }) => {
  // `foo` fields are replaced with `bar` fields
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"typeinfoChild\\": Object {
          \\"fields\\": Array [
            Object {
    -         \\"name\\": \\"foo\\",
    +         \\"name\\": \\"bar\\",
            },
          ],
        },
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
            Object {
    -         \\"name\\": \\"children\\",
    +         \\"name\\": \\"bar\\",
            },
            Object {
    -         \\"name\\": \\"fields\\",
    +         \\"name\\": \\"children\\",
            },
            Object {
    -         \\"name\\": \\"foo\\",
    +         \\"name\\": \\"fields\\",
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

  // data only change fields from `foo` to `bar`
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentParentChangeForFields\\": Object {
          \\"nodes\\": Array [
            Object {
    +         \\"bar\\": \\"run-2\\",
              \\"fields\\": Object {
    -           \\"foo\\": \\"run-1\\",
    +           \\"bar\\": \\"run-2\\",
              },
    -         \\"foo\\": \\"run-1\\",
              \\"id\\": \\"parent_parentChangeForFields\\",
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
