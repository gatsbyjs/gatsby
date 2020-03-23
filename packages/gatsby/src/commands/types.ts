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
