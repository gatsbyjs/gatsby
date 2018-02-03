const path = require(`path`)
const fs = require(`fs`)

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
  packageDir: resolveApp(`package.json`),
  pagesDir: resolveApp(`src/pages`),
  coverImg: resolveApp(`static/header.png`),
}
