import type { AdapterInit } from "gatsby/src/utils/adapter/types"

// just for debugging
import { inspect } from "util"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface INetlifyAdapterOptions {}

import fs from "fs-extra"

// @ts-ignore sigh, we compile to mjs, but it doesn't exist in source code, skipping extension result in error at runtime when
// loading this module because we need to supply mjs extension to actually load it. Adding extension makes typescript unhappy
// TODO: adjust build to convert import paths so typescript is happy and runtime actually works
import { prepareFunctionVariants } from "./lambda-handler.mjs"

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

const createNetlifyAdapter: AdapterInit<INetlifyAdapterOptions> = () => {
  return {
    name: `gatsby-adapter-netlify`,
    cache: {
      restore({ directories, reporter }): void {
        reporter.info(`[gatsby-adapter-netlify] cache.restore() ${directories}`)
      },
      store({ directories, reporter }): void {
        reporter.info(`[gatsby-adapter-netlify] cache.store() ${directories}`)
      },
    },
    async adapt({ routesManifest, functionsManifest }): Promise<void> {
      console.log(
        `[gatsby-adapter-netlify] adapt()`,
        inspect(
          {
            routesManifest,
            functionsManifest,
          },
          { depth: Infinity, colors: true }
        )
      )

      const lambdasThatUseCaching = new Map<string, string>()

      let _redirects = ``
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

          const [netlifyFromPath, netlifyToPath] = toNetlifyPath(
            fromPath,
            toPath
          )

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
                  for (const [
                    conditionKey,
                    conditionValueRaw,
                  ] of Object.entries(value)) {
                    if (NETLIFY_CONDITIONS_ALLOWLIST.has(conditionKey)) {
                      const conditionValue = Array.isArray(conditionValueRaw)
                        ? conditionValueRaw.join(`,`)
                        : conditionValueRaw
                      // Gatsby gives us "country", we want "Country"
                      const conditionName =
                        conditionKey.charAt(0).toUpperCase() +
                        conditionKey.slice(1)

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
        }
      }

      // TODO: add markers around generated redirects so we can update them and merge with user provided ones
      await fs.outputFile(`public/_redirects`, _redirects)

      // functions handling
      for (const fun of functionsManifest) {
        await prepareFunctionVariants(
          fun,
          lambdasThatUseCaching.get(fun.functionId)
        )
      }
    },
  }
}

export default createNetlifyAdapter
