const path = require(`path`)

const { createFileNode } = require(`../create-file-node`)

describe(`create-file-node`, () => {
  it(`creates a file node`, done => {
    createFileNode(
      path.resolve(`${__dirname}/fixtures/file.json`),
      {},
      (err, fileNode) => {
        // Delete access time since this changes on every run.
        delete fileNode.accessTime
        delete fileNode.atime
        delete fileNode.atimeMs

        expect(fileNode).toMatchSnapshot()
        done()
      }
    )
  })
})
