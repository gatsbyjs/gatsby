import { PackageJson } from "gatsby"

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
  [`cert-file`]?: string
  [`key-file`]?: string
  directory: string
  https?: boolean
  sitePackageJson: PackageJson
  ssl?: ICert
}

export enum BuildHTMLStage {
  DevelopHTML = `develop-html`,
  BuildHTML = `build-html`,
}
