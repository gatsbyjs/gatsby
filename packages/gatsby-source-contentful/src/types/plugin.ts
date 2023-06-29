import { PluginOptions } from "gatsby"

export interface IPluginOptions extends Partial<PluginOptions> {
  accessToken: string
  spaceId: string
  host?: string
  environment?: string
  downloadLocal?: boolean
  localeFilter?: () => boolean
  contentTypeFilter?: () => boolean
  pageLimit?: number
  useNameForId?: boolean
  contentTypePrefix: string
}

export interface IProcessedPluginOptions {
  get: (key: keyof IPluginOptions) => any
  getOriginalPluginOptions: () => IPluginOptions
}

export type MarkdownFieldDefinition = Map<string, [string]>
