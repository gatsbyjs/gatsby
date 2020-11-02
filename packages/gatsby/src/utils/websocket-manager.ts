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
import { findPageByPath } from "./find-page-by-path"
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
  const state = store.getState()
  const publicDir = path.join(state.program.directory, `public`)

  const result: IPageQueryResult = {
    id: pagePath,
    result: undefined,
  }

  const page = findPageByPath(state, pagePath)
  if (page) {
    result.id = page.path
    try {
      const pageData: IPageDataWithQueryResult = await readPageData(
        publicDir,
        page.path
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

interface IClientInfo {
  activePath: string | null
  socket: socketIO.Socket
}

export class WebsocketManager {
  activePaths: Set<string> = new Set()
  clients: Set<IClientInfo> = new Set()
  errors: Map<string, string> = new Map()
  pageResults: PageResultsMap = new Map()
  staticQueryResults: QueryResultsMap = new Map()
  websocket: socketIO.Server | undefined

  init = ({
    server,
  }: {
    server: HTTPSServer | HTTPServer
  }): socketIO.Server => {
    this.websocket = socketIO(server, {
      // we see ping-pong timeouts on gatsby-cloud when socket.io is running for a while
      // increasing it should help
      // @see https://github.com/socketio/socket.io/issues/3259#issuecomment-448058937
      pingTimeout: 30000,
    })

    const updateServerActivePaths = (): void => {
      const serverActivePaths = new Set<string>()
      for (const client of this.clients) {
        if (client.activePath) {
          serverActivePaths.add(client.activePath)
        }
      }
      this.activePaths = serverActivePaths
    }

    this.websocket.on(`connection`, socket => {
      const clientInfo: IClientInfo = {
        activePath: null,
        socket,
      }
      this.clients.add(clientInfo)

      const setActivePath = (
        newActivePath: string | null,
        fallbackTo404: boolean = false
      ): void => {
        let activePagePath: string | null = null
        if (newActivePath) {
          const page = findPageByPath(
            store.getState(),
            newActivePath,
            fallbackTo404
          )
          if (page) {
            activePagePath = page.path
          }
        }
        clientInfo.activePath = activePagePath
        updateServerActivePaths()
      }

      if (socket?.handshake?.headers?.referer) {
        const path = url.parse(socket.handshake.headers.referer).path
        setActivePath(path, true)
      }

      this.errors.forEach((message, errorID) => {
        socket.send({
          type: `overlayError`,
          payload: {
            id: errorID,
            message,
          },
        })
      })

      const getDataForPath = async (path: string): Promise<void> => {
        const page = findPageByPath(store.getState(), path)
        if (!page) {
          socket.send({
            type: `pageQueryResult`,
            why: `getDataForPath-notfound`,
            payload: {
              id: path,
              result: undefined,
            },
          })
          return
        }
        path = page.path

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

        if (this.clients.size > 0) {
          telemetry.trackCli(
            `WEBSOCKET_PAGE_DATA_UPDATE`,
            {
              siteMeasurements: {
                clientsCount: this.clients.size,
                paths: hashPaths(Array.from(this.activePaths)),
              },
            },
            { debounce: true }
          )
        }
      }

      socket.on(`getDataForPath`, getDataForPath)

      socket.on(`registerPath`, (path: string): void => {
        setActivePath(path, true)
      })

      socket.on(`disconnect`, (): void => {
        setActivePath(null)
        this.clients.delete(clientInfo)
      })

      socket.on(`unregisterPath`, (_path: string): void => {
        setActivePath(null)
      })
    })

    return this.websocket
  }

  getSocket = (): socketIO.Server | undefined => this.websocket

  emitStaticQueryData = (data: IStaticQueryResult): void => {
    this.staticQueryResults.set(data.id, data)

    if (this.websocket) {
      this.websocket.send({ type: `staticQueryResult`, payload: data })

      if (this.clients.size > 0) {
        telemetry.trackCli(
          `WEBSOCKET_EMIT_STATIC_PAGE_DATA_UPDATE`,
          {
            siteMeasurements: {
              clientsCount: this.clients.size,
              paths: hashPaths(Array.from(this.activePaths)),
            },
          },
          { debounce: true }
        )
      }
    }
  }

  emitPageData = (data: IPageQueryResult): void => {
    this.pageResults.set(data.id, data)

    if (this.websocket) {
      this.websocket.send({ type: `pageQueryResult`, payload: data })

      if (this.clients.size > 0) {
        telemetry.trackCli(
          `WEBSOCKET_EMIT_PAGE_DATA_UPDATE`,
          {
            siteMeasurements: {
              clientsCount: this.clients.size,
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
      this.websocket.send({
        type: `overlayError`,
        payload: { id, message },
      })
    }
  }
}

export const websocketManager: WebsocketManager = new WebsocketManager()
