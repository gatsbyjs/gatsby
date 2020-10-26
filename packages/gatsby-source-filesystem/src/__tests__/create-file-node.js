const path = require(`path`)

const { createFileNode } = require(`../create-file-node`)
const fs = require(`fs-extra`)

const fsStatBak = fs.stat

// FIXME: This test needs to not use snapshots because of file differences
// and locations across users and CI systems
describe(`create-file-node`, () => {
  beforeEach(() => {
    // If this breaks, note that the actual values here are not relevant. They just need to be mocked because
    // otherwise the tests change due to changing timestamps. The returned object should mimic the real fs.stat
    // Note: async tests should run in serial so this mock should not cause cross test polution on this thread.
    fs.stat = jest.fn().mockResolvedValue(
      Promise.resolve({
        isDirectory() {
          return false
        },
        dev: 123456,
        mode: 123456,
        nlink: 123456,
        uid: 123456,
        rdev: 123456,
        blksize: 123456,
        ino: 123456,
        size: 123456,
        blocks: 123456,
        atimeMs: 123456,
        mtimeMs: 123456,
        ctimeMs: 123456,
        birthtimeMs: 123456,
        atime: new Date(123456),
        mtime: new Date(123456),
        ctime: new Date(123456),
        birthtime: new Date(123456),
      })
    )
  })

  afterEach(() => {
    fs.stat = fsStatBak
  })

  it(`creates a file node`, async () => {
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    return createFileNode(
      path.resolve(`${__dirname}/fixtures/file.json`),
      createNodeId,
      {}
    )
  })

  it(`records the shape of the node`, async () => {
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    const node = await createFileNode(
      path.resolve(`${__dirname}/fixtures/file.json`),
      createNodeId,
      {}
    )

    jest.unmock(`fs-extra`)

    // Note: this snapshot should update if the mock above is changed
    expect(node).toMatchInlineSnapshot(`
      Object {
        "absolutePath": "<PROJECT_ROOT>/packages/gatsby-source-filesystem/src/__tests__/fixtures/file.json",
        "accessTime": "1970-01-01T00:02:03.456Z",
        "atime": "1970-01-01T00:02:03.456Z",
        "atimeMs": 123456,
        "base": "file.json",
        "birthTime": "1970-01-01T00:02:03.456Z",
        "birthtime": "1970-01-01T00:02:03.456Z",
        "birthtimeMs": 123456,
        "blksize": 123456,
        "blocks": 123456,
        "changeTime": "1970-01-01T00:02:03.456Z",
        "children": Array [],
        "ctime": "1970-01-01T00:02:03.456Z",
        "ctimeMs": 123456,
        "dev": 123456,
        "dir": "<PROJECT_ROOT>/packages/gatsby-source-filesystem/src/__tests__/fixtures",
        "ext": ".json",
        "extension": "json",
        "id": "uuid-from-gatsby",
        "ino": 123456,
        "internal": Object {
          "contentDigest": "3857af536a3d0950f833cf47079facdd",
          "description": "File \\"packages/gatsby-source-filesystem/src/__tests__/fixtures/file.json\\"",
          "mediaType": "application/json",
          "type": "File",
        },
        "mode": 123456,
        "modifiedTime": "1970-01-01T00:02:03.456Z",
        "mtime": "1970-01-01T00:02:03.456Z",
        "mtimeMs": 123456,
        "name": "file",
        "nlink": 123456,
        "parent": null,
        "prettySize": "123 kB",
        "rdev": 123456,
        "relativeDirectory": "packages/gatsby-source-filesystem/src/__tests__/fixtures",
        "relativePath": "packages/gatsby-source-filesystem/src/__tests__/fixtures/file.json",
        "root": "/",
        "size": 123456,
        "sourceInstanceName": "__PROGRAMMATIC__",
        "uid": 123456,
      }
    `)
  })
})
