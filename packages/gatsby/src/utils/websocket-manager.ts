import path from "path"
import { store } from "../redux"
import { Server as HTTPSServer } from "https"
import { Server as HTTPServer } from "http"
import fs from "fs"
import pageDataUtil from "../utils/page-data"
import telemetry from "gatsby-telemetry"
import url from "url"
import { createHash } from "crypto"
import { normalizePagePath, denormalizePagePath } from "./normalize-page-path"
import socketIO from "socket.io"

interface IPageQueryResult {
  id: string
  result: any // TODO: Improve this once we understand what the type is
}

interface IStaticQueryResult {
  id: number
  result: any // TODO: Improve this once we understand what the type is
}

type PageResultsMap = Map<string, IPageQueryResult>
type QueryResultsMap = Map<number, IStaticQueryResult>

/**
 * Get cached page query result for given page path.
 * @param {string} pagePath Path to a page.
 */
const getCachedPageData = async (
  pagePath: string
): Promise<IPageQueryResult> => {
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

  return {
    id: pagePath,
    result: undefined,
  }
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
  const cachedStaticQueryResults: QueryResultsMap = new Map()
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
  activePaths: Set<string> = new Set()
  connectedClients = 0
  errors: Map<string, string> = new Map()
  pageResults: PageResultsMap = new Map()
  staticQueryResults: QueryResultsMap = new Map()
  websocket: socketIO.Server | undefined

  init = ({
    directory,
    server,
  }: {
    directory: string
    server: HTTPSServer | HTTPServer
  }): socketIO.Server => {
    const cachedStaticQueryResults = getCachedStaticQueryResults(
      this.staticQueryResults,
      directory
    )
    this.staticQueryResults = new Map([
      ...this.staticQueryResults,
      ...cachedStaticQueryResults,
    ])

    this.websocket = socketIO(server)

    this.websocket.on(`connection`, socket => {
      let activePath: string | null = null
      if (socket?.handshake?.headers?.referer) {
        const path = url.parse(socket.handshake.headers.referer).path
        if (path) {
          activePath = path
          this.activePaths.add(path)
        }
      }

      this.connectedClients += 1
      // Send already existing static query results
      this.staticQueryResults.forEach(result => {
        socket.send({
          type: `staticQueryResult`,
          payload: result,
        })
      })
      this.errors.forEach((message, errorID) => {
        socket.send({
          type: `overlayError`,
          payload: {
            id: errorID,
            message,
          },
        })
      })

      const leaveRoom = (path: string): void => {
        socket.leave(getRoomNameFromPath(path))
        if (!this.websocket) return
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

            this.pageResults.set(path, result)
          } catch (err) {
            console.log(err.message)

            return
          }
        }

        socket.send({
          type: `pageQueryResult`,
          why: `getDataForPath`,
          payload: this.pageResults.get(path),
        })

        if (this.connectedClients > 0) {
          telemetry.trackCli(
            `WEBSOCKET_PAGE_DATA_UPDATE`,
            {
              siteMeasurements: {
                clientsCount: this.connectedClients,
                paths: hashPaths(Array.from(this.activePaths)),
              },
            },
            { debounce: true }
          )
        }
      }

      socket.on(`getDataForPath`, getDataForPath)

      socket.on(`registerPath`, (path: string): void => {
        socket.join(getRoomNameFromPath(path))
        activePath = path
        this.activePaths.add(path)
      })

      socket.on(`disconnect`, (): void => {
        if (activePath) leaveRoom(activePath)
        this.connectedClients -= 1
      })

      socket.on(`unregisterPath`, (path: string): void => {
        leaveRoom(path)
      })
    })

    return this.websocket
  }

  getSocket = (): socketIO.Server | undefined => this.websocket

  emitStaticQueryData = (data: IStaticQueryResult): void => {
    this.staticQueryResults.set(data.id, data)

    if (this.websocket) {
      this.websocket.send({ type: `staticQueryResult`, payload: data })
      if (this.connectedClients > 0) {
        telemetry.trackCli(
          `WEBSOCKET_EMIT_STATIC_PAGE_DATA_UPDATE`,
          {
            siteMeasurements: {
              clientsCount: this.connectedClients,
              paths: hashPaths(Array.from(this.activePaths)),
            },
          },
          { debounce: true }
        )
      }
    }
  }

  emitPageData = (data: IPageQueryResult): void => {
    data.id = normalizePagePath(data.id)
    this.pageResults.set(data.id, data)

    if (this.websocket) {
      this.websocket.send({ type: `pageQueryResult`, payload: data })

      if (this.connectedClients > 0) {
        telemetry.trackCli(
          `WEBSOCKET_EMIT_PAGE_DATA_UPDATE`,
          {
            siteMeasurements: {
              clientsCount: this.connectedClients,
              paths: hashPaths(Array.from(this.activePaths)),
            },
          },
          { debounce: true }
        )
      }
    }
  }

  emitError = (id: string, message?: string): void => {
    if (message) {
      this.errors.set(id, message)
    } else {
      this.errors.delete(id)
    }

    if (this.websocket) {
      this.websocket.send({ type: `overlayError`, payload: { id, message } })
    }
  }
}

export const websocketManager: WebsocketManager = new WebsocketManager()
