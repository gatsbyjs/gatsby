import { ExportType, ICurrentAPIs } from "../validate"

export const getAPI = (api: {
  [exportType in ExportType]: { [api: string]: boolean }
}): ICurrentAPIs =>
  Object.keys(api).reduce<Partial<ICurrentAPIs>>((merged, key) => {
    merged[key] = Object.keys(api[key])
    return merged
  }, {}) as ICurrentAPIs
