// Convenience script to bump all @babel dependencies of all packages to the latest version
const { readdirSync, readFile, writeFileSync } = require(`node:fs`)
const { sync: execaSync } = require(`execa`)

const packages = readdirSync(`./packages`)
const versions = {}

function getLatest(pkg) {
  let version
  if (!versions[pkg]) {
    version = execaSync(`npm`, [`show`, pkg, `version`]).stdout
    versions[pkg] = version
    console.log(`latest ${pkg}: `, version)
  } else {
    version = versions[pkg]
  }
  return version
}

function replace(deps, library) {
  if (deps && deps[library]) {
    deps[library] = `^` + getLatest(library)
  }
}

packages.forEach(packageName => {
  const path = `${process.cwd()}/packages/${packageName}/package.json`
  readFile(path, (err, json) => {
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

    writeFileSync(path, JSON.stringify(pkg, null, 2) + `\n`)
  })
})
