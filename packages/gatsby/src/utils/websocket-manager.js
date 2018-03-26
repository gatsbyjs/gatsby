const path = require(`path`)
const { store } = require(`../redux`)
const fs = require(`fs`)

const getCachedPageData = (jsonName, directory) => {
  const jsonDataPaths = store.getState().jsonDataPaths
  const dataPath = jsonDataPaths[jsonName]
  if (typeof dataPath === `undefined`) return undefined
  const filePath = path.join(
    directory,
    `public`,
    `static`,
    `d`,
    `${dataPath}.json`
  )
  const data = fs.readFileSync(filePath, `utf-8`)
  return {
    data,
    dataPath,
    path: jsonName,
  }
}

class WebsocketManager {
  constructor() {
    this.isInitialised = false
    this.results = {}
    this.activePaths = new Map()
    this.websocket
    this.programDir

    this.init = this.init.bind(this)
    this.getSocket = this.getSocket.bind(this)
    this.getPageData = this.getPageData.bind(this)
    this.emitData = this.emitData.bind(this)
  }

  init({ server, directory }) {
    this.programDir = directory
    this.websocket = require(`socket.io`)(server)

    this.websocket.on(`connection`, s => {
      const clientId = s.id
      s.join(`clients`)
      s.on(`getPageData`, path => {
        this.getPageData(path, clientId)
      })
      s.on(`disconnect`, s => {
        this.activePaths.delete(clientId)
      })
    })

    this.isInitialised = true
  }

  getSocket() {
    return this.isInitialised && this.websocket
  }

  getPageData(path, clientId) {
    // track the active path for each connected client
    this.activePaths.set(clientId, path)
    const data = getCachedPageData(path, this.programDir)
    this.emitData({ data, forceEmit: true })
  }

  emitData({ data, forceEmit = false }) {
    const isActivePath =
      data.path && Array.from(this.activePaths.values()).includes(data.path)

    // push results if this path is active on a client
    if (isActivePath || forceEmit) {
      this.websocket.emit(`queryResult`, data)
    }
  }
}

const manager = new WebsocketManager()

module.exports = manager
