import type { Request } from "express"
import type { IGatsbyPage } from "../redux/types"
import { match } from "@gatsbyjs/reach-router"

export interface IServerData {
  headers?: Record<string, string>
  props?: Record<string, unknown>
  status?: number
}

interface IModuleWithServerData {
  getServerData?: (args: {
    headers: Map<string, unknown>
    method: string
    url: string
    query?: Record<string, unknown>
    params?: Record<string, unknown>
    pageContext: Record<string, unknown>
  }) => Promise<IServerData>
}

export async function getServerData(
  req:
    | Partial<Pick<Request, "query" | "method" | "url" | "headers">>
    | undefined,
  page: Pick<IGatsbyPage, "path" | "matchPath" | "context">,
  pagePath: string,
  mod: IModuleWithServerData | undefined
): Promise<IServerData> {
  if (!mod?.getServerData) {
    return {}
  }

  const ensuredLeadingSlash = pagePath.startsWith(`/`)
    ? pagePath
    : `/${pagePath}`

  const { params } = match(page.matchPath || page.path, ensuredLeadingSlash)
  const fsRouteParams =
    typeof page.context[`__params`] === `object` ? page.context[`__params`] : {}

  const getServerDataArg = {
    headers: new Map(Object.entries(req?.headers ?? {})),
    method: req?.method ?? `GET`,
    url: req?.url ?? `"req" most likely wasn't passed in`,
    query: req?.query ?? {},
    pageContext: page.context,
    params: {
      ...params,
      ...fsRouteParams,
    },
  }

  return mod.getServerData(getServerDataArg)
}
