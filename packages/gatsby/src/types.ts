import { PackageJson, Reporter } from "gatsby"

export interface ICert {
  keyPath: string
  certPath: string
  key: string
  cert: string
}

export interface IProgram {
  useYarn: boolean
  open: boolean
  openTracingConfigFile: string
  port: number
  host: string
  report: Reporter
  [`cert-file`]?: string
  [`key-file`]?: string
  directory: string
  https?: boolean
  sitePackageJson: PackageJson
  ssl?: ICert
  prefixPaths?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentSpan: Record<string, any>
}

// @deprecated
export enum BuildHTMLStage {
  DevelopHTML = `develop-html`,
  BuildHTML = `build-html`,
}

export enum Stage {
  Develop = `develop`,
  DevelopHTML = `develop-html`,
  BuildJavascript = `build-javascript`,
  BuildHTML = `build-html`,
}

export interface IMatch {
  id: string
  context: {
    sourceMessage: string
    [key: string]: string
  }
  error?: Error | undefined
  [key: string]: unknown
}

export interface IConfigModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any
}

export interface IModule {
  configFilePath: string
  configModule: IConfigModule
}
