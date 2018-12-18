const path = require(`path`)
const { sourceNodes } = require(`../gatsby-node`)

let i = 0

describe(`gatsby-source-filesystem plugin`, () => {
  let args, node
  beforeEach(() => {
    args = {
      getNode: jest.fn(() => node),
      reporter: {
        panic: jest.fn(e => {
          throw new Error(e)
        }),
        info: jest.fn,
      },
      createNodeId: jest.fn(() => `id-${i++}`),
      emitter: { on: jest.fn() },
      actions: {
        createNode: jest.fn(),
        deleteNode: jest.fn(),
      },
    }
  })

  it(`watches a directory`, async () => {
    await sourceNodes(args, {
      path: path.resolve(__dirname, `fixtures/subdir`),
    })

    expect(args.actions.createNode).toBeCalledTimes(2) // 1 files, 1 dirs
  })

  it(`watches multiple files`, async () => {
    await sourceNodes(args, {
      path: [
        path.resolve(__dirname, `fixtures/file.json`),
        path.resolve(__dirname, `fixtures/**/*.ts`),
      ],
    })

    expect(args.actions.createNode).toBeCalledTimes(4) // 2 files, 2 dirs
  })

  it(`throws when paths don't exist`, async () => {
    try {
      await sourceNodes(args, {
        path: path.resolve(__dirname, `fixtures/foo.js`),
      })
    } catch {
      /* */
    } finally {
      expect(args.reporter.panic).toBeCalledTimes(1)
    }
  })
})
