const path = require(`path`)

const { createFileNode } = require(`../create-file-node`)
const fs = require(`fs-extra`)

const fsStatBak = fs.stat

const createMockCache = (get = jest.fn()) => {
  return {
    get,
    set: jest.fn(),
    directory: __dirname,
  }
}

const createMockCreateNodeId = () => {
  const createNodeId = jest.fn()
  createNodeId.mockReturnValue(`uuid-from-gatsby`)
  return createNodeId
}

// MD5 hash of the file (if the mock below changes this should change)
const fileHash = `8d777f385d3dfec8815d20f7496026dc`

// mtime + inode (if the mock below changes this should change)
const fileFastHash = `123456123456`

function testNode(node, dname, fname, contentDigest) {
  // Sanitize all filenames
  Object.keys(node).forEach(key => {
    if (typeof node[key] === `string`) {
      node[key] = node[key].replace(new RegExp(dname, `g`), `<DIR>`)
      node[key] = node[key].replace(new RegExp(fname, `g`), `<FILE>`)
    }
  })
  Object.keys(node.internal).forEach(key => {
    if (typeof node.internal[key] === `string`) {
      node.internal[key] = node.internal[key].replace(
        new RegExp(dname, `g`),
        `<DIR>`
      )
      node.internal[key] = node.internal[key].replace(
        new RegExp(fname, `g`),
        `<FILE>`
      )
    }
  })

  // Note: this snapshot should update if the mock below is changed
  expect(node).toMatchInlineSnapshot(`
    Object {
      "absolutePath": "<DIR>/f",
      "accessTime": "1970-01-01T00:02:03.456Z",
      "atime": "1970-01-01T00:02:03.456Z",
      "atimeMs": 123456,
      "base": "f",
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
      "dir": "<DIR>",
      "ext": "",
      "extension": "",
      "id": "uuid-from-gatsby",
      "ino": 123456,
      "internal": Object {
        "contentDigest": "${contentDigest}",
        "description": "File \\"<DIR>/f\\"",
        "mediaType": "application/octet-stream",
        "type": "File",
      },
      "mode": 123456,
      "modifiedTime": "1970-01-01T00:02:03.456Z",
      "mtime": "1970-01-01T00:02:03.456Z",
      "mtimeMs": 123456,
      "name": "f",
      "nlink": 123456,
      "parent": null,
      "prettySize": "123 kB",
      "rdev": 123456,
      "relativeDirectory": "<DIR>",
      "relativePath": "<DIR>/f",
      "root": "",
      "size": 123456,
      "sourceInstanceName": "__PROGRAMMATIC__",
      "uid": 123456,
    }
  `)
}

// FIXME: This test needs to not use snapshots because of file differences
// and locations across users and CI systems
describe(`create-file-node`, () => {
  beforeEach(() => {
    // If this breaks, note that the actual values here are not relevant. They just need to be mocked because
    // otherwise the tests change due to changing timestamps. The returned object should mimic the real fs.stat
    // Note: async tests should run in serial so this mock should not cause cross test pollution on this thread.
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
    const createNodeId = createMockCreateNodeId()

    const cache = createMockCache()

    return createFileNode(
      path.resolve(`${__dirname}/fixtures/file.json`),
      createNodeId,
      {},
      cache
    )
  })

  it(`records the shape of the node`, async () => {
    const dname = fs.mkdtempSync(`gatsby-create-file-node-test`).trim()
    try {
      const fname = path.join(dname, `f`)
      fs.writeFileSync(fname, `data`)
      try {
        const createNodeId = createMockCreateNodeId()

        const emptyCache = {
          get: jest.fn(),
          set: jest.fn(),
          directory: __dirname,
        }

        const node = await createFileNode(fname, createNodeId, {}, emptyCache)

        testNode(node, dname, fname, fileHash)
      } finally {
        fs.unlinkSync(fname)
      }
    } finally {
      fs.rmdirSync(dname)
    }
  })

  it(`records the shape of the node from cache`, async () => {
    const dname = fs.mkdtempSync(`gatsby-create-file-node-test`).trim()
    try {
      const fname = path.join(dname, `f`)
      fs.writeFileSync(fname, `data`)
      try {
        const createNodeId = createMockCreateNodeId()

        const getFromCache = jest.fn()
        getFromCache.mockReturnValue(fileHash)
        const cache = createMockCache(getFromCache)

        const nodeFromCache = await createFileNode(
          fname,
          createNodeId,
          {},
          cache
        )

        testNode(nodeFromCache, dname, fname, fileHash)
      } finally {
        fs.unlinkSync(fname)
      }
    } finally {
      fs.rmdirSync(dname)
    }
  })

  it(`records the shape of the fast hashed node`, async () => {
    const dname = fs.mkdtempSync(`gatsby-create-file-node-test`).trim()
    try {
      const fname = path.join(dname, `f`)
      fs.writeFileSync(fname, `data`)
      try {
        const createNodeId = createMockCreateNodeId()
        const cache = createMockCache()

        const nodeFastHash = await createFileNode(
          fname,
          createNodeId,
          {
            fastHash: true,
          },
          cache
        )

        testNode(nodeFastHash, dname, fname, fileFastHash)
      } finally {
        fs.unlinkSync(fname)
      }
    } finally {
      fs.rmdirSync(dname)
    }
  })
})
