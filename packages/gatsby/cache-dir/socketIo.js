let socket = null

let staticQueryData = {}
let pageQueryData = {}
let isInitialized = false

export const getStaticQueryData = () => staticQueryData
export const getPageQueryData = () => pageQueryData
export const getIsInitialized = () => isInitialized

export default function socketIo() {
  if (process.env.NODE_ENV !== `production`) {
    if (!socket) {
      // Try to initialize web socket if we didn't do it already
      try {
        // eslint-disable-next-line no-undef
        socket = io()

        const didDataChange = (msg, queryData) =>
          !(msg.payload.id in queryData) ||
          JSON.stringify(msg.payload.result) !==
            JSON.stringify(queryData[msg.payload.id])

        socket.on(`message`, msg => {
          if (msg.type === `staticQueryResult`) {
            if (didDataChange(msg, staticQueryData)) {
              staticQueryData = {
                ...staticQueryData,
                [msg.payload.id]: msg.payload.result,
              }
            }
          }
          if (msg.type === `pageQueryResult`) {
            if (didDataChange(msg, pageQueryData)) {
              pageQueryData = {
                ...pageQueryData,
                [msg.payload.id]: msg.payload.result,
              }
            }
          }
          if (msg.type && msg.payload) {
            ___emitter.emit(msg.type, msg.payload)
          }
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

function getPageData(pathname, cb) {
  if (pathname in pageQueryData) {
    // We already have data, no need to request it
    cb && cb()
    return true
  }

  if (cb) {
    const onPageDataCallback = msg => {
      if (msg.type === `pageQueryResult` && msg.payload.id === pathname) {
        socket.off(`message`, onPageDataCallback)
        cb()
      }
    }
    socket.on(`message`, onPageDataCallback)
  }

  socket.emit(`getDataForPath`, pathname)
  return false
}

function registerPath(path) {
  socket.emit(`registerPath`, path)
}

function unregisterPath(path) {
  socket.emit(`unregisterPath`, path)
}

export { getPageData, registerPath, unregisterPath }
