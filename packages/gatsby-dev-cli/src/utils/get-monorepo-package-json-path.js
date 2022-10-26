const path = require(`path`)

exports.getMonorepoPackageJsonPath = ({ packageName, packageNameToPath }) =>
  path.join(packageNameToPath.get(packageName), `package.json`)
