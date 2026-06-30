import type { RoutesManifest, HeaderRoutes } from "gatsby"
import { join } from "path"
import { outputJSONSync } from "fs-extra"
import { cwd } from "node:process"
import { createStaticAssetsPathHandler } from "./pretty-urls"

interface INetlifyRedirectEntry {
  conditions?: Record<string, Array<string>>
  force?: boolean
  from: string
  query?: Record<string, string>
  signed?: string
  status: number
  to: string
}

function buildHeaderObject(
  path: string,
  headers: Array<{ key: string; value: string }>
): { for: string; values: Record<string, string> } {
  return {
    for: path,
    values: headers.reduce((acc: Record<string, string>, { key, value }) => {
      acc[key] = value
      return acc
    }, {}),
  }
}

export function processRoutesManifest(
  routesManifest: RoutesManifest,
  headerRoutes?: HeaderRoutes
): {
  fileMovingPromise: Promise<void>
  headers: Array<{ for: string; values: Record<string, string> }>
  redirects: Array<INetlifyRedirectEntry>
} {
  const { ensureStaticAssetPath, fileMovingDone } =
    createStaticAssetsPathHandler()

  const redirects: Array<INetlifyRedirectEntry> = []
  let headers: Array<{ for: string; values: Record<string, string> }> = []

  for (const route of routesManifest) {
    const fromPath = route.path.replace(/\*.*/, `*`)

    if (route.type === `redirect`) {
      const redirectObj: INetlifyRedirectEntry = {
        from: fromPath,
        status: route.status,
        to: route.toPath.replace(/\*/, `:splat`),
      }

      if (route.force) {
        redirectObj.force = true
      }

      const conditions = route.conditions

      if (conditions && typeof conditions === `object`) {
        const mapped: Record<string, Array<string>> = {}

        for (const [key, val] of Object.entries(conditions)) {
          if (key === `language` || key === `country`) {
            mapped[key.charAt(0).toUpperCase() + key.slice(1)] = Array.isArray(
              val
            )
              ? val
              : [String(val)]
          }
        }

        if (Object.keys(mapped).length > 0) {
          redirectObj.conditions = mapped
        }
      }

      const { query, signed } = route as unknown as {
        query?: Record<string, string>
        signed?: string
      }

      if (query) {
        redirectObj.query = query
      }

      if (signed) {
        redirectObj.signed = signed
      }

      redirects.push(redirectObj)
    } else if (route.type === `static`) {
      const { finalFilePath, isDynamic } = ensureStaticAssetPath(
        route.filePath,
        fromPath
      )

      if (isDynamic) {
        redirects.push({
          from: fromPath,
          to: finalFilePath.replace(/^public/, ``),
          status: 200,
        })
      }

      if (!headerRoutes) {
        const headerObj = buildHeaderObject(route.path, route.headers)
        if (Object.keys(headerObj.values).length > 0) {
          headers.push(headerObj)
        }
      }
    }
  }

  if (headerRoutes) {
    headers = headerRoutes
      .map(curr => buildHeaderObject(curr.path, curr.headers))
      .filter(h => Object.keys(h.values).length > 0)
  }

  return {
    fileMovingPromise: fileMovingDone(),
    headers,
    redirects,
  }
}

export async function handleRoutesManifest(
  routesManifest: RoutesManifest,
  headerRoutes: HeaderRoutes
): Promise<void> {
  const { redirects, headers, fileMovingPromise } = processRoutesManifest(
    routesManifest,
    headerRoutes
  )

  outputJSONSync(join(cwd(), `.netlify`, `v1`, `config.json`), {
    headers,
    redirects,
  })

  await fileMovingPromise
}
