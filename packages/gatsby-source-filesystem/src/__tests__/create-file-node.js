const path = require(`path`)

const { createFileNode } = require(`../create-file-node`)

describe(`create-file-node`, () => {
  it(`creates a file node`, done => {
    createFileNode(
      path.resolve(`${__dirname}/fixtures/file.json`),
      {},
      (err, fileNode) => {
        expect(fileNode).toMatchSnapshot()
        done()
      }
    )
  })
})
