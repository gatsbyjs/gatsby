import path from "path"
import * as fs from "fs-extra"
import axios from "axios"
import { IAdapterManifestEntry } from "./adapter/types"
import { preferDefault } from "../bootstrap/prefer-default"

const ROOT = path.join(__dirname, `..`, `..`)
const UNPKG_ROOT = `https://unpkg.com/gatsby/`
const GITHUB_ROOT = `https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby/`

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

const _fetchFile = async (root: string, fileName: string): Promise<any> => {
  try {
    const { data } = await axios.get(`${root}${fileName}`, {
      timeout: 5000,
    })
    return data
  } catch (e) {
    return null
  }
}

const _getFile = async <T>({
  fileName,
  outputFileName,
  defaultReturn,
  tryGithubBeforeUnpkg,
  forcedContent,
}: {
  fileName: string
  outputFileName: string
  defaultReturn: T
  tryGithubBeforeUnpkg?: boolean
  forcedContent?: string
}): Promise<T> => {
  let fileToUse = path.join(ROOT, fileName)

  let dataToUse = forcedContent

  if (!dataToUse && tryGithubBeforeUnpkg) {
    dataToUse = await _fetchFile(GITHUB_ROOT, fileName)
  }
  if (!dataToUse) {
    dataToUse = await _fetchFile(UNPKG_ROOT, fileName)
  }

  if (dataToUse) {
    await fs.writeFile(
      outputFileName,
      typeof dataToUse === `string`
        ? dataToUse
        : JSON.stringify(dataToUse, null, 2),
      `utf8`
    )

    fileToUse = outputFileName
  } else {
    // if file was previously cached, use it
    if (await fs.pathExists(outputFileName)) {
      fileToUse = outputFileName
    }
  }

  if (fileToUse.endsWith(`.json`)) {
    return fs.readJSON(fileToUse).catch(() => defaultReturn)
  } else {
    try {
      const importedFile = await import(fileToUse)
      const adapters = preferDefault(importedFile)
      return adapters
    } catch (e) {
      // no-op
      return defaultReturn
    }
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
    // trying github first for adapters manifest to be able to faster make changes to version manifest
    // as publishing latest version of gatsby package takes more time
    tryGithubBeforeUnpkg: true,
    // in e2e-tests/adapters we force adapters manifest to be used
    forcedContent: process.env.GATSBY_ADAPTERS_MANIFEST,
  })
