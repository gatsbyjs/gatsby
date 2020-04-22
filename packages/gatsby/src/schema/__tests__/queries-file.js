const { graphql } = require(`graphql`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { build } = require(`..`)
const withResolverContext = require(`../context`)
require(`../../db/__tests__/fixtures/ensure-loki`)()
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)

const basePath = slash(__dirname)
const filePath = p => slash(path.join(basePath, p))

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
    dir: basePath,
    absolutePath: filePath(`1.png`),
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
    dir: basePath,
    absolutePath: filePath(`2.png`),
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
    dir: basePath,
    absolutePath: filePath(`test.txt`),
  },
  {
    id: `file4`,
    parent: `file5`,
    children: [`test2`],
    internal: {
      type: `File`,
      contentDigest: `file4`,
    },
    name: `parent.txt`,
    dir: basePath,
    absolutePath: filePath(`parent.txt`),
  },
  {
    id: `file5`,
    parent: null,
    children: [`file4`],
    internal: {
      type: `File`,
      contentDigest: `file5`,
    },
    name: `root.txt`,
    dir: `/`,
    absolutePath: `/root.txt`,
  },
  {
    id: `test1`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Test`,
      contentDigest: `filenested`,
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
    arrayOfArray: [[`./1.png`], [`./2.png`]],
    arrayOfArrayOfObjects: [[{ nested: `./1.png` }], [{ nested: `./2.png` }]],
  },
  {
    id: `test2`,
    parent: `file4`,
    children: [],
    internal: {
      type: `TestChild`,
      contentDigest: `test2`,
    },
    file: `./1.png`,
  },
]

describe(`Query fields of type File`, () => {
  let schema
  let schemaComposer

  const runQuery = query =>
    graphql(
      schema,
      query,
      undefined,
      withResolverContext({
        schema,
        schemaComposer,
      })
    )

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node => {
      actions.createNode(node, { name: `test` })(store.dispatch)
    })

    await build({})
    schema = store.getState().schema
    schemaComposer = store.getState().schemaCustomization.composer
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
          arrayOfArray { name }
          arrayOfArrayOfObjects {
            nested {
              name
            }
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
        arrayOfArray: [[{ name: `1.png` }], [{ name: `2.png` }]],
        arrayOfArrayOfObjects: [
          [{ nested: { name: `1.png` } }],
          [{ nested: { name: `2.png` } }],
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

  it(`uses nearest File node ancestor to resolve relative paths`, async () => {
    const query = `
      {
        testChild {
          file { name }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      testChild: {
        file: { name: `1.png` },
      },
    }
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual(expected)
  })
})
