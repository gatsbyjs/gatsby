import * as path from "path"
import * as glob from "glob"
import * as debug from "debug"
import * as report from "gatsby-cli/lib/reporter"

const log = debug(`gatsby:webpack-eslint-config`)

export const hasLocalEslint = (directory: string): boolean => {
  try {
    log(`Attempting to load package.json for eslint config check`)

    const pkg = require(path.resolve(directory, `package.json`))
    if (pkg.eslintConfig) {
      return true
    }
  } catch (err) {
    report.error(`There was a problem processing the package.json file`, err)
  }

  log(`Checking for eslint config file`)
  const eslintFiles = glob.sync(`.eslintrc?(.js|.json|.yaml|.yml)`, {
    cwd: directory,
  })

  if (eslintFiles.length) {
    return true
  }

  return false
}
