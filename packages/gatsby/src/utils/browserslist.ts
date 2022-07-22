import path from "path"
import browserslist from "browserslist/node"
import query from "browserslist"

const installedGatsbyVersion = (directory: string): number | undefined => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { version } = require(path.join(
      directory,
      `node_modules`,
      `gatsby`,
      `package.json`
    ))
    return parseInt(version.split(`.`)[0], 10)
  } catch (e) {
    return undefined
  }
}

export const getBrowsersList = (directory: string): Array<string> => {
  const fallback =
    installedGatsbyVersion(directory) === 1
      ? [`>1%`, `last 2 versions`, `IE >= 9`]
      : [`>0.25%`, `not dead`]

  const config = browserslist.findConfig(directory)

  if (config && config.defaults) {
    return config.defaults
  }

  return fallback
}

export const hasES6ModuleSupport = (directory: string): boolean => {
  const browserslist = getBrowsersList(directory)
  return query(browserslist + `, not supports es6-module`).length === 0
}
