const path = require(`path`)
const { store } = require(`../redux`)
const fs = require(`fs`)

const readCachedResults = (dataPath, directory) => {
  const filePath = path.join(
    directory,
    `public`,
    `static`,
    `d`,
    `${dataPath}.json`
  )
  return JSON.parse(fs.readFileSync(filePath, `utf-8`))
}

const getCachedPageData = (pagePath, directory) => {
  const { jsonDataPaths, pages } = store.getState()
  const page = pages.find(p => p.path === pagePath)
  const dataPath = jsonDataPaths[page.jsonName]
  if (typeof dataPath === `undefined`) {
    console.log(
      `Error loading a result for the page query in "${pagePath}". Query was not run and no cached result was found.`
    )
    return undefined
  }

  return {
    result: readCachedResults(dataPath, directory),
    id: pagePath,
  }
}

const getCachedStaticQueryResults = (resultsMap, directory) => {
  const cachedStaticQueryResults = new Map()
  const { staticQueryComponents, jsonDataPaths } = store.getState()
  staticQueryComponents.forEach(staticQueryComponent => {
    // Don't read from file if results were already passed from query runner
    if (resultsMap.has(staticQueryComponent.hash)) return

    const dataPath = jsonDataPaths[staticQueryComponent.jsonName]
    if (typeof dataPath === `undefined`) {
      console.log(
        `Error loading a result for the StaticQuery in "${
          staticQueryComponent.componentPath
        }". Query was not run and no cached result was found.`
      )
      return
    }
    cachedStaticQueryResults.set(
      staticQueryComponent.hash,
      {
        result: readCachedResults(dataPath, directory),
        id: staticQueryComponent.hash,
      }
    )
  })
  return cachedStaticQueryResults
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

    const cachedStaticQueryResults = getCachedStaticQueryResults(
      this.staticQueryResults,
      this.programDir
    )
    this.staticQueryResults = new Map([
      ...this.staticQueryResults,
      ...cachedStaticQueryResults,
    ])

    this.websocket = require(`socket.io`)(server)

    this.websocket.on(`connection`, s => {
      let activePath = null

      // Send already existing static query results
      this.staticQueryResults.forEach(result => {
        this.websocket.send({
          type: `staticQueryResult`,
          payload: result,
        })
      })
      this.pageResults.forEach(result => {
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
    this.staticQueryResults.set(data.id, data)
    if (this.isInitialised) {
      this.websocket.send({ type: `staticQueryResult`, payload: data })
    }
  }
  emitPageData(data) {
    if (this.isInitialised) {
      this.websocket.send({ type: `pageQueryResult`, payload: data })
    }
    this.pageResults.set(data.id, data)
  }
}

const manager = new WebsocketManager()

module.exports = manager
