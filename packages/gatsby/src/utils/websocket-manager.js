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
    this.activePaths = new Set()
    this.pageResults = new Map()
    this.staticQueryResults = new Map()
    this.websocket
    this.programDir

    this.init = this.init.bind(this)
    this.getSocket = this.getSocket.bind(this)
    this.emitPageData = this.emitPageData.bind(this)
    this.emitStaticQueryData = this.emitStaticQueryData.bind(this)
  }

  init({ server, directory }) {
    this.programDir = directory
    this.websocket = require(`socket.io`)(server)

    this.websocket.on(`connection`, s => {
      let activePath = null

      // Send already existing static query results
      this.staticQueryResults.forEach((result, id) => {
        this.websocket.send({
          type: `staticQueryResult`,
          payload: { id, result },
        })
      })
      this.pageResults.forEach((result, path) => {
        this.websocket.send({
          type: `pageQueryResult`,
          payload: result,
        })
      })

      const leaveRoom = path => {
        s.leave(getRoomNameFromPath(path))
        const leftRoom = this.websocket.sockets.adapter.rooms[
          getRoomNameFromPath(path)
        ]
        if (!leftRoom || leftRoom.length === 0) {
          this.activePaths.delete(path)
        }
      }

      s.on(`registerPath`, path => {
        s.join(getRoomNameFromPath(path))
        activePath = path
        this.activePaths.add(path)

        if (this.pageResults.has(path)) {
          this.websocket.send({
            type: `pageQueryResult`,
            payload: this.pageResults.get(path),
          })
        } else {
          const result = getCachedPageData(path, this.programDir)
          this.pageResults.set(path, result)
          this.websocket.send({
            type: `pageQueryResult`,
            payload: this.pageResults.get(path),
          })
        }
      })

      s.on(`disconnect`, s => {
        leaveRoom(activePath)
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

  emitStaticQueryData(data) {
    this.staticQueryResults.set(data.id, data.result)
    if (this.isInitialised) {
      this.websocket.send({ type: `staticQueryResult`, payload: data })
    }
  }
  emitPageData(data) {
    if (this.isInitialised) {
      this.websocket.send({ type: `pageQueryResult`, payload: data })
    }
    this.pageResults.set(data.path, data)
  }
}

const manager = new WebsocketManager()

module.exports = manager
