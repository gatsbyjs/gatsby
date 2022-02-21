import { distance as levenshtein } from "fastest-levenshtein"
import fs from "fs-extra"
import { testRequireError } from "../utils/test-require-error"
import report from "gatsby-cli/lib/reporter"
import path from "path"
import { sync as existsSync } from "fs-exists-cached"
import { COMPILED_CACHE_DIR } from "../utils/parcel/compile-gatsby-files"

function isNearMatch(
  fileName: string | undefined,
  configName: string,
  distance: number
): boolean {
  if (!fileName) return false
  return levenshtein(fileName, configName) <= distance
}

export async function getConfigFile(
  siteDirectory: string,
  configName: string,
  distance: number = 3
): Promise<{
  configModule: any
  configFilePath: string
}> {
  let configPath = ``
  let configFilePath = ``
  let configModule: any

  try {
    // Try .cache/compiled/gatsby-config first
    configPath = path.join(`${siteDirectory}/${COMPILED_CACHE_DIR}`, configName)
    configFilePath = require.resolve(configPath)
    configModule = require(configFilePath)
  } catch (err) {
    // Fallback to regular rootDir gatsby-config
    configPath = path.join(siteDirectory, configName)
    try {
      configFilePath = require.resolve(configPath)
      configModule = require(configFilePath)
    } catch (err) {
      // Only then hard fail
      const nearMatch = await fs.readdir(siteDirectory).then(files =>
        files.find(file => {
          const fileName = file.split(siteDirectory).pop()
          return isNearMatch(fileName, configName, distance)
        })
      )
      if (!testRequireError(configPath, err)) {
        report.panic({
          id: `10123`,
          error: err,
          context: {
            configName,
            message: err.message,
          },
        })
      } else if (nearMatch) {
        report.panic({
          id: `10124`,
          error: err,
          context: {
            configName,
            nearMatch,
          },
        })
      } else if (
        existsSync(path.join(siteDirectory, `src`, configName + `.js`))
      ) {
        report.panic({
          id: `10125`,
          context: {
            configName,
          },
        })
      }
    }
  }

  return { configModule, configFilePath }
}
