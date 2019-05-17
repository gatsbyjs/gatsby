jest.mock(`fs-extra`, () => {
  return {
    createWriteStream: jest.fn(() => {
      return {
        on: jest.fn((type, cb) => {
          if (type === `finish`) {
            cb()
          }
        }),
      }
    }),
    ensureDir: jest.fn(),
    move: jest.fn(),
    stat: jest.fn(),
  }
})
jest.mock(`got`, () => {
  return {
    stream: jest.fn(),
  }
})
jest.mock(
  `progress`,
  () =>
    class ProgressBar {
      static total = 0
      static tick = jest.fn(() => (ProgressBar.total -= 1))

      total = ProgressBar.total
      tick = ProgressBar.tick
    }
)
jest.mock(`../create-file-node`, () => {
  return {
    createFileNode: jest.fn(),
  }
})
const got = require(`got`)
const ProgressBar = require(`progress`)
const createRemoteFileNode = require(`../create-remote-file-node`)
const { createFileNode } = require(`../create-file-node`)

beforeEach(() => {
  ProgressBar.total = 0
  ProgressBar.tick.mockClear()
})

describe(`create-remote-file-node`, () => {
  const defaultArgs = {
    url: ``,
    store: {},
    cache: {},
    createNode: jest.fn(),
    createNodeId: jest.fn(),
  }

  describe(`basic functionality`, () => {
    describe(`non-url`, () => {
      it(`short-circuits and resolves`, () => {
        const value = createRemoteFileNode({
          ...defaultArgs,
          url: ``,
        })

        expect(value).rejects.toMatch(`wrong url: `)
      })

      it(`does not increment progress bar total`, () => {
        const value = createRemoteFileNode({
          ...defaultArgs,
          url: ``,
        })

        expect(value).rejects.toMatch(`wrong url: `)

        expect(ProgressBar.total).toBe(0)
        expect(ProgressBar.tick).not.toHaveBeenCalled()
      })
    })
  })

  describe(`valid url`, () => {
    let uuid = 0

    const setup = (
      args = {},
      type = `response`,
      response = { statusCode: 200 }
    ) => {
      const url = `https://images.whatever.com/real-image-trust-me-${uuid}.png`

      const gotMock = {
        pipe: jest.fn(),
        on: jest.fn(),
      }

      createFileNode.mockImplementationOnce(() => {
        return {
          internal: {},
        }
      })

      got.stream.mockReturnValueOnce({
        pipe: jest.fn(() => gotMock),
        on: jest.fn((mockType, mockCallback) => {
          if (mockType === type) {
            mockCallback(response)
          }

          return gotMock
        }),
      })

      uuid += 1

      return createRemoteFileNode({
        ...defaultArgs,
        cache: {
          get: jest.fn(),
          set: jest.fn(),
        },
        store: {
          getState: jest.fn(() => {
            return {
              program: {
                directory: `__whatever__`,
              },
            }
          }),
        },
        url,
        ...args,
      })
    }

    it(`invokes ProgressBar tick`, async () => {
      await setup()

      expect(ProgressBar.tick).toHaveBeenCalledTimes(1)
    })

    describe(`requesting remote image`, () => {
      it(`passes correct url`, async () => {
        const url = `https://hello.com/image.png`
        await setup({
          url,
        })

        expect(got.stream).toHaveBeenCalledWith(url, expect.any(Object))
      })

      it(`passes headers`, async () => {
        await setup()

        expect(got.stream).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {},
          })
        )
      })

      it(`passes custom auth header, if defined`, async () => {
        const auth = {
          htaccess_user: `hunter2`,
          htaccess_pass: `*******`,
        }
        await setup({
          auth,
        })

        expect(got.stream).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            auth: [auth.htaccess_user, auth.htaccess_pass].join(`:`),
          })
        )
      })

      it(`passes custom http heades, if defined`, async () => {
        await setup({
          httpHeaders: {
            Authorization: `Bearer foobar`,
          },
        })

        expect(got.stream).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: `Bearer foobar`,
            }),
          })
        )
      })
    })
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
})
