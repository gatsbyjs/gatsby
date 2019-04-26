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

type RenderCallback = (data: any) => React.ReactNode

export interface StaticQueryProps {
  query: any
  render?: RenderCallback
  children?: RenderCallback
}

export class StaticQuery extends React.Component<StaticQueryProps> {}

export const useStaticQuery: <TData = any>(query: any) => TData

export const graphql: (query: TemplateStringsArray) => void

/**
 * Gatsby configuration API.
 *
 * @see https://www.gatsbyjs.org/docs/gatsby-config/
 */
export interface GatsbyConfig {
  siteMetadata?: Record<string, unknown>;
  plugins?: Array<string | {
    resolve: string;
    options: Record<string, unknown>;
  }>;
  pathPrefix?: string;
  polyfill?: boolean;
  mapping?: Record<string, string>;
  proxy?: {
    prefix: string;
    url: string;
  };
  developMiddleware?(app: Application): void;
}

/**
 * Gatsby API for Node.js.
 *
 * @see https://www.gatsbyjs.org/docs/node-apis/
 */
export interface GatsbyNode {
  createPages?(args: CreatePagesArgs, options: PluginOptions): any;
  createPages?(args: CreatePagesArgs, options: PluginOptions): Promise<any>;
  createPages?(args: CreatePagesArgs, options: PluginOptions, callback: PluginCallback): void;

  createPagesStatefully?(args: CreatePagesArgs, options: PluginOptions): any;
  createPagesStatefully?(args: CreatePagesArgs, options: PluginOptions): Promise<any>;
  createPagesStatefully?(args: CreatePagesArgs, options: PluginOptions, callback: PluginCallback): void;

  generateSideEffects?(args: NodePluginArgs, options: PluginOptions): any;
  generateSideEffects?(args: NodePluginArgs, options: PluginOptions): Promise<any>;
  generateSideEffects?(args: NodePluginArgs, options: PluginOptions, callback: PluginCallback): void;

  onCreateBabelConfig?(args: CreateBabelConfigArgs, options: PluginOptions): any;
  onCreateBabelConfig?(args: CreateBabelConfigArgs, options: PluginOptions): Promise<any>;
  onCreateBabelConfig?(args: CreateBabelConfigArgs, options: PluginOptions, callback: PluginCallback): void;

  onCreateDevServer?(args: CreateDevServerArgs, options: PluginOptions): any;
  onCreateDevServer?(args: CreateDevServerArgs, options: PluginOptions): Promise<any>;
  onCreateDevServer?(args: CreateDevServerArgs, options: PluginOptions, callback: PluginCallback): void;

  onCreateNode?(args: CreateNodeArgs, options: PluginOptions): any;
  onCreateNode?(args: CreateNodeArgs, options: PluginOptions): Promise<any>;
  onCreateNode?(args: CreateNodeArgs, options: PluginOptions, callback: PluginCallback): void;

  onCreatePage?(args: CreatePageArgs, options: PluginOptions): any;
  onCreatePage?(args: CreatePageArgs, options: PluginOptions): Promise<any>;
  onCreatePage?(args: CreatePageArgs, options: PluginOptions, callback: PluginCallback): void;

  onCreateWebpackConfig?(args: CreateWebpackConfigArgs, options: PluginOptions): any;
  onCreateWebpackConfig?(args: CreateWebpackConfigArgs, options: PluginOptions): Promise<any>;
  onCreateWebpackConfig?(args: CreateWebpackConfigArgs, options: PluginOptions, callback: PluginCallback): void;

  onPostBootstrap?(args: ParentSpanPluginArgs, options: PluginOptions): any;
  onPostBootstrap?(args: ParentSpanPluginArgs, options: PluginOptions): Promise<any>;
  onPostBootstrap?(args: ParentSpanPluginArgs, options: PluginOptions, callback: PluginCallback): void;

  onPostBuild?(args: NodePluginArgs, options: PluginOptions): any;
  onPostBuild?(args: NodePluginArgs, options: PluginOptions): Promise<any>;
  onPostBuild?(args: NodePluginArgs, options: PluginOptions, callback: PluginCallback): void;

  onPreBootstrap?(args: ParentSpanPluginArgs, options: PluginOptions): any;
  onPreBootstrap?(args: ParentSpanPluginArgs, options: PluginOptions): Promise<any>;
  onPreBootstrap?(args: ParentSpanPluginArgs, options: PluginOptions, callback: PluginCallback): void;

  onPreBuild?(args: NodePluginArgs, options: PluginOptions): any;
  onPreBuild?(args: NodePluginArgs, options: PluginOptions): Promise<any>;
  onPreBuild?(args: NodePluginArgs, options: PluginOptions, callback: PluginCallback): void;

  onPreExtractQueries?(args: ParentSpanPluginArgs, options: PluginOptions): any;
  onPreExtractQueries?(args: ParentSpanPluginArgs, options: PluginOptions): Promise<any>;
  onPreExtractQueries?(args: ParentSpanPluginArgs, options: PluginOptions, callback: PluginCallback): void;

  onPreInit?(args: ParentSpanPluginArgs, options: PluginOptions): any;
  onPreInit?(args: ParentSpanPluginArgs, options: PluginOptions): Promise<any>;
  onPreInit?(args: ParentSpanPluginArgs, options: PluginOptions, callback: PluginCallback): void;

  preprocessSource?(args: PreprocessSourceArgs, options: PluginOptions): any;
  preprocessSource?(args: PreprocessSourceArgs, options: PluginOptions): Promise<any>;
  preprocessSource?(args: PreprocessSourceArgs, options: PluginOptions, callback: PluginCallback): void;

  resolvableExtensions?(args: ResolvableExtensionsArgs, options: PluginOptions): any;
  resolvableExtensions?(args: ResolvableExtensionsArgs, options: PluginOptions): Promise<any>;
  resolvableExtensions?(args: ResolvableExtensionsArgs, options: PluginOptions, callback: PluginCallback): void;

  setFieldsOnGraphQLNodeType?(args: SetFieldsOnGraphQLNodeTypeArgs, options: PluginOptions): any;
  setFieldsOnGraphQLNodeType?(args: SetFieldsOnGraphQLNodeTypeArgs, options: PluginOptions): Promise<any>;
  setFieldsOnGraphQLNodeType?(args: SetFieldsOnGraphQLNodeTypeArgs, options: PluginOptions, callback: PluginCallback): void;

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
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions): any;
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions): Promise<any>;
  onPreRenderHTML?(args: PreRenderHTMLArgs, options: PluginOptions, callback: PluginCallback): void;

  onRenderBody?(args: RenderBodyArgs, options: PluginOptions): any;
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions): Promise<any>;
  onRenderBody?(args: RenderBodyArgs, options: PluginOptions, callback: PluginCallback): void;

  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions): any;
  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions): Promise<any>;
  replaceRenderer?(args: ReplaceRendererArgs, options: PluginOptions, callback: PluginCallback): void;

  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions): any;
  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions): Promise<any>;
  wrapPageElement?(args: WrapPageElementNodeArgs, options: PluginOptions, callback: PluginCallback): void;

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
  deletePage: Function;
  createPage: Function;
  deleteNode: Function;
  deleteNodes: Function;
  createNode: Function;
  touchNode: Function;
  createNodeField: Function;
  createParentChildLink: Function;
  createPageDependency: Function;
  deleteComponentsDependencies: Function;
  replaceComponentQuery: Function;
  replaceStaticQuery: Function;
  setWebpackConfig: Function;
  replaceWebpackConfig: Function;
  setBabelOptions: Function;
  setBabelPlugin: Function;
  setBabelPreset: Function;
  createJob: Function;
  setJob: Function;
  endJob: Function;
  setPluginStatus: Function;
  createRedirect: Function;
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

export interface Node {
  path?: string;
  id: string;
  parent: string;
  children: Node[];
  internal: {
    type: string;
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
  siteMetadata?: Record<string, unknown>;
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
  context?: object;
  pluginCreatorId?: string;
  componentPath?: string;
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
export const parsePath: (path: string) => WindowLocation

export interface PageRendererProps {
  location: WindowLocation
}

export class PageRenderer extends React.Component<PageRendererProps> {}
