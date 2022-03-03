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
  } catch (outerError) {
    // Not all plugins will have a compiled file, so the err.message can look like this:
    // "Cannot find module '<root>/node_modules/gatsby-source-filesystem/.cache/compiled/gatsby-config'"
    // But the compiled file can also have an error like this:
    // "Cannot find module 'foobar'"
    // So this is trying to differentiate between an error we're fine ignoring and an error that we should throw
    const isModuleNotFoundError = outerError.code === `MODULE_NOT_FOUND`
    const isThisFileRequireError =
      outerError?.requireStack?.[0]?.includes(`get-config-file`) ?? true

    if (!(isModuleNotFoundError && isThisFileRequireError)) {
      report.panic({
        id: `11902`,
        error: outerError,
        context: {
          configName,
          message: outerError.message,
        },
      })
    }

    // Fallback to regular rootDir gatsby-config
    configPath = path.join(siteDirectory, configName)
    try {
      configFilePath = require.resolve(configPath)
      configModule = require(configFilePath)
    } catch (innerError) {
      // Only then hard fail
      const nearMatch = await fs.readdir(siteDirectory).then(files =>
        files.find(file => {
          const fileName = file.split(siteDirectory).pop()
          return isNearMatch(fileName, configName, distance)
        })
      )
      if (!testRequireError(configPath, innerError)) {
        report.panic({
          id: `10123`,
          error: innerError,
          context: {
            configName,
            message: innerError.message,
          },
        })
      } else if (nearMatch) {
        report.panic({
          id: `10124`,
          error: innerError,
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
