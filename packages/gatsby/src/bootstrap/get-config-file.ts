import { distance as levenshtein } from "fastest-levenshtein"
import fs from "fs-extra"
import { testRequireError } from "../utils/test-require-error"
import { resolveModule } from "../utils/module-resolver"
import report from "gatsby-cli/lib/reporter"
import path from "path"

function isNearMatch(
  fileName: string | undefined,
  configName: string,
  distance: number
): boolean {
  if (!fileName) return false
  return levenshtein(fileName, configName) <= distance
}

export async function getConfigFile(
  rootDir: string,
  configName: string,
  distance: number = 3
): Promise<{
  configModule: any
  configFilePath: string
}> {
  const configPath = resolveModule(rootDir, `./${configName}`)

  if (!configPath) {
    report.panic({
      id: `10123`,
      context: {
        configName,
        message: `resolveModule could not find anything`,
      },
    })
  }

  let configFilePath = ``
  let configModule: any
  try {
    configFilePath = require.resolve(configPath)
    configModule = require(configFilePath)
  } catch (err) {
    const nearMatch = await fs.readdir(rootDir).then(files =>
      files.find(file => {
        const fileName = file.split(rootDir).pop()
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
    } else if (resolveModule(path.join(rootDir, `src`), `./${configName}`)) {
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
