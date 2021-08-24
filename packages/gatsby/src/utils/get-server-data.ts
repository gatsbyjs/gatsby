import { match } from "node-match-path"
import type { Request } from "express"
import type { IGatsbyPage } from "../redux/types"

export interface IServerData {
  headers?: Record<string, string>
  props?: Record<string, unknown>
}

interface IModuleWithServerData {
  getServerData?: (args: {
    headers: Map<string, unknown>
    method: string
    url: string
    query?: string
    params?: Record<string, unknown> | null
  }) => Promise<IServerData>
}

export async function getServerData(
  req: Request,
  page: Partial<IGatsbyPage> & { path: IGatsbyPage["path"] },
  modulePath: string
): Promise<IServerData> {
  // I wanted to use dynamic imports as esm wants us to do but sadly it doesn't support cache-busting yet.
  // https://github.com/nodejs/modules/issues/307
  let mod: IModuleWithServerData | undefined

  try {
    mod = require(modulePath)
  } catch (err) {
    return {}
  }

  if (!mod?.getServerData) {
    return {}
  }

  const { params } = match(
    page.matchPath || page.path,
    `/${req.params.pagePath}`
  )

  return mod.getServerData({
    headers: new Map(Object.entries(req.headers)),
    method: req.method,
    url: req.url,
    query: req.query,
    params,
  })
}
