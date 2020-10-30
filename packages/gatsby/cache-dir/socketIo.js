import io from "socket.io-client"
import { reportError, clearError } from "./error-overlay-handler"
import normalizePagePath from "./normalize-page-path"
// TODO move away from lodash
import isEqual from "lodash/isEqual"

let socket = null

const inFlightGetPageDataPromiseCache = {}
let staticQueryData = {}
let pageQueryData = {}
let hasReceivedSocketIoUpdateBool = false

export const getStaticQueryData = () => staticQueryData
export const getPageQueryData = () => pageQueryData

const didDataChange = (id, queryData, exisitingQueryData) =>
  !(id in exisitingQueryData) || !isEqual(queryData, exisitingQueryData[id])

export default function socketIo() {
  if (process.env.NODE_ENV !== `production`) {
    if (!socket) {
      // Try to initialize web socket if we didn't do it already
      try {
        // force websocket as transport
        socket = io({
          transports: [`websocket`],
        })

        // when websocket fails, we'll try polling
        socket.on(`reconnect_attempt`, () => {
          socket.io.opts.transports = [`polling`, `websocket`]
        })

        socket.on(`connect`, () => {
          // we might have disconnected so we loop over the page-data requests in flight
          // so we can get the data again
          Object.keys(inFlightGetPageDataPromiseCache).forEach(pathname => {
            socket.emit(`getDataForPath`, pathname)
          })
        })

        socket.on(`message`, msg => {
          if (msg.type === `staticQueryResult`) {
            hasReceivedSocketIoUpdateBool = true
            if (
              didDataChange(msg.payload.id, msg.payload.result, staticQueryData)
            ) {
              staticQueryData = {
                ...staticQueryData,
                [msg.payload.id]: msg.payload.result,
              }
            }
          } else if (msg.type === `pageQueryResult`) {
            hasReceivedSocketIoUpdateBool = true
            const normalizedPagePath = normalizePagePath(msg.payload.id)

            const result = msg.payload.result
            if (didDataChange(normalizedPagePath, result, pageQueryData)) {
              pageQueryData = {
                ...pageQueryData,
                [normalizedPagePath]: result,
              }
            }
          } else if (msg.type === `overlayError`) {
            if (msg.payload.message) {
              reportError(msg.payload.id, msg.payload.message)
            } else {
              clearError(msg.payload.id)
            }
          }

          if (msg.type && msg.payload) {
            ___emitter.emit(msg.type, msg.payload)
          }
        })

        // Prevents certain browsers spamming XHR 'ERR_CONNECTION_REFUSED'
        // errors within the console, such as when exiting the develop process.
        socket.on(`disconnect`, () => {
          console.warn(`[socket.io] Disconnected from dev server.`)
        })
      } catch (err) {
        console.error(`Could not connect to socket.io on dev server.`)
      }
    }
    return socket
  } else {
    return null
  }
}

function savePageDataAndStaticQueries(
  pathname,
  { webpackCompilationHash, matchPath, ...pageData },
  staticQueriesData = {}
) {
  const normalizedPagePath = normalizePagePath(pathname)

  if (didDataChange(normalizedPagePath, pageData, pageQueryData)) {
    pageQueryData = {
      ...pageQueryData,
      [normalizedPagePath]: pageData,
    }
  }

  for (const id in staticQueriesData) {
    if (didDataChange(id, staticQueriesData[id], staticQueryData)) {
      staticQueryData = {
        ...staticQueryData,
        [id]: staticQueriesData[id],
      }
    }
  }

  ___emitter.emit(`pageQueryResult`, pageData)
}

function getPageData(pathname) {
  pathname = normalizePagePath(pathname)
  if (inFlightGetPageDataPromiseCache[pathname]) {
    return inFlightGetPageDataPromiseCache[pathname]
  } else {
    inFlightGetPageDataPromiseCache[pathname] = new Promise(resolve => {
      if (pageQueryData[pathname]) {
        delete inFlightGetPageDataPromiseCache[pathname]
        resolve(pageQueryData[pathname])
      } else {
        const onPageDataCallback = msg => {
          if (
            msg.type === `pageQueryResult` &&
            normalizePagePath(msg.payload.id) === pathname
          ) {
            socket.off(`message`, onPageDataCallback)
            delete inFlightGetPageDataPromiseCache[pathname]
            resolve(pageQueryData[pathname])
          }
        }
        socket.on(`message`, onPageDataCallback)

        socket.emit(`getDataForPath`, pathname)
      }
    })
  }
  return inFlightGetPageDataPromiseCache[pathname]
}

// Tell websocket-manager.js the new path we're on.
// This will help the backend prioritize queries for this
// path.
function registerPath(path) {
  socket.emit(`registerPath`, path)
}

// Unregister the former path
function unregisterPath(path) {
  socket.emit(`unregisterPath`, path)
}

function hasReceivedSocketIoUpdate() {
  return hasReceivedSocketIoUpdateBool
}

export {
  getPageData,
  registerPath,
  unregisterPath,
  hasReceivedSocketIoUpdate,
  savePageDataAndStaticQueries,
}
