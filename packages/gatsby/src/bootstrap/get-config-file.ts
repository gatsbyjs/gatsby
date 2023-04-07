import fs from "fs-extra"
import { testImportError } from "../utils/test-import-error"
import report from "gatsby-cli/lib/reporter"
import path from "path"
import { COMPILED_CACHE_DIR } from "../utils/parcel/compile-gatsby-files"
import { isNearMatch } from "../utils/is-near-match"
import { resolveJSFilepath, maybeAddFileProtocol } from "./resolve-js-file-path"
import { preferDefault } from "./prefer-default"

export async function getConfigFile(
  siteDirectory: string,
  configName: string,
  distance: number = 3
): Promise<{
  configModule: any
  configFilePath: string
}> {
  const compiledResult = await attemptImportCompiled(siteDirectory, configName)

  if (compiledResult?.configModule && compiledResult?.configFilePath) {
    return compiledResult
  }

  const uncompiledResult = await attemptImportUncompiled(
    siteDirectory,
    configName,
    distance
  )

  return uncompiledResult || {}
}

async function attemptImport(
  siteDirectory: string,
  configPath: string
): Promise<{
  configModule: unknown
  configFilePath: string
}> {
  const configFilePath = await resolveJSFilepath({
    rootDir: siteDirectory,
    filePath: configPath,
  })

  // The file does not exist, no sense trying to import it
  if (!configFilePath) {
    return { configFilePath: ``, configModule: undefined }
  }

  const importedModule = await import(maybeAddFileProtocol(configFilePath))
  const configModule = preferDefault(importedModule)

  return { configFilePath, configModule }
}

async function attemptImportCompiled(
  siteDirectory: string,
  configName: string
): Promise<{
  configModule: unknown
  configFilePath: string
}> {
  let compiledResult

  try {
    const compiledConfigPath = path.join(
      `${siteDirectory}/${COMPILED_CACHE_DIR}`,
      configName
    )
    compiledResult = await attemptImport(siteDirectory, compiledConfigPath)
  } catch (error) {
    report.panic({
      id: `11902`,
      error: error,
      context: {
        configName,
        message: error.message,
      },
    })
  }

  return compiledResult
}

async function attemptImportUncompiled(
  siteDirectory: string,
  configName: string,
  distance: number
): Promise<{
  configModule: unknown
  configFilePath: string
}> {
  let uncompiledResult

  const uncompiledConfigPath = path.join(siteDirectory, configName)

  try {
    uncompiledResult = await attemptImport(siteDirectory, uncompiledConfigPath)
  } catch (error) {
    if (!testImportError(uncompiledConfigPath, error)) {
      report.panic({
        id: `10123`,
        error,
        context: {
          configName,
          message: error.message,
        },
      })
    }
  }

  if (uncompiledResult?.configFilePath) {
    return uncompiledResult
  }

  const error = new Error(`Cannot find package '${uncompiledConfigPath}'`)

  const { tsConfig, nearMatch } = await checkTsAndNearMatch(
    siteDirectory,
    configName,
    distance
  )

  // gatsby-config.ts exists but compiled gatsby-config.js does not
  if (tsConfig) {
    report.panic({
      id: `10127`,
      error,
      context: {
        configName,
      },
    })
  }

  // gatsby-config is misnamed
  if (nearMatch) {
    const isTSX = nearMatch.endsWith(`.tsx`)
    report.panic({
      id: `10124`,
      error,
      context: {
        configName,
        nearMatch,
        isTSX,
      },
    })
  }

  // gatsby-config is incorrectly located in src directory
  const isInSrcDir = await resolveJSFilepath({
    rootDir: siteDirectory,
    filePath: path.join(siteDirectory, `src`, configName),
    warn: false,
  })

  if (isInSrcDir) {
    report.panic({
      id: `10125`,
      context: {
        configName,
      },
    })
  }

  return uncompiledResult
}

async function checkTsAndNearMatch(
  siteDirectory: string,
  configName: string,
  distance: number
): Promise<{
  tsConfig: boolean
  nearMatch: string
}> {
  const files = await fs.readdir(siteDirectory)

  let tsConfig = false
  let nearMatch = ``

  for (const file of files) {
    if (tsConfig || nearMatch) {
      break
    }

    const { name, ext } = path.parse(file)

    if (name === configName && ext === `.ts`) {
      tsConfig = true
      break
    }

    if (isNearMatch(name, configName, distance)) {
      nearMatch = file
    }
  }

  return {
    tsConfig,
    nearMatch,
  }
}
