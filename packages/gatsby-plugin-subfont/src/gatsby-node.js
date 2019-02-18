const path = require(`path`)
const { execSync } = require(`child_process`)

exports.onPostBuild = ({ store }) => {
  const root = path.join(store.getState().program.directory, `public`)
  // TODO make this configurable
  const urlPaths = [`/`]
  const filePaths = urlPaths.reduce(
    (accumulator, currentPath) =>
      `${accumulator} ${path.join(root, currentPath, `index.html`)}`,
    ``
  )

  const command = `node_modules/.bin/subfont -i --no-recursive --inline-css --root file://${root}${filePaths}`
  execSync(command)
}
