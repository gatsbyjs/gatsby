export type IRawSiteConfig = {
  plugins?: Array<PluginRef> | undefined;
};

export type ISiteConfig = {
  plugins?: Array<IPluginRefObject> | undefined;
} & IRawSiteConfig;

// There are two top-level "Plugin" concepts:
// 1. IPluginInfo, for processed plugins, and
// 2. PluginRef, for plugin configs

export type IPluginInfo = {
  /** Unique ID describing a plugin */
  id: string;

  /** The absolute path to the plugin */
  resolve: string;

  /** The absolute path to the compiled plugin's gatsby-node module, if there is one */
  resolvedCompiledGatsbyNode?: string | undefined;

  /** The plugin name */
  name: string;

  /** The plugin version (can be content hash) */
  version: string;

  /** Options passed to the plugin */
  pluginOptions?: IPluginInfoOptions | undefined;

  subPluginPaths?: Array<string> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module?: any | undefined;
  modulePath?: string | undefined;
};

export type IPluginInfoOptions = {
  plugins?: Array<IPluginInfo> | undefined;
  path?: string | undefined;
  [option: string]: unknown;
};

export type IFlattenedPlugin = {
  skipSSR?: boolean | undefined;
  ssrAPIs: Array<string>;
  nodeAPIs: Array<string>;
  browserAPIs: Array<string>;
} & IPluginInfo;

export type IPluginRefObject = {
  resolve?: string | undefined;
  options?: IPluginRefOptions | undefined;
  parentDir?: string | undefined;
  subPluginPaths?: Array<string> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module?: any | undefined;
  modulePath?: string | undefined;
};

export type PluginRef = string | IPluginRefObject;

export type IPluginRefOptions = {
  plugins?: Array<PluginRef> | undefined;
  path?: string | undefined;
  [option: string]: unknown;
};
