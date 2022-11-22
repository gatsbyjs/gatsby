import fs from "fs-extra"
import { isImportError } from "../utils/is-import-error"
import report from "gatsby-cli/lib/reporter"
import path from "path"
import { sync as existsSync } from "fs-exists-cached"
import { COMPILED_CACHE_DIR } from "../utils/parcel/compile-gatsby-files"
import { isNearMatch } from "../utils/is-near-match"
import { resolveConfigFilePath } from "./resolve-config-file-path"

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

  // Attempt to find compiled gatsby-config in .cache/compiled/gatsby-config
  try {
    configPath = path.join(`${siteDirectory}/${COMPILED_CACHE_DIR}`, configName)
    configFilePath = resolveConfigFilePath(configPath)
    configModule = await import(configFilePath)
    if (!configModule.default) {
      // TODO: Structured error
      throw new Error(`No default export found in gatsby-config`)
    }
    configModule = configModule.default
  } catch (outerError) {
    // Not all plugins will have a compiled file, so the err.message can look like this:
    // "Cannot find module '<root>/node_modules/gatsby-source-filesystem/.cache/compiled/gatsby-config'"
    // But the compiled file can also have an error like this:
    // "Cannot find module 'foobar'"
    // So this is trying to differentiate between an error we're fine ignoring and an error that we should throw
    const isModuleNotFoundError = outerError.code === `ERR_MODULE_NOT_FOUND`
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

    // Attempt to find uncompiled gatsby-config in root dir
    configPath = path.join(siteDirectory, configName)

    try {
      configFilePath = resolveConfigFilePath(configPath)
      configModule = await import(configFilePath)
      if (!configModule.default) {
        // TODO: Structured error
        throw new Error(`No default export found in gatsby-config`)
      }
    } catch (innerError) {
      // Panic if error happened because user's gatsby-config has some errors
      // if not, we'll contine trying to find a config
      if (!isImportError(innerError)) {
        report.panic({
          id: `10123`,
          error: innerError,
          context: {
            configName,
            message: innerError.message,
          },
        })
      }

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

      // gatsby-config.ts exists but compiled gatsby-config.js does not
      if (tsConfig) {
        report.panic({
          id: `10127`,
          error: innerError,
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
          error: innerError,
          context: {
            configName,
            nearMatch,
            isTSX,
          },
        })
      }

      // gatsby-config.js is incorrectly located in src/gatsby-config.js
      if (existsSync(path.join(siteDirectory, `src`, configName + `.js`))) {
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
