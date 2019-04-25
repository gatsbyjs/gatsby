
import * as React from "react"
import { EventEmitter } from "events"
import { Application } from "express"
import { WindowLocation } from "@reach/router"

export {
  default as Link,
  GatsbyLinkProps,
  navigate,
  navigateTo,
  push,
  replace,
  withPrefix,
} from "gatsby-link"


export interface StaticQueryProps {
  query: any
  render?: RenderCallback
  children?: RenderCallback
}

export const useStaticQuery: <TData = any>(query: any) => TData

export const parsePath: (path: string) => WindowLocation

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

type RenderCallback = (data: any) => React.ReactNode

export interface StaticQueryProps {
  query: any
  render?: RenderCallback
  children?: RenderCallback
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

export class StaticQuery extends React.Component<StaticQueryProps> {}

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
  siteMetadata?: Record<string, unknown>;
  /** Plugins are Node.js packages that implement Gatsby APIs. The config file accepts an array of plugins. Some plugins may need only to be listed by name, while others may take options. */
  plugins?: Array<string | {
    resolve: string;
    options: Record<string, unknown>;
  }>;
  /** It’s common for sites to be hosted somewhere other than the root of their domain. Say we have a Gatsby site at `example.com/blog/`. In this case, we would need a prefix (`/blog`) added to all paths on the site. */
  pathPrefix?: string;
  /** Gatsby uses the ES6 Promise API. Because some browsers don't support this, Gatsby includes a Promise polyfill by default. If you'd like to provide your own Promise polyfill, you can set `polyfill` to false.*/
  polyfill?: boolean;
  mapping?: Record<string, string>;
  /** 
   * Setting the proxy config option will tell the develop server to proxy any unknown requests to your specified server. 
   * @see https://www.gatsbyjs.org/docs/api-proxy/
   * */
  proxy?: {
    prefix: string;
    url: string;
  };
  /** Sometimes you need more granular/flexible access to the development server. Gatsby exposes the Express.js development server to your site’s gatsby-config.js where you can add Express middleware as needed. */
  developMiddleware?(app: Application): void;
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
  createPages?(args: CreatePagesArgs, options?: PluginOptions, callback?: PluginCallback): void;

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
  createPagesStatefully?(args: CreatePagesArgs, options?: PluginOptions, callback?: PluginCallback): void;


  /**
   * Tell plugins with expensive "side effects" from queries to start running
   * those now. This is a soon-to-be-replaced API only currently in use by
   * `gatsby-plugin-sharp`.
   */
  generateSideEffects?(args: NodePluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /**
   * Let plugins extend/mutate the site's Babel configuration.
   * This API will change before 2.0 as it needs still to be converted to use
   * Redux actions.
   */
  onCreateBabelConfig?(args: CreateBabelConfigArgs, options?: PluginOptions, callback?: PluginCallback): void;


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
  onCreateDevServer?(args: CreateDevServerArgs, options?: PluginOptions, callback?: PluginCallback): void;

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
  onCreateNode?(args: CreateNodeArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /**
   * Called when a new page is created. This extension API is useful
   * for programmatically manipulating pages created by other plugins e.g.
   * if you want paths without trailing slashes.
   *
   * See the guide [Creating and Modifying Pages](https://www.gatsbyjs.org/docs/creating-and-modifying-pages/)
   * for more on this API.
   */
  onCreatePage?(args: CreatePageArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** 
   * Let plugins extend/mutate the site's webpack configuration.
   * @see https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
   */
  onCreateWebpackConfig?(args: CreateWebpackConfigArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** Called at the end of the bootstrap process after all other extension APIs have been called. */
  onPostBootstrap?(args: ParentSpanPluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** The last extension point called after all other parts of the build process are complete. */
  onPostBuild?(args: NodePluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** Called at the end of the bootstrap process after all other extension APIs have been called. */
  onPreBootstrap?(args: ParentSpanPluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** The first extension point called during the build process. Called after the bootstrap has completed but before the build steps start. */
  onPreBuild?(args: NodePluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** Called once Gatsby has initialized itself and is ready to bootstrap your site. */
  onPreExtractQueries?(args: ParentSpanPluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** The first API called during Gatsby execution, runs as soon as plugins are loaded, before cache initialization and bootstrap preparation. */
  onPreInit?(args: ParentSpanPluginArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /** 
   * Ask compile-to-js plugins to process source to JavaScript so the query
   * runner can extract out GraphQL queries for running.
   */
  preprocessSource?(args: PreprocessSourceArgs, options?: PluginOptions, callback?: PluginCallback): void;

  /**
   * Lets plugins implementing support for other compile-to-js add to the list of "resolvable" file extensions. Gatsby supports `.js` and `.jsx` by default.
   */
  resolvableExtensions?(args: ResolvableExtensionsArgs, options: PluginOptions, callback: PluginCallback): array[] | Promise<array[]>;

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
  setFieldsOnGraphQLNodeType?(args: SetFieldsOnGraphQLNodeTypeArgs, options: PluginOptions): any;
  setFieldsOnGraphQLNodeType?(args: SetFieldsOnGraphQLNodeTypeArgs, options: PluginOptions): Promise<any>;
  setFieldsOnGraphQLNodeType?(args: SetFieldsOnGraphQLNodeTypeArgs, options: PluginOptions, callback: PluginCallback): void;

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
  sourceNodes?(args: SourceNodesArgs, options: PluginOptions): any;
  sourceNodes?(args: SourceNodesArgs, options: PluginOptions): Promise<any>;
  sourceNodes?(args: SourceNodesArgs, options: PluginOptions, callback: PluginCallback): void;
}

/**
 * Gatsby browser API.
 *
 * @see https://www.gatsbyjs.org/docs/browser-apis/
 */
export interface GatsbyBrowser {
  disableCorePrefetching?(args: BrowserPluginArgs, options: PluginOptions): any;
  onClientEntry?(args: BrowserPluginArgs, options: PluginOptions): any;
  onInitialClientRender?(args: BrowserPluginArgs, options: PluginOptions): any;
  onPostPrefetchPathname?(args: PostPrefetchPathnameArgs, options: PluginOptions): any;
  onPreRouteUpdate?(args: RouteUpdateArgs, options: PluginOptions): any;
  onPrefetchPathname?(args: BrowserPluginArgs, options: PluginOptions): any;
  onRouteUpdate?(args: RouteUpdateArgs, options: PluginOptions): any;
  onRouteUpdateDelayed?(args: BrowserPluginArgs, options: PluginOptions): any;
  onServiceWorkerActive?(args: BrowserPluginArgs, options: PluginOptions): any;
  onServiceWorkerInstalled?(args: BrowserPluginArgs, options: PluginOptions): any;
  onServiceWorkerRedundant?(args: BrowserPluginArgs, options: PluginOptions): any;
  onServiceWorkerUpdateFound?(args: BrowserPluginArgs, options: PluginOptions): any;
  registerServiceWorker?(args: BrowserPluginArgs, options: PluginOptions): any;
  replaceComponentRenderer?(args: ReplaceComponentRendererArgs, options: PluginOptions): any;
  replaceHydrateFunction?(args: BrowserPluginArgs, options: PluginOptions): any;
  shouldUpdateScroll?(args: ShouldUpdateScrollArgs, options: PluginOptions): any;
  wrapPageElement?(args: WrapPageElementBrowserArgs, options: PluginOptions): any;
  wrapRootElement?(args: WrapRootElementBrowserArgs, options: PluginOptions): any;
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
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions): any;
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions): Promise<any>;
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions, callback: PluginCallback): void;


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
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions): any;
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions): Promise<any>;
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions, callback: PluginCallback): void;

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
  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions): any;
  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions): Promise<any>;
  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions, callback: PluginCallback): void;


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
  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions): any;
  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions): Promise<any>;
  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions, callback: PluginCallback): void;
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
  wrapRootElement?(args: WrapRootElementNodeArgs, options: PluginOptions): any;
  wrapRootElement?(args: WrapRootElementNodeArgs, options: PluginOptions): Promise<any>;
  wrapRootElement?(args: WrapRootElementNodeArgs, options: PluginOptions, callback: PluginCallback): void;
}

export interface PluginOptions {
  plugins: unknown[];
  path?: string;
  pathCheck?: boolean;
  [key: string]: unknown;
}

export type PluginCallback = (err: Error | null, result?: any) => void;

export interface CreatePagesArgs extends ParentSpanPluginArgs {
  graphql: Function;
  traceId: string;
  waitForCascadingActions: boolean;
}

export interface CreateBabelConfigArgs extends ParentSpanPluginArgs {
  stage: string;
}

export interface CreateDevServerArgs extends ParentSpanPluginArgs {
  app: Application;
}

export interface CreateNodeArgs extends ParentSpanPluginArgs {
  node: Node;
  traceId: string;
  traceTags: {
    nodeId: string;
    nodeType: string;
  };
}

export interface CreatePageArgs extends ParentSpanPluginArgs {
  page: Node;
  traceId: string;
}

export interface CreateWebpackConfigArgs extends ParentSpanPluginArgs {
  getConfig: Function;
  stage: string;
  rules: WebpackRules;
  loaders: WebpackLoaders;
  plugins: WebpackPlugins;
}

export interface PreprocessSourceArgs extends ParentSpanPluginArgs {
  filename: string;
  contents: string;
}

export interface ResolvableExtensionsArgs extends ParentSpanPluginArgs {
  traceId: string;
}

export interface SetFieldsOnGraphQLNodeTypeArgs extends ParentSpanPluginArgs {
  type: {
    name: string;
    nodes: any[];
  };
  traceId: string;
}

export interface SourceNodesArgs extends ParentSpanPluginArgs {
  traceId: string;
  waitForCascadingActions: boolean;
}

export interface PreRenderHTMLArgs extends NodePluginArgs {
  getHeadComponents: any[];
  replaceHeadComponents: Function;
  getPreBodyComponents: any[];
  replacePreBodyComponents: Function;
  getPostBodyComponents: any[];
  replacePostBodyComponents: Function;
}

export interface RenderBodyArgs extends NodePluginArgs {
  pathname: string;
  setHeadComponents: Function;
  setHtmlAttributes: Function;
  setBodyAttributes: Function;
  setPreBodyComponents: Function;
  setPostBodyComponents: Function;
  setBodyProps: Function;
}

export interface ReplaceRendererArgs extends NodePluginArgs {
  replaceBodyHTMLString: Function;
  setHeadComponents: Function;
  setHtmlAttributes: Function;
  setBodyAttributes: Function;
  setPreBodyComponents: Function;
  setPostBodyComponents: Function;
  setBodyProps: Function;
}

export interface WrapPageElementNodeArgs extends NodePluginArgs {
  element: object;
  props: object;
  pathname: string;
}

export interface WrapRootElementNodeArgs extends NodePluginArgs {
  element: object;
}

export interface ParentSpanPluginArgs extends NodePluginArgs {
  parentSpan: object;
}

export interface NodePluginArgs {
  pathPrefix: string;
  boundActionCreators: Actions;
  actions: Actions;
  loadNodeContent: Function;
  store: Store;
  emitter: EventEmitter;
  getNodes: Function;
  getNode: Function;
  getNodesByType: Function;
  hasNodeChanged: Function;
  reporter: Reporter;
  getNodeAndSavePathDependency: Function;
  cache: Cache;
  createNodeId: Function;
  createContentDigest: Function;
  tracing: Tracing;
  [key: string]: unknown;
}

export interface Actions {
  /** @see https://www.gatsbyjs.org/docs/actions/#deletePage */
  deletePage: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#createPage */
  createPage(args: CreatePageArgs, option?: ActionOptions): void;

  /** @see https://www.gatsbyjs.org/docs/actions/#deletePage */
  deleteNode(args: DeleteNodeArgs, option?: ActionOptions): void;

  /** @see https://www.gatsbyjs.org/docs/actions/#deleteNodes */
  deleteNodes: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#createNode */
  createNode(node: Node, options?: ActionOptions): void;

  /** @see https://www.gatsbyjs.org/docs/actions/#touchNode */
  touchNode: Function;
  
  /** @see https://www.gatsbyjs.org/docs/actions/#createNodeField */
  createNodeField(args: CreateNodeFieldArgs, options?: ActionOptions): void;

  /** @see https://www.gatsbyjs.org/docs/actions/#createParentChildLink */
  createParentChildLink: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#createPageDependency */
  createPageDependency: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#deleteComponentsDependencies */
  deleteComponentsDependencies: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#replaceComponentQuery */
  replaceComponentQuery: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#replaceStaticQuery */
  replaceStaticQuery: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#setWebpackConfig */
  setWebpackConfig(config: object): void;

  /** @see https://www.gatsbyjs.org/docs/actions/#replaceWebpackConfig */
  replaceWebpackConfig(config: object): void;

  /** @see https://www.gatsbyjs.org/docs/actions/#setBabelOptions */
  setBabelOptions: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#setBabelPlugin */
  setBabelPlugin: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#setBabelPreset */
  setBabelPreset: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#createJob */
  createJob: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#setJob */
  setJob: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#endJob */
  endJob: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#setPluginStatus */
  setPluginStatus: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#createRedirect */
  createRedirect: Function;

  /** @see https://www.gatsbyjs.org/docs/actions/#addThirdPartySchema */
  addThirdPartySchema: Function;
}

export interface Store {
  dispatch: Function;
  subscribe: Function;
  getState: Function;
  replaceReducer: Function;
}

export interface Reporter {
  language: string;
  stdout: WritableStream;
  stderr: WritableStream;
  stdin: ReadableStream;
  emoji: boolean;
  nonInteractive: boolean;
  noProgress: boolean;
  isVerbose: boolean;
  isTTY: undefined;
  peakMemory: number;
  startTime: number;
  format: Function;
  isSilent: boolean;
  stripIndent: Function;
  setVerbose: Function;
  setNoColor: Function;
  panic: Function;
  panicOnBuild: Function;
  error: Function;
  uptime: Function;
  activityTimer: Function;
}

export interface Cache {
  name: string;
  store: {
    create: Function;
  };
  cache: {
    getAndPassUp: Function;
    wrap: Function;
    set: Function;
    mset: Function;
    get: Function;
    mget: Function;
    del: Function;
    reset: Function;
  }
}

export interface Tracing {
  tracer: object;
  parentSpan: object;
  startSpan: Function;
}


export interface PackageJson {
  name?: string;
  description?: string;
  version?: string;
  main?: string;
  author?: string | {
    name: string;
    email: string;
  };
  license?: string;
  dependencies?: Array<Record<string, string>>;
  devDependencies?: Array<Record<string, string>>;
  peerDependencies?: Array<Record<string, string>>;
  optionalDependecies?: Array<Record<string, string>>;
  bundledDependecies?: Array<Record<string, string>>;
  keywords?: string[];
}

export interface WebpackRules {
  js: Function;
  mjs: Function;
  eslint: Function;
  yaml: Function;
  fonts: Function;
  images: Function;
  media: Function;
  miscAssets: Function;
  css: Function;
  cssModules: Function;
  postcss: Function;
  [key: string]: Function;
}

export interface WebpackLoaders {
  json: Function;
  yaml: Function;
  null: Function;
  raw: Function;
  style: Function;
  miniCssExtract: Function;
  css: Function;
  postcss: Function;
  file: Function;
  url: Function;
  js: Function;
  eslint: Function;
  imports: Function;
  exports: Function;
  [key: string]: Function;
}

export interface WebpackPlugins {
  normalModuleReplacement: Function;
  contextReplacement: Function;
  ignore: Function;
  watchIgnore: Function;
  banner: Function;
  prefetch: Function;
  automaticPrefetch: Function;
  define: Function;
  provide: Function;
  hotModuleReplacement: Function;
  sourceMapDevTool: Function;
  evalSourceMapDevTool: Function;
  evalDevToolModule: Function;
  cache: Function;
  extendedAPI: Function;
  externals: Function;
  jsonpTemplate: Function;
  libraryTemplate: Function;
  loaderTarget: Function;
  memoryOutputFile: Function;
  progress: Function;
  setVarMainTemplate: Function;
  umdMainTemplate: Function;
  noErrors: Function;
  noEmitOnErrors: Function;
  newWatching: Function;
  environment: Function;
  dll: Function;
  dllReference: Function;
  loaderOptions: Function;
  namedModules: Function;
  namedChunks: Function;
  hashedModuleIds: Function;
  moduleFilenameH: Function;
  aggressiveMerging: Function;
  aggressiveSplitting: Function;
  splitChunks: Function;
  chunkModuleIdRange: Function;
  dedupe: Function;
  limitChunkCount: Function;
  minChunkSize: Function;
  occurrenceOrder: Function;
  moduleConcatenation: Function;
  minifyJs: Function;
  minifyCss: Function;
  extractText: Function;
  moment: Function;
  [key: string]: Function;
}

export interface PostPrefetchPathnameArgs extends BrowserPluginArgs {
  pathname: string;
}

export interface RouteUpdateArgs extends BrowserPluginArgs {
  location: Location;
}

export interface ReplaceComponentRendererArgs extends BrowserPluginArgs {
  props: {
    path: string;
    "*": string;
    uri: string;
    location: object;
    navigate: Function;
    children: undefined;
    pageResources: object;
    data: object;
    pageContext: object;
  };
  loader: object;
}

export interface ShouldUpdateScrollArgs extends BrowserPluginArgs {
  prevRouterProps: null;
  pathname: string;
  routerProps: {
    location: Location;
  };
  getSavedScrollPosition: Function;
}

export interface WrapPageElementBrowserArgs extends BrowserPluginArgs {
  element: object;
  props: object;
}

export interface WrapRootElementBrowserArgs extends BrowserPluginArgs {
  element: object;
}

export interface BrowserPluginArgs {
  getResourcesForPathnameSync: Function;
  getResourcesForPathname: Function;
  getResourceURLsForPathname: Function;
  [key: string]: unknown;
}

export interface Node {
  path?: string;
  id: string;
  parent: string;
  children: Node[];
  fields?: Record<string, string>;
  internal: {
    type: string;
    mediaType: string;
    content: string;
    contentDigest: string;
    owner: string;
    description?: string;
  };
  resolve?: string;
  name?: string;
  version?: string;
  pluginOptions?: PluginOptions;
  nodeAPIs?: any[];
  browserAPIs?: any[];
  ssrAPIs?: any[];
  pluginFilepath?: string;
  packageJson?: PackageJson;
  siteMetadata?: Record<string, any>;
  port?: string;
  host?: string;
  pathPrefix?: string;
  polyfill?: boolean;
  buildTime?: string;
  jsonName?: string;
  internalComponentName?: string;
  matchPath?: unknown;
  component?: string;
  componentChunkName?: string;
  context?: Record<string, any>;
  pluginCreatorId?: string;
  componentPath?: string;
  [key: string]: unknown;
}
