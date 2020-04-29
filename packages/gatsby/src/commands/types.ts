import { PackageJson, Reporter } from "gatsby"

export interface ICert {
  key: string
  cert: string
}

export interface IProgram {
  _: `develop` | `build` | `clean` | `feedback` | `repl` | `serve`
  status?: string // I think this type should not exist here. It seems to be added in the reducer, but not applicable to the caller site from gatsby-cli
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
