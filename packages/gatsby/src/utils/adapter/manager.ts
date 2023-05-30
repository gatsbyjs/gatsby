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
import { createRequireFromPath } from "gatsby-core-utils/create-require-from-path"
import { getPageMode } from "../page-mode"
import { generatePageDataPath } from "gatsby-core-utils/page-data"
import { satisfies } from "semver"
import { sync as globSync } from "glob"

interface IAdapterManager {
  restoreCache: () => Promise<void> | void
  storeCache: () => Promise<void> | void
  adapt: () => Promise<void> | void
}

function noOpAdapterManager(): IAdapterManager {
  return {
    restoreCache: (): void => {},
    storeCache: (): void => {},
    adapt: (): void => {},
  }
}

export async function initAdapterManager(): Promise<IAdapterManager> {
  const adapterInit = await getAdapterInit()

  if (!adapterInit) {
    // if we don't have adapter - use no-op adapter manager
    return noOpAdapterManager()
  }

  const adapter = adapterInit({ reporter })

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

const REDIRECT_HEADERS = [
  `x-xss-protection: 1; mode=block`,
  `x-content-type-options: nosniff`,
  `referrer-policy: same-origin`,
  `x-frame-options: DENY`,
]

const ASSET_HEADERS = [
  `x-xss-protection: 1; mode=block`,
  `x-content-type-options: nosniff`,
  `referrer-policy: same-origin`,
  `x-frame-options: DENY`,
]

const WEBPACK_ASSET_HEADERS = [
  `cache-control: public, max-age=31536000, immutable`,
  `x-xss-protection: 1; mode=block`,
  `x-content-type-options: nosniff`,
  `referrer-policy: same-origin`,
  `x-frame-options: DENY`,
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
  const routes = [] as RoutesManifest

  const fileAssets = new Set(
    globSync(`**/**`, {
      cwd: posix.join(process.cwd(), `public`),
      nodir: true,
      dot: true,
    })
  )

  function removeFromAssets(path: string): void {
    if (fileAssets.has(path)) {
      fileAssets.delete(path)
    } else {
      reporter.warn(
        `[dev-adapter-manager] tried to remove "${path}" from assets but it wasn't there`
      )
    }
  }

  // routes - pages - static (SSG) or lambda (DSG/SSR)
  for (const page of store.getState().pages.values()) {
    const htmlRoutePath =
      maybeDropNamedPartOfWildcard(page.matchPath) ?? page.path
    const pageDataRoutePath = generatePageDataPath(``, htmlRoutePath)

    if (getPageMode(page) === `SSG`) {
      const htmlFilePath = generateHtmlPath(``, page.path)
      const pageDataFilePath = generatePageDataPath(``, page.path)

      routes.push({
        path: htmlRoutePath,
        type: `static`,
        filePath: posix.join(`public`, htmlFilePath),
        headers: STATIC_PAGE_HEADERS,
      })

      removeFromAssets(htmlFilePath)

      routes.push({
        path: pageDataRoutePath,
        type: `static`,
        filePath: posix.join(`public`, pageDataFilePath),
        headers: STATIC_PAGE_HEADERS,
      })

      removeFromAssets(pageDataFilePath)
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

  // webpack assets
  if (!webpackAssets) {
    throw new Error(`[dev-adapter-manager] webpackAssets is not defined`)
  }

  for (const asset of webpackAssets) {
    routes.push({
      path: asset,
      type: `static`,
      filePath: posix.join(`public`, asset),
      headers: WEBPACK_ASSET_HEADERS,
    })
    removeFromAssets(asset)
  }

  // TODO: slices

  // TODO: static query json assets

  // redirect routes
  for (const redirect of store.getState().redirects.values()) {
    routes.push({
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
    routes.push({
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
    routes.push({
      type: `static`,
      path: fileAsset,
      filePath: posix.join(`public`, fileAsset),
      headers: ASSET_HEADERS,
    })
  }

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

async function getAdapterInit(): Promise<AdapterInit | undefined> {
  // TODO: figure out adapter to use (and potentially install) based on environent
  // for now, just hardcode work-in-progress Netlify adapter to work out details of Adapter API

  // 1. figure out which adapter (and its version) to use

  // this is just random npm package to test autoinstallation soon
  // const adapterToUse = {
  //   packageName: `ascii-cats`,
  //   version: `^1.1.1`,
  // }

  const adapterToUse = {
    packageName: `gatsby-adapter-netlify`,
    version: `*`,
  }

  if (!adapterToUse) {
    reporter.info(
      `[dev-adapter-manager] using no-op adapter, because nothing was discovered`
    )
    return undefined
  }

  // 2. check siteDir
  // try to resolve from siteDir
  try {
    const siteRequire = createRequireFromPath(`${process.cwd()}/:internal:`)
    const adapterPackageJson = siteRequire(
      `${adapterToUse.packageName}/package.json`
    )

    if (
      satisfies(adapterPackageJson.version, adapterToUse.version, {
        includePrerelease: true,
      })
    ) {
      // console.log(`SATISFIED`, adapterPackageJson.version, adapterToUse.version)
      return preferDefault(
        await import(siteRequire.resolve(adapterToUse.packageName))
      ) as AdapterInit
    }
    // else {
    //   console.log(
    //     `NOT SATISFIED`,
    //     adapterPackageJson.version,
    //     adapterToUse.version
    //   )
    // }
  } catch (e) {
    // no-op
  }

  // 3. check .cache/adapters
  // const gatsbyManagedAdaptersLocation = `.cache/adapters`

  // 4. install to .cache/adapters if still not available

  return undefined
}
