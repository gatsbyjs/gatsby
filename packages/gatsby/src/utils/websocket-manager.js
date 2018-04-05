const path = require(`path`)
const { store } = require(`../redux`)
const fs = require(`fs`)

const getCachedPageData = (pagePath, directory) => {
  const { jsonDataPaths, pages } = store.getState()
  const page = pages.find(p => p.path === pagePath)
  const dataPath = jsonDataPaths[page.jsonName]
  if (typeof dataPath === `undefined`) return undefined
  const filePath = path.join(
    directory,
    `public`,
    `static`,
    `d`,
    `${dataPath}.json`
  )
  const result = JSON.parse(fs.readFileSync(filePath, `utf-8`))
  return {
    result,
    path: pagePath,
  }
}

const getRoomNameFromPath = path => `path-${path}`

class WebsocketManager {
  constructor() {
    this.isInitialised = false
    this.activePaths = new Map()
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

    this.websocket.on(`connection`, s => {
      let activePath = null

      const leaveRoom = path => {
        s.leave(getRoomNameFromPath(path))
        activePath = null
      }

      s.on(`disconnect`, s => {
        leaveRoom(activePath)
      })

      s.on(`registerPath`, path => {
        s.join(getRoomNameFromPath(path))
        activePath = path
        this.activePaths.set(s.id, path)

        if (this.results.has(path)) {
          s.emit(`queryResult`, this.results.get(path))
        } else {
          const result = getCachedPageData(path, this.programDir)
          this.results.set(path, result)
          s.emit(`queryResult`, result)
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
    const isActivePath =
      data.path && Array.from(this.activePaths.values()).includes(data.path)

    if (isActivePath) {
      this.websocket
        .to(getRoomNameFromPath(data.path))
        .emit(`queryResult`, data)
    }
    this.results.set(data.path, data)
  }
}

const manager = new WebsocketManager()

module.exports = manager
