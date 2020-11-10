import io from "socket.io-client"
import { reportError, clearError } from "./error-overlay-handler"
import loader from "./loader"
import normalizePagePath from "./normalize-page-path"
import { debounce } from "lodash"

let socket = null
let staticQueryData = {}

const debouncedLoadPage = debounce(
  () => loader.loadPage(window.location.pathname, true),
  100,
  { leading: true }
)

export const getStaticQueryData = () => staticQueryData

const didDataChange = (msg, queryData) => {
  const id =
    msg.type === `staticQueryResult`
      ? msg.payload.id
      : normalizePagePath(msg.payload.id)
  return (
    !(id in queryData) ||
    JSON.stringify(msg.payload.result) !== JSON.stringify(queryData[id])
  )
}

export default function socketIo() {
  if (process.env.NODE_ENV !== `production`) {
    if (!socket) {
      // Try to initialize web socket if we didn't do it already
      try {
        // force websocket as transport
        socket = io({
          transports: [process.env.GATSBY_SOCKET_IO_DEFAULT_TRANSPORT],
        })

        // when websocket fails, we'll try polling
        socket.on(`reconnect_attempt`, () => {
          socket.io.opts.transports = [`polling`, `websocket`]
        })

        socket.on(`message`, msg => {
          console.log(msg)
          if (msg.type === `overlayError`) {
            if (msg.payload.message) {
              reportError(msg.payload.id, msg.payload.message)
            } else {
              clearError(msg.payload.id)
            }
          }
          if (msg.type === `staticQueryResult`) {
            if (didDataChange(msg, staticQueryData)) {
              staticQueryData = {
                ...staticQueryData,
                [msg.payload.id]: msg.payload.result,
              }
            }
          }

          if (msg.type === `pageQueryResult`) {
            debouncedLoadPage()
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

export { registerPath, unregisterPath }
