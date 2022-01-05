import type { Request } from "express"
import type { IGatsbyPage } from "../redux/types"

import { match } from "@gatsbyjs/reach-router/lib/utils"
import { GetServerData, GetServerDataReturn } from "../.."

interface IModuleWithServerData {
  getServerData?: GetServerData<Map<string, unknown>>
}

export async function getServerData(
  req:
    | Partial<Pick<Request, "query" | "method" | "url" | "headers">>
    | undefined,
  page: IGatsbyPage,
  pagePath: string,
  mod: IModuleWithServerData | undefined
): Promise<GetServerDataReturn<Map<string, unknown>>> {
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
