const path = require(`path`)

const { createFileNode } = require(`../create-file-node`)

// FIXME: This test needs to not use snapshots because of file differences
// and locations across users and CI systems
describe(`create-file-node`, () => {
  it(`creates a file node`, () => {
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    return createFileNode(
      path.resolve(`${__dirname}/fixtures/file.json`),
      createNodeId,
      {}
    )
  })
})

// describe(`get-git-repo-path`, () => {
//   it(`should return the git repo file path`, () => {
//     const createNodeId = jest.fn()
//     createNodeId.mockReturnValue(`uuid-from-gatsby`)
//     let fileNode = createFileNode(
//       path.resolve(`${__dirname}/fixtures/file.json`),
//       createNodeId,
//       {}
//     )
//     expect(fileNode.gitRepoPath).toBeDefined()
//   })
// })
