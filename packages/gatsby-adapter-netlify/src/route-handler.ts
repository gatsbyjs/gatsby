import type { RoutesManifest } from "gatsby/src/utils/adapter/types"

import fs from "fs-extra"

const NETLIFY_REDIRECT_KEYWORDS_ALLOWLIST = new Set([
  `query`,
  `conditions`,
  `headers`,
  `signed`,
  `edge_handler`,
])

const NETLIFY_CONDITIONS_ALLOWLIST = new Set([`language`, `country`])

const toNetlifyPath = (fromPath: string, toPath: string): Array<string> => {
  // Modifies query parameter redirects, having no effect on other fromPath strings
  const netlifyFromPath = fromPath.replace(/[&?]/, ` `)
  // Modifies wildcard & splat redirects, having no effect on other toPath strings
  const netlifyToPath = toPath.replace(/\*/, `:splat`)

  return [netlifyFromPath, netlifyToPath]
}

export async function handleRoutesManifest(
  routesManifest: RoutesManifest
): Promise<{
  lambdasThatUseCaching: Map<string, string>
}> {
  console.log(`hello from handleRoutesManifest()`)
  const lambdasThatUseCaching = new Map<string, string>()

  let _redirects = ``
  let _headers = ``
  for (const route of routesManifest) {
    const fromPath = route.path.replace(/\*.*/, `*`)

    if (route.type === `lambda`) {
      let functionName = route.functionId
      if (route.cache) {
        functionName = `${route.functionId}-odb`
        if (!lambdasThatUseCaching.has(route.functionId)) {
          lambdasThatUseCaching.set(route.functionId, functionName)
        }
      }

      const invocationURL = `/.netlify/${
        route.cache ? `builders` : `functions`
      }/${functionName}`
      _redirects += `${fromPath}  ${invocationURL}  200\n`
    } else if (route.type === `redirect`) {
      const {
        status: routeStatus,
        toPath,
        force,
        // TODO: add headers handling
        headers,
        ...rest
      } = route
      let status = String(routeStatus)

      if (force) {
        status = `${status}!`
      }

      const [netlifyFromPath, netlifyToPath] = toNetlifyPath(fromPath, toPath)

      // The order of the first 3 parameters is significant.
      // The order for rest params (key-value pairs) is arbitrary.
      const pieces = [netlifyFromPath, netlifyToPath, status]

      for (const [key, value] of Object.entries(rest)) {
        if (NETLIFY_REDIRECT_KEYWORDS_ALLOWLIST.has(key)) {
          if (key === `conditions`) {
            // "conditions" key from Gatsby contains only "language" and "country"
            // which need special transformation to match Netlify _redirects
            // https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect
            if (value && typeof value === `object`) {
              for (const [conditionKey, conditionValueRaw] of Object.entries(
                value
              )) {
                if (NETLIFY_CONDITIONS_ALLOWLIST.has(conditionKey)) {
                  const conditionValue = Array.isArray(conditionValueRaw)
                    ? conditionValueRaw.join(`,`)
                    : conditionValueRaw
                  // Gatsby gives us "country", we want "Country"
                  const conditionName =
                    conditionKey.charAt(0).toUpperCase() + conditionKey.slice(1)

                  pieces.push(`${conditionName}:${conditionValue}`)
                }
              }
            }
          } else {
            pieces.push(`${key}=${value}`)
          }
        }
      }
      _redirects += pieces.join(`  `) + `\n`
    } else if (route.type === `static`) {
      // regular static asset without dynamic paths will just work, so skipping those
      if (route.path.includes(`:`) || route.path.includes(`*`)) {
        _redirects += `${fromPath}  ${route.filePath.replace(
          /^public/,
          ``
        )}  200\n`
      }

      _headers += `${fromPath}\n${route.headers.reduce((acc, curr) => {
        acc += `  ${curr.key}: ${curr.value}\n`
        return acc
      }, ``)}`
    }
  }

  // TODO: add markers around generated redirects and headers so we can update them and merge with user provided ones
  await fs.outputFile(`public/_redirects`, _redirects)
  await fs.outputFile(`public/_headers`, _headers)

  return {
    lambdasThatUseCaching,
  }
}
