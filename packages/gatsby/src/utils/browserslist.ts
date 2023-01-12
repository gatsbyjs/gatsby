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
  const fallbackV1 = [`>1%`, `last 2 versions`, `IE >= 9`]
  let fallbackOthers = [`>0.25%`, `not dead`]

  if (_CFLAGS_.GATSBY_MAJOR === `5`) {
    fallbackOthers = fallbackOthers.map(
      fallback => fallback + ` and supports es6-module`
    )
  }

  const fallback =
    installedGatsbyVersion(directory) === 1 ? fallbackV1 : fallbackOthers

  const config = browserslist.loadConfig({
    path: directory,
  })

  return config ?? fallback
}

export const hasES6ModuleSupport = (directory: string): boolean => {
  const browserslist = getBrowsersList(directory)
  return query(browserslist + `, not supports es6-module`).length === 0
}
