import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"

const createRemoteFileNode = require(`../create-remote-file-node`)

jest.mock(`gatsby-core-utils/fetch-remote-file`, () => {
  const path = require(`path`)

  return {
    fetchRemoteFile: jest.fn(() =>
      path.join(__dirname, `fixtures`, `dog-thumbnail.jpg`)
    ),
  }
})

describe(`create-remote-file-node`, () => {
  const cache = createMockCache()
  let uuid = 0

  beforeEach(async () => {
    uuid = 1
    fetchRemoteFile.mockClear()
  })

  function createMockCache() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      directory: __dirname,
    }
  }

  const defaultArgs = {
    url: `https://external.com/dog.jpg`,
    getCache: () => cache,
    createNode: jest.fn(),
    createNodeId: jest.fn(() => String(uuid++)),
    ext: `.jpg`,
    name: `dog-thumbnail`,
  }

  it(`should throw an error when an invalid url is given`, () => {
    expect(() =>
      createRemoteFileNode({
        ...defaultArgs,
        url: ``,
      })
    ).toThrowError(
      `url passed to createRemoteFileNode is either missing or not a proper web uri: `
    )
  })

  it(`should download and create file node`, async () => {
    const node = await createRemoteFileNode(defaultArgs)

    expect(node).toMatchObject(
      expect.objectContaining({
        id: `1`,
        extension: `jpg`,
        name: `dog-thumbnail`,
        base: `dog-thumbnail.jpg`,
        url: defaultArgs.url,
        internal: expect.objectContaining({
          type: `File`,
        }),
      })
    )
  })

  it(`passes headers`, async () => {
    await createRemoteFileNode({
      ...defaultArgs,
      // bypass cache
      url: `${defaultArgs.url}?header`,
      httpHeaders: {
        "x-test": `test`,
      },
    })

    expect(fetchRemoteFile).toHaveBeenCalledWith(
      expect.objectContaining({
        httpHeaders: {
          "x-test": `test`,
        },
      })
    )
  })

  it(`passes custom auth header, if defined`, async () => {
    const auth = {
      htaccess_user: `hunter2`,
      htaccess_pass: `*******`,
    }
    await createRemoteFileNode({
      ...defaultArgs,
      // bypass cache
      url: `${defaultArgs.url}?auth`,
      auth,
    })

    expect(fetchRemoteFile).toHaveBeenCalledWith(
      expect.objectContaining({
        auth,
      })
    )
  })

  it(`fails when fetchRemoteFile throws an error`, async () => {
    expect.assertions(1)
    try {
      fetchRemoteFile.mockImplementationOnce(({ url }) =>
        Promise.reject(new Error(`failed to process ${url}`))
      )
      await createRemoteFileNode({
        ...defaultArgs,
        // bypass cache
        url: `${defaultArgs.url}?error`,
      })
    } catch (err) {
      expect(err.message).toEqual(`failed to process ${defaultArgs.url}?error`)
    }
  })

  describe(`validation`, () => {
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

    it(`throws on invalid inputs: cache and getCache undefined`, () => {
      expect(() =>
        createRemoteFileNode({
          ...defaultArgs,
          cache: undefined,
          getCache: undefined,
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `"Neither \\"cache\\" or \\"getCache\\" was passed. getCache must be function that return Gatsby cache, \\"cache\\" must be the Gatsby cache, was undefined"`
      )
    })

    it(`doesn't throw when getCache is defined`, () => {
      expect(() =>
        createRemoteFileNode({
          ...defaultArgs,
          getCache: () => createMockCache(),
        })
      ).not.toThrow()
    })

    it(`doesn't throw when cache is defined`, () => {
      expect(() =>
        createRemoteFileNode({
          ...defaultArgs,
          cache: createMockCache(),
        })
      ).not.toThrow()
    })
  })
})
