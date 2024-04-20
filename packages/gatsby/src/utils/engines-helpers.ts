import { emitter, store } from "../redux"
import { ICreatePageAction, ISetComponentFeatures } from "../redux/types"
import { trackFeatureIsUsed } from "gatsby-telemetry"

export function shouldPrintEngineSnapshot(): boolean {
  return process.env.gatsby_executing_command === `build`
}

let generate = false
let shouldSendTelemetryForHeadAPI = true
export function shouldGenerateEngines(): boolean {
  return process.env.gatsby_executing_command === `build` && generate
}

emitter.on(`CREATE_PAGE`, (action: ICreatePageAction) => {
  if (action.payload.mode && action.payload.mode !== `SSG`) generate = true
})
emitter.on(`SET_COMPONENT_FEATURES`, (action: ISetComponentFeatures) => {
  if (action.payload.serverData) generate = true
  if (action.payload.config) generate = true
  if (action.payload.Head && shouldSendTelemetryForHeadAPI) {
    trackFeatureIsUsed(`HeadAPI`)
    shouldSendTelemetryForHeadAPI = false
  }
})

export function shouldBundleDatastore(): boolean {
  return !store.getState().adapter.config.excludeDatastoreFromEngineFunction
}

function getCDNObfuscatedPath(path: string): string {
  return `${store.getState().status.cdnObfuscatedPrefix}-${path}`
}

export const LmdbOnCdnPath = getCDNObfuscatedPath(`data.mdb`)

export type IPlatformAndArch = {
  platform: string
  arch: string
}

const currentTarget: IPlatformAndArch = {
  platform: process.platform,
  arch: process.arch,
}

export function getCurrentPlatformAndTarget(): IPlatformAndArch {
  return currentTarget
}

export function getFunctionsTargetPlatformAndTarget(): IPlatformAndArch {
  const state = store.getState()

  return {
    platform:
      process.env.GATSBY_FUNCTIONS_PLATFORM ??
      state.program.functionsPlatform ??
      state.adapter.config.functionsPlatform ??
      currentTarget.platform,
    arch:
      process.env.GATSBY_FUNCTIONS_ARCH ??
      state.program.functionsArch ??
      state.adapter.config.functionsArch ??
      currentTarget.arch,
  }
}
