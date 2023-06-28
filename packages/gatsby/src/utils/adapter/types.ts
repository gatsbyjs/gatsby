import type reporter from "gatsby-cli/lib/reporter"
import type { TrailingSlash } from "gatsby-page-utils"
import type { IHeader, HttpStatusCode } from "../../redux/types"

interface IBaseRoute {
  /**
   * Request path that should be matched for this route.
   * It can be:
   *  - static: `/about/`
   *  - dynamic:
   *    - parameterized: `/blog/:slug/`
   *    - catch-all / wildcard: `/app/*`
   */
  path: string
}

export interface IStaticRoute extends IBaseRoute {
  type: `static`
  /**
   * Location of the file that should be served for this route.
   */
  filePath: string
  /**
   * HTTP headers that should be set for this route.
   * @see http://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/headers/
   */
  headers: IHeader["headers"]
}

export interface IFunctionRoute extends IBaseRoute {
  type: `function`
  /**
   * Unique identifier of this function. Corresponds to the `functionId` inside the `functionsManifest`.
   * Some functions will be shared for multiple routes, e.g. SSR or DSG functions.
   */
  functionId: string
  /**
   * If `cache` is true, response of function should be cached for current deployment and served on subsequent requests for this route.
   */
  cache?: true
}

/**
 * Redirects are being created through the `createRedirect` action.
 * @see https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect
 */
export interface IRedirectRoute extends IBaseRoute {
  type: `redirect`
  /**
   * The redirect should happen from `path` to `toPath`.
   */
  toPath: string
  /**
   * HTTP status code that should be used for this redirect.
   */
  status: HttpStatusCode
  ignoreCase?: boolean
  /**
   * HTTP headers that should be used for this redirect.
   * @see http://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/headers/
   */
  headers: IHeader["headers"]
  [key: string]: unknown
}

export type Route = IStaticRoute | IFunctionRoute | IRedirectRoute

export type RoutesManifest = Array<Route>

export interface IFunctionDefinition {
  /**
   * Unique identifier of this function. Corresponds to the `functionId` inside the `routesManifest`.
   */
  functionId: string
  /**
   * Path to function entrypoint that will be used to create function.
   */
  pathToEntryPoint: string
  /**
   * List of all required files that this function needs to run.
   */
  requiredFiles: Array<string>
}

export type FunctionsManifest = Array<IFunctionDefinition>

interface IDefaultContext {
  /**
   * Reporter instance that can be used to log messages to terminal.
   * @see https://www.gatsbyjs.com/docs/reference/config-files/node-api-helpers/#reporter
   */
  reporter: typeof reporter
}

export interface IAdaptContext extends IDefaultContext {
  routesManifest: RoutesManifest
  functionsManifest: FunctionsManifest
  /**
   * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#pathprefix
   */
  pathPrefix: string
  /**
   * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#trailingslash
   */
  trailingSlash: TrailingSlash
}

export interface ICacheContext extends IDefaultContext {
  directories: Array<string>
}

export interface IAdapter {
  /**
   * Unique name of the adapter. Used to identify adapter in manifest.
   */
  name: string
  cache?: {
    /**
     * Hook to restore `directories` from previous builds. This is executed very early on in the build process. If `false` is returned Gatsby will skip its cache restoration.
     */
    restore: (
      context: ICacheContext
    ) => Promise<boolean | void> | boolean | void
    /**
     * Hook to store `directories` for the current build. Executed as one of the last steps in the build process.
     */
    store: (context: ICacheContext) => Promise<void> | void
  }
  /**
   * Hook to take Gatsby’s output and preparing it for deployment on the adapter’s platform. Executed as one of the last steps in the build process.
   *
   * The `adapt` hook should do the following things:
   * - Apply HTTP headers to assets
   * - Apply redirects and rewrites. The adapter should can also create its own redirects/rewrites if necessary (e.g. mapping serverless functions to internal URLs).
   * - Wrap serverless functions coming from Gatsby with platform-specific code (if necessary). Gatsby will produce [Express-like](https://expressjs.com/) handlers.
   * - Apply trailing slash behavior and path prefix to URLs
   * - Possibly upload assets to CDN
   *
   * @see http://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/creating-an-adapter/
   */
  adapt: (context: IAdaptContext) => Promise<void> | void
  // TODO: should we have "private storage" handling defining a way to "upload" and "download those private assets?
  // this could be used for lmdb datastore in case it's not being bundled with ssr-engine lambda as well as File nodes to handle
  // current limitation in Netlify's implementation of DSG/SSR ( https://github.com/netlify/netlify-plugin-gatsby#caveats )
}

/**
 * Adapter initialization function that returns an instance of the adapter.
 * @see http://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/creating-an-adapter/
 */
export type AdapterInit<T = Record<string, unknown>> = (
  adapterOptions?: T
) => IAdapter

export interface IAdapterManager {
  restoreCache: () => Promise<void> | void
  storeCache: () => Promise<void> | void
  adapt: () => Promise<void> | void
}

/**
 * Types for gatsby/adapters.js
 * @see http://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/
 */
export interface IAdapterManifestEntry {
  /**
   * Name of the adapter
   */
  name: string
  /**
   * Test function to determine if adapter should be used
   */
  test: () => boolean
  /**
   * npm module name of the adapter
   */
  module: string
  /**
   * List of version pairs that are supported by the adapter.
   * This allows to have multiple versions of the adapter for different versions of Gatsby.
   * This is useful for when APIs change or bugs are fixed that require different implementations.
   */
  versions: Array<{
    /**
     * Version of the `gatsby` package. This is a semver range.
     */
    gatsbyVersion: string
    /**
     * Version of the adapter. This is a semver range.
     */
    moduleVersion: string
  }>
}
