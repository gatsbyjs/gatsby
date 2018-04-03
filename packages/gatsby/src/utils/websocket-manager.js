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

    emitter.on(`INVALIDATE_QUERY_RESULTS`, path => {
      this.results.delete(path)
    })

    this.websocket.on(`connection`, s => {
      /**
       * Ref counting map for paths
       * differentiate between active path and linked path, because
       * queries will have different priorities for each type
       */
      const pathRefCount = {
        ACTIVE_PATH: new Map(),
        LINKED_PATH: new Map(),
      }

      const leaveRoom = ({ path, mode, forceRemove = false }) => {
        const roomName = getRoomNameFromPath(path)

        let removeQueryListener = forceRemove

        if (!forceRemove) {
          let refCount = pathRefCount[mode].get(path)
          if (typeof refCount !== `undefined`) {
            refCount--
            if (refCount <= 0) {
              removeQueryListener = true
            } else {
              pathRefCount[mode].set(path, refCount)
            }
          } else {
            // If we have not ref counts, remove listener just in case
            removeQueryListener = true
          }
        }

        if (removeQueryListener) {
          pathRefCount[mode].delete(path)

          if (
            !pathRefCount.ACTIVE_PATH.has(path) &&
            !pathRefCount.LINKED_PATH.has(path)
          ) {
            // Leave room if both ACTIVE and LINKED paths don't have
            s.leave(roomName)
          }

          emitter.emit(`REMOVE_QUERY_RESULTS_LISTENER`, {
            path,
            mode,
            listenerID: s.id,
          })
        }
      }

      s.on(`disconnect`, () => {
        ;[`ACTIVE_PATH`, `LINKED_PATH`].forEach(mode => {
          pathRefCount[mode].forEach((refCount, path) => {
            leaveRoom({ path, mode, forceRemove: true })
          })
        })
      })

      s.on(`registerPath`, ({ path, mode }) => {
        const refCount = pathRefCount[mode].get(path)
        if (typeof refCount !== `undefined`) {
          pathRefCount[mode].set(path, refCount + 1)
        } else {
          const roomName = getRoomNameFromPath(path)

          emitter.emit(`ADD_QUERY_RESULTS_LISTENER`, {
            path,
            mode,
            listenerID: s.id,
          })

          s.join(roomName)

          pathRefCount[mode].set(path, 1)

          if (this.results.has(path)) {
            s.emit(`queryResult`, this.results.get(path))
          }
        }
      })

      s.on(`unregisterPath`, args => {
        // Add small delay before leaving room, to allow page to change
        // so we first add new listeners before removing old ones
        setTimeout(() => {
          leaveRoom(args)
        }, 500)
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
