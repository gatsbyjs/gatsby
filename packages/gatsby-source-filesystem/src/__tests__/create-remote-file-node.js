const createRemoteFileNode = require(`../create-remote-file-node`)

describe(`create-remote-file-node`, () => {
  const defaultArgs = {
    url: ``,
    store: {},
    cache: {},
    createNode: jest.fn(),
    createNodeId: jest.fn(),
  }

  it(`throws on invalid inputs: createNode`, () => {
    expect(() => {
      createRemoteFileNode({
        ...defaultArgs,
        createNode: undefined,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `"createNode must be a function, was undefined"`
    )
  })

  it(`throws on invalid inputs: createNodeId`, () => {
    expect(() => {
      createRemoteFileNode({
        ...defaultArgs,
        createNodeId: undefined,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `"createNodeId must be a function, was undefined"`
    )
  })

  it(`throws on invalid inputs: cache`, () => {
    expect(() => {
      createRemoteFileNode({
        ...defaultArgs,
        cache: undefined,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `"cache must be the Gatsby cache, was undefined"`
    )
  })

  it(`throws on invalid inputs: store`, () => {
    expect(() => {
      createRemoteFileNode({
        ...defaultArgs,
        store: undefined,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `"store must be the redux store, was undefined"`
    )
  })
})
