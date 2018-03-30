const { emitter } = require(`../redux`)

const getRoomNameFromPath = path => `path-${path}`

class WebsocketManager {
  constructor() {
    this.isInitialised = false
    this.results = new Map()
    this.websocket
    this.programDir

    this.init = this.init.bind(this)
    this.getSocket = this.getSocket.bind(this)
    this.emitData = this.emitData.bind(this)
  }

  init({ server, directory }) {
    this.programDir = directory
    this.websocket = require(`socket.io`)(server)

    const isRoomEmpty = roomName => {
      const clientsInRoom = this.websocket.sockets.adapter.rooms[roomName]
      return !clientsInRoom || clientsInRoom.length === 0
    }

    this.websocket.on(`connection`, s => {
      const activePaths = new Set()

      const leaveRoom = path => {
        const roomName = getRoomNameFromPath(path)
        s.leave(roomName)
        activePaths.delete(path)

        if (isRoomEmpty(roomName)) {
          emitter.emit(`STOP_RUNNING_QUERIES_FOR_PATH`, path)

          // keep results in memory for few seconds
          setTimeout(() => {
            if (isRoomEmpty(roomName)) {
              this.results.delete(path)
            }
          }, 5000)
        }
      }

      s.on(`disconnect`, s => {
        activePaths.forEach(path => {
          leaveRoom(path)
        })
      })

      s.on(`registerPath`, path => {
        const roomName = getRoomNameFromPath(path)

        if (isRoomEmpty(roomName)) {
          emitter.emit(`RUN_QUERIES_FOR_PATH`, path)
        }

        s.join(roomName)
        activePaths.add(path)

        if (this.results.has(path)) {
          s.emit(`queryResult`, this.results.get(path))
        }
      })

      s.on(`unregisterPath`, path => {
        leaveRoom(path)
      })
    })

    this.isInitialised = true
  }

  getSocket() {
    return this.isInitialised && this.websocket
  }

  emitData(data) {
    this.websocket.to(getRoomNameFromPath(data.path)).emit(`queryResult`, data)
    this.results.set(data.path, data)
  }
}

const manager = new WebsocketManager()

module.exports = manager
