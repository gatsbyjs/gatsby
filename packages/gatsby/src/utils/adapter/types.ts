import type reporter from "gatsby-cli/lib/reporter"
import type { IHeader } from "../../redux/types"

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

interface IStaticRoute extends IBaseRoute {
  type: `static`
  /**
   * Location of the file that should be served for this route.
   */
  filePath: string
  headers: IHeader["headers"]
}

export interface ILambdaRoute extends IBaseRoute {
  type: `lambda`
  /**
   * Identifier of the function. Definition of that function is in function manifest.
   * Definition of function is not left directly here as some lambdas will be shared for multiple routes - such as DSG/SSR engine.
   */
  functionId: string
  /**
   * If `cache` is true, response of lambda should be cached for current deployed and served on subsequent requests for this route.
   */
  cache?: true
}

interface IRedirectRoute extends IBaseRoute {
  type: `redirect`
  toPath: string
  status: number // narrow down types to cocnrete status code that are acceptible here
  ignoreCase: boolean // this is not supported by Netlify, but is supported by Gatsby ...
  headers: IHeader["headers"]
  [key: string]: unknown
}

export type Route = IStaticRoute | ILambdaRoute | IRedirectRoute

export type RoutesManifest = Array<Route>

export type FunctionsManifest = Array<{
  /**
   * Identifier of the function. Referenced in routes manifest in lambda routes.
   */
  functionId: string
  /**
   * Path to function entrypoint that will be used to create lambda.
   */
  pathToCompiledFunction: string
  // TODO: auxiliaryFilesAndDirecotries: Array<string> - files and directories that should be copied to the function directory - do we need to figure out if platform supports bundling auxilary files to decide how to bundle ssr-engine lambda (wether datastore is bundled in function or deployed to CDN)
}>

export interface IAdaptContext {
  routesManifest: RoutesManifest
  functionsManifest: FunctionsManifest
}
export interface IAdapter {
  /**
   * Unique name of the adapter. Used to identify adapter in manifest.
   */
  name: string
  cache?: {
    /**
     * Hook to restore .cache and public directories from previous builds. Executed very early on in the build process.
     * If `false` is returned gatsby will skip trying to rehydrate state from fs.
     */
    restore: (
      directories: Array<string>
    ) => Promise<boolean | void> | boolean | void
    /**
     * Hook to store .cache and public directories from previous builds. Executed as one of last steps in build process.
     */
    store: (directories: Array<string>) => Promise<void> | void
  }
  /**
   * Hook to prepare platform specific deployment of the build. Executed as one of last steps in build process.
   * Routes and Functions manifests are being passed in as arguments and implementation should configure:
   *  - headers for static assets
   *  - redirects and rewrites (both user defined ones as well as anything needed for lambda execution)
   *  - wrap lambda functions with platform specific code if needed (produced ones will be express-like route handlers)
   *  - possibly upload static assets to CDN (unless platform is configured to just deploy "public" dir, in which case this will be skipped)
   */
  adapt: (context: IAdaptContext) => Promise<void> | void
  // TODO: should we have "private storage" handling defining a way to "upload" and "download those private assets?
  // this could be used for lmdb datastore in case it's not being bundled with ssr-engine lambda as well as File nodes to handle
  // current limitation in Netlify's implementation of DSG/SSR ( https://github.com/netlify/netlify-plugin-gatsby#caveats )
}

export interface IAdapterInitArgs {
  reporter: typeof reporter
}

export type AdapterInit = (initArgs: IAdapterInitArgs) => IAdapter

export interface IAdapterManager {
  restoreCache: () => Promise<void> | void
  storeCache: () => Promise<void> | void
  adapt: () => Promise<void> | void
}

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
