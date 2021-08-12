import { IGatsbyConfig } from "../../redux/types"

export interface ITheme {
  themeName: string
  themeConfig: IGatsbyConfig
  themeSpec: string | IThemeSpec
  themeDir: string
  parentDir?: string
  configFilePath?: string
}

export interface IThemeSpec {
  resolve?: string
  options?: { [key: string]: unknown }
}
