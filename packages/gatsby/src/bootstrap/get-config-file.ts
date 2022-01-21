import { distance as levenshtein } from "fastest-levenshtein"
import fs from "fs-extra"
import { testRequireError } from "../utils/test-require-error"
import { resolveModule } from "../utils/module-resolver"
import report from "gatsby-cli/lib/reporter"

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
  let configPath = ``

  let configFilePath = ``
  let configModule: any
  try {
    configPath = resolveModule(rootDir, `./${configName}`) as string
    configFilePath = require.resolve(configPath)
    configModule = require(configFilePath)
  } catch (err) {
    const nearMatch = await fs.readdir(rootDir).then(files =>
      files.find(file => {
        const fileName = file.split(rootDir).pop()
        return isNearMatch(fileName, configName, distance)
      })
    )
    const ignore = true
    if (!testRequireError(configPath, err) && !ignore) {
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
    }
  }

  return { configModule, configFilePath }
}
