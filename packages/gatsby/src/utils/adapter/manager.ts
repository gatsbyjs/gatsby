import reporter from "gatsby-cli/lib/reporter"
import { generateHtmlPath } from "gatsby-core-utils/page-html"
import { generatePageDataPath } from "gatsby-core-utils/page-data"
import { posix } from "path"
import { sync as globSync } from "glob"
import telemetry from "gatsby-telemetry"
import type {
  FunctionsManifest,
  IAdaptContext,
  RoutesManifest,
  Route,
  IAdapterManager,
  IFunctionRoute,
  IAdapter,
} from "./types"
import { store, readState } from "../../redux"
import { getPageMode } from "../page-mode"
import { getStaticQueryPath } from "../static-query-utils"
import { getAdapterInit } from "./init"
import { shouldGenerateEngines } from "../engines-helpers"
import {
  ASSET_HEADERS,
  REDIRECT_HEADERS,
  STATIC_PAGE_HEADERS,
  WEBPACK_ASSET_HEADERS,
} from "./constants"
import { createHeadersMatcher } from "./create-headers"
import { HTTP_STATUS_CODE } from "../../redux/types"
import type { IHeader } from "../../redux/types"
import { rankRoute } from "../rank-route"
import {
  getRoutePathFromFunction,
  getRoutePathFromPage,
} from "./get-route-path"

function noOpAdapterManager(): IAdapterManager {
  return {
    restoreCache: (): void => {},
    storeCache: (): void => {},
    adapt: (): void => {},
  }
}

export async function initAdapterManager(): Promise<IAdapterManager> {
  let adapter: IAdapter

  const config = store.getState().config
  const { adapter: adapterFromGatsbyConfig } = config

  // If the user specified an adapter inside their gatsby-config, use that instead of trying to figure out an adapter for the current environment
  if (adapterFromGatsbyConfig) {
    adapter = adapterFromGatsbyConfig

    reporter.verbose(`Using adapter ${adapter.name} from gatsby-config`)
  } else {
    const adapterInit = await getAdapterInit()

    // If we don't have adapter, use no-op adapter manager
    if (!adapterInit) {
      telemetry.trackFeatureIsUsed(`adapter:no-op`)

      return noOpAdapterManager()
    }

    adapter = adapterInit()
  }

  reporter.info(`Using ${adapter.name} adapter`)

  telemetry.trackFeatureIsUsed(`adapter:${adapter.name}`)

  const directoriesToCache = [`.cache`, `public`]
  return {
    restoreCache: async (): Promise<void> => {
      reporter.info(`[dev-adapter-manager] restoreCache()`)
      if (!adapter.cache) {
        return
      }

      const result = await adapter.cache.restore({
        directories: directoriesToCache,
        reporter,
      })
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

      await adapter.cache.store({ directories: directoriesToCache, reporter })
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
        reporter,
      }

      await adapter.adapt(adaptContext)
    },
  }
}

let webpackAssets: Set<string> | undefined
export function setWebpackAssets(assets: Set<string>): void {
  webpackAssets = assets
}

type RouteWithScore = { score: number } & Route

function getRoutesManifest(): RoutesManifest {
  const routes: Array<RouteWithScore> = []
  const createHeaders = createHeadersMatcher(store.getState().config.headers)

  const fileAssets = new Set(
    globSync(`**/**`, {
      cwd: posix.join(process.cwd(), `public`),
      nodir: true,
      dot: true,
    })
  )

  // TODO: This could be a "addSortedRoute" function that would add route to the list in sorted order. TBD if necessary performance-wise
  function addRoute(route: Route): void {
    if (!route.path.startsWith(`/`)) {
      route.path = `/${route.path}`
    }

    if (route.type !== `function`) {
      route.headers = createHeaders(route.path, route.headers)
    }

    ;(route as RouteWithScore).score = rankRoute(route.path)

    routes.push(route as RouteWithScore)
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
    addRoute({
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
    const htmlRoutePath = getRoutePathFromPage(page)
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
      const commonFields: Omit<IFunctionRoute, "path"> = {
        type: `function`,
        functionId: `ssr-engine`,
      }

      if (pageMode === `DSG`) {
        commonFields.cache = true
      }

      addRoute({
        path: htmlRoutePath,
        ...commonFields,
      })

      addRoute({
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
    addRoute({
      path: redirect.fromPath,
      type: `redirect`,
      toPath: redirect.toPath,
      status:
        redirect.statusCode ??
        (redirect.isPermanent
          ? HTTP_STATUS_CODE.MOVED_PERMANENTLY_301
          : HTTP_STATUS_CODE.FOUND_302),
      ignoreCase: redirect.ignoreCase,
      headers: REDIRECT_HEADERS,
    })
  }

  // function routes
  for (const functionInfo of store.getState().functions.values()) {
    addRoute({
      path: `/api/${getRoutePathFromFunction(functionInfo)}`,
      type: `function`,
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

  return (
    routes
      .sort((a, b) => {
        // The higher the score, the higher the specificity of our path
        const order = b.score - a.score
        if (order !== 0) {
          return order
        }

        // if specificity is the same we do lexigraphic comparison of path to ensure
        // deterministic order regardless of order pages where created
        return a.path.localeCompare(b.path)
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ score, ...rest }): Route => {
        return { ...rest }
      })
  )
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
