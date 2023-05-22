import { store, readState } from "../../redux"
import reporter from "gatsby-cli/lib/reporter"
import { posix } from "path"
import {
  FunctionsManifest,
  IAdaptContext,
  AdapterInit,
  RoutesManifest,
} from "./types"
import { preferDefault } from "../../bootstrap/prefer-default"
import { generateHtmlPath } from "gatsby-core-utils/page-html"
import { getPageMode } from "../page-mode"
import { generatePageDataPath } from "gatsby-core-utils/page-data"

interface IAdapterManager {
  restoreCache: () => Promise<void>
  storeCache: () => Promise<void>
  adapt: () => Promise<void>
}

export function initAdapterManager(): IAdapterManager {
  // TODO: figure out adapter to use (and potentially install) based on environent
  // for now, just hardcode work-in-progress Netlify adapter to work out details of Adapter API
  const adapterFn = preferDefault(
    require(`gatsby-adapter-netlify`)
  ) as AdapterInit

  const adapter = adapterFn({ reporter })

  reporter.info(`[dev-adapter-manager] using an adapter named ${adapter.name}`)

  const directoriesToCache = [`.cache`, `public`]
  return {
    restoreCache: async (): Promise<void> => {
      reporter.info(`[dev-adapter-manager] restoreCache()`)
      if (!adapter.cache) {
        return
      }

      const result = await adapter.cache.restore(directoriesToCache)
      if (result === false) {
        // if adapter reports `false`, we can skip trying to re-hydrate state
        return
      }

      const cachedState = readState()

      // readState() returns empty object if there is no cached state or it's corrupted etc
      // so we want to avoid dispatching RESTORE_CACHE action in that case
      if (Object.keys(cachedState).length > 0) {
        store.dispatch({
          type: `RESTORE_CACHE`,
          payload: cachedState,
        })
      }
    },
    storeCache: async (): Promise<void> => {
      reporter.info(`[dev-adapter-manager] storeCache()`)
      if (!adapter.cache) {
        return
      }

      await adapter.cache.store(directoriesToCache)
    },
    adapt: async (): Promise<void> => {
      reporter.info(`[dev-adapter-manager] adapt()`)
      if (!adapter.adapt) {
        return
      }

      let _routesManifest: RoutesManifest | undefined = undefined
      let _functionsManifest: FunctionsManifest | undefined = undefined
      const adaptContext: IAdaptContext = {
        get routesManifest(): RoutesManifest {
          if (!_routesManifest) {
            _routesManifest = getRoutesManifest()
          }

          return _routesManifest
        },
        get functionsManifest(): FunctionsManifest {
          if (!_functionsManifest) {
            _functionsManifest = getFunctionsManifest()
          }

          return _functionsManifest
        },
      }

      await adapter.adapt(adaptContext)
    },
  }
}

const STATIC_PAGE_HEADERS = [
  `cache-control: public, max-age=0, must-revalidate`,
  `x-xss-protection: 1; mode=block`,
  `x-content-type-options: nosniff`,
  `referrer-policy: same-origin`,
  `x-frame-options: DENY`,
]

// TODO: gather assets that need JS chunk headers
// const STATIC_JS_CHUNK_HEADERS = [
//   `cache-control: public, max-age=31536000, immutable`,
//   `x-xss-protection: 1; mode=block`,
//   `x-content-type-options: nosniff`,
//   `referrer-policy: same-origin`,
//   `x-frame-options: DENY`,
// ]

function maybeDropNamedPartOfWildcard(
  path: string | undefined
): string | undefined {
  if (!path) {
    return path
  }

  return path.replace(/\*.+$/, `*`)
}

function getRoutesManifest(): RoutesManifest {
  const routes = [] as RoutesManifest

  // routes - pages - static (SSG) or lambda (DSG/SSR)
  for (const page of store.getState().pages.values()) {
    const htmlRoutePath =
      maybeDropNamedPartOfWildcard(page.matchPath) ?? page.path
    const pageDataRoutePath = generatePageDataPath(`public`, htmlRoutePath)

    if (getPageMode(page) === `SSG`) {
      const htmlFilePath = generateHtmlPath(`public`, page.path)
      const pageDataFilePath = generatePageDataPath(`public`, htmlFilePath)

      routes.push({
        path: htmlRoutePath,
        type: `static`,
        filePath: htmlFilePath,
        headers: STATIC_PAGE_HEADERS,
      })

      routes.push({
        path: pageDataRoutePath,
        type: `static`,
        filePath: pageDataFilePath,
        headers: STATIC_PAGE_HEADERS,
      })
    } else {
      // TODO: generate lambda function for SSR/DSG
      // TODO: figure out caching behavior metadata - maybe take a look at https://vercel.com/docs/build-output-api/v3/primitives#prerender-functions for inspiration
      // routes.push({
      //   path: htmlRoutePath,
      //   type: `lambda`,
      //   functionId: `ssr-engine`,
      // })
      // routes.push({
      //   path: pageDataRoutePath,
      //   type: `lambda`,
      //   functionId: `ssr-engine`,
      // })
    }
  }

  // TODO: static asset routes - bundles

  // redirect routes
  for (const redirect of store.getState().redirects.values()) {
    routes.push({
      path: redirect.fromPath,
      type: `redirect`,
      toPath: redirect.toPath,
      status: redirect.statusCode ?? (redirect.isPermanent ? 301 : 302),
      ignoreCase: redirect.ignoreCase,
    })
  }

  // function routes
  for (const functionInfo of store.getState().functions.values()) {
    routes.push({
      path: `/api/${
        maybeDropNamedPartOfWildcard(functionInfo.matchPath) ??
        functionInfo.functionRoute
      }`,
      type: `lambda`,
      functionId: functionInfo.functionId,
    })
  }

  // TODO: figure out any random files copied to public (e.g. static folder)

  return routes
}

function getFunctionsManifest(): FunctionsManifest {
  const functions = [] as FunctionsManifest

  for (const functionInfo of store.getState().functions.values()) {
    functions.push({
      functionId: functionInfo.functionId,
      pathToCompiledFunction: posix.join(
        `.cache`,
        `functions`,
        functionInfo.relativeCompiledFilePath
      ),
    })
  }

  return functions
}
