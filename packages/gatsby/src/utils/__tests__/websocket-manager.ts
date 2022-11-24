import { createServer } from "http"
import * as io from "socket.io-client"
import { WebsocketManager } from "../websocket-manager"
import { store } from "../../redux"
import * as path from "path"

const MOCK_FILE_INFO = {}

jest.mock(`fs-extra`, () => {
  return {
    readJson: jest.fn(path => {
      if (MOCK_FILE_INFO[path]) {
        return MOCK_FILE_INFO[path]
      }
      throw new Error(`Doesn't exist`)
    }),
    pathExists: jest.fn(path => !!MOCK_FILE_INFO[path]),
    readFile: jest.fn(path => JSON.stringify(MOCK_FILE_INFO[path])),
  }
})

// we mock it to make tests faster
jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {}
})

const INTERVAL_TIMEOUT = 500
const TEST_TIMEOUT = 30000

function waitUntil<T = any>(
  cb: (resolve: (resolved?: T) => void) => void,
  maxTimeout: number = TEST_TIMEOUT
): Promise<T> {
  return new Promise(resolve => {
    let i = 0

    const interval = setInterval(() => {
      if (i >= maxTimeout) {
        clearInterval(interval)
        return
      }

      cb((resolved?: T): void => {
        clearInterval(interval)
        resolve(resolved)
      })

      i += INTERVAL_TIMEOUT
    }, INTERVAL_TIMEOUT)
  })
}

/**
 * @see https://github.com/facebook/jest/issues/10529#issuecomment-904608475
 */
function itAsyncDone(
  name: string,
  cb: (done: jest.DoneCallback) => Promise<void>,
  timeout?: number
): void {
  it(
    name,
    done => {
      let doneCalled = false
      const wrappedDone: jest.DoneCallback = (...args) => {
        if (doneCalled) {
          return
        }

        doneCalled = true
        done(...args)
      }

      wrappedDone.fail = (err): void => {
        if (doneCalled) {
          return
        }

        doneCalled = true

        done(err)
      }

      cb(wrappedDone).catch(wrappedDone)
    },
    timeout
  )
}

describe(`websocket-manager`, () => {
  let websocketManager: WebsocketManager
  let httpServerAddr

  function getClientSocket(): typeof io.Socket {
    return io.default(`http://127.0.0.1:${httpServerAddr.port}`)
  }

  function getClientSocketAndWaitForConnect(): Promise<typeof io.Socket> {
    return new Promise(resolve => {
      const clientSocket = getClientSocket()
      clientSocket.on(`connect`, () => {
        resolve(clientSocket)
      })
    })
  }

  /**
   * This is helper waiting for disconnect to be handled by server as well
   */
  async function disconnectClientSocket(
    clientSocket: typeof io.Socket
  ): Promise<void> {
    const currentClientCount = websocketManager.clients.size
    const waitForDisconnect = waitUntil(done => {
      if (websocketManager.clients.size === currentClientCount - 1) {
        done()
      }
    })
    clientSocket.disconnect()
    return waitForDisconnect
  }

  beforeAll(done => {
    const httpServer = createServer().listen()
    httpServerAddr = httpServer.address()

    if (typeof httpServerAddr === `string`) {
      // https://nodejs.org/api/net.html#net_server_address
      throw new Error(
        `Type guard - "address" can return string when letting up server on a pipe or Unix domain socket, which we don't use here`
      )
    } else if (!httpServerAddr) {
      throw new Error(
        `Type guard - "address" can return null in some cases, but we expect object`
      )
    }

    websocketManager = new WebsocketManager()
    websocketManager.init({ server: httpServer })
    ;[
      `/`,
      `no-slashes`,
      `/leading-slash`,
      `trailing-slash/`,
      `/leading-and-trailing-slash/`,
      {
        path: `/app/`,
        matchPath: `/app/*`,
      },
      `/app/static/`,
      `/blog/`,
    ].forEach(pathOrObject => {
      let pageObject
      if (typeof pathOrObject !== `object`) {
        pageObject = {
          path: pathOrObject,
        }
      } else {
        pageObject = pathOrObject
      }
      store.dispatch({
        type: `CREATE_PAGE`,
        payload: { ...pageObject, component: `not-important`, context: {} },
        plugin: { name: `websocket-manager-test` },
      })
      store.dispatch({
        type: `QUERY_START`,
        payload: { path: pageObject.path },
      })
      store.dispatch({
        type: `PAGE_QUERY_RUN`,
        payload: { path: pageObject.path },
      })
    })

    store.dispatch({
      type: `SET_PROGRAM`,
      payload: {
        directory: __dirname,
      },
    })

    done()
  })

  afterAll(done => {
    if (websocketManager.websocket) {
      websocketManager.websocket.close()
    }

    done()
  })

  it(
    `Can connect`,
    async () => {
      expect.assertions(1)
      const clientSocket = await getClientSocketAndWaitForConnect()
      expect(clientSocket.connected).toBe(true)
      clientSocket.disconnect()
    },
    TEST_TIMEOUT
  )

  describe(`Active path tracking`, () => {
    it(
      `reports no active paths when there are no connections`,
      () => {
        expect(websocketManager.activePaths).toEqual(new Set())
      },
      TEST_TIMEOUT
    )

    it(
      `can register and unregister paths`,
      async () => {
        expect.assertions(3)

        const clientSocket = await getClientSocketAndWaitForConnect()

        expect(websocketManager.activePaths).toEqual(new Set())

        let activePathAdjustedPromise = waitUntil(done => {
          if (websocketManager.activePaths.size === 1) {
            expect(websocketManager.activePaths).toEqual(new Set(`/`))
            done()
          }
        })

        clientSocket.emit(`registerPath`, `/`)
        await activePathAdjustedPromise

        // disconnect remaining session (mostly to make sure other tests are not affected)
        activePathAdjustedPromise = waitUntil(done => {
          if (websocketManager.activePaths.size === 0) {
            expect(websocketManager.activePaths).toEqual(new Set())
            clientSocket.disconnect()
            done()
          }
        })
        clientSocket.emit(`unregisterPath`, `/`)
        await activePathAdjustedPromise
      },
      TEST_TIMEOUT
    )

    it(
      `track individual clients`,
      async () => {
        expect.assertions(5)
        const clientSocket1 = await getClientSocketAndWaitForConnect()
        const clientSocket2 = await getClientSocketAndWaitForConnect()
        expect(websocketManager.activePaths).toEqual(new Set())

        let activePathAdjustedPromise = waitUntil(done => {
          if (websocketManager.activePaths.size === 2) {
            expect(Array.from(websocketManager.activePaths).sort()).toEqual([
              `/`,
              `/blog/`,
            ])

            done()
          }
        })
        clientSocket1.emit(`registerPath`, `/`)
        clientSocket2.emit(`registerPath`, `/blog/`)
        await activePathAdjustedPromise

        activePathAdjustedPromise = waitUntil(done => {
          // we should have 2 sessions looking at single page
          if (websocketManager.activePaths.size === 1) {
            expect(Array.from(websocketManager.activePaths).sort()).toEqual([
              `/blog/`,
            ])
            expect(websocketManager.clients.size).toEqual(2)

            done()
          }
        })
        clientSocket1.emit(`registerPath`, `/blog/`)
        await activePathAdjustedPromise

        // we should have 2 sessions looking at single page, let's disconnect one
        // and make sure that page is still considered active
        await disconnectClientSocket(clientSocket2)

        expect(websocketManager.activePaths).toEqual(new Set([`/blog/`]))

        // change active path and make sure activePath is tracking that correctly
        // and doesn't keep old one
        activePathAdjustedPromise = waitUntil(done => {
          // we should have 2 sessions looking at single page
          if (websocketManager.activePaths.has(`/`)) {
            expect(websocketManager.activePaths).toEqual(new Set([`/`]))
            done()
          }
        })
        clientSocket1.emit(`registerPath`, `/`)

        // disconnect remaining session (mostly to make sure other tests are not affected)
        await disconnectClientSocket(clientSocket1)
      },
      TEST_TIMEOUT
    )

    describe(`It can find page of paths passed by clients don't exactly match page path (leading/trailing slashes, client-only-paths)`, () => {
      async function registerPathnameAndGetPath(
        pathname: string
      ): Promise<string> {
        const clientSocket = await getClientSocketAndWaitForConnect()

        if (websocketManager.activePaths.size > 0) {
          throw new Error(`There was client connected already`)
        }

        const activePathAdjustedPromise = waitUntil<string>(done => {
          if (websocketManager.activePaths.size === 1) {
            done(Array.from(websocketManager.activePaths as Set<string>)[0])
          }
        })

        clientSocket.emit(`registerPath`, pathname)
        const value = await activePathAdjustedPromise

        await disconnectClientSocket(clientSocket)

        return value
      }
      function assertGetterWithSlashMatrix(
        pathWithoutTrailingOrLeadingSlashes: string,
        exactPath: string
      ): void {
        const withTrailingSlash = pathWithoutTrailingOrLeadingSlashes + `/`
        const withLeadingSlash = `/` + pathWithoutTrailingOrLeadingSlashes
        const withLeadingAndTrailingSlash =
          `/` + pathWithoutTrailingOrLeadingSlashes + `/`

        it(
          `Finds a page when request doesn't have trailing and leading slashes ("${pathWithoutTrailingOrLeadingSlashes}")`,
          async () => {
            const page = await registerPathnameAndGetPath(
              pathWithoutTrailingOrLeadingSlashes
            )

            expect(page).toEqual(exactPath)
          },
          TEST_TIMEOUT
        )

        it(
          `Finds a page when request have trailing slash ("${withTrailingSlash}")`,
          async () => {
            const page = await registerPathnameAndGetPath(withTrailingSlash)
            expect(page).toEqual(exactPath)
          },
          TEST_TIMEOUT
        )

        it(
          `Finds a page when request have leading slash ("${withLeadingSlash}")`,
          async () => {
            const page = await registerPathnameAndGetPath(withLeadingSlash)
            expect(page).toEqual(exactPath)
          },
          TEST_TIMEOUT
        )

        it(
          `Finds a page when request have both leading and trailing slash ("${withLeadingAndTrailingSlash}")`,
          async () => {
            const page = await registerPathnameAndGetPath(
              withLeadingAndTrailingSlash
            )
            expect(page).toEqual(exactPath)
          },
          TEST_TIMEOUT
        )
      }

      describe(`Page with no slashes ("no-slashes")`, () => {
        assertGetterWithSlashMatrix(`no-slashes`, `no-slashes`)
      })

      describe(`Page with leading slash ("/leading-slash")`, () => {
        assertGetterWithSlashMatrix(`leading-slash`, `/leading-slash`)
      })

      describe(`Page with trailing slash ("trailing-slash/")`, () => {
        assertGetterWithSlashMatrix(`trailing-slash`, `trailing-slash/`)
      })

      describe(`Page with leading and trailing slash ("/leading-and-trailing-slash/")`, () => {
        assertGetterWithSlashMatrix(
          `leading-and-trailing-slash`,
          `/leading-and-trailing-slash/`
        )
      })

      describe(`Client-only-paths`, () => {
        it(
          `Can match client-only path by matchPath`,
          async () => {
            const page = await registerPathnameAndGetPath(`/app/test`)
            expect(page).toEqual(`/app/`)
          },
          TEST_TIMEOUT
        )

        it(
          `Can match client-only path by static`,
          async () => {
            const page = await registerPathnameAndGetPath(`/app`)
            expect(page).toEqual(`/app/`)
          },
          TEST_TIMEOUT
        )

        it(
          `Will prefer static page over client-only in case both match`,
          async () => {
            const page = await registerPathnameAndGetPath(`/app/static`)
            expect(page).toEqual(`/app/static/`)
          },
          TEST_TIMEOUT
        )
      })

      describe(`No page found`, () => {
        beforeAll(() => {
          store.dispatch({
            type: `CREATE_PAGE`,
            payload: {
              path: `/404.html`,
              component: `not-important`,
              componentPath: `not-important`,
              context: {},
            },
            plugin: { name: `websocket-manager-test` },
          })
          store.dispatch({
            type: `CREATE_PAGE`,
            payload: {
              path: `/dev-404-page/`,
              component: `not-important`,
              componentPath: `not-important`,
              context: {},
            },
            plugin: { name: `websocket-manager-test` },
          })
        })

        afterAll(() => {
          store.dispatch({
            type: `DELETE_PAGE`,
            payload: {
              path: `/404.html`,
              component: `not-important`,
              context: {},
            },
            plugin: { name: `websocket-manager-test` },
          })
          store.dispatch({
            type: `DELETE_PAGE`,
            payload: {
              path: `/dev-404-page/`,
              component: `not-important`,
              context: {},
            },
            plugin: { name: `websocket-manager-test` },
          })
        })

        it(
          `Will return 404 pages if requested not found (will prefer /dev-404-page/)`,
          async () => {
            const page = await registerPathnameAndGetPath(`/does-not-exist/`)

            expect(page).toEqual(`/dev-404-page/`)
          },
          TEST_TIMEOUT
        )

        it(
          `Will return 404 page if requested not found (will fallback to /404.html)`,
          async () => {
            store.dispatch({
              type: `DELETE_PAGE`,
              payload: { path: `/dev-404-page/`, component: `not-important` },
            })

            const page = await registerPathnameAndGetPath(`/does-not-exist/`)

            expect(page).toEqual(`/404.html`)
          },
          TEST_TIMEOUT
        )
      })
    })
  })

  describe(`Data`, () => {
    beforeEach(() => {
      websocketManager.staticQueryResults.clear()
    })
    afterAll(() => {
      websocketManager.staticQueryResults.clear()
    })

    describe(`emitPageQueryData`, () => {
      it(
        `Client can receive page query update`,
        async () => {
          expect.assertions(1)
          const clientSocket = await getClientSocketAndWaitForConnect()

          const pageQueryId = `/blog/`
          const result = {
            path: pageQueryId,
            result: {
              data: { foo: `bar` },
            },

            componentChunkName: `not-important`,
            staticQueryHashes: [],
          }

          const receivedDataOnClientPromise = new Promise(resolve => {
            function handler(msg): void {
              if (
                msg.type === `pageQueryResult` &&
                msg.payload.id === pageQueryId
              ) {
                expect(msg.payload.result).toEqual(result)

                clientSocket.off(`message`, handler)
                resolve()
              }
            }
            clientSocket.on(`message`, handler)
          })

          websocketManager.emitPageData({
            id: pageQueryId,
            result,
          })

          await receivedDataOnClientPromise

          // disconnect remaining session (mostly to make sure other tests are not affected)
          await disconnectClientSocket(clientSocket)
        },
        TEST_TIMEOUT
      )
    })

    describe(`emitStaticQueryData`, () => {
      it(
        `Client can receive static query update`,
        async () => {
          expect.assertions(1)
          const clientSocket = await getClientSocketAndWaitForConnect()

          const staticQueryId = `12345`
          const result = {
            data: { foo: `bar` },
          }

          const receivedDataOnClientPromise = new Promise(resolve => {
            function handler(msg): void {
              if (
                msg.type === `staticQueryResult` &&
                msg.payload.id === staticQueryId
              ) {
                expect(msg.payload.result).toEqual(result)

                clientSocket.off(`message`, handler)
                resolve()
              }
            }
            clientSocket.on(`message`, handler)
          })

          websocketManager.emitStaticQueryData({
            id: staticQueryId,
            result,
          })

          await receivedDataOnClientPromise

          // disconnect remaining session (mostly to make sure other tests are not affected)
          await disconnectClientSocket(clientSocket)
        },
        TEST_TIMEOUT
      )
    })
  })

  describe(`Errors`, () => {
    itAsyncDone(`Emits errors to display by clients`, async done => {
      expect.assertions(1)

      const clientSocket = await getClientSocketAndWaitForConnect()

      function handler(msg): void {
        if (
          msg.type === `overlayError` &&
          msg.payload.id === `test` &&
          msg.payload?.message === `error-string`
        ) {
          clientSocket.off(`message`, handler)
          clientSocket.disconnect()
          expect(true).toBe(true)
          done()
        }
      }

      clientSocket.on(`message`, handler)
      websocketManager.emitError(`test`, `error-string`)
    })

    itAsyncDone(`Emits stored errors to new clients`, async done => {
      expect.assertions(1)

      const clientSocket = getClientSocket()

      function handler(msg): void {
        if (
          msg.type === `overlayError` &&
          msg.payload.id === `test` &&
          msg.payload?.message === `error-string`
        ) {
          clientSocket.off(`message`, handler)
          clientSocket.disconnect()
          expect(true).toBe(true)
          done()
        }
      }

      clientSocket.on(`message`, handler)
      // we don't emit error here, instead rely on error we emitted in previous test
    })

    itAsyncDone(
      `Can clear errors by emitting empty "overlayError" msg`,
      async done => {
        expect.assertions(1)

        const clientSocket = await getClientSocketAndWaitForConnect()

        function handler(msg): void {
          if (
            msg.type === `overlayError` &&
            msg.payload.id === `test` &&
            msg.payload.message === null
          ) {
            clientSocket.off(`message`, handler)
            clientSocket.disconnect()
            expect(true).toBe(true)
            done()
          }
        }

        clientSocket.on(`message`, handler)
        websocketManager.emitError(`test`, null)
      }
    )
  })
})
