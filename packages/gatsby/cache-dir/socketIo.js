let socket = null

export default function socketIo() {
  if (!socket) {
    // Try to initialize web socket if we didn't do it already
    try {
      socket = window.io()
    } catch (err) {
      console.error(`Could not connect to socket.io on dev server.`)
    }
  }
  return socket
}
