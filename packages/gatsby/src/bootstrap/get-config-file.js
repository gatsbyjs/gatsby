/* @flow */
const levenshtein = require(`fast-levenshtein`)
const fs = require(`fs-extra`)
const testRequireError = require(`../utils/test-require-error`).default
const report = require(`gatsby-cli/lib/reporter`)
const chalk = require(`chalk`)
const path = require(`path`)
const existsSync = require(`fs-exists-cached`).sync

function isNearMatch(
  fileName: string,
  configName: string,
  distance: number
): boolean {
  return levenshtein.get(fileName, configName) <= distance
}

module.exports = async function getConfigFile(
  rootDir: string,
  configName: string,
  distance: number = 3
) {
  const configPath = path.join(rootDir, configName)
  let configModule
  try {
    configModule = require(configPath)
  } catch (err) {
    const nearMatch = await fs.readdir(rootDir).then(files =>
      files.find(file => {
        const fileName = file.split(rootDir).pop()
        return isNearMatch(fileName, configName, distance)
      })
    )
    if (!testRequireError(configPath, err)) {
      report.panic(
        `We encountered an error while trying to load your site's ${configName}. Please fix the error and try again.`,
        err
      )
    } else if (nearMatch) {
      report.panic(
        `It looks like you were trying to add the config file? Please rename "${chalk.bold(
          nearMatch
        )}" to "${chalk.bold(configName)}"`
      )
    } else if (existsSync(path.join(rootDir, `src`, configName))) {
      report.panic(
        `Your ${configName} file is in the wrong place. You've placed it in the src/ directory. It must instead be at the root of your site next to your package.json file.`
      )
    }
  }

  return configModule
}
