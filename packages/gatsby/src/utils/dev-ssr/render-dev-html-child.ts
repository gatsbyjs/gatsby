import { parseError, IErrorRenderMeta } from "./parse-error"

import type { IServerData } from "../get-server-data"

export async function renderHTML({
  path,
  componentPath,
  htmlComponentRendererPath,
  publicDir,
  isClientOnlyPage = false,
  error = undefined,
  directory,
  serverData,
}: {
  path: string
  componentPath: string
  htmlComponentRendererPath: string
  publicDir: string
  isClientOnlyPage?: boolean
  error?: IErrorRenderMeta
  directory: string
  serverData?: IServerData["props"]
}): Promise<string> {
  try {
    const htmlComponentRenderer = require(htmlComponentRendererPath)
    if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
      return await htmlComponentRenderer.default({
        pagePath: path,
        isClientOnlyPage,
        publicDir,
        error,
        serverData,
      })
    } else {
      return await htmlComponentRenderer.default({
        pagePath: path,
        publicDir,
        isClientOnlyPage: true,
      })
    }
  } catch (err) {
    const error = parseError({
      err,
      directory,
      componentPath,
      htmlComponentRendererPath,
    })
    throw error
  }
}
export function deleteModuleCache(htmlComponentRendererPath: string): void {
  delete require.cache[require.resolve(htmlComponentRendererPath)]
}
