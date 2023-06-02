import reporter from "gatsby-cli/lib/reporter"
import { generateHtmlPath } from "gatsby-core-utils/page-html"
import { generatePageDataPath } from "gatsby-core-utils/page-data"
import { posix } from "path"
import { sync as globSync } from "glob"
import telemetry from "gatsby-telemetry"
import {
  FunctionsManifest,
  IAdaptContext,
  RoutesManifest,
  Route,
  IAdapterManager,
  ILambdaRoute,
} from "./types"
import { store, readState } from "../../redux"
import { getPageMode } from "../page-mode"
import { getStaticQueryPath } from "../static-query-utils"
import { getAdapterInit } from "./init"
import { shouldGenerateEngines } from "../engines-helpers"
import type { IHeader } from "../../redux/types"

function noOpAdapterManager(): IAdapterManager {
  return {
    restoreCache: (): void => {},
    storeCache: (): void => {},
    adapt: (): void => {},
  }
}

export async function initAdapterManager(): Promise<IAdapterManager> {
  const adapterInit = await getAdapterInit()

  // If we don't have adapter, use no-op adapter manager
  if (!adapterInit) {
    return noOpAdapterManager()
  }

  const adapter = adapterInit({ reporter })

  reporter.info(`Using ${adapter.name} adapter`)

  telemetry.trackFeatureIsUsed(`adapter:${adapter.name}`)

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

      const { headers } = store.getState().config
      console.log({ headers })

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

const STATIC_PAGE_HEADERS: IHeader["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=0, must-revalidate`,
  },
  {
    key: `x-xss-protection`,
    value: `1; mode=block`,
  },
  {
    key: `x-content-type-options`,
    value: `nosniff`,
  },
  {
    key: `referrer-policy`,
    value: `same-origin`,
  },
  {
    key: `x-frame-options`,
    value: `DENY`,
  },
]

const REDIRECT_HEADERS: IHeader["headers"] = [
  {
    key: `x-xss-protection`,
    value: `1; mode=block`,
  },
  {
    key: `x-content-type-options`,
    value: `nosniff`,
  },
  {
    key: `referrer-policy`,
    value: `same-origin`,
  },
  {
    key: `x-frame-options`,
    value: `DENY`,
  },
]

const ASSET_HEADERS: IHeader["headers"] = [
  {
    key: `x-xss-protection`,
    value: `1; mode=block`,
  },
  {
    key: `x-content-type-options`,
    value: `nosniff`,
  },
  {
    key: `referrer-policy`,
    value: `same-origin`,
  },
  {
    key: `x-frame-options`,
    value: `DENY`,
  },
]

const WEBPACK_ASSET_HEADERS: IHeader["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=31536000, immutable`,
  },
  {
    key: `x-xss-protection`,
    value: `1; mode=block`,
  },
  {
    key: `x-content-type-options`,
    value: `nosniff`,
  },
  {
    key: `referrer-policy`,
    value: `same-origin`,
  },
  {
    key: `x-frame-options`,
    value: `DENY`,
  },
]

function maybeDropNamedPartOfWildcard(
  path: string | undefined
): string | undefined {
  if (!path) {
    return path
  }

  return path.replace(/\*.+$/, `*`)
}

let webpackAssets: Set<string> | undefined
export function setWebpackAssets(assets: Set<string>): void {
  webpackAssets = assets
}

function getRoutesManifest(): RoutesManifest {
  // TODO: have routes list sorted by specifity so more specific ones are before less specific ones (/static should be before /:param and that should be before /*),
  // so routing can just handle first match
  const routes = [] as RoutesManifest

  const fileAssets = new Set(
    globSync(`**/**`, {
      cwd: posix.join(process.cwd(), `public`),
      nodir: true,
      dot: true,
    })
  )

  function addSortedRoute(route: Route): void {
    if (!route.path.startsWith(`/`)) {
      route.path = `/${route.path}`
    }
    // TODO: calculate specifity of route's path and insert route in correct place
    routes.push(route)
  }

  function addStaticRoute({
    path,
    pathToFilInPublicDir,
    headers,
  }: {
    path: string
    pathToFilInPublicDir: string
    headers: IHeader["headers"]
  }): void {
    addSortedRoute({
      path,
      type: `static`,
      filePath: posix.join(`public`, pathToFilInPublicDir),
      headers,
    })

    if (fileAssets.has(pathToFilInPublicDir)) {
      fileAssets.delete(pathToFilInPublicDir)
    } else {
      reporter.warn(
        `[dev-adapter-manager] tried to remove "${pathToFilInPublicDir}" from assets but it wasn't there`
      )
    }
  }

  // routes - pages - static (SSG) or lambda (DSG/SSR)
  for (const page of store.getState().pages.values()) {
    const htmlRoutePath =
      maybeDropNamedPartOfWildcard(page.matchPath) ?? page.path
    const pageDataRoutePath = generatePageDataPath(``, htmlRoutePath)

    const pageMode = getPageMode(page)

    if (pageMode === `SSG`) {
      const htmlFilePath = generateHtmlPath(``, page.path)
      const pageDataFilePath = generatePageDataPath(``, page.path)

      addStaticRoute({
        path: htmlRoutePath,
        pathToFilInPublicDir: htmlFilePath,
        headers: STATIC_PAGE_HEADERS,
      })
      addStaticRoute({
        path: pageDataRoutePath,
        pathToFilInPublicDir: pageDataFilePath,
        headers: STATIC_PAGE_HEADERS,
      })
    } else {
      const commonFields: Omit<ILambdaRoute, "path"> = {
        type: `lambda`,
        functionId: `ssr-engine`,
      }

      if (pageMode === `DSG`) {
        commonFields.cache = true
      }

      addSortedRoute({
        path: htmlRoutePath,
        ...commonFields,
      })

      addSortedRoute({
        path: pageDataRoutePath,
        ...commonFields,
      })
    }
  }

  // static query json assets
  for (const staticQueryComponent of store
    .getState()
    .staticQueryComponents.values()) {
    const staticQueryResultPath = getStaticQueryPath(staticQueryComponent.hash)
    addStaticRoute({
      path: staticQueryResultPath,
      pathToFilInPublicDir: staticQueryResultPath,
      headers: STATIC_PAGE_HEADERS,
    })
  }

  // app-data.json
  {
    const appDataFilePath = posix.join(`page-data`, `app-data.json`)
    addStaticRoute({
      path: appDataFilePath,
      pathToFilInPublicDir: appDataFilePath,
      headers: STATIC_PAGE_HEADERS,
    })
  }

  // webpack assets
  if (!webpackAssets) {
    throw new Error(`[dev-adapter-manager] webpackAssets is not defined`)
  }

  for (const asset of webpackAssets) {
    addStaticRoute({
      path: asset,
      pathToFilInPublicDir: asset,
      headers: WEBPACK_ASSET_HEADERS,
    })
  }

  // TODO: slices

  // redirect routes
  for (const redirect of store.getState().redirects.values()) {
    addSortedRoute({
      path: redirect.fromPath,
      type: `redirect`,
      toPath: redirect.toPath,
      status: redirect.statusCode ?? (redirect.isPermanent ? 301 : 302),
      ignoreCase: redirect.ignoreCase,
      headers: REDIRECT_HEADERS,
    })
  }

  // function routes
  for (const functionInfo of store.getState().functions.values()) {
    addSortedRoute({
      path: `/api/${
        maybeDropNamedPartOfWildcard(functionInfo.matchPath) ??
        functionInfo.functionRoute
      }`,
      type: `lambda`,
      functionId: functionInfo.functionId,
    })
  }

  console.log(
    `[dev-adapter-manager] unmanaged (or not yet handled) assets`,
    fileAssets
  )

  for (const fileAsset of fileAssets) {
    addStaticRoute({
      path: fileAsset,
      pathToFilInPublicDir: fileAsset,
      headers: ASSET_HEADERS,
    })
  }

  return routes
}

function getFunctionsManifest(): FunctionsManifest {
  const functions = [] as FunctionsManifest

  for (const functionInfo of store.getState().functions.values()) {
    const pathToEntryPoint = posix.join(
      `.cache`,
      `functions`,
      functionInfo.relativeCompiledFilePath
    )
    functions.push({
      functionId: functionInfo.functionId,
      pathToEntryPoint,
      requiredFiles: [pathToEntryPoint],
    })
  }

  if (shouldGenerateEngines()) {
    function getFilesFrom(dir: string): Array<string> {
      return globSync(`**/**`, {
        cwd: posix.join(process.cwd(), dir),
        nodir: true,
        dot: true,
      }).map(file => posix.join(dir, file))
    }

    functions.push({
      functionId: `ssr-engine`,
      pathToEntryPoint: posix.join(`.cache`, `page-ssr`, `lambda.js`),
      requiredFiles: [
        ...getFilesFrom(posix.join(`.cache`, `data`, `datastore`)),
        ...getFilesFrom(posix.join(`.cache`, `page-ssr`)),
        ...getFilesFrom(posix.join(`.cache`, `query-engine`)),
      ],
    })
  }

  return functions
}
