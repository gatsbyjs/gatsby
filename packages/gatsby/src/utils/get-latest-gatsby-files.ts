import path from "node:path"
import * as fs from "fs-extra"
import type { IAdapterManifestEntry } from "./adapter/types"
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

export type IAPIResponse = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  browser: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ssr: Record<string, any>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _fetchFile(root: string, fileName: string): Promise<any> {
  try {
    const controller = new AbortController()

    const tm = globalThis.setTimeout(() => {
      controller.abort()
    }, 5000)

    const response = await globalThis
      .fetch(`${root}${fileName}`, {
        signal: controller.signal,
      })
      .then((res) => {
        globalThis.clearTimeout(tm)
        return res.json()
      })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response as any).data
  } catch (e) {
    return null
  }
}

async function _getFile<T>({
  fileName,
  outputFileName,
  defaultReturn,
  tryGithubBeforeUnpkg,
  forcedContent,
}: {
  fileName: string
  outputFileName: string
  defaultReturn: T
  tryGithubBeforeUnpkg?: boolean | undefined
  forcedContent?: string | undefined
}): Promise<T> {
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
      `utf8`,
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

export async function getLatestAPIs(): Promise<IAPIResponse> {
  return _getFile({
    fileName: FILE_NAMES.APIS,
    outputFileName: OUTPUT_FILES.APIS,
    defaultReturn: {
      browser: {},
      node: {},
      ssr: {},
    },
  })
}

export async function getLatestAdapters(): Promise<
  Array<IAdapterManifestEntry>
> {
  return _getFile({
    fileName: FILE_NAMES.ADAPTERS,
    outputFileName: OUTPUT_FILES.ADAPTERS,
    defaultReturn: [],
    // trying github first for adapters manifest to be able to faster make changes to version manifest
    // as publishing latest version of gatsby package takes more time
    tryGithubBeforeUnpkg: true,
    // in e2e-tests/adapters we force adapters manifest to be used
    forcedContent: process.env.GATSBY_ADAPTERS_MANIFEST,
  })
}
