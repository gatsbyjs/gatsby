import path from "path"
import { store } from "../redux"
import fs from "fs"
import pageDataUtil from "../utils/page-data"
import telemetry from "gatsby-telemetry"
import url from "url"
import { createHash } from "crypto"
import { normalizePagePath, denormalizePagePath } from "./normalize-page-path"
import socketIO from "socket.io"

interface IQueryResult {
  id: string
  result?: object
}

type QueryResultsMap = Map<string, IQueryResult>

/**
 * Get cached page query result for given page path.
 * @param {string} pagePath Path to a page.
 */
const getCachedPageData = async (
  pagePath: string
): Promise<IQueryResult | undefined> => {
  const { program, pages } = store.getState()
  const publicDir = path.join(program.directory, `public`)
  if (pages.has(denormalizePagePath(pagePath)) || pages.has(pagePath)) {
    try {
      const pageData = await pageDataUtil.read({ publicDir }, pagePath)

      return {
        result: pageData.result,
        id: pagePath,
      }
    } catch (err) {
      throw new Error(
        `Error loading a result for the page query in "${pagePath}". Query was not run and no cached result was found.`
      )
    }
  }

  return undefined
}

const hashPaths = (paths?: string[]): undefined | Array<string | undefined> => {
  if (!paths) {
    return undefined
  }
  return paths.map(path => {
    if (!path) {
      return undefined
    }
    return createHash(`sha256`)
      .update(path)
      .digest(`hex`)
  })
}

/**
 * Get cached StaticQuery results for components that Gatsby didn't run query yet.
 * @param {QueryResultsMap} resultsMap Already stored results for queries that don't need to be read from files.
 * @param {string} directory Root directory of current project.
 */
const getCachedStaticQueryResults = (
  resultsMap: QueryResultsMap,
  directory: string
): QueryResultsMap => {
  const cachedStaticQueryResults = new Map()
  const { staticQueryComponents } = store.getState()
  staticQueryComponents.forEach(staticQueryComponent => {
    // Don't read from file if results were already passed from query runner
    if (resultsMap.has(staticQueryComponent.hash)) return
    const filePath = path.join(
      directory,
      `public`,
      `static`,
      `d`,
      `${staticQueryComponent.hash}.json`
    )
    const fileResult = fs.readFileSync(filePath, `utf-8`)
    if (fileResult === `undefined`) {
      console.log(
        `Error loading a result for the StaticQuery in "${staticQueryComponent.componentPath}". Query was not run and no cached result was found.`
      )
      return
    }
    cachedStaticQueryResults.set(staticQueryComponent.hash, {
      result: JSON.parse(fileResult),
      id: staticQueryComponent.hash,
    })
  })
  return cachedStaticQueryResults
}

const getRoomNameFromPath = (path: string): string => `path-${path}`

class WebsocketManager {
  pageResults: QueryResultsMap
  staticQueryResults: QueryResultsMap
  errors: Map<string, string>
  isInitialised: boolean
  activePaths: Set<string>
  connectedClients: number

  // Initialized in init()
  websocket!: socketIO.Server

  constructor() {
    this.isInitialised = false
    this.activePaths = new Set()
    this.pageResults = new Map()
    this.staticQueryResults = new Map()
    this.errors = new Map()
    // this.websocket

    this.init = this.init.bind(this)
    this.getSocket = this.getSocket.bind(this)
    this.emitPageData = this.emitPageData.bind(this)
    this.emitStaticQueryData = this.emitStaticQueryData.bind(this)
    this.emitError = this.emitError.bind(this)
    this.connectedClients = 0
  }

  init({
    server,
    directory,
  }: {
    server: unknown
    directory: string
  }): socketIO.Server {
    const cachedStaticQueryResults = getCachedStaticQueryResults(
      this.staticQueryResults,
      directory
    )
    this.staticQueryResults = new Map([
      ...this.staticQueryResults,
      ...cachedStaticQueryResults,
    ])

    this.websocket = socketIO(server)

    this.websocket.on(`connection`, s => {
      let activePath: string | null = null
      if (
        s &&
        s.handshake &&
        s.handshake.headers &&
        s.handshake.headers.referer
      ) {
        const path = url.parse(s.handshake.headers.referer).path
        if (path) {
          activePath = path
          this.activePaths.add(path)
        }
      }

      this.connectedClients += 1
      // Send already existing static query results
      this.staticQueryResults.forEach(result => {
        this.websocket.send({
          type: `staticQueryResult`,
          payload: result,
        })
      })
      this.errors.forEach((message, errorID) => {
        this.websocket.send({
          type: `overlayError`,
          payload: {
            id: errorID,
            message,
          },
        })
      })

      const leaveRoom = (path: string): void => {
        s.leave(getRoomNameFromPath(path))
        const leftRoom = this.websocket.sockets.adapter.rooms[
          getRoomNameFromPath(path)
        ]
        if (!leftRoom || leftRoom.length === 0) {
          this.activePaths.delete(path)
        }
      }

      const getDataForPath = async (path: string): Promise<void> => {
        if (!this.pageResults.has(path)) {
          try {
            const result = await getCachedPageData(path)

            this.pageResults.set(path, result || { id: path })
          } catch (err) {
            console.log(err.message)

            return
          }
        }

        this.websocket.send({
          type: `pageQueryResult`,
          why: `getDataForPath`,
          payload: this.pageResults.get(path),
        })

        const clientsCount = this.connectedClients
        if (clientsCount && clientsCount > 0) {
          telemetry.trackCli(
            `WEBSOCKET_PAGE_DATA_UPDATE`,
            {
              siteMeasurements: {
                clientsCount,
                paths: hashPaths(Array.from(this.activePaths)),
              },
            },
            { debounce: true }
          )
        }
      }

      s.on(`getDataForPath`, getDataForPath)

      s.on(`registerPath`, path => {
        s.join(getRoomNameFromPath(path))
        activePath = path
        this.activePaths.add(path)
      })

      s.on(`disconnect`, () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        leaveRoom(activePath!)
        this.connectedClients -= 1
      })

      s.on(`unregisterPath`, path => {
        leaveRoom(path)
      })
    })

    this.isInitialised = true

    return this.websocket
  }

  getSocket(): socketIO.Server | undefined {
    return this.isInitialised ? this.websocket : undefined
  }

  emitStaticQueryData(data: IQueryResult): void {
    this.staticQueryResults.set(data.id, data)
    if (this.isInitialised) {
      this.websocket.send({ type: `staticQueryResult`, payload: data })
      const clientsCount = this.connectedClients
      if (clientsCount && clientsCount > 0) {
        telemetry.trackCli(
          `WEBSOCKET_EMIT_STATIC_PAGE_DATA_UPDATE`,
          {
            siteMeasurements: {
              clientsCount,
              paths: hashPaths(Array.from(this.activePaths)),
            },
          },
          { debounce: true }
        )
      }
    }
  }

  emitPageData(data: IQueryResult): void {
    data.id = normalizePagePath(data.id)
    this.pageResults.set(data.id, data)
    if (this.isInitialised) {
      this.websocket.send({ type: `pageQueryResult`, payload: data })
      const clientsCount = this.connectedClients
      if (clientsCount && clientsCount > 0) {
        telemetry.trackCli(
          `WEBSOCKET_EMIT_PAGE_DATA_UPDATE`,
          {
            siteMeasurements: {
              clientsCount,
              paths: hashPaths(Array.from(this.activePaths)),
            },
          },
          { debounce: true }
        )
      }
    }
  }
  emitError(id: string, message?: string): void {
    if (message) {
      this.errors.set(id, message)
    } else {
      this.errors.delete(id)
    }

    if (this.isInitialised) {
      this.websocket.send({ type: `overlayError`, payload: { id, message } })
    }
  }
}

export const websocketManager: WebsocketManager = new WebsocketManager()
