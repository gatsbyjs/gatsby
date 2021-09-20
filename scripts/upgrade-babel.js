// Convenience script to bump all @babel dependencies of all packages to the latest version
const fs = require(`fs`)
const execa = require(`execa`)

const packages = fs.readdirSync(`./packages`)
const versions = {}

function getLatestMinor(pkg) {
  let version
  if (!versions[pkg]) {
    version = execa.sync(`npm`, [`show`, pkg, `version`]).stdout
    // e.g. 7.14.5 -> 7.14.0
    const parts = version.split(`.`)
    parts[parts.length - 1] = 0
    version = parts.join(`.`)
    versions[pkg] = version
    console.log(`latest ${pkg} minor: `, version)
  } else {
    version = versions[pkg]
  }
  return version
}

function replace(deps, library) {
  if (deps && deps[library]) {
    deps[library] = `^` + getLatestMinor(library)
  }
}

packages.forEach(packageName => {
  const path = `${process.cwd()}/packages/${packageName}/package.json`
  fs.readFile(path, (err, json) => {
    if (err) return
    const pkg = JSON.parse(json)

    Object.keys(pkg.dependencies || {}).forEach(dep => {
      if (dep.startsWith(`@babel/`)) {
        replace(pkg.dependencies, dep)
      }
    })
    Object.keys(pkg.devDependencies || {}).forEach(dep => {
      if (dep.startsWith(`@babel/`)) {
        replace(pkg.devDependencies, dep)
      }
    })

    console.log(`updating ${path}`)

    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + `\n`)
  })
})
