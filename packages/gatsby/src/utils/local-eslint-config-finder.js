const path = require(`path`)
const glob = require(`glob`)

module.exports = directory => {
  let hasEslintConfig = false

  try {
    const pkg = require(path.resolve(directory, `package.json`))
    if (pkg.eslintConfig) {
      hasEslintConfig = true
    }
  } catch (error) {
    // not sure what we should do here...
  }

  const eslintFiles = glob.sync(`.eslintrc?(.js|.json|.yaml|.yml)`, {
    cwd: directory,
  })

  if (eslintFiles.length) {
    hasEslintConfig = true
  }

  return hasEslintConfig
}
