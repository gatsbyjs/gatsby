export interface ISiteConfig {
  plugins?: PluginRef[]
}

// There are two top-level "Plugin" concepts:
// 1. IPluginInfo, for processed plugins, and
// 2. PluginRef, for plugin configs

export interface IPluginInfo {
  /** Unique ID describing a plugin */
  id: string

  /** The absolute path to the plugin */
  resolve: string

  /** The plugin name */
  name: string

  /** The plugin version (can be content hash) */
  version: string

  /** Options passed to the plugin */
  pluginOptions?: IPluginInfoOptions
}

export interface IPluginInfoOptions {
  plugins?: IPluginInfo[]
  path?: string
  [option: string]: unknown
}

export interface IFlattenedPlugin extends IPluginInfo {
  skipSSR?: boolean
  ssrAPIs: string[]
  nodeAPIs: string[]
  browserAPIs: string[]
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
