const path = require(`path`)
const { execSync } = require(`child_process`)

exports.onPostBuild = ({ store, cache }) => {
  // TODO make this configurable
  const urlPaths = [`/`]
  const filePaths = urlPaths.reduce(
    (accumulator, currentPath) =>
      `${accumulator} ${path.join(
        cache.publicPath(currentPath),
        `index.html`
      )}`,
    ``
  )

  const command = `node_modules/.bin/subfont -i --no-recursive --inline-css --root file://${cache.publicPath()}${filePaths}`
  execSync(command)
}
