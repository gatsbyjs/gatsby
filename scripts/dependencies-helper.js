const path = require(`path`)
const fs = require(`fs`)
const [, , cmd, regex, version] = process.argv

if (cmd === `update`) {
  const packageJson = require(path.join(process.cwd(), `package.json`))
  const { dependencies, devDependencies } = packageJson

  for (const pkg in dependencies) {
    if (new RegExp(regex).test(pkg)) {
      dependencies[pkg] = version
    }
  }
  for (const pkg in devDependencies) {
    if (new RegExp(regex).test(pkg)) {
      devDependencies[pkg] = version
    }
  }

  fs.writeFileSync(
    path.join(process.cwd(), `package.json`),
    JSON.stringify(packageJson, null, 2)
  )
}

if (cmd === `get`) {
  const packageJson = require(path.join(process.cwd(), `package.json`))
  const { dependencies, devDependencies } = packageJson

  let result = []
  for (const pkg in dependencies) {
    if (new RegExp(regex).test(pkg)) {
      result.push(pkg)
    }
  }
  for (const pkg in devDependencies) {
    if (new RegExp(regex).test(pkg)) {
      result.push(pkg)
    }
  }

  console.log(result.join(`\n`))
}
