import { ExportType, ICurrentAPIs } from "../validate"
import { keys } from "es-toolkit/compat"

export const getAPI = (api: {
  [exportType in ExportType]: { [api: string]: boolean }
}): ICurrentAPIs =>
  keys(api).reduce<Partial<ICurrentAPIs>>((merged, key) => {
    merged[key] = keys(api[key])
    return merged
  }, {}) as ICurrentAPIs
