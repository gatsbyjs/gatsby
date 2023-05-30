import path from "path"
import fs from "fs-extra"
import axios from "axios"
import { IAdapterManifestEntry } from "./adapter/types"

const ROOT = path.join(__dirname, `..`, `..`)
const UNPKG_ROOT = `https://unpkg.com/gatsby/`

const FILE_NAMES = {
  APIS: `apis.json`,
  ADAPTERS: `adapters.js`,
}

const OUTPUT_FILES = {
  APIS: path.join(ROOT, `latest-apis.json`),
  ADAPTERS: path.join(ROOT, `latest-adapters.js`),
}

export interface IAPIResponse {
  browser: Record<string, any>
  node: Record<string, any>
  ssr: Record<string, any>
}

const _getFile = async <T>({
  fileName,
  outputFileName,
  defaultReturn,
}): Promise<T> => {
  try {
    const { data } = await axios.get(`${UNPKG_ROOT}${fileName}`, {
      timeout: 5000,
    })

    await fs.writeFile(outputFileName, JSON.stringify(data, null, 2), `utf8`)

    return data
  } catch (e) {
    if (await fs.pathExists(outputFileName)) {
      return fs.readJSON(outputFileName)
    }
    // possible offline/network issue
    return fs.readJSON(path.join(ROOT, fileName)).catch(() => defaultReturn)
  }
}

export const getLatestAPIs = async (): Promise<IAPIResponse> =>
  _getFile({
    fileName: FILE_NAMES.APIS,
    outputFileName: OUTPUT_FILES.APIS,
    defaultReturn: {
      browser: {},
      node: {},
      ssr: {},
    },
  })

export const getLatestAdapters = async (): Promise<
  Array<IAdapterManifestEntry>
> =>
  _getFile({
    fileName: FILE_NAMES.ADAPTERS,
    outputFileName: OUTPUT_FILES.ADAPTERS,
    defaultReturn: [],
  })
