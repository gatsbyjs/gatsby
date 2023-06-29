import { uuid } from "gatsby-core-utils/index"
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

// TODO: we should preserve randomized from previous builds to not keep accumulating different versions of datastore in public dir
const randomized = uuid.v4()
function getCDNObfuscatedPath(path: string): string {
  return `${randomized}-${path}`
}

export const LmdbOnCdnPath = getCDNObfuscatedPath(`data.mdb`)
