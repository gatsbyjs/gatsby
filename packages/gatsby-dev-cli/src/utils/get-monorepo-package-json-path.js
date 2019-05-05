const path = require(`path`)

exports.getMonorepoPackageJsonPath = ({ packageName, root }) =>
  path.join(root, `packages`, packageName, `package.json`)
