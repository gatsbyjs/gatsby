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
        socket = io()
        socket.on(`message`, msg => {
          if (msg.type === `staticQueryResult`) {
            staticQueryData = {
              ...staticQueryData,
              [msg.payload.id]: msg.payload.result,
            }
          }
          if (msg.type === `pageQueryResult`) {
            pageQueryData = {
              ...pageQueryData,
              [msg.payload.id ? msg.payload.id : msg.payload.path]: msg.payload
                .result,
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
