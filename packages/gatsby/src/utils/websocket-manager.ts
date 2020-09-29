/* eslint-disable no-invalid-this */
import path from "path"
import { store } from "../redux"
import { Server as HTTPSServer } from "https"
import { Server as HTTPServer } from "http"
import fs from "fs-extra"
import { readPageData, IPageDataWithQueryResult } from "../utils/page-data"
import telemetry from "gatsby-telemetry"
import url from "url"
import { createHash } from "crypto"
import { normalizePagePath, denormalizePagePath } from "./normalize-page-path"
import socketIO from "socket.io"

export interface IPageQueryResult {
  id: string
  result?: IPageDataWithQueryResult
}

export interface IStaticQueryResult {
  id: string
  result: unknown // TODO: Improve this once we understand what the type is
}

type PageResultsMap = Map<string, IPageQueryResult>
type QueryResultsMap = Map<string, IStaticQueryResult>

/**
 * Get page query result for given page path.
 * @param {string} pagePath Path to a page.
 */
async function getPageData(pagePath: string): Promise<IPageQueryResult> {
  const { program, pages } = store.getState()
  const publicDir = path.join(program.directory, `public`)

  const result: IPageQueryResult = {
    id: pagePath,
    result: undefined,
  }
  if (pages.has(denormalizePagePath(pagePath)) || pages.has(pagePath)) {
    try {
      const pageData: IPageDataWithQueryResult = await readPageData(
        publicDir,
        pagePath
      )

      result.result = pageData
    } catch (err) {
      throw new Error(
        `Error loading a result for the page query in "${pagePath}". Query was not run and no cached result was found.`
      )
    }
  }

  return result
}

/**
 * Get page query result for given page path.
 * @param {string} pagePath Path to a page.
 */
async function getStaticQueryData(
  staticQueryId: string
): Promise<IStaticQueryResult> {
  const { program } = store.getState()
  const publicDir = path.join(program.directory, `public`)

  const filePath = path.join(
    publicDir,
    `page-data`,
    `sq`,
    `d`,
    `${staticQueryId}.json`
  )

  const result: IStaticQueryResult = {
    id: staticQueryId,
    result: undefined,
  }
  if (await fs.pathExists(filePath)) {
    try {
      const fileResult = await fs.readJson(filePath)

      result.result = fileResult
    } catch (err) {
      // ignore errors
    }
  }

  return result
}

function hashPaths(paths: Array<string>): Array<string> {
  return paths.map(path => createHash(`sha256`).update(path).digest(`hex`))
}

const getRoomNameFromPath = (path: string): string => `path-${path}`

export class WebsocketManager {
  activePaths: Set<string> = new Set()
  connectedClients = 0
  errors: Map<string, string> = new Map()
  pageResults: PageResultsMap = new Map()
  staticQueryResults: QueryResultsMap = new Map()
  websocket: socketIO.Server | undefined

  init = ({
    server,
  }: {
    directory: string
    server: HTTPSServer | HTTPServer
  }): socketIO.Server => {
    this.websocket = socketIO(server, {
      // we see ping-pong timeouts on gatsby-cloud when socket.io is running for a while
      // increasing it should help
      // @see https://github.com/socketio/socket.io/issues/3259#issuecomment-448058937
      pingTimeout: 30000,
    })

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
        let pageData = this.pageResults.get(path)
        if (!pageData) {
          try {
            pageData = await getPageData(path)

            this.pageResults.set(path, pageData)
          } catch (err) {
            console.log(err.message)
            return
          }
        }

        const staticQueryHashes = pageData.result?.staticQueryHashes ?? []
        await Promise.all(
          staticQueryHashes.map(async queryId => {
            let staticQueryResult = this.staticQueryResults.get(queryId)

            if (!staticQueryResult) {
              staticQueryResult = await getStaticQueryData(queryId)
              this.staticQueryResults.set(queryId, staticQueryResult)
            }

            socket.send({
              type: `staticQueryResult`,
              payload: staticQueryResult,
            })
          })
        )

        socket.send({
          type: `pageQueryResult`,
          why: `getDataForPath`,
          payload: pageData,
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
        if (path) {
          activePath = path
          this.activePaths.add(path)
        }
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
