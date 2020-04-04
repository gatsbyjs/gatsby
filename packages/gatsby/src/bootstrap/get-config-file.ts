/* @flow */
import * as levenshtein from "fast-levenshtein"
import * as fs from "fs-extra"
import { testRequireError } from "../utils/test-require-error"
import report from "gatsby-cli/lib/reporter"
import * as path from "path"
import { sync } from "fs-exists-cached"

import { IModule } from "../types"

function isNearMatch(
  fileName: string,
  configName: string,
  distance: number
): boolean {
  return levenshtein.get(fileName, configName) <= distance
}

export default async function getConfigFile(
  rootDir: string,
  configName: string,
  distance = 3
): Promise<IModule> {
  const configPath = path.join(rootDir, configName)

  let configModule
  let configFilePath

  try {
    configFilePath = require.resolve(configPath)
    configModule = require(configFilePath)
  } catch (err) {
    const nearMatch = await fs.readdir(rootDir).then((files) =>
      files.find((file) => {
        const fileName = file.split(rootDir).pop()

        if (fileName === undefined) {
          return false
        }

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
    } else if (sync(path.join(rootDir, `src`, configName + `.js`))) {
      report.panic({
        id: `10125`,
        context: {
          configName,
        },
      })
    }
  }

  return { configModule, configFilePath }
}
