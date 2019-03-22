const { graphql } = require(`graphql`)
const { store } = require(`../../redux`)
const { build } = require(`..`)
const withResolverContext = require(`../context`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

const nodes = [
  {
    id: `file1`,
    parent: null,
    children: [],
    internal: {
      type: `File`,
      contentDigest: `file1`,
    },
    name: `1.png`,
    dir: `/home/me/`,
    absolutePath: `/home/me/1.png`,
  },
  {
    id: `file2`,
    parent: null,
    children: [],
    internal: {
      type: `File`,
      contentDigest: `file2`,
    },
    name: `2.png`,
    dir: `/home/me/`,
    absolutePath: `/home/me/2.png`,
  },
  {
    id: `file3`,
    parent: null,
    children: [`test1`],
    internal: {
      type: `File`,
      contentDigest: `file3`,
    },
    name: `test.txt`,
    dir: `/home/me/`,
    absolutePath: `/home/me/test.txt`,
  },
  {
    id: `test1`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Test`,
    },
    file: `./1.png`,
    files: [`./1.png`, `./2.png`],
    nested: {
      file: `./1.png`,
      files: [`./1.png`, `./2.png`],
    },
    array: [
      {
        file: `./1.png`,
        files: [`./1.png`, `./2.png`],
      },
      {
        file: `./2.png`,
        files: [`./2.png`],
      },
    ],
  },
]

describe(`Query fields of type File`, () => {
  let schema

  const runQuery = query =>
    graphql(schema, query, undefined, withResolverContext({}, schema))

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    )

    await build({})
    schema = store.getState().schema
  })

  it(`finds File nodes`, async () => {
    const query = `
      {
        test {
          file { name }
          files { name }
          nested {
            file { name }
            files { name }
          }
          array {
            file { name }
            files { name }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        file: { name: `1.png` },
        files: [{ name: `1.png` }, { name: `2.png` }],
        nested: {
          file: { name: `1.png` },
          files: [{ name: `1.png` }, { name: `2.png` }],
        },
        array: [
          {
            file: { name: `1.png` },
            files: [{ name: `1.png` }, { name: `2.png` }],
          },
          {
            file: { name: `2.png` },
            files: [{ name: `2.png` }],
          },
        ],
      },
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })

  it(`finds filtered File nodes`, async () => {
    const query = `
      {
        test(
          file: { name: { ne: null } }
          files: { elemMatch: { name: { ne: null } } }
          nested: {
            file: { name: { ne: null } }
            files: { elemMatch: { name: { ne: null } } }
          }
          array: {
            elemMatch: {
              file: { name: { ne: null } }
              files: { elemMatch: { name: { ne: null } } }
            }
          }
        ) {
          file { name }
          files { name }
          nested {
            file { name }
            files { name }
          }
          array {
            file { name }
            files { name }
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        file: { name: `1.png` },
        files: [{ name: `1.png` }, { name: `2.png` }],
        nested: {
          file: { name: `1.png` },
          files: [{ name: `1.png` }, { name: `2.png` }],
        },
        array: [
          {
            file: { name: `1.png` },
            files: [{ name: `1.png` }, { name: `2.png` }],
          },
          {
            file: { name: `2.png` },
            files: [{ name: `2.png` }],
          },
        ],
      },
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })
})
