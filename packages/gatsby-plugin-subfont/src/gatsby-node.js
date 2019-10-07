const path = require(`path`)
const { execSync } = require(`child_process`)
const shellescape = require(`shell-escape`)

exports.onPostBuild = ({ store }) => {
  const root = path.join(store.getState().program.directory, `public`)
  // TODO make this configurable
  const urlPaths = [`/`]
  const baseArgs = [
    `node_modules/.bin/subfont`,
    `-i`,
    `--no-recursive`,
    `--inline-css`,
    `--root`,
    `file://${root}`,
  ]
  const args = baseArgs.concat(
    urlPaths.map(currentPath => path.join(root, currentPath, `index.html`))
  )
  const command = shellescape(args)
  execSync(command)
}
