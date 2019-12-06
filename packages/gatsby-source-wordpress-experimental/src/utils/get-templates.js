const path = require(`path`)
const glob = require(`glob`)

module.exports = () => {
  const templatesPath = path.resolve(`./`)
  return glob.sync(`./src/templates/**/*.js`, { cwd: templatesPath })
}
