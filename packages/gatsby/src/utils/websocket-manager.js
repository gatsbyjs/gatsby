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

/**
 * Specialized result buffer that will keep in memory results
 * of last N queries needed to render pages in browser
 */
class ResultBuffer {
  constructor(capacity) {
    this.history = new Array(capacity)
    this.first = 0
    this.size = 0
    this.results = new Map()
  }

  get(path) {
    return this.results.get(path)
  }

  set(data, updateOnly) {
    if (!this.results.has(data.path)) {
      if (updateOnly) {
        return
      }

      // if we don't have result for this path in buffer - need to add history tracking
      const end = (this.first + this.size) % this.history.length
      const isFull = this.size === this.history.length

      if (isFull) {
        const pathOfResultTodelete = this.history[end].path
        this.results.delete(pathOfResultTodelete)

        this.first = (this.first + 1) % this.results.length
      } else {
        this.size++
      }

      this.history[end] = data.path
    }

    this.results.set(data.path, data)
  }
}

class WebsocketManager {
  constructor() {
    this.isInitialised = false
    this.results = new ResultBuffer(15)
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

    const dataInBuffer = this.results.get(path)
    if (dataInBuffer) {
      // If we have data in buffer emit that instead of reading json file
      this.emitData({
        data: dataInBuffer,
      })
      return
    }

    const data = getCachedPageData(path, this.programDir)
    this.emitData({ data })
  }

  emitData({ data }) {
    const isActivePath =
      data.path && Array.from(this.activePaths.values()).includes(data.path)

    this.results.set(data, !isActivePath)
    // push results if this path is active on a client
    if (isActivePath) {
      this.websocket.emit(`queryResult`, data)
    }
  }
}

const manager = new WebsocketManager()

module.exports = manager
