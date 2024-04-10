import { PackageJson, Reporter } from "gatsby"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"

export type ICert = {
  key: string
  cert: string
}

export type IDebugInfo = {
  port: number
  break: boolean
}

export type IProgram = {
  _: `develop` | `build` | `clean` | `feedback` | `repl` | `serve`
  status?: string | undefined // I think this type should not exist here. It seems to be added in the reducer, but not applicable to the caller site from gatsby-cli
  useYarn: boolean
  open: boolean
  openTracingConfigFile: string
  port: number
  // TODO(v5): remove
  proxyPort: number
  host: string
  report: Reporter
  [`cert-file`]?: string | undefined
  [`key-file`]?: string | undefined
  directory: string
  https?: boolean | undefined
  sitePackageJson: PackageJson
  ssl?: ICert | undefined
  inspect?: number | undefined
  inspectBrk?: number | undefined
  graphqlTracing?: boolean | undefined
  verbose?: boolean | undefined
  prefixPaths?: boolean | undefined
  setStore?: ((store: Store<IGatsbyState, AnyAction>) => void) | undefined
  disablePlugins?: Array<{
    name: string
    reasons: Array<string>
  }> | undefined
}

/**
 * @deprecated
 * Use `Stage` instead
 */
export type BuildHTMLStage = `develop-html` | `build-html`

export type Stage = `develop` | `develop-html` | `build-javascript` | `build-html`
