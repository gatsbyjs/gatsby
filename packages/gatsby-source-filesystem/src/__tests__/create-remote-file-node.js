jest.mock(`fs-extra`, () => {
  return {
    createWriteStream: jest.fn(() => {
      return {
        on: jest.fn((type, cb) => {
          if (type === `finish`) {
            cb()
          }
        }),
        close: jest.fn(),
      }
    }),
    ensureDir: jest.fn(),
    removeSync: jest.fn(),
    move: jest.fn(),
    stat: jest.fn(),
  }
})
jest.mock(`got`, () => {
  return {
    stream: jest.fn(),
  }
})

jest.mock(`../create-file-node`, () => {
  return {
    createFileNode: jest.fn(),
  }
})
const reporter = require(`gatsby/reporter`)

const got = require(`got`)
const createRemoteFileNode = require(`../create-remote-file-node`)
const { createFileNode } = require(`../create-file-node`)

const createMockCache = () => {
  return {
    get: jest.fn(),
    set: jest.fn(),
    directory: __dirname,
  }
}

describe(`create-remote-file-node`, () => {
  const cache = createMockCache()

  const defaultArgs = {
    url: ``,
    store: {},
    getCache: () => cache,
    createNode: jest.fn(),
    createNodeId: jest.fn(),
    reporter,
  }

  describe(`basic functionality`, () => {
    describe(`non-url`, () => {
      it(`short-circuits and resolves`, () => {
        const value = createRemoteFileNode({
          ...defaultArgs,
          url: ``,
        })

        expect(value).rejects.toMatch(
          `url passed to createRemoteFileNode is either missing or not a proper web uri: `
        )
      })

      it(`does not increment progress bar total`, () => {
        const value = createRemoteFileNode({
          ...defaultArgs,
          url: ``,
        })

        expect(value).rejects.toMatch(
          `url passed to createRemoteFileNode is either missing or not a proper web uri: `
        )
      })
    })
  })

  describe(`valid url`, () => {
    let uuid = 0

    const setup = (args = {}, response = { statusCode: 200 }) => {
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
          if (mockType === `response`) {
            // got throws on 404/500 so we mimic this behaviour
            if (response.statusCode === 404) {
              throw new Error(`Response code 404 (Not Found)`)
            }

            mockCallback(response)
          }
          if (mockType === `downloadProgress`) {
            mockCallback({
              progress: 1,
              transferred: 1,
              total: 1,
            })
          }

          return gotMock
        }),
      })

      uuid += 1

      return createRemoteFileNode({
        ...defaultArgs,
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

      it(`passes custom http header, if defined`, async () => {
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

      it(`fails when 404 is given`, async () => {
        expect.assertions(1)
        try {
          await setup({}, `response`, { statusCode: 404 })
        } catch (err) {
          expect(err).toEqual(
            expect.stringContaining(
              `failed to process https://images.whatever.com/real-image-trust-me`
            )
          )
        }
      })

      it(`retries if stalled`, done => {
        const fs = require(`fs-extra`)

        fs.createWriteStream.mockReturnValue({
          on: jest.fn(),
          close: jest.fn(),
        })
        jest.useFakeTimers()
        got.stream.mockReset()
        got.stream.mockReturnValueOnce({
          pipe: jest.fn(() => {
            return {
              pipe: jest.fn(),
              on: jest.fn(),
            }
          }),
          on: jest.fn((mockType, mockCallback) => {
            if (mockType === `response`) {
              mockCallback({ statusCode: 200 })

              expect(got.stream).toHaveBeenCalledTimes(1)
              jest.advanceTimersByTime(1000)
              expect(got.stream).toHaveBeenCalledTimes(1)
              jest.advanceTimersByTime(30000)

              expect(got.stream).toHaveBeenCalledTimes(2)
              done()
            }
          }),
        })
        setup()
        jest.runAllTimers()
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

    it(`throws on invalid inputs: cache and getCache undefined`, () => {
      expect(() => {
        createRemoteFileNode({
          ...defaultArgs,
          cache: undefined,
          getCache: undefined,
        })
      }).toThrowErrorMatchingInlineSnapshot(
        `"Neither \\"cache\\" or \\"getCache\\" was passed. getCache must be function that return Gatsby cache, \\"cache\\" must be the Gatsby cache, was undefined"`
      )
    })

    it(`doesn't throw when getCache is defined`, () => {
      expect(() => {
        createRemoteFileNode({
          ...defaultArgs,
          getCache: () => createMockCache(),
        })
      }).not.toThrow()
    })

    it(`doesn't throw when cache is defined`, () => {
      expect(() => {
        createRemoteFileNode({
          ...defaultArgs,
          cache: createMockCache(),
        })
      }).not.toThrow()
    })
  })
})
