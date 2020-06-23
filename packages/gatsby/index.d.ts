import * as React from "react"
import { Renderer } from "react-dom"
import { EventEmitter } from "events"
import { WindowLocation, NavigateFn } from "@reach/router"
import reporter from "gatsby-cli/lib/reporter"
import {
  ComposeEnumTypeConfig,
  ComposeInputObjectTypeConfig,
  ComposeInterfaceTypeConfig,
  ComposeObjectTypeConfig,
  ComposeScalarTypeConfig,
  ComposeUnionTypeConfig,
} from "graphql-compose"
import { GraphQLOutputType } from "graphql"

export {
  default as Link,
  GatsbyLinkProps,
  navigate,
  navigateTo,
  push,
  replace,
  withPrefix,
  withAssetPrefix,
} from "gatsby-link"

export const useStaticQuery: <TData = any>(query: any) => TData

export const parsePath: (path: string) => WindowLocation

export const prefetchPathname: (path: string) => void

/**
 * A props object for adding type safety to your Gatsby pages, can be
 * extended with both the query response shape, and the page context.
 *
 * @example
 * // When typing a default page from the ./pages dir
 *
 * import {PageProps} from "gatsby"
 * export default (props: PageProps) => {
 *
 * @example
 * // When adding types for both pageContext (represended by LocaleLookUpInfo) 
 * // and GraphQL query data (represented by IndexQueryProps)
 *
 * import {PageProps} from "gatsby"
 *
 * type IndexQueryProps = { downloadCount: number }
 * type LocaleLookUpInfo = { translationStrings: any } & { langKey: string, slug: string }
 * type IndexPageProps = PageProps<IndexQueryProps, LocaleLookUpInfo>
 *
 * export default (props: IndexPageProps) => {
 *   ..
 */
export type PageProps<
  DataType = object,
  PageContextType = object,
  LocationState = WindowLocation["state"]
> = {
  /** The path for this current page */
  path: string
  /** The URI for the current page */
  uri: string
  /** An extended version of window.document which comes from @react/router */
  location: WindowLocation<LocationState>
  /** A way to handle programmatically controlling navigation */
  navigate: NavigateFn
  /** You can't get passed children as this is the root user-land component */
  children: undefined
  /** @deprecated use pageContext instead */
  pathContext: object
  /** Holds information about the build process for this component */
  pageResources: {
    component: React.Component
    json: {
      data: DataType
      pageContext: PageContextType
    }
    page: {
      componentChunkName: string
      path: string
      webpackCompilationHash: string
      matchPath?: string
    }
  }
  /**
   * Data passed into the page via an exported GraphQL query. To set up this type
   * you need to use [generics](https://www.typescriptlang.org/play/#example/generic-functions),
   * see below for an example
   *
   * @example
   *
   * import {PageProps} from "gatsby"
   *
   * type IndexQueryProps = { downloadCount: number }
   * type IndexPageProps = PageProps<IndexQueryProps>
   *
   * export default (props: IndexPageProps) => {
   *   ..
   *
   */
  data: DataType
  /**
   * A context object which is passed in during the creation of the page. Can be extended if you are using
   * `createPage` yourself using generics:
   *
   * @example
   *
   * import {PageProps} from "gatsby"
   *
   * type IndexQueryProps = { downloadCount: number }
   * type LocaleLookUpInfo = { translationStrings: any } & { langKey: string, slug: string }
   * type IndexPageProps = PageProps<IndexQueryProps, LocaleLookUpInfo>
   *
   * export default (props: IndexPageProps) => {
   *   ..
   */
  pageContext: PageContextType
}

export interface PageRendererProps {
  location: WindowLocation
}

/**
 * PageRenderer's constructor [loads the page resources](https://www.gatsbyjs.org/docs/production-app/#load-page-resources) for the path.
 *
 * On first load though, these will have already been requested from the server by `<link rel="preload" ... />` in the page's original HTML (see [Link Preloads](https://www.gatsbyjs.org/docs/how-code-splitting-works/#construct-link-and-script-tags-for-current-page) in HTML Generation Docs).
 * The loaded page resources includes the imported component, with which we create the actual page component using [React.createElement()](https://reactjs.org/docs/react-api.html). This element is returned to our RouteHandler which hands it off to Reach Router for rendering.
 *
 * @see https://www.gatsbyjs.org/docs/production-app/#page-rendering
 */
export class PageRenderer extends React.Component<PageRendererProps> {}

type RenderCallback<T = any> = (data: T) => React.ReactNode

export interface StaticQueryProps<T = any> {
  query: any
  render?: RenderCallback<T>
  children?: RenderCallback<T>
}

/**
 * StaticQuery can do most of the things that page query can, including fragments. The main differences are:
 *
 * - page queries can accept variables (via `pageContext`) but can only be added to _page_ components
 * - StaticQuery does not accept variables (hence the name "static"), but can be used in _any_ component, including pages
 * - StaticQuery does not work with raw React.createElement calls; please use JSX, e.g. `<StaticQuery />`
 *
 * @see https://www.gatsbyjs.org/docs/static-query/
 */

export class StaticQuery<T = any> extends React.Component<
  StaticQueryProps<T>
> {}

/**
 * graphql is a tag function. Behind the scenes Gatsby handles these tags in a particular way
 *
 * During the Gatsby build process, GraphQL queries are pulled out of the original source for parsing.
 *
 * @see https://www.gatsbyjs.org/docs/page-query#how-does-the-graphql-tag-work
 */
export const graphql: (query: TemplateStringsArray) => void

/**
 * Gatsby configuration API.
 *
 * @see https://www.gatsbyjs.org/docs/gatsby-config/
 */
export interface GatsbyConfig {
  /** When you want to reuse common pieces of data across the site (for example, your site title), you can store that here. */
  siteMetadata?: Record<string, unknown>
  /** Plugins are Node.js packages that implement Gatsby APIs. The config file accepts an array of plugins. Some plugins may need only to be listed by name, while others may take options. */
  plugins?: Array<PluginRef>
  /** It’s common for sites to be hosted somewhere other than the root of their domain. Say we have a Gatsby site at `example.com/blog/`. In this case, we would need a prefix (`/blog`) added to all paths on the site. */
  pathPrefix?: string
  /** In some circumstances you may want to deploy assets (non-HTML resources such as JavaScript, CSS, etc.) to a separate domain. `assetPrefix` allows you to use Gatsby with assets hosted from a separate domain */
  assetPrefix?: string
  /** Gatsby uses the ES6 Promise API. Because some browsers don't support this, Gatsby includes a Promise polyfill by default. If you'd like to provide your own Promise polyfill, you can set `polyfill` to false.*/
  polyfill?: boolean
  mapping?: Record<string, string>
  /**
   * Setting the proxy config option will tell the develop server to proxy any unknown requests to your specified server.
   * @see https://www.gatsbyjs.org/docs/api-proxy/
   * */
  proxy?: {
    prefix: string
    url: string
  }
  /** Sometimes you need more granular/flexible access to the development server. Gatsby exposes the Express.js development server to your site’s gatsby-config.js where you can add Express middleware as needed. */
  developMiddleware?(app: any): void
}

/**
 * Gatsby API for Node.js.
 *
 * @see https://www.gatsbyjs.org/docs/node-apis/
 */
export interface GatsbyNode {
  /**
   * Tell plugins to add pages. This extension point is called only after the initial
   * sourcing and transformation of nodes plus creation of the GraphQL schema are
   * complete so you can query your data in order to create pages.
   *
   * @see https://www.gatsbyjs.org/docs/node-apis/#createPages
   */
  createPages?(
    args: CreatePagesArgs & {
      traceId: "initial-createPages"
    },
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Like `createPages` but for plugins who want to manage creating and removing
   * pages themselves in response to changes in data *not* managed by Gatsby.
   * Plugins implementing `createPages` will get called regularly to recompute
   * page information as Gatsby's data changes but those implementing
   * `createPagesStatefully` will not.
   *
   * An example of a plugin that uses this extension point is the plugin
   * [gatsby-plugin-page-creator](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-page-creator)
   * which monitors the `src/pages` directory for the adding and removal of JS
   * pages. As its source of truth, files in the pages directory, is not known by
   * Gatsby, it needs to keep its own state about its world to know when to
   * add and remove pages.
   */
  createPagesStatefully?(
    args: CreatePagesArgs & {
      traceId: "initial-createPagesStatefully"
    },
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Let plugins extend/mutate the site's Babel configuration.
   * This API will change before 2.0 as it needs still to be converted to use
   * Redux actions.
   */
  onCreateBabelConfig?(
    args: CreateBabelConfigArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Run when gatsby develop server is started, its useful to add proxy and middleware
   * to the dev server app
   * @param {object} $0
   * @param {Express} $0.app The [Express app](https://expressjs.com/en/4x/api.html#app) used to run the dev server
   *
   * @example
   *
   * exports.onCreateDevServer = ({ app }) => {
   *   app.get('/hello', function (req, res) {
   *     res.send('hello world')
   *   })
   * }
   */
  onCreateDevServer?(
    args: CreateDevServerArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Called when a new node is created. Plugins wishing to extend or
   * transform nodes created by other plugins should implement this API.
   *
   * See also the documentation for `createNode`
   * and [`createNodeField`](https://www.gatsbyjs.org/docs/actions/#createNodeField)
   * @example
   * exports.onCreateNode = ({ node, actions }) => {
   *   const { createNode, createNodeField } = actions
   *   // Transform the new node here and create a new node or
   *   // create a new node field.
   * }
   */
  onCreateNode?<TNode extends object = {}>(
    args: CreateNodeArgs<TNode>,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Called when a new page is created. This extension API is useful
   * for programmatically manipulating pages created by other plugins e.g.
   * if you want paths without trailing slashes.
   *
   * See the guide [Creating and Modifying Pages](https://www.gatsbyjs.org/docs/creating-and-modifying-pages/)
   * for more on this API.
   */
  onCreatePage?<TContext = Record<string, unknown>>(
    args: CreatePageArgs<TContext>,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Let plugins extend/mutate the site's webpack configuration.
   * @see https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
   */
  onCreateWebpackConfig?(
    args: CreateWebpackConfigArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /** Called at the end of the bootstrap process after all other extension APIs have been called. */
  onPostBootstrap?(
    args: ParentSpanPluginArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /** The last extension point called after all other parts of the build process are complete. */
  onPostBuild?(
    args: BuildArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /** Called at the end of the bootstrap process after all other extension APIs have been called. */
  onPreBootstrap?(
    args: ParentSpanPluginArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /** The first extension point called during the build process. Called after the bootstrap has completed but before the build steps start. */
  onPreBuild?(
    args: BuildArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /** Called once Gatsby has initialized itself and is ready to bootstrap your site. */
  onPreExtractQueries?(
    args: ParentSpanPluginArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /** The first API called during Gatsby execution, runs as soon as plugins are loaded, before cache initialization and bootstrap preparation. */
  onPreInit?(
    args: ParentSpanPluginArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Ask compile-to-js plugins to process source to JavaScript so the query
   * runner can extract out GraphQL queries for running.
   */
  preprocessSource?(
    args: PreprocessSourceArgs,
    options?: PluginOptions,
    callback?: PluginCallback
  ): void

  /**
   * Lets plugins implementing support for other compile-to-js add to the list of "resolvable" file extensions. Gatsby supports `.js` and `.jsx` by default.
   */
  resolvableExtensions?(
    args: ResolvableExtensionsArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): any[] | Promise<any[]>

  /**
   * Called during the creation of the GraphQL schema. Allows plugins
   * to add new fields to the types created from data nodes. It will be called
   * separately for each type.
   *
   * This function should return an object in the shape of
   * [GraphQLFieldConfigMap](https://graphql.org/graphql-js/type/#graphqlobjecttype)
   * which will be appended to fields inferred by Gatsby from data nodes.
   *
   * *Note:* Import GraphQL types from `gatsby/graphql` and don't add the `graphql`
   * package to your project/plugin dependencies to avoid Schema must
   * contain unique named types but contains multiple types named errors.
   * `gatsby/graphql` exports all builtin GraphQL types as well as the `graphQLJSON`
   * type.
   *
   * Many transformer plugins use this to add fields that take arguments.
   *
   * @see https://www.gatsbyjs.org/docs/node-apis/#setFieldsOnGraphQLNodeType
   */
  setFieldsOnGraphQLNodeType?(
    args: SetFieldsOnGraphQLNodeTypeArgs,
    options: PluginOptions
  ): any
  setFieldsOnGraphQLNodeType?(
    args: SetFieldsOnGraphQLNodeTypeArgs,
    options: PluginOptions
  ): Promise<any>
  setFieldsOnGraphQLNodeType?(
    args: SetFieldsOnGraphQLNodeTypeArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void

  /**
   * Extension point to tell plugins to source nodes. This API is called during
   * the Gatsby bootstrap sequence. Source plugins use this hook to create nodes.
   * This API is called exactly once per plugin (and once for your site's
   * `gatsby-config.js` file). If you define this hook in `gatsby-node.js` it
   * will be called exactly once after all of your source plugins have finished
   * creating nodes.
   *
   * @see https://www.gatsbyjs.org/docs/node-apis/#sourceNodes
   */
  sourceNodes?(args: SourceNodesArgs, options: PluginOptions): any
  sourceNodes?(args: SourceNodesArgs, options: PluginOptions): Promise<any>
  sourceNodes?(
    args: SourceNodesArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void

  /**
   * Add custom field resolvers to the GraphQL schema.
   *
   * Allows adding new fields to types by providing field configs, or adding resolver
   * functions to existing fields.
   *
   * Things to note:
   * * Overriding field types is disallowed, instead use the `createTypes`
   *   action. In case of types added from third-party schemas, where this is not
   *   possible, overriding field types is allowed.
   * * New fields will not be available on `filter` and `sort` input types. Extend
   *   types defined with `createTypes` if you need this.
   * * In field configs, types can be referenced as strings.
   * * When extending a field with an existing field resolver, the original
   *   resolver function is available from `info.originalResolver`.
   * * The `createResolvers` API is called as the last step in schema generation.
   *   Thus, an intermediate schema is made available on the `schema` property.
   *   In resolver functions themselves, it is recommended to access the final
   *   built schema from `info.schema`.
   * * Gatsby's data layer, including all internal query capabilities, is
   *   exposed on [`context.nodeModel`](/docs/node-model/). The node store can be
   *   queried directly with `getAllNodes`, `getNodeById` and `getNodesByIds`,
   *   while more advanced queries can be composed with `runQuery`. Note that
   *   `runQuery` will call field resolvers before querying, so e.g. foreign-key
   *   fields will be expanded to full nodes. The other methods on `nodeModel`
   *   don't do this.
   * * It is possible to add fields to the root `Query` type.
   * * When using the first resolver argument (`source` in the example below,
   *   often also called `parent` or `root`), take care of the fact that field
   *   resolvers can be called more than once in a query, e.g. when the field is
   *   present both in the input filter and in the selection set. This means that
   *   foreign-key fields on `source` can be either resolved or not-resolved.
   *
   * For fuller examples, see [`using-type-definitions`](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-type-definitions).
   *
   * @see https://www.gatsbyjs.org/docs/node-apis/#createResolvers
   */
  createResolvers?(args: CreateResolversArgs, options: PluginOptions): any
  createResolvers?(
    args: CreateResolversArgs,
    options: PluginOptions
  ): Promise<any>
  createResolvers?(
    args: CreateResolversArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void

  /**
   * Customize Gatsby’s GraphQL schema by creating type definitions, field extensions or adding third-party schemas.
   * The createTypes, createFieldExtension and addThirdPartySchema actions are only available in this API.
   *
   * For details on their usage please refer to the actions documentation.
   *
   * This API runs immediately before schema generation. For modifications of the generated schema, e.g.
   * to customize added third-party types, use the createResolvers API.
   * @see https://www.gatsbyjs.org/docs/node-apis/#createSchemaCustomization
   */
  createSchemaCustomization?(
    args: CreateSchemaCustomizationArgs,
    options: PluginOptions
  ): any
  createSchemaCustomization?(
    args: CreateSchemaCustomizationArgs,
    options: PluginOptions
  ): Promise<any>
  createSchemaCustomization?(
    args: CreateSchemaCustomizationArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void
}

/**
 * Gatsby browser API.
 *
 * @see https://www.gatsbyjs.org/docs/browser-apis/
 */
export interface GatsbyBrowser {
  disableCorePrefetching?(args: BrowserPluginArgs, options: PluginOptions): any
  onClientEntry?(args: BrowserPluginArgs, options: PluginOptions): any
  onInitialClientRender?(args: BrowserPluginArgs, options: PluginOptions): any
  onPostPrefetchPathname?(
    args: PrefetchPathnameArgs,
    options: PluginOptions
  ): any
  onPreRouteUpdate?(args: RouteUpdateArgs, options: PluginOptions): any
  onPrefetchPathname?(args: PrefetchPathnameArgs, options: PluginOptions): any
  onRouteUpdate?(args: RouteUpdateArgs, options: PluginOptions): any
  onRouteUpdateDelayed?(
    args: RouteUpdateDelayedArgs,
    options: PluginOptions
  ): any
  onServiceWorkerActive?(args: ServiceWorkerArgs, options: PluginOptions): any
  onServiceWorkerInstalled?(
    args: ServiceWorkerArgs,
    options: PluginOptions
  ): any
  onServiceWorkerRedundant?(
    args: ServiceWorkerArgs,
    options: PluginOptions
  ): any
  onServiceWorkerUpdateFound?(
    args: ServiceWorkerArgs,
    options: PluginOptions
  ): any
  onServiceWorkerUpdateReady?(
    args: ServiceWorkerArgs,
    options: PluginOptions
  ): any
  registerServiceWorker?(args: BrowserPluginArgs, options: PluginOptions): any
  replaceComponentRenderer?(
    args: ReplaceComponentRendererArgs,
    options: PluginOptions
  ): any
  replaceHydrateFunction?(
    args: BrowserPluginArgs,
    options: PluginOptions
  ): Renderer
  shouldUpdateScroll?(args: ShouldUpdateScrollArgs, options: PluginOptions): any
  wrapPageElement?(
    args: WrapPageElementBrowserArgs,
    options: PluginOptions
  ): any
  wrapRootElement?(
    args: WrapRootElementBrowserArgs,
    options: PluginOptions
  ): any
}

/**
 * Gatsby server-side rendering API.
 *
 * @see https://www.gatsbyjs.org/docs/ssr-apis/
 */
export interface GatsbySSR {
  /**
   * Called after every page Gatsby server renders while building HTML so you can
   * replace head components to be rendered in your `html.js`. This is useful if
   * you need to reorder scripts or styles added by other plugins.
   * @example
   * // Move Typography.js styles to the top of the head section so they're loaded first.
   * exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
   *   const headComponents = getHeadComponents()
   *   headComponents.sort((x, y) => {
   *     if (x.key === 'TypographyStyle') {
   *       return -1
   *     } else if (y.key === 'TypographyStyle') {
   *       return 1
   *     }
   *     return 0
   *   })
   *   replaceHeadComponents(headComponents)
   * }
   */
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions): any
  onPreRenderHTML?(
    args: PreRenderHTMLArgs,
    options: PluginOptions
  ): Promise<any>
  onPreRenderHTML?(
    args: PreRenderHTMLArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void

  /**
   * Called after every page Gatsby server renders while building HTML so you can
   * set head and body components to be rendered in your `html.js`.
   *
   * Gatsby does a two-pass render for HTML. It loops through your pages first
   * rendering only the body and then takes the result body HTML string and
   * passes it as the `body` prop to your `html.js` to complete the render.
   *
   * It's often handy to be able to send custom components to your `html.js`.
   * For example, it's a very common pattern for React.js libraries that
   * support server rendering to pull out data generated during the render to
   * add to your HTML.
   *
   * Using this API over `replaceRenderer` is preferable as
   * multiple plugins can implement this API where only one plugin can take
   * over server rendering. However, if your plugin requires taking over server
   * rendering then that's the one to use
   * @example
   * const { Helmet } = require("react-helmet")
   *
   * exports.onRenderBody = (
   *   { setHeadComponents, setHtmlAttributes, setBodyAttributes },
   *   pluginOptions
   * ) => {
   *   const helmet = Helmet.renderStatic()
   *   setHtmlAttributes(helmet.htmlAttributes.toComponent())
   *   setBodyAttributes(helmet.bodyAttributes.toComponent())
   *   setHeadComponents([
   *     helmet.title.toComponent(),
   *     helmet.link.toComponent(),
   *     helmet.meta.toComponent(),
   *     helmet.noscript.toComponent(),
   *     helmet.script.toComponent(),
   *     helmet.style.toComponent(),
   *   ])
   * }
   */
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions): any
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions): Promise<any>
  onRenderBody?(
    args: RenderBodyArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void

  /**
   * Replace the default server renderer. This is useful for integration with
   * Redux, css-in-js libraries, etc. that need custom setups for server
   * rendering.
   * @example
   * // From gatsby-plugin-glamor
   * const { renderToString } = require("react-dom/server")
   * const inline = require("glamor-inline")
   *
   * exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
   *   const bodyHTML = renderToString(bodyComponent)
   *   const inlinedHTML = inline(bodyHTML)
   *
   *   replaceBodyHTMLString(inlinedHTML)
   * }
   */
  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions): any
  replaceRenderer?(
    args: ReplaceRendererArgs,
    options: PluginOptions
  ): Promise<any>
  replaceRenderer?(
    args: ReplaceRendererArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void

  /**
   * Allow a plugin to wrap the page element.
   *
   * This is useful for setting wrapper component around pages that won't get
   * unmounted on page change. For setting Provider components use `wrapRootElement`.
   *
   * _Note:_ [There is equivalent hook in Browser API](https://www.gatsbyjs.org/docs/browser-apis/#wrapPageElement)
   * @example
   * const React = require("react")
   * const Layout = require("./src/components/layout")
   *
   * exports.wrapPageElement = ({ element, props }) => {
   *   // props provide same data to Layout as Page element will get
   *   // including location, data, etc - you don't need to pass it
   *   return <Layout {...props}>{element}</Layout>
   * }
   */
  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions): any
  wrapPageElement?(
    args: WrapPageElementNodeArgs,
    options: PluginOptions
  ): Promise<any>
  wrapPageElement?(
    args: WrapPageElementNodeArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void
  /**
   * Allow a plugin to wrap the root element.
   *
   * This is useful to setup any Providers component that will wrap your application.
   * For setting persistent UI elements around pages use `wrapPageElement`.
   *
   * _Note:_ [There is equivalent hook in Browser API](https://www.gatsbyjs.org/docs/browser-apis/#wrapRootElement)
   * @example
   * const React = require("react")
   * const { Provider } = require("react-redux")
   *
   * const createStore = require("./src/state/createStore")
   * const store = createStore()
   *
   * exports.wrapRootElement = ({ element }) => {
   *   return (
   *     <Provider store={store}>
   *       {element}
   *     </Provider>
   *   )
   * }
   */
  wrapRootElement?(args: WrapRootElementNodeArgs, options: PluginOptions): any
  wrapRootElement?(
    args: WrapRootElementNodeArgs,
    options: PluginOptions
  ): Promise<any>
  wrapRootElement?(
    args: WrapRootElementNodeArgs,
    options: PluginOptions,
    callback: PluginCallback
  ): void
}

export interface PluginOptions {
  plugins: unknown[]
  [key: string]: unknown
}

export type PluginCallback = (err: Error | null, result?: any) => void

export interface CreatePagesArgs extends ParentSpanPluginArgs {
  graphql<TData, TVariables = any>(
    query: string,
    variables?: TVariables
  ): Promise<{
    errors?: any
    data?: TData
  }>
  traceId: string
  waitForCascadingActions: boolean
}

type GatsbyStages =
  | "develop"
  | "develop-html"
  | "build-javascript"
  | "build-html"

export interface CreateBabelConfigArgs extends ParentSpanPluginArgs {
  stage: GatsbyStages
}

export interface CreateDevServerArgs extends ParentSpanPluginArgs {
  app: any
}

export interface CreateNodeArgs<TNode extends object = {}>
  extends ParentSpanPluginArgs {
  node: Node & TNode
  traceId: string
  traceTags: {
    nodeId: string
    nodeType: string
  }
}

export interface CreatePageArgs<TContext = Record<string, unknown>>
  extends ParentSpanPluginArgs {
  page: Page<TContext>
  traceId: string
}

export interface CreateWebpackConfigArgs extends ParentSpanPluginArgs {
  getConfig: Function
  stage: GatsbyStages
  rules: WebpackRules
  loaders: WebpackLoaders
  plugins: WebpackPlugins
}

export interface PreprocessSourceArgs extends ParentSpanPluginArgs {
  filename: string
  contents: string
}

export interface ResolvableExtensionsArgs extends ParentSpanPluginArgs {
  traceId: "initial-resolvableExtensions"
}

export interface SetFieldsOnGraphQLNodeTypeArgs extends ParentSpanPluginArgs {
  type: {
    name: string
    nodes: any[]
  }
  traceId: "initial-setFieldsOnGraphQLNodeType"
}

export interface GatsbyGraphQLObjectType {
  kind: "OBJECT"
  config: ComposeObjectTypeConfig<any, any>
}

interface GatsbyGraphQLInputObjectType {
  kind: "INPUT_OBJECT"
  config: ComposeInputObjectTypeConfig
}

interface GatsbyGraphQLUnionType {
  kind: "UNION"
  config: ComposeUnionTypeConfig<any, any>
}

interface GatsbyGraphQLInterfaceType {
  kind: "INTERFACE"
  config: ComposeInterfaceTypeConfig<any, any>
}

interface GatsbyGraphQLEnumType {
  kind: "ENUM"
  config: ComposeEnumTypeConfig
}

interface GatsbyGraphQLScalarType {
  kind: "SCALAR"
  config: ComposeScalarTypeConfig
}

export type GatsbyGraphQLType =
  | GatsbyGraphQLObjectType
  | GatsbyGraphQLInputObjectType
  | GatsbyGraphQLUnionType
  | GatsbyGraphQLInterfaceType
  | GatsbyGraphQLEnumType
  | GatsbyGraphQLScalarType

export interface NodePluginSchema {
  buildObjectType(
    config: ComposeObjectTypeConfig<any, any>
  ): GatsbyGraphQLObjectType
  buildUnionType(
    config: ComposeUnionTypeConfig<any, any>
  ): GatsbyGraphQLUnionType
  buildInterfaceType(
    config: ComposeInterfaceTypeConfig<any, any>
  ): GatsbyGraphQLInterfaceType
  buildInputObjectType(
    config: ComposeInputObjectTypeConfig
  ): GatsbyGraphQLInputObjectType
  buildEnumType(config: ComposeEnumTypeConfig): GatsbyGraphQLEnumType
  buildScalarType(config: ComposeScalarTypeConfig): GatsbyGraphQLScalarType
}

export interface SourceNodesArgs extends ParentSpanPluginArgs {
  traceId: "initial-sourceNodes"
  waitForCascadingActions: boolean
}

export interface CreateResolversArgs extends ParentSpanPluginArgs {
  intermediateSchema: object
  createResolvers: Function
  traceId: "initial-createResolvers"
}

export interface CreateSchemaCustomizationArgs extends ParentSpanPluginArgs {
  traceId: "initial-createSchemaCustomization"
}

export interface PreRenderHTMLArgs extends NodePluginArgs {
  getHeadComponents: () => React.ReactNode[]
  replaceHeadComponents: (comp: React.ReactNode[]) => void
  getPreBodyComponents: () => React.ReactNode[]
  replacePreBodyComponents: (comp: React.ReactNode[]) => void
  getPostBodyComponents: () => React.ReactNode[]
  replacePostBodyComponents: (comp: React.ReactNode[]) => void
}

type ReactProps<T extends Element> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
>
export interface RenderBodyArgs extends NodePluginArgs {
  pathname: string
  setHeadComponents: (comp: React.ReactNode[]) => void
  setHtmlAttributes: (attr: ReactProps<HTMLHtmlElement>) => void
  setBodyAttributes: (attr: ReactProps<HTMLBodyElement>) => void
  setPreBodyComponents: (comp: React.ReactNode[]) => void
  setPostBodyComponents: (comp: React.ReactNode[]) => void
  setBodyProps: Function
}

export interface ReplaceRendererArgs extends NodePluginArgs {
  replaceBodyHTMLString: (str: string) => void
  setHeadComponents: (comp: React.ReactNode[]) => void
  setHtmlAttributes: (attr: ReactProps<HTMLHtmlElement>) => void
  setBodyAttributes: (attr: ReactProps<HTMLBodyElement>) => void
  setPreBodyComponents: (comp: React.ReactNode[]) => void
  setPostBodyComponents: (comp: React.ReactNode[]) => void
  setBodyProps: Function
}

export interface WrapPageElementNodeArgs<
  DataType = object,
  PageContextType = object
> extends NodePluginArgs {
  element: object
  props: PageProps<DataType, PageContextType>
  pathname: string
}

export interface WrapRootElementNodeArgs extends NodePluginArgs {
  element: object
}

export interface ParentSpanPluginArgs extends NodePluginArgs {
  parentSpan: object
}

export interface NodePluginArgs {
  /**
   * Use to prefix resources URLs. `pathPrefix` will be either empty string or
   * path that starts with slash and doesn't end with slash. Check
   * [Adding a Path Prefix](https://www.gatsbyjs.org/docs/path-prefix/)
   * page for details about path prefixing.
   */
  pathPrefix: string

  /**
   * Collection of functions used to programmatically modify Gatsby’s internal state.
   * @deprecated Will be removed in gatsby 3.0. Use `actions` instead
   */
  boundActionCreators: Actions

  /**
   * Collection of functions used to programmatically modify Gatsby’s internal state.
   */
  actions: Actions

  /**
   * Get content for a node from the plugin that created it.
   *
   * @example
   * module.exports = async function onCreateNode(
   *   { node, loadNodeContent, actions, createNodeId }
   * ) {
   *   if (node.internal.mediaType === 'text/markdown') {
   *     const { createNode, createParentChildLink } = actions
   *     const textContent = await loadNodeContent(node)
   *     // process textContent and create child nodes
   *   }
   * }
   */
  loadNodeContent(node: Node): Promise<string>

  /**
   * Internal redux state used for application state. Do not use, unless you
   * absolutely must. Store is considered a private API and can change with
   * any version.
   */
  store: Store

  /**
   * Internal event emitter / listener.  Do not use, unless you absolutely
   * must. Emitter is considered a private API and can change with any version.
   */
  emitter: EventEmitter

  /**
   * Get array of all nodes.
   *
   * @returns Array of nodes.
   * @example
   * const allNodes = getNodes()
   */
  getNodes(): Node[]

  /**
   * Get single node by given ID.
   * Don't use this in graphql resolvers - see
   * `getNodeAndSavePathDependency`
   *
   * @param id id of the node.
   * @returns Single node instance.
   * @example
   * const node = getNode(id)
   */
  getNode(id: string): Node

  /**
   * Get array of nodes of given type.
   * @param type Type of nodes
   * @returns Array of nodes.
   *
   * @example
   * const markdownNodes = getNodesByType(`MarkdownRemark`)
   */
  getNodesByType(type: string): Node[]

  /**
   * Compares `contentDigest` of cached node with passed value
   * to determine if node has changed.
   *
   * @param id of node
   * @param contentDigest of node
   * @deprecated This check is done internally in Gatsby and it's not necessary to use it in plugins. Will be removed in gatsby 3.0.
   */
  hasNodeChanged(id: string, contentDigest: string): boolean

  /**
   * Set of utilities to output information to user
   */
  reporter: Reporter

  /**
   * Get single node by given ID and create dependency for given path.
   * This should be used instead of `getNode` in graphql resolvers to enable
   * tracking dependencies for query results. If it's not used Gatsby will
   * not rerun query if node changes leading to stale query results. See
   * [Page -> Node Dependency Tracking](/docs/page-node-dependencies/)
   * for more details.
   * @param id id of the node.
   * @param path of the node.
   * @returns Single node instance.
   */
  getNodeAndSavePathDependency(id: string, path: string): Node

  /**
   * Key-value store used to persist results of time/memory/cpu intensive
   * tasks. All functions are async and return promises.
   */
  cache: GatsbyCache

  /**
   * Utility function useful to generate globally unique and stable node IDs.
   * It will generate different IDs for different plugins if they use same
   * input.
   *
   * @returns UUIDv5 ID string
   * @example
   * const node = {
   *   id: createNodeId(`${backendData.type}${backendData.id}`),
   *   ...restOfNodeData
   * }
   */
  createNodeId(input: string): string

  /**
   * Create a stable content digest from a string or object, you can use the
   * result of this function to set the `internal.contentDigest` field
   * on nodes. Gatsby uses the value of this field to invalidate stale data
   * when your content changes.
   * @param input
   * @returns Hash string
   * @example
   * const node = {
   *   ...nodeData,
   *   internal: {
   *     type: `TypeOfNode`,
   *     contentDigest: createContentDigest(nodeData)
   *   }
   * }
   */
  createContentDigest(input: string | object): string

  /**
   * Set of utilities that allow adding more detailed tracing for plugins.
   * Check
   * [Performance tracing](https://www.gatsbyjs.org/docs/performance-tracing)
   * page for more details.
   */
  tracing: Tracing
  schema: NodePluginSchema
  [key: string]: unknown
}

interface ActionPlugin {
  name: string
}

interface DeleteNodeArgs {
  node: Node
}

interface CreateNodeFieldArgs {
  node: Node
  name: string
  value: string

  /**
   * @deprecated
   */
  fieldName?: string

  /**
   * @deprecated
   */
  fieldValue?: string
}

interface ActionOptions {
  [key: string]: unknown
}

export interface BuildArgs extends ParentSpanPluginArgs {
  graphql<TData, TVariables = any>(
    query: string,
    variables?: TVariables
  ): Promise<{
    errors?: any
    data?: TData
  }>
}

export interface Actions {
  /** @see https://www.gatsbyjs.org/docs/actions/#deletePage */
  deletePage(args: { path: string; component: string }): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createPage */
  createPage<TContext = Record<string, unknown>>(
    args: Page<TContext>,
    plugin?: ActionPlugin,
    option?: ActionOptions
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#deletePage */
  deleteNode(
    options: { node: Node },
    plugin?: ActionPlugin,
    option?: ActionOptions
  ): void

  /**
   * @deprecated
   * @see https://www.gatsbyjs.org/docs/actions/#deleteNodes
   */
  deleteNodes(nodes: string[], plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createNode */
  createNode(
    node: NodeInput,
    plugin?: ActionPlugin,
    options?: ActionOptions
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#touchNode */
  touchNode(node: { nodeId: string }, plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createNodeField */
  createNodeField(
    args: {
      node: Node
      fieldName?: string
      fieldValue?: string
      name?: string
      value: any
    },
    plugin?: ActionPlugin,
    options?: ActionOptions
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createParentChildLink */
  createParentChildLink(
    args: { parent: Node; child: Node },
    plugin?: ActionPlugin
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#setWebpackConfig */
  setWebpackConfig(config: object, plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#replaceWebpackConfig */
  replaceWebpackConfig(config: object, plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#setBabelOptions */
  setBabelOptions(options: object, plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#setBabelPlugin */
  setBabelPlugin(
    config: { name: string; options: object },
    plugin?: ActionPlugin
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#setBabelPreset */
  setBabelPreset(
    config: { name: string; options: object },
    plugin?: ActionPlugin
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createJob */
  createJob(
    job: Record<string, unknown> & { id: string },
    plugin?: ActionPlugin
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createJobV2 */
  createJobV2(
    job: {
      name: string
      inputPaths: string[]
      outputDir: string
      args: Record<string, unknown>
    },
    plugin?: ActionPlugin
  ): Promise<unknown>

  /** @see https://www.gatsbyjs.org/docs/actions/#setJob */
  setJob(
    job: Record<string, unknown> & { id: string },
    plugin?: ActionPlugin
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#endJob */
  endJob(job: { id: string }, plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#setPluginStatus */
  setPluginStatus(status: Record<string, unknown>, plugin?: ActionPlugin): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createRedirect */
  createRedirect(
    redirect: {
      fromPath: string
      isPermanent?: boolean
      toPath: string
      redirectInBrowser?: boolean
      force?: boolean
      statusCode?: number
      [key: string]: unknown
    },
    plugin?: ActionPlugin
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#addThirdPartySchema */
  addThirdPartySchema(
    args: { schema: object },
    plugin?: ActionPlugin,
    traceId?: string
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createTypes */
  createTypes(
    types:
      | string
      | GraphQLOutputType
      | GatsbyGraphQLType
      | string[]
      | GraphQLOutputType[]
      | GatsbyGraphQLType[],
    plugin?: ActionPlugin,
    traceId?: string
  ): void

  /** @see https://www.gatsbyjs.org/docs/actions/#createFieldExtension */
  createFieldExtension(
    extension: object,
    plugin?: ActionPlugin,
    traceId?: string
  ): void
}

export interface Store {
  dispatch: Function
  subscribe: Function
  getState: Function
  replaceReducer: Function
}

export type Reporter = typeof reporter

export type ActivityTracker = {
  start(): () => void
  end(): () => void
  span: Object
  setStatus(status: string): void
  panic: (errorMeta: string | Object, error?: Object) => never
  panicOnBuild: (errorMeta: string | Object, error?: Object) => void
}

export type ProgressActivityTracker = Omit<ActivityTracker, "end"> & {
  tick(increment?: number): void
  done(): void
  total: number
}

export type ActivityArgs = {
  parentSpan?: Object
  id?: string
}

/**
 * @deprecated Use `GatsbyCache` instead
 */
export interface Cache {
  name: string
  store: {
    create: Function
  }
  cache: {
    getAndPassUp: Function
    wrap: Function
    set: Function
    mset: Function
    get: Function
    mget: Function
    del: Function
    reset: Function
  }
}

export interface GatsbyCache {
  /**
   * Retrieve cached value
   * @param key Cache key
   * @returns Promise resolving to cached value
   * @example
   * const value = await cache.get(`unique-key`)
   */
  get(key: string): Promise<any>

  /**
   * Cache value
   * @param key Cache key
   * @param value Value to be cached
   * @returns Promise resolving to cached value
   * @example
   * await cache.set(`unique-key`, value)
   */
  set(key: string, value: any): Promise<any>
}

export interface Tracing {
  tracer: object
  parentSpan: object
  startSpan: Function
}

export interface PackageJson {
  name?: string
  description?: string
  version?: string
  main?: string
  author?:
    | string
    | {
        name: string
        email: string
      }
  license?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  bundledDependencies?: Array<string>
  keywords?: string[]
}

export interface WebpackRules {
  js: Function
  mjs: Function
  eslint: Function
  yaml: Function
  fonts: Function
  images: Function
  media: Function
  miscAssets: Function
  css: Function
  cssModules: Function
  postcss: Function
  [key: string]: Function
}

export interface WebpackLoaders {
  json: Function
  yaml: Function
  null: Function
  raw: Function
  style: Function
  miniCssExtract: Function
  css: Function
  postcss: Function
  file: Function
  url: Function
  js: Function
  eslint: Function
  imports: Function
  exports: Function
  [key: string]: Function
}

export interface WebpackPlugins {
  normalModuleReplacement: Function
  contextReplacement: Function
  ignore: Function
  watchIgnore: Function
  banner: Function
  prefetch: Function
  automaticPrefetch: Function
  define: Function
  provide: Function
  hotModuleReplacement: Function
  sourceMapDevTool: Function
  evalSourceMapDevTool: Function
  evalDevToolModule: Function
  cache: Function
  extendedAPI: Function
  externals: Function
  jsonpTemplate: Function
  libraryTemplate: Function
  loaderTarget: Function
  memoryOutputFile: Function
  progress: Function
  setVarMainTemplate: Function
  umdMainTemplate: Function
  noErrors: Function
  noEmitOnErrors: Function
  newWatching: Function
  environment: Function
  dll: Function
  dllReference: Function
  loaderOptions: Function
  namedModules: Function
  namedChunks: Function
  hashedModuleIds: Function
  moduleFilenameH: Function
  aggressiveMerging: Function
  aggressiveSplitting: Function
  splitChunks: Function
  chunkModuleIdRange: Function
  dedupe: Function
  limitChunkCount: Function
  minChunkSize: Function
  occurrenceOrder: Function
  moduleConcatenation: Function
  minifyJs: Function
  minifyCss: Function
  extractText: Function
  moment: Function
  [key: string]: Function
}

export interface PrefetchPathnameArgs extends BrowserPluginArgs {
  pathname: string
}

export interface RouteUpdateArgs extends BrowserPluginArgs {
  location: Location
}

export interface ReplaceComponentRendererArgs extends BrowserPluginArgs {
  props: PageProps
  loader: object
}

export interface ShouldUpdateScrollArgs extends BrowserPluginArgs {
  prevRouterProps?: {
    location: Location
  }
  pathname: string
  routerProps: {
    location: Location
  }
  getSavedScrollPosition: Function
}

export interface WrapPageElementBrowserArgs<
  DataType = object,
  PageContextType = object
> extends BrowserPluginArgs {
  element: object
  props: PageProps<DataType, PageContextType>
}

export interface WrapRootElementBrowserArgs extends BrowserPluginArgs {
  element: object
  pathname: string
}

export interface BrowserPluginArgs {
  getResourcesForPathnameSync: Function
  getResourcesForPathname: Function
  getResourceURLsForPathname: Function
  [key: string]: unknown
}

export interface RouteUpdateDelayedArgs extends BrowserPluginArgs {
  location: Location
}

export interface ServiceWorkerArgs extends BrowserPluginArgs {
  serviceWorker: ServiceWorkerRegistration
}

export interface NodeInput {
  id: string
  parent?: string
  children?: string[]
  internal: {
    type: string
    mediaType?: string
    content?: string
    contentDigest: string
    description?: string
  }
  [key: string]: unknown
}

export interface Node extends NodeInput {
  parent: string
  children: string[]
  internal: NodeInput["internal"] & {
    owner: string
  }
  [key: string]: unknown
}

export interface Page<TContext = Record<string, unknown>> {
  path: string
  matchPath?: string
  component: string
  context: TContext
}

export interface IPluginRefObject {
  resolve: string
  options?: IPluginRefOptions
  parentDir?: string
}

export type PluginRef = string | IPluginRefObject

export interface IPluginRefOptions {
  plugins?: PluginRef[]
  path?: string
  [option: string]: unknown
}
