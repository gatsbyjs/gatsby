export default function socketIo() {
  try {
    const socket = window.io()

    socket.on(`reload`, () => {
      window.location.reload()
    })
  } catch(err) {
    console.error(`Could not connect to socket.io on dev server.`)
  }
}
