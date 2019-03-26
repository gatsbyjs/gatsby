/* @flow */
const levenshtein = require(`fast-levenshtein`)
const fs = require(`fs-extra`)
const testRequireError = require(`../utils/test-require-error`).default
const chalk = require(`chalk`)
const path = require(`path`)
const existsSync = require(`fs-exists-cached`).sync
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)

const { dispatch } = store
const { log } = actions

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
      const message =
        `We encountered an error while trying to load your site's ${configName}. ` +
        `Please fix the error and try again.\n` +
        err
      dispatch(log({ message, type: `panic` }))
    } else if (nearMatch) {
      const message =
        `It looks like you were trying to add the config file? ` +
        `Please rename "${chalk.bold(nearMatch)}" to ` +
        `"${chalk.bold(configName)}".`
      dispatch(log({ message, type: `panic` }))
    } else if (existsSync(path.join(rootDir, `src`, configName))) {
      const message =
        `Your ${configName} file is in the wrong place. You've placed it in the ` +
        `src/ directory. It must instead be at the root of your site next to ` +
        `your package.json file.`
      dispatch(log({ message, type: `panic` }))
    }
  }

  return configModule
}
