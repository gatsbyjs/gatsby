import { PackageJson, Reporter } from "gatsby"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"

export interface ICert {
  key: Buffer
  cert: Buffer
}

export interface IDebugInfo {
  port: number
  break: boolean
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
  inspect?: number
  inspectBrk?: number
  graphqlTracing?: boolean
  verbose?: boolean
  setStore?: (store: Store<IGatsbyState, AnyAction>) => void
}

/**
 * @deprecated
 * Use `Stage` instead
 */

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
