/**
 * ⚠️ DO NOT EDIT ⚠️
 * These types are duplicated from packages/gatsby/src/bootstrap/load-plugins/types.ts
 * If you edit this file, make sure to edit that file too!!!
 * They are duplicate to avoid a circular dependency between gatsby-plugin-utils <=> gatsby <=> gatsby-plugin-utils
 * See gatsbyjs/gatsby#27578
 */

export type IRawSiteConfig = {
  plugins?: Array<PluginRef> | undefined;
};

export type ISiteConfig = IRawSiteConfig & {
  plugins?: Array<IPluginRefObject> | undefined;
};

// There are two top-level "Plugin" concepts:
// 1. IPluginInfo, for processed plugins, and
// 2. PluginRef, for plugin configs

export type IPluginInfo = {
  /** Unique ID describing a plugin */
  id: string;

  /** The absolute path to the plugin */
  resolve: string;

  /** The plugin name */
  name: string;

  /** The plugin version (can be content hash) */
  version: string;

  /** Options passed to the plugin */
  pluginOptions?: IPluginInfoOptions | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module?: any | undefined;
  modulePath?: string | undefined;
};

export type IPluginInfoOptions = {
  plugins?: Array<IPluginInfo> | undefined;
  path?: string | undefined;
  [option: string]: unknown;
};

export type IFlattenedPlugin = IPluginInfo & {
  skipSSR?: boolean | undefined;
  ssrAPIs: Array<string>;
  nodeAPIs: Array<string>;
  browserAPIs: Array<string>;
};

export type IPluginRefObject = {
  resolve: string;
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
